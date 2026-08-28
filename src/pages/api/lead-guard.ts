// Porteiro do wizard: diz se o que foi digitado na etapa 1 segue ou para.
//
// Por que é SERVIDOR e não uma checagem no navegador: o IP só existe aqui. O
// filtro de conteúdo até rodaria no cliente, mas então o bloqueio por IP não
// existiria e qualquer um contornaria tudo pelo console.
//
// Decisões do Orlando (27/08), depois da leva de submissão-troça:
//   • bloqueio BARRA e avisa neutro — para na etapa 1, sem CRM, sem Meta e sem
//     chegar no calendário (era o pior custo: o time aparecia pra call fake);
//   • quem for barrado vira linha na aba `bloqueados` da planilha de auditoria;
//   • a lista de IP começa VAZIA. Os dois IPs dos fakes conhecidos não são
//     seguros de chumbar: um é faixa da Fastly (proxy — derruba gente real) e o
//     outro é o mesmo IP de um lead que pode ser legítimo. A planilha vira a
//     evidência pra decidir isso depois, com dado.
//
// 🔴 Fail-open, igual ao `/api/whatsapp-check`: qualquer erro NOSSO (timeout,
// exceção, JSON quebrado) responde "ok" e o funil segue. Nunca perder lead pago
// por problema de infra — só reprovação CONFIRMADA barra.
import type { APIRoute } from "astro";
import { avaliaLead } from "../../lib/antifraude";

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Bloqueio automático de reincidente. Vive na memória da função serverless:
// some no cold start, e tudo bem — serve pro sujeito que está insistindo AGORA.
// A trava permanente é a aba `bloqueados` da planilha, não isto.
//
// 🔴 EXIGE 3 REPROVAÇÕES, e não uma. Medido em 27/08: com bloqueio na primeira,
// um lead legítimo do mesmo IP era barrado em seguida. E isso não é hipótese de
// laboratório — o tráfego vem do navegador do Instagram, em celular, e operadora
// brasileira usa CGNAT: milhares de pessoas dividem o mesmo IP. Bloquear na
// primeira faria UM troll calar leads pagos de todo mundo atrás daquele IP.
// Três reprovações em 30 min é coisa de quem está insistindo de propósito.
const strikes = new Map<string, { n: number; até: number }>();
const ipsBloqueados = new Map<string, number>();
const porIp = new Map<string, { n: number; janela: number }>();

const STRIKES_PARA_BLOQUEAR = 3;
const JANELA_STRIKE_MS = 30 * 60 * 1000;
// Bloqueio curto pelo mesmo motivo: se o IP for compartilhado e eu errar, o
// estrago dura meia hora, não um turno inteiro de anúncio.
const TTL_BLOQUEIO_MS = 30 * 60 * 1000;
const LIMITE_IP = 20; // por minuto — o wizard chama isto uma vez por tentativa
const TETO_MAPA = 500; // memória de função serverless não é lugar de crescer sem fim

function ipDaRequisicao(request: Request, clientAddress?: string): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    clientAddress ||
    "?"
  );
}

function estaBloqueado(ip: string, agora: number): boolean {
  const até = ipsBloqueados.get(ip);
  if (!até) return false;
  if (até <= agora) {
    ipsBloqueados.delete(ip);
    return false;
  }
  return true;
}

/**
 * Registra uma reprovação e só bloqueia o IP no 3º strike dentro da janela.
 * Devolve quantos strikes o IP tem agora (vai pra planilha: é o número que
 * diferencia "alguém digitou besteira" de "tem gente insistindo").
 */
