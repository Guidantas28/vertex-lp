import type { APIRoute } from "astro";
import { createHmac, timingSafeEqual } from "node:crypto";

// Webhook de leads do Meta (formulários instantâneos / lead ads).
// GET  = verificação do webhook (hub.challenge) na configuração do app.
// POST = Meta empurra o leadgen em tempo real → buscamos o lead completo na
//        Graph API e entregamos no MESMO pipeline do formulário do site
//        (VOS_LEAD_ENDPOINT), pra lead de anúncio e lead de site entrarem
//        pela mesma porta do CRM.
// Não disparamos evento de pixel aqui de propósito: lead ad já conta como
// conversão nativa no Meta; mandar um Lead de site duplicaria a métrica.
export const prerender = false;

const GRAPH = "https://graph.facebook.com/v21.0";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// ── GET: handshake de verificação do Meta ──────────────────────────────────
export const GET: APIRoute = async ({ url }) => {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") ?? "";

  if (mode === "subscribe" && token === import.meta.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return json({ ok: false }, 403);
};

// ── POST: entrega de lead ──────────────────────────────────────────────────
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const raw = await request.text();

  // Assinatura HMAC do Meta — recusa qualquer chamada que não venha dele.
  const secret = import.meta.env.META_APP_SECRET;
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  if (!secret) {
    console.error("[meta-leads] META_APP_SECRET ausente; webhook inativo");
    return json({ ok: false }, 503);
  }
  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    console.warn("[meta-leads] assinatura inválida");
    return json({ ok: false }, 403);
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, message: "JSON inválido" }, 400);
  }

  const pageToken = import.meta.env.META_PAGE_TOKEN;
  const endpoint = import.meta.env.VOS_LEAD_ENDPOINT;
  if (!pageToken || !endpoint) {
    console.error("[meta-leads] META_PAGE_TOKEN ou VOS_LEAD_ENDPOINT ausente");
    return json({ ok: false }, 503);
  }

  // Um POST pode agrupar vários leads; falha em qualquer um → 500, e o Meta
  // reentrega o lote (a criação no vos é idempotente por e-mail).
  let falhas = 0;

  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      if (change?.field !== "leadgen") continue;
      const leadgenId = change?.value?.leadgen_id;
      if (!leadgenId) continue;

      try {
        // 1) Busca o lead completo (respostas do formulário).
        const res = await fetch(
          `${GRAPH}/${leadgenId}?fields=created_time,field_data,form_id,campaign_name,adset_name,ad_name&access_token=${encodeURIComponent(pageToken)}`,
        );
        if (!res.ok) throw new Error(`graph ${res.status}`);
        const lead = await res.json();

        // 2) field_data → campos do vos. Perguntas custom viram entradas de
        //    `utm` (o endpoint público trata o record livre como customFields).
        let name = "";
        let email = "";
        let phone: string | undefined;
        let company: string | undefined;
        const extras: Record<string, string> = {};

        for (const f of lead?.field_data ?? []) {
          const key = String(f?.name ?? "").toLowerCase();
          const value = String((f?.values ?? [])[0] ?? "").trim();
          if (!value) continue;
          if (key === "full_name" || key === "nome" || key === "nome_completo") name = value;
          else if (key === "email") email = value.toLowerCase();
          else if (key === "phone_number" || key === "telefone" || key === "whatsapp") phone = value;
          else if (key === "company_name" || key === "empresa") company = value;
          else extras[key.slice(0, 60)] = value.slice(0, 300);
        }

        if (!email && !phone) throw new Error("lead sem email e sem telefone");

        // 3) Mesmo pipeline do formulário do site.
        const fwd = request.headers.get("x-forwarded-for") ?? clientAddress ?? "";
        const vos = await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": fwd,
            ...(import.meta.env.VOS_LEAD_SECRET
              ? { "x-lead-secret": import.meta.env.VOS_LEAD_SECRET }
              : {}),
          },
          body: JSON.stringify({
            name: name || email || phone,
            email,
            phone,
            company,
            sourceDetail: "meta-lead-ad",
            utm: {
              utm_source: "meta",
              utm_medium: "lead-ad",
              ...(lead?.campaign_name ? { utm_campaign: String(lead.campaign_name).slice(0, 200) } : {}),
              ...(lead?.adset_name ? { utm_term: String(lead.adset_name).slice(0, 200) } : {}),
              ...(lead?.ad_name ? { utm_content: String(lead.ad_name).slice(0, 200) } : {}),
              leadgen_id: String(leadgenId),
              ...(lead?.form_id ? { form_id: String(lead.form_id) } : {}),
              ...extras,
            },
          }),
        });
        if (!vos.ok) {
          const detail = await vos.text().catch(() => "");
          throw new Error(`vos ${vos.status} ${detail.slice(0, 200)}`);
        }
      } catch (err) {
        falhas++;
        console.error("[meta-leads] falha no lead", leadgenId, err);
      }
    }
  }

  // 200 = lote aceito · 500 = Meta reentrega depois.
  return falhas === 0 ? json({ ok: true }) : json({ ok: false, falhas }, 500);
};
