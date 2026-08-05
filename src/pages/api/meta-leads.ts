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
// O lead também é espelhado no GTM server (`meta_lead_ad`) só para a planilha
// de auditoria — ver espelharNaAuditoria() para o porquê do nome próprio.
export const prerender = false;

const GRAPH = "https://graph.facebook.com/v21.0";
const VHQ_PADRAO = "https://vx.voshq.com/vhq";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Data e hora no fuso de SP — é o que preenche a coluna A da planilha.
function dataHoraSP(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", ...opts }).format(d);
  return {
    time_date: fmt({ year: "numeric", month: "2-digit", day: "2-digit" }),
    time_hour: fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
  };
}

// O server GTM espera telefone só com dígitos e DDI. A tag é quem hasheia.
function telefoneNormalizado(v?: string) {
  if (!v) return undefined;
  const d = v.replace(/\D/g, "");
  if (!d) return undefined;
  return d.startsWith("55") ? d : `55${d}`;
}

// Espelha o lead na planilha de auditoria pelo mesmo server GTM que já recebe
// call_show e purchase (contrato do Data Client: event_name + token + user_data).
//
// O event_name é PRÓPRIO — `meta_lead_ad`, nunca `generate_lead`. Dois motivos:
// 1) no container server, `generate_lead` dispara 🔵 FB Lead, 🔵 FB Purchase
//    Adv+ e 🟣 LKD Lead. Lead de anúncio já conta como conversão nativa no
//    Meta; reusar o evento duplicaria a conversão em três tags de uma vez.
// 2) a Meta é explícita: a carga de leads de conversão é só para anúncios de
//    lead, "evite usá-la para outros tipos de eventos, como leads de site".
//
// Não mandamos `ip`/`userAgent`: não houve navegador nosso nessa jornada, e o
// IP daqui é o do servidor do webhook — geo errada é pior que geo vazia.
async function espelharNaAuditoria(
  leadgenId: string,
  lead: any,
  pessoa: { name: string; email: string; phone?: string },
) {
  const token = import.meta.env.VHQ_TOKEN;
  if (!token) {
    console.warn("[meta-leads] VHQ_TOKEN ausente; espelho de auditoria desligado");
    return;
  }
  const partes = pessoa.name.trim().split(/\s+/);
  const res = await fetch(import.meta.env.VHQ_ENDPOINT || VHQ_PADRAO, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event_name: "meta_lead_ad",
      token,
      event_id: `${leadgenId}-meta_lead_ad`,
      ...dataHoraSP(lead?.created_time),
      campaign_source: "meta",
      campaign_medium: "lead-ad",
      ...(lead?.campaign_name ? { campaign_name: String(lead.campaign_name).slice(0, 200) } : {}),
      ...(lead?.adset_name ? { campaign_term: String(lead.adset_name).slice(0, 200) } : {}),
      ...(lead?.ad_name ? { campaign_content: String(lead.ad_name).slice(0, 200) } : {}),
      user_data: {
        email: pessoa.email,
        phone: telefoneNormalizado(pessoa.phone),
        first_name: (partes[0] ?? "").toLowerCase(),
        last_name: partes.slice(1).join(" ").toLowerCase(),
        external_id: pessoa.email,
      },
    }),
  });
  if (!res.ok) throw new Error(`vhq ${res.status}`);
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

        // 4) Espelho na planilha de auditoria — try próprio de propósito.
        //    Se isto falhasse dentro do try de cima, o lote responderia 500,
        //    o Meta reentregaria e o lead entraria duas vezes no CRM. Perder
        //    uma linha de auditoria é barato; duplicar lead não é.
        try {
          await espelharNaAuditoria(String(leadgenId), lead, { name: name || email || phone || "", email, phone });
        } catch (err) {
          console.warn("[meta-leads] espelho de auditoria falhou", leadgenId, err);
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
