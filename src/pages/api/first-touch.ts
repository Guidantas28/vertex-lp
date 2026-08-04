import type { APIRoute } from "astro";

/**
 * Registra o PRIMEIRO TOQUE da visita (serverless, roda como função).
 *
 * O browser manda o que só ele sabe (click-ids da URL e os cookies `_fbp`/`_fbc`
 * do pixel); aqui o servidor acrescenta o que só ele sabe (IP real e user-agent)
 * e devolve o objeto completo, que o client guarda no cookie `vos_ft`.
 *
 * Por que existe: o CallShow é um evento OFFLINE (dispara no servidor, quando a
 * pessoa comparece na call). Naquele momento não há navegador — então fbp/fbc/IP
 * têm que ser os ORIGINAIS de quando ela chegou pelo anúncio. Sem isso a Meta não
 * liga o comparecimento à campanha.
 *
 * "Primeiro toque vence": o client só chama isto quando ainda não tem `vos_ft`.
 */
export const prerender = false;

const clip = (v: unknown, max = 500) =>
  typeof v === "string" && v ? v.slice(0, max) : undefined;

/**
 * Stape User ID vindo do header Cookie. O client tenta ler de `document.cookie`,
 * mas o GTM server pode setar o cookie como HttpOnly — aí só o servidor enxerga.
 */
function stapeUserIdFromHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  for (const name of ["stape_user_id", "_stape_user_id"]) {
    const m = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(cookieHeader);
    if (m?.[1]) return decodeURIComponent(m[1]).slice(0, 120);
  }
  return undefined;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let data: any;
  try {
    data = await request.json();
  } catch {
    data = {};
  }

  const utm: Record<string, string> = {};
  if (data?.utm && typeof data.utm === "object") {
    for (const [k, v] of Object.entries(data.utm)) {
      if (typeof v === "string" && v) utm[k.slice(0, 40)] = v.slice(0, 200);
    }
  }

  // IP: preferimos o 1º hop do x-forwarded-for (cliente real atrás do proxy).
  const xff = request.headers.get("x-forwarded-for") ?? "";
  const ip = (xff.split(",")[0]?.trim() || clientAddress || "").slice(0, 45) || undefined;

  const firstTouch = {
    ts: new Date().toISOString(),
    fbclid: clip(data?.fbclid),
    fbc: clip(data?.fbc),
    fbp: clip(data?.fbp),
    gclid: clip(data?.gclid),
    // client_id do GA (cookie `_ga`): entra no call_show junto de fbp/fbc.
    clientId: clip(data?.clientId, 120),
    // 1º toque vence; entre client e servidor, vale o que existir.
    stapeUserId: clip(data?.stapeUserId, 120) ?? stapeUserIdFromHeader(request.headers.get("cookie")),
    ip,
    userAgent: request.headers.get("user-agent")?.slice(0, 600) || undefined,
    landing: clip(data?.landing, 300),
    referrer: clip(data?.referrer, 300),
    utm: Object.keys(utm).length ? utm : undefined,
  };

  return new Response(JSON.stringify({ ok: true, firstTouch }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
};
