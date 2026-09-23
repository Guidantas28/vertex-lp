// Porteiro do wizard: diz se o que foi digitado na etapa 1 segue ou para.
//
// Por que é SERVIDOR e não uma checagem no navegador: aqui eu enxergo o cookie e
// o IP, e daqui não dá pra contornar pelo console.
//
// Decisões do Orlando (27–28/08), depois da leva de submissão-troça:
//   • bloqueio BARRA e avisa neutro — para na etapa 1, sem CRM, sem Meta e sem
//     chegar no calendário (era o pior custo: o time aparecia pra call fake);
//   • quem for barrado vira linha na aba `bloqueados` da planilha de auditoria;
//   • banimento é PERMANENTE e pelo NAVEGADOR, não pelo IP.
//
// 🔴 Por que o banimento deixou de ser por IP: o IP do primeiro troll era da
// **Fastly** (iCloud Private Relay) — o IP real dele nunca chega até nós, e
// bloquear aquele endereço derrubaria qualquer usuário de iPhone com Private
// Relay. O segundo era compartilhado com um lead que pode ser legítimo. Fora
// isso, operadora brasileira usa CGNAT: milhares de pessoas no mesmo IP.
// O `vos_uid` é um cookie de 1ª parte de 400 dias (`FirstTouch.astro`), então
// três reprovações nele são de UMA pessoa, não de uma cidade inteira. O IP
// continua sendo GRAVADO na planilha — é evidência —, só não bloqueia mais nada.
//
// ⚠️ Limite honesto: limpar cookie ou abrir aba anônima zera o banimento. Nenhum
// ban por cookie escapa disso; quem volta cai de novo no filtro de conteúdo.
//
// 🔴 Fail-open, igual ao `/api/whatsapp-check`: qualquer erro NOSSO (timeout,
// exceção, JSON quebrado) responde "ok" e o funil segue. Nunca perder lead pago
// por problema de infra — só reprovação CONFIRMADA barra.
import type { APIRoute } from "astro";
import { avaliaLead } from "../../lib/antifraude";

export const prerender = false;

const STRIKES_PARA_BANIR = 3;
const DIAS_BAN = 400; // mesma vida do vos_uid: banir por menos seria teatro
const DIAS_STRIKE = 30;

// Throttle do REGISTRO (não do veredito): impede que alguém martelando o
// endpoint encha a planilha de linhas. Nunca muda a resposta ao usuário.
const registroPorIp = new Map<string, { n: number; janela: number }>();
const LIMITE_REGISTRO = 10; // linhas por IP por minuto

function json(body: unknown, cookies: string[] = []) {
  const h = new Headers({ "content-type": "application/json" });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(JSON.stringify(body), { status: 200, headers: h });
}

function leCookie(request: Request, nome: string): string {
  const m = new RegExp(`(?:^|;\\s*)${nome}=([^;]*)`).exec(
    request.headers.get("cookie") ?? "",
  );
  return m ? decodeURIComponent(m[1]!) : "";
}

function montaCookie(nome: string, valor: string, dias: number, seguro: boolean) {
  const exp = new Date(Date.now() + dias * 864e5).toUTCString();
  // HttpOnly: o JS da página não lê nem apaga. Não impede o dono do navegador
  // de limpar tudo — nada impede —, mas tira o caminho fácil.
  return `${nome}=${encodeURIComponent(valor)}; Expires=${exp}; Path=/; SameSite=Lax; HttpOnly${seguro ? "; Secure" : ""}`;
}

function ipDaRequisicao(request: Request, clientAddress?: string): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    clientAddress ||
    "?"
  );
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const agora = Date.now();
  const ip = ipDaRequisicao(request, clientAddress);
  // Em localhost o `Secure` impediria o cookie de ser guardado — e sem cookie
  // não dá pra testar o banimento no ambiente local.
  const seguro =
    (request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol)
      .startsWith("https");

  try {
    // Já banido: barra sem nem olhar o que foi digitado.
    if (leCookie(request, "vos_bl") === "1") {
      return json({ status: "block", campo: "name" });
    }

    let data: any;
    try {
      data = await request.json();
    } catch {
      return json({ status: "ok" }); // fail-open
    }

    const name = typeof data?.name === "string" ? data.name : "";
    const company = typeof data?.company === "string" ? data.company : "";
    const email = typeof data?.email === "string" ? data.email : "";

    const veredito = avaliaLead({ name, company, email });
    if (veredito.ok) return json({ status: "ok" });

    // 🔑 O contador vive em COOKIE, não em memória. A memória da função
    // serverless morre no cold start, e um troll espalhado ao longo de horas
    // nunca fecharia as 3 tentativas — o banimento nunca dispararia.
    const strike = Math.min(99, (parseInt(leCookie(request, "vos_st"), 10) || 0) + 1);
    const banir = strike >= STRIKES_PARA_BANIR;

    const cookies = [montaCookie("vos_st", String(strike), DIAS_STRIKE, seguro)];
    if (banir) cookies.push(montaCookie("vos_bl", "1", DIAS_BAN, seguro));

    // 🔴 `await`, não fire-and-forget. Medido em produção 27/08: com `void`, a
    // linha NUNCA chegava na planilha — a Vercel congela a função assim que ela
    // responde e o POST pendente morre.
    if (podeRegistrar(ip, agora)) {
      await registraBloqueio({
        ip,
        vosUid: leCookie(request, "vos_uid"),
        motivo: veredito.motivo,
        strike,
        banido: banir,
        name,
        company,
        email,
        data,
      });
    }

    return json({ status: "block", campo: veredito.campo }, cookies);
  } catch {
    return json({ status: "ok" }); // fail-open
  }
};

/** Throttle só do registro na planilha; o veredito nunca depende disto. */
function podeRegistrar(ip: string, agora: number): boolean {
  const janela = Math.floor(agora / 60_000);
  const uso = registroPorIp.get(ip);
  if (uso && uso.janela === janela) {
    if (uso.n >= LIMITE_REGISTRO) return false;
    uso.n += 1;
    return true;
  }
  if (registroPorIp.size > 500) registroPorIp.clear();
  registroPorIp.set(ip, { n: 1, janela });
  return true;
}

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
 * Falha aqui morre em silêncio: o registro nunca pode piorar o que denuncia.
 */
async function registraBloqueio(ctx: {
  ip: string;
  vosUid: string;
  motivo: string;
  strike: number;
  banido: boolean;
  name: string;
  company: string;
  email: string;
  data: any;
}) {
  // Em `astro dev` o bloqueio não vira linha na aba `bloqueados`: o teste local
  // da jornada não pode escrever na planilha de produção. O console mostra.
  if (import.meta.env.DEV) {
    console.info("[lead-guard][local] seria registrado:", { motivo: ctx.motivo, strike: ctx.strike, banido: ctx.banido });
    return;
  }
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
        // 1 = digitou besteira uma vez. 3+ = o navegador levou banimento.
        strike: String(ctx.strike),
        banido: ctx.banido ? "sim" : "nao",
        // A identidade que importa agora. O IP fica como evidência, não trava nada.
        vos_uid: ctx.vosUid.slice(0, 60),
        ip_bloqueado: ctx.ip,
        digitou_nome: ctx.name.slice(0, 120),
        digitou_empresa: ctx.company.slice(0, 120),
        digitou_email: ctx.email.slice(0, 120),
        utm_source: String(ctx.data?.utm_source ?? "").slice(0, 60),
        utm_content: String(ctx.data?.utm_content ?? "").slice(0, 80),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // silêncio de propósito — ver comentário acima
  }
}
