import type { APIRoute } from "astro";
import {
  contatoPorEmail,
  contatoPorTelefone,
  criarContato,
  criarEmpresa,
  criarLead,
  enriquecerLead,
  leadAbertoDoContato,
  tagDesafio,
} from "../../lib/vos";

// Serverless (Vercel). Recebe o formulário da landing e cria um **Lead** no vos.
//
// Antes isto repassava pro endpoint público `/public/marketing-lead`, que cria
// um **Negócio** com `stage: "booked"` chumbado. Resultado: quem preenchia o
// formulário e ia embora sem agendar caía no funil na coluna AGENDADO, como se
// tivesse marcado reunião.
//
// Não precisa mais criar negócio: em 06/08 medimos que o `/public/cal-booking`
// do vos — para onde o Cal.com manda a reserva — cria contato, empresa,
// negócio em `booked` e a atividade de reunião sozinho, e **reaproveita** o
// contato quando já existe. Ou seja, o negócio nasce no momento certo (quando
// há reunião de verdade) sem nós fazermos nada.
//
// O desenho fica:
//   preencheu e não agendou  → Lead na aba Leads, fora do kanban
//   preencheu e agendou      → o Cal cria o negócio, reusando este contato
//   agendou sem preencher    → o Cal cria tudo (já funcionava)
//
// É o mesmo caminho que `/api/meta-leads` já usa pro lead de anúncio.
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// customFields do vos é record de string. Descarta vazio e corta o que for
// grande demais (o user_agent passa de 500 chars com folga).
function campo(alvo: Record<string, string>, chave: string, valor: unknown, limite = 300) {
  if (typeof valor === "string" && valor.trim()) alvo[chave] = valor.trim().slice(0, limite);
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
  const company = typeof data?.company === "string" ? data.company.trim() : "";
  const phone = typeof data?.phone === "string" ? data.phone.trim() : "";
  const segment = typeof data?.segment === "string" ? data.segment.trim() : "";
  const rawUtm = data?.utm && typeof data.utm === "object" ? data.utm : {};

  if (name.length < 2) return json({ ok: false, message: "Informe seu nome" }, 422);
  if (!EMAIL_RE.test(email)) return json({ ok: false, message: "E-mail inválido" }, 422);

  if (!(process.env.VOS_API_TOKEN ?? import.meta.env.VOS_API_TOKEN)) {
    // Sem token não dá pra persistir. Não trava o funil: a pessoa segue pro
    // agendamento, e o Cal cria o registro no vos de qualquer forma.
    console.error("[lead] VOS_API_TOKEN ausente; lead não persistido", { email });
    // Incidente de 24/08: falha silenciosa deixou 2 leads pagos invisíveis.
    // O alarme vira linha `crm_erro_lead` na planilha de auditoria em segundos.
    await avisaCanoQuebrado("TOKEN-AUSENTE", name, email, phone);
    return json({ ok: true, persisted: false });
  }

  // Tudo que descreve a origem vira customFields do Lead. Os click-ids são o
  // que costura este preenchimento com o evento de agendamento no Meta.
  const customFields: Record<string, string> = {
    source: "landing",
    source_detail: "landing-page-wizard",
  };
  for (const [k, v] of Object.entries(rawUtm)) campo(customFields, k.toLowerCase().slice(0, 60), v);
  campo(customFields, "segmento", segment);
  // O @ da empresa (opcional na landing) — mesmo campo que o formulário do Meta
  // preenche; o vigia de agendamento lê daqui pro aviso no grupo.
  campo(customFields, "instagram", data?.instagram, 60);
  campo(customFields, "fbclid", data?.fbclid, 500);
  campo(customFields, "fbc", data?.fbc, 500);
  campo(customFields, "fbp", data?.fbp, 500);
  campo(customFields, "gclid", data?.gclid, 500);
  campo(customFields, "client_id", data?.clientId);
  campo(
    customFields,
    "stape_user_id",
    data?.stapeUserId ||
      /(?:^|;\s*)_?stape_user_id=([^;]*)/.exec(request.headers.get("cookie") ?? "")?.[1],
  );
  campo(customFields, "user_agent", request.headers.get("user-agent"), 600);
  campo(customFields, "ip", request.headers.get("x-forwarded-for") ?? clientAddress);
  // Identidade site → CRM (22/08): o event_id do Lead que o navegador mandou
  // para a Meta, o cookie próprio de 1ª parte e o contexto de chegada — os
  // quatro estavam sendo capturados e jogados fora (ou nem existiam).
  campo(customFields, "lead_event_id", data?.leadEventId, 80);
  campo(
    customFields,
    "vos_uid",
    data?.vosUid || /(?:^|;\s*)vos_uid=([^;]*)/.exec(request.headers.get("cookie") ?? "")?.[1],
    80,
  );
  campo(customFields, "landing_page", data?.landing, 500);
  campo(customFields, "referrer", data?.referrer, 500);

  // Tráfego pago do Meta é a origem real hoje; sem utm, trata como orgânico.
  // As UTMs dinâmicas dos anúncios mandam a plataforma real ({{site_source_name}}:
  // ig/fb/msg/an) — e fbclid só existe em clique de anúncio.
  const fonteUtm = String(rawUtm?.utm_source ?? "").toLowerCase();
  const origem =
    ["meta", "ig", "fb", "msg", "an"].includes(fonteUtm) ||
    (typeof data?.fbclid === "string" && data.fbclid.trim() !== "")
      ? "ads"
      : "organic";

  try {
    // E-mail primeiro; TELEFONE como segunda chave. A mesma pessoa preenche o
    // form do Meta com um e-mail e a landing com outro — sem a segunda chave
    // ela virava dois contatos e o fluxo de boas-vindas saía em dobro (15/08).
    let contato = await contatoPorEmail(email);
    if (!contato && phone) contato = await contatoPorTelefone(phone);
    let companyId = contato?.companyId ?? null;

    // O vos passou a EXIGIR empresa no Lead (400 "Empresa obrigatória"), a
    // partir de 06/08 22:20. O campo é obrigatório no formulário da landing,
    // mas o fallback existe pro caso de contato antigo sem empresa.
    const nomeEmpresa = company || name;

    if (!contato) {
      // Empresa primeiro, pra o contato já nascer amarrado a ela — contato
      // solto é o que deixa empresa com "0 contatos" no CRM.
      companyId = await criarEmpresa(nomeEmpresa);
      const partes = name.split(/\s+/);
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

    // Contato antigo pode estar sem empresa. Cria uma só pro lead — sem PATCH
    // no contato, pra não esbarrar no defeito de campo omitido voltar pro default.
    if (!companyId) companyId = await criarEmpresa(nomeEmpresa);

    // Quem já veio pelo formulário do Meta tem Lead aberto. Preencher a landing
    // não faz dele outra pessoa: soma o tracking no lead que existe.
    // A tag desafio-* roteia a variante do primeiro toque (M0) no fluxo de
    // automação do vos — o builder só condiciona em lead.tags.
    const tags = ["landing", tagDesafio((rawUtm as Record<string, unknown>)?.desafio)];

    // A busca de lead cobre o e-mail do CONTATO — que pode não ser o que a
    // pessoa digitou agora (contato achado pelo telefone). Buscar pelo e-mail
    // errado deixaria o lead aberto invisível e criaria o segundo.
    const aberto = await leadAbertoDoContato(contato.id, contato.email || email);
    if (aberto) {
      const ok = await enriquecerLead(aberto, { customFields, tags });
      console.info("[lead] lead existente enriquecido", aberto.id, ok);
      return json({ ok: true, persisted: true });
    }

    const { id: leadId, erro } = await criarLead({
      contactId: contato.id,
      companyId,
      title: `Landing — ${name}`,
      tags,
      source: origem,
      customFields,
    });
    if (!leadId) throw new Error(`vos: falhou ao criar o lead — ${erro ?? "sem detalhe"}`);

    return json({ ok: true, persisted: true });
  } catch (err) {
    console.error("[lead] erro ao registrar no vos", err);
    await avisaCanoQuebrado("ERRO-GRAVACAO", name, email, phone);
    return json({ ok: false, message: "Não foi possível registrar agora." }, 502);
  }
};

// Alarme do cano LP→CRM: quando a gravação falha, uma cópia do lead vai pro
// servidor de tags com o nome `crm_erro_lead` — o acionador `crm_* + token`
// (server GTM v21) escreve a linha na planilha de auditoria, o vigia da VPS e
// o monitor gritam, e o lead fica recuperável ali mesmo. O prefixo `crm_` não
// casa com nenhuma tag de Meta: o alarme jamais vira evento no pixel.
// Fire-and-forget de verdade: falha aqui morre em silêncio (o alarme nunca
// pode piorar o problema que ele denuncia).
async function avisaCanoQuebrado(motivo: string, nome: string, email: string, telefone: string) {
  try {
    const token = process.env.VHQ_TOKEN ?? import.meta.env.VHQ_TOKEN;
    if (!token) return;
    const partes = nome.trim().split(/\s+/);
    const agora = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const p = Object.fromEntries(agora.map((x) => [x.type, x.value]));
    const user_data: Record<string, string> = {};
    if (email) user_data.email = email;
    if (telefone) user_data.phone = telefone;
    if (partes[0]) user_data.first_name = partes[0];
    if (partes.length > 1) user_data.last_name = partes.slice(1).join(" ");
    await fetch("https://vx.voshq.com/vhq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "crm_erro_lead",
        token,
        event_id: `${motivo}_${Date.now()}`,
        time_date: `${p.day}-${p.month}-${p.year}`,
        time_hour: `${p.hour}:${p.minute}:${p.second}`,
        user_data,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // silêncio de propósito — ver comentário acima
  }
}
