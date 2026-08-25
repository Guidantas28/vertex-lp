// Verifica se um número EXISTE no WhatsApp antes do lead avançar no wizard.
// Fonte: uazapi `POST /chat/check` (spec OpenAPI 2.1.1, auth = header `token`
// da instância). Decisões de 24/08 (Orlando): negativo CONFIRMADO bloqueia o
// avanço; QUALQUER falha nossa (env ausente, timeout, 401/500, instância
// desconectada) responde "unknown" e o funil segue — nunca perdemos lead por
// problema de infra (fail-open).
//
// Proteções: rate-limit por IP e cache por número em memória — servem para o
// caso normal (função serverless quente); cada cold start zera, o que é
// aceitável: o custo é uma consulta a mais, nunca um lead a menos.
import type { APIRoute } from "astro";

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

type Verdict = "yes" | "no" | "unknown";

const cache = new Map<string, { v: Verdict; até: number }>();
const porIp = new Map<string, { n: number; janela: number }>();

const TTL_SIM_MS = 24 * 60 * 60 * 1000;
// Negativo expira rápido: número recém-criado no WhatsApp não pode ficar
// bloqueado um dia inteiro por causa do nosso cache.
const TTL_NAO_MS = 60 * 60 * 1000;
const LIMITE_IP = 12; // por minuto — humano de verdade não passa disso

// Celular BR tem as duas grafias (com e sem o 9º dígito) e o provedor pode
// conhecer só UMA delas — consultar uma única forma reprova número válido.
// Mesma solução do phoneVariants() do SaaS: manda as duas, qualquer "sim" vale.
function variantesBR(num: string): string[] {
  if (!num.startsWith("55")) return [num];
  const ddd = num.slice(2, 4);
  const resto = num.slice(4);
  if (resto.length === 9 && resto.startsWith("9")) return [num, `55${ddd}${resto.slice(1)}`];
  if (resto.length === 8 && /^[6-9]/.test(resto)) return [num, `55${ddd}9${resto}`];
  return [num];
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let data: any;
  try {
    data = await request.json();
  } catch {
    return json({ status: "unknown" });
  }
  const phone = String(data?.phone ?? "").replace(/\D/g, "");
  // Curto demais nem vale a consulta (BR mínimo = 55 + DDD + 8 dígitos).
  if (phone.length < 10 || phone.length > 15) return json({ status: "unknown" });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || clientAddress || "?";
  const agora = Date.now();
  const janela = Math.floor(agora / 60_000);
  const uso = porIp.get(ip);
  if (uso && uso.janela === janela && uso.n >= LIMITE_IP) return json({ status: "unknown" });
  porIp.set(ip, uso && uso.janela === janela ? { n: uso.n + 1, janela } : { n: 1, janela });

  const memo = cache.get(phone);
  if (memo && memo.até > agora) return json({ status: memo.v });

  const base = (process.env.UAZAPI_BASE ?? import.meta.env.UAZAPI_BASE ?? "").replace(/\/$/, "");
  const token = process.env.UAZAPI_TOKEN ?? import.meta.env.UAZAPI_TOKEN;
  if (!base || !token) return json({ status: "unknown" });

  try {
    const numeros = variantesBR(phone);
    const r = await fetch(`${base}/chat/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify({ numbers: numeros }),
      signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) return json({ status: "unknown" });
    const corpo = await r.json();
    const itens: any[] = Array.isArray(corpo) ? corpo : [];
    const vereditos = itens.map((i) => i?.isInWhatsapp).filter((x) => typeof x === "boolean");
    if (!vereditos.length) return json({ status: "unknown" });
    // Qualquer variante existir = existe. "no" só quando TODAS negam — é o
    // veredito que bloqueia lead, então ele exige prova completa.
    const v: Verdict = vereditos.some(Boolean)
      ? "yes"
      : vereditos.length === numeros.length
        ? "no"
        : "unknown";
    cache.set(phone, { v, até: agora + (v === "yes" ? TTL_SIM_MS : TTL_NAO_MS) });
    return json({ status: v });
  } catch {
    return json({ status: "unknown" });
  }
};
