import type { APIRoute } from "astro";
import { createHmac, timingSafeEqual } from "node:crypto";
import { contatoPorEmail, criarContato, criarEmpresa, criarLead, leadJaExiste } from "../../lib/vos";

// Webhook de leads do Meta (formulários instantâneos / lead ads).
// GET  = verificação do webhook (hub.challenge) na configuração do app.
// POST = Meta empurra o leadgen em tempo real → buscamos o lead completo na
//        Graph API e criamos um LEAD no vos (status "new"), pela API
//        autenticada. Antes usávamos o endpoint público, que cria **Deal** —
//        e Deal é negociação ativa num pipeline, então o lead nascia dentro do
//        funil (coluna AGENDADO) e aparecia como "Negociação" em Clientes.
//        Em 06/08 o `GET /leads` do vos devolvia `total: 0`.
// Não disparamos evento de pixel aqui de propósito: lead ad já conta como
// conversão nativa no Meta; mandar um Lead de site duplicaria a métrica.
//
// Também NÃO espelhamos o lead na planilha de auditoria de EMQ. Chegou a
// existir um espelho (`meta_lead_ad` → GTM server) e foi removido: lead de
// anúncio não tem navegador, então a linha nascia sem fbp, sem fbc, com geo
// do datacenter e sem UTM de sessão. Numa planilha que mede qualidade de
// correspondência, isso não mede nada e ainda derruba a média. A auditoria
// desse lead acontece no momento certo sozinha — quando ele agenda no
// Cal.com, o evento `schedule` dispara pelo container web com dados reais.
export const prerender = false;

const GRAPH = "https://graph.facebook.com/v21.0";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// A ferramenta de lead de teste do Meta preenche todo campo com um texto entre
// < >, inclusive o telefone (40 chars). Ingerir isso sujaria o CRM, e devolver
// erro faria o Meta reentregar o mesmo lote pra sempre. Reconhecemos, damos 200
// e não criamos nada — é o que mantém a ferramenta de teste utilizável.
function ehLeadDeTeste(lead: any) {
  const vals = (lead?.field_data ?? []).map((f: any) => String((f?.values ?? [])[0] ?? ""));
  if (!vals.length) return false;
  const marcados = vals.filter((v: string) => v.startsWith("<") && v.endsWith(">")).length;
  return marcados >= Math.ceil(vals.length / 2);
}

