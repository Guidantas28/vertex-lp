import type { APIRoute } from "astro";

// Serverless (Vercel). Proxy server-to-server pro endpoint público do vos:
// esconde a URL/segredo do backend, normaliza o payload e repassa o IP do
// cliente pro rate-limit do vos. Roda como função (não estática).
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let data: any;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, message: "JSON inválido" }, 400);
  }

  const name = typeof data?.name === "string" ? data.name.trim() : "";
  // E-mail minúsculo é a chave de recuperação do banco de atribuição do tracking.
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  const company = typeof data?.company === "string" ? data.company.trim() : undefined;
  const phone = typeof data?.phone === "string" ? data.phone.trim() : undefined;
  const segment = typeof data?.segment === "string" ? data.segment.trim() : undefined;
  const rawUtm = data?.utm && typeof data.utm === "object" ? data.utm : {};
  // O schema público do vos é .strict(): só name/email/company/phone/sourceDetail/utm.
  // Campos extras (segmento, faturamento, desafio) vão dentro de `utm` (record livre
  // → viram customFields no CRM).
  const utm = { ...rawUtm, ...(segment ? { segmento: segment } : {}) };

  // Click-ids de 1º toque (o vos aceita como campos top-level opcionais).
  const clip = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 500) : undefined);
  const fbclid = clip(data?.fbclid);
  const fbc = clip(data?.fbc);
  const fbp = clip(data?.fbp);
  const gclid = clip(data?.gclid);
  // client_id do GA (cookie `_ga`) — o vos guarda junto da atribuição de 1º toque.
  const clientId = clip(data?.clientId);
  // Stape User ID: external_id dos eventos, costura site → comparecimento → venda.
  const stapeUserId =
    clip(data?.stapeUserId) ||
    /(?:^|;\s*)_?stape_user_id=([^;]*)/.exec(request.headers.get("cookie") ?? "")?.[1];
  // userAgent original do browser (EMQ). O IP vai no x-forwarded-for abaixo.
  const userAgent = request.headers.get("user-agent")?.slice(0, 600) || undefined;

  if (name.length < 2) return json({ ok: false, message: "Informe seu nome" }, 422);
  if (!EMAIL_RE.test(email)) return json({ ok: false, message: "E-mail inválido" }, 422);

  const endpoint = import.meta.env.VOS_LEAD_ENDPOINT;
  if (!endpoint) {
    // Sem backend configurado: não trava o funil, loga e devolve ok “best effort”.
    console.warn("[lead] VOS_LEAD_ENDPOINT ausente; lead não persistido", { email });
    return json({ ok: true, persisted: false });
  }

  const fwd =
    request.headers.get("x-forwarded-for") ?? clientAddress ?? "";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": fwd,
        ...(import.meta.env.VOS_LEAD_SECRET
          ? { "x-lead-secret": import.meta.env.VOS_LEAD_SECRET }
          : {}),
      },
      body: JSON.stringify({
        name,
        email,
        company,
        phone,
        sourceDetail: "landing-page-wizard",
        utm,
        fbclid,
        fbc,
        fbp,
        gclid,
        clientId,
        stapeUserId,
        userAgent,
      }),
    });

    if (res.status === 429) return json({ ok: false, message: "Muitas tentativas. Tente em instantes." }, 429);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[lead] vos respondeu", res.status, detail.slice(0, 300));
      return json({ ok: false, message: "Não foi possível registrar agora." }, 502);
    }

    return json({ ok: true, persisted: true });
  } catch (err) {
    console.error("[lead] erro ao chamar vos", err);
    return json({ ok: false, message: "Serviço indisponível. Tente novamente." }, 502);
  }
};