function marcaStrike(ip: string, agora: number): number {
  if (ip === "?") return 0;
  if (strikes.size >= TETO_MAPA) {
    // Faxina barata: derruba o que já venceu; se nada venceu, deixa como está
    // (perder contagem é aceitável, estourar memória não).
    for (const [k, v] of strikes) if (v.até <= agora) strikes.delete(k);
  }
  const atual = strikes.get(ip);
  const n = atual && atual.até > agora ? atual.n + 1 : 1;
  if (strikes.size < TETO_MAPA || atual) {
    strikes.set(ip, { n, até: agora + JANELA_STRIKE_MS });
  }
  if (n >= STRIKES_PARA_BLOQUEAR && ipsBloqueados.size < TETO_MAPA) {
    ipsBloqueados.set(ip, agora + TTL_BLOQUEIO_MS);
  }
  return n;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const agora = Date.now();
  const ip = ipDaRequisicao(request, clientAddress);

  // Rate-limit por IP. Estourar não é motivo pra barrar (poderia ser NAT de
  // empresa): responde "ok" e sai — o custo é uma checagem a menos, não um lead.
  const janela = Math.floor(agora / 60_000);
  const uso = porIp.get(ip);
  if (uso && uso.janela === janela && uso.n >= LIMITE_IP) return json({ status: "ok" });
  porIp.set(ip, uso && uso.janela === janela ? { n: uso.n + 1, janela } : { n: 1, janela });

  let data: any;
  try {
    data = await request.json();
  } catch {
    return json({ status: "ok" }); // fail-open
  }

  const name = typeof data?.name === "string" ? data.name : "";
  const company = typeof data?.company === "string" ? data.company : "";
  const email = typeof data?.email === "string" ? data.email : "";

  try {
    // Reincidente do momento: nem avalia o conteúdo, já barra. O campo apontado
    // é o nome porque é onde a mensagem neutra faz mais sentido pra quem lê.
    if (estaBloqueado(ip, agora)) {
      return json({ status: "block", campo: "name" });
    }

    const veredito = avaliaLead({ name, company, email });
    if (veredito.ok) return json({ status: "ok" });

    const strike = marcaStrike(ip, agora);
    // Fire-and-forget: o registro na planilha nunca pode atrasar nem derrubar
    // a resposta ao usuário.
    void registraBloqueio({ ip, motivo: veredito.motivo, strike, name, company, email, data });
    return json({ status: "block", campo: veredito.campo });
  } catch {
    return json({ status: "ok" }); // fail-open
  }
};

/**
 * Manda o bloqueado pro servidor de tags, que grava a linha na aba `bloqueados`
 * da planilha de auditoria. Mesmo caminho e mesmo formato do `crm_erro_lead`
 * (`api/lead.ts`) e do `call_show`.
 *
 * 🔴 O nome do evento NÃO leva o prefixo `crm_`, e isso é deliberado. O server
 * GTM tem o acionador 261 (`🧾 CRM | Auditoria`) casando por REGEX `^crm_`, que
 * alimenta a tag 188 → planilha de EMQ. Com o prefixo, todo lead barrado cairia
 * lá dentro, misturado com os eventos de conversão, e estragaria a contagem de
 * quem agendou. O `call_show` resolveu do mesmo jeito — nome sem prefixo e
 * acionador próprio. A segurança contra virar conversão da Meta continua de pé
 * por outro motivo: todo acionador de Meta filtra `Event Name` EXATO
 * (generate_lead, page_view, schedule, BOOKING_*, view_content) e o de GA4 exige
 * `Client Name = GA4` — este evento chega pelo Data Client.
 *
 * Enquanto o acionador não existir no server GTM (fase 2), isto é um POST que
 * ninguém escuta — exatamente o estado em que o `call_show` ficou entre a v24 e
 * a v25. Não quebra nada.
 *
 * Falha aqui morre em silêncio: o registro nunca pode piorar o que denuncia.
 */
async function registraBloqueio(ctx: {
  ip: string;
  motivo: string;
  strike: number;
  name: string;
  company: string;
  email: string;
  data: any;
}) {
  try {
    const token = process.env.VHQ_TOKEN ?? import.meta.env.VHQ_TOKEN;
    if (!token) return;
    const agora = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const p = Object.fromEntries(agora.map((x) => [x.type, x.value]));
    await fetch("https://vx.voshq.com/vhq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "lead_bloqueado",
        token,
        event_id: `bloq_${ctx.motivo}_${Date.now()}`,
        time_date: `${p.day}-${p.month}-${p.year}`,
        time_hour: `${p.hour}:${p.minute}:${p.second}`,
        // O que a aba `bloqueados` recebe. Tudo string e cortado: é planilha.
        motivo: ctx.motivo,
        ip_bloqueado: ctx.ip,
        // 1 = alguem digitou besteira uma vez. 3+ = o IP levou trava de 30 min.
        strike: String(ctx.strike),
        digitou_nome: ctx.name.slice(0, 120),
        digitou_empresa: ctx.company.slice(0, 120),
        digitou_email: ctx.email.slice(0, 120),
        utm_source: String(ctx.data?.utm_source ?? "").slice(0, 60),
        utm_content: String(ctx.data?.utm_content ?? "").slice(0, 80),
        landing: String(ctx.data?.landing ?? "").slice(0, 300),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // silêncio de propósito — ver comentário acima
  }
}