// O formulário do Meta não tem campo de empresa, mas tem o Instagram — e
// quando ele vem como @, costuma ser o nome do NEGÓCIO, não da pessoa
// (@sertaoadentro, Sigarastreamento). Vira um nome de empresa muito melhor
// que o nome do dono.
//
// Só aceita o que parece perfil: uma palavra só, sem espaço. Isso descarta os
// casos podres que já apareceram na prática — gente que escreveu o próprio
// nome completo no campo, e um que escreveu "Quero falar no WhatsApp meu
// parceiro". E descarta também o primeiro nome da própria pessoa, que não
// acrescenta nada.
function empresaPeloInstagram(valor: string | undefined, nome: string) {
  const h = String(valor ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .trim();
  if (!h || /\s/.test(h) || h.length < 3 || h.length > 40) return null;
  if (nome.toLowerCase().split(/\s+/).includes(h.toLowerCase())) return null;
  return h;
}

// O endpoint do vos recusa telefone acima de 30 chars. Antes, um telefone ruim
// derrubava o lead inteiro — e junto ia o e-mail, que estava bom. Melhor
// entregar sem telefone do que perder o lead.
function telefonePlausivel(v?: string) {
  if (!v) return undefined;
  const d = v.replace(/\D/g, "");
  return d.length >= 8 && d.length <= 15 ? v.slice(0, 30) : undefined;
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
  if (!pageToken || !import.meta.env.VOS_API_TOKEN) {
    console.error("[meta-leads] META_PAGE_TOKEN ou VOS_API_TOKEN ausente");
    return json({ ok: false }, 503);
  }

  // Um POST pode agrupar vários leads; falha em qualquer um → 500, e o Meta
  // reentrega o lote (a criação é idempotente — ver leadJaExiste()).
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

        // Lead da ferramenta de teste do Meta: aceita e ignora, sem reentrega.
        if (ehLeadDeTeste(lead)) {
          console.info("[meta-leads] lead de teste ignorado", leadgenId);
          continue;
        }

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
          else if (key === "phone_number" || key === "telefone" || key === "whatsapp")
            phone = telefonePlausivel(value);
          else if (key === "company_name" || key === "empresa") company = value;
          else extras[key.slice(0, 60)] = value.slice(0, 300);
        }

        if (!email && !phone) throw new Error("lead sem email e sem telefone");

        // 3) Entrega no vos como LEAD (status "new"), não como negócio.
        //    O endpoint público criava Deal — e Deal é negociação ativa: o lead
        //    nascia dentro do funil, na coluna AGENDADO, sem ter agendado.
        const nomeCompleto = (name || email || phone || "").trim();
        const partes = nomeCompleto.split(/\s+/);

        let contato = email ? await contatoPorEmail(email) : null;
        let companyId = contato?.companyId ?? null;

        // O vos passou a EXIGIR empresa no Lead — em 06/08 às 22:20 o
        // `POST /leads` começou a devolver 400 "Empresa obrigatória — vincule
        // uma empresa ao contato ou informe companyId". Antes disso o mesmo
        // payload passava (Ivane, Elenice, Anderson entraram sem empresa).
        //
        // O formulário instantâneo do Meta não tem campo de empresa, então o
        // nome da pessoa vira o nome da empresa. É feio, mas é exatamente o
        // que já existe na base ("Elenice Ferreira", "Delicia Tananta") e
        // perder o lead é muito pior. Quem vender renomeia depois.
        const nomeEmpresa =
          company ||
          empresaPeloInstagram(extras.instagram, nomeCompleto) ||
          nomeCompleto ||
          email ||
          "(sem nome)";

        if (!contato) {
          // Empresa primeiro, pra o contato já nascer amarrado a ela — contato
          // solto é o que deixou "Beto Borrachas · 0 contatos" no CRM.
          companyId = await criarEmpresa(nomeEmpresa);
          const contactId = await criarContato({
            firstName: partes[0] ?? "(sem nome)",
            lastName: partes.slice(1).join(" "),
            email,
            phone,
            companyId,
          });
          if (!contactId) throw new Error("vos: falhou ao criar o contato");
          contato = { id: contactId, email, companyId };
        }

        // Contato antigo, de antes desta regra, pode estar sem empresa. Cria
        // uma só pro lead — não dá PATCH no contato pra não esbarrar no outro
        // defeito, o de campo omitido voltar pro default.
        if (!companyId) companyId = await criarEmpresa(nomeEmpresa);

        // Reenvio (vigia a cada 10min, reentrega do Meta) não pode duplicar.
        if (await leadJaExiste(contato.id, email, String(leadgenId))) {
          console.info("[meta-leads] lead já existe, nada a fazer", leadgenId);
          continue;
        }

        const { id: leadId, erro } = await criarLead({
          contactId: contato.id,
          companyId,
          title: `Meta Ads — ${nomeCompleto}`,
          tags: ["meta-lead-ad"],
          customFields: {
            leadgen_id: String(leadgenId),
            utm_source: "meta",
            utm_medium: "lead-ad",
            ...(lead?.campaign_name ? { utm_campaign: String(lead.campaign_name).slice(0, 200) } : {}),
            ...(lead?.adset_name ? { utm_term: String(lead.adset_name).slice(0, 200) } : {}),
            ...(lead?.ad_name ? { utm_content: String(lead.ad_name).slice(0, 200) } : {}),
            ...(lead?.form_id ? { form_id: String(lead.form_id) } : {}),
            ...extras,
          },
        });
        if (!leadId) throw new Error(`vos: falhou ao criar o lead — ${erro ?? "sem detalhe"}`);

      } catch (err) {
        falhas++;
        console.error("[meta-leads] falha no lead", leadgenId, err);
      }
    }
  }

  // 200 = lote aceito · 500 = Meta reentrega depois.
  return falhas === 0 ? json({ ok: true }) : json({ ok: false, falhas }, 500);
};
