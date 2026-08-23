// Cliente da API do vos (https://vos.mintlify.site).
//
// Por que existe: o endpoint público `/public/marketing-lead` cria um **Deal**.
// No modelo do vos, Deal é negociação ativa num pipeline — então todo lead do
// formulário nascia dentro do funil (coluna AGENDADO, sem ter agendado) e
// aparecia como "Negociação" na tela de Clientes. Em 06/08 o `GET /leads`
// devolvia `total: 0`: não existia UM lead no CRM inteiro.
//
// A entidade certa pra quem acabou de preencher formulário é **Lead**, com
// `status: "new"`. Vira Deal só quando qualifica (`POST /leads/{id}/convert`).
//
// O preço de sair do endpoint público é que a deduplicação e a criação da
// empresa passam a ser nossas. É o que as funções abaixo fazem.

const BASE_PADRAO = "https://api.osvertex.com";

type Resp<T> = { ok: boolean; status: number; data: T | null; erro?: string };

async function chamar<T>(caminho: string, init?: RequestInit): Promise<Resp<T>> {
  const token = import.meta.env.VOS_API_TOKEN;
  if (!token) return { ok: false, status: 0, data: null, erro: "VOS_API_TOKEN ausente" };
  const base = (import.meta.env.VOS_API_BASE || BASE_PADRAO).replace(/\/$/, "");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(`${base}${caminho}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    const txt = await r.text();
    let corpo: any = null;
    try {
      corpo = txt ? JSON.parse(txt) : null;
    } catch {
      /* resposta não-JSON: mantemos o texto no erro */
    }
    // A API embrulha tudo em { data: ... }.
    return {
      ok: r.ok,
      status: r.status,
      data: (corpo?.data ?? corpo) as T,
      erro: r.ok ? undefined : txt.slice(0, 300),
    };
  } catch (e) {
    return { ok: false, status: 0, data: null, erro: String(e).slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

type Contato = {
  id: string;
  email?: string | null;
  companyId?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
};
type Lead = {
  id: string;
  contactId?: string;
  customFields?: Record<string, unknown>;
  tags?: string[];
  source?: string;
};
type Pagina<T> = { items?: T[] };

/** Busca exata por e-mail. O `search` da API é texto livre, então conferimos o
 *  e-mail no retorno — senão um homônimo viraria "contato já existe". */
export async function contatoPorEmail(email: string): Promise<Contato | null> {
  const e = email.trim().toLowerCase();
  if (!e) return null;
  const r = await chamar<Pagina<Contato>>(`/contacts?search=${encodeURIComponent(e)}&pageSize=20`);
  if (!r.ok) return null;
  return (r.data?.items ?? []).find((c) => (c.email ?? "").toLowerCase() === e) ?? null;
}

/** Dígitos com DDI: "43 98888-7777" e "+55 (43) 98888-7777" viram a mesma chave. */
function chaveTelefone(v: string): string {
  const d = v.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

/** As formas equivalentes de um número BR: com e sem o 9º dígito. */
function variantesTelefone(v: string): string[] {
  const d = chaveTelefone(v);
  if (!d.startsWith("55")) return [d];
  const ddd = d.slice(2, 4);
  const resto = d.slice(4);
  if (!/^\d{2}$/.test(ddd)) return [d];
  if (resto.length === 9 && resto.startsWith("9")) return [d, `55${ddd}${resto.slice(1)}`];
  if (resto.length === 8) return [d, `55${ddd}9${resto}`];
  return [d];
}

/** Busca exata por TELEFONE — a outra metade da deduplicação de contato.
 *
 *  Era só por e-mail, e foi assim que a mesma pessoa virou duas no CRM: form
 *  do Meta com um e-mail, landing com outro, MESMO telefone — dois contatos,
 *  dois leads, e o fluxo de boas-vindas saiu em dobro no WhatsApp (caso real,
 *  15/08). O telefone é a identidade que os dois formulários compartilham.
 *
 *  O `search` do vos compara os DÍGITOS das colunas phone/whatsapp por
 *  substring; buscamos pelos 8 dígitos finais (acha o número em qualquer
 *  formato salvo, com e sem o 9) e conferimos EXATO no retorno, pelas
 *  variantes — substring sozinha casaria um número dentro de outro. */
export async function contatoPorTelefone(phone: string): Promise<Contato | null> {
  const digitos = (phone ?? "").replace(/\D/g, "");
  if (digitos.length < 10) return null; // sem DDD não há como afirmar identidade
  const finais = digitos.slice(-8);
  const r = await chamar<Pagina<Contato>>(`/contacts?search=${encodeURIComponent(finais)}&pageSize=20`);
  if (!r.ok) return null;
  const alvos = new Set(variantesTelefone(digitos));
  return (
    (r.data?.items ?? []).find((c) =>
      [c.phone, c.whatsapp].some((t) => t && alvos.has(chaveTelefone(String(t)))),
    ) ?? null
  );
}

/** Marca o CONTATO com uma tag, preservando as que já existem.
 *
 *  Por que no contato e não (só) no lead: as CONDIÇÕES dos fluxos do vos leem
 *  as tags do contato — a tag no lead é invisível pra automação (provado em
 *  teste real 08/08: lead com `vos-agendado` na row recebeu a cadência mesmo
 *  assim). O `/api/agendou` grava nos dois: lead (relatório) + contato (fluxo).
 *
 *  ⚠️ PATCH de contato tem o mesmo defeito dos outros: campo omitido volta pro
 *  default (`tags: []`, `customFields: {}`). Por isso lê antes e devolve junto. */
export async function marcarContatoTag(contactId: string, tag: string): Promise<boolean> {
  const r0 = await chamar<{ id: string; tags?: string[]; customFields?: Record<string, unknown> }>(
    `/contacts/${contactId}`,
  );
  if (!r0.ok || !r0.data) return false;
  const tags = new Set([...(r0.data.tags ?? []), tag]);
  const r = await chamar(`/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify({
      tags: [...tags],
      customFields: r0.data.customFields ?? {},
    }),
  });
  return r.ok;
}

export async function criarEmpresa(nome: string): Promise<string | null> {
  const r = await chamar<{ id: string }>("/companies", {
    method: "POST",
    body: JSON.stringify({ name: nome.slice(0, 200) }),
  });
  return r.ok ? (r.data?.id ?? null) : null;
}

export async function criarContato(c: {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyId?: string | null;
}): Promise<string | null> {
  const r = await chamar<{ id: string }>("/contacts", {
    method: "POST",
    body: JSON.stringify({
      firstName: c.firstName.slice(0, 100) || "(sem nome)",
      ...(c.lastName ? { lastName: c.lastName.slice(0, 100) } : {}),
      ...(c.email ? { email: c.email } : {}),
      ...(c.phone ? { phone: c.phone.slice(0, 30) } : {}),
      ...(c.companyId ? { companyId: c.companyId } : {}),
    }),
  });
  return r.ok ? (r.data?.id ?? null) : null;
}

/** Idempotência: o vigia reenvia o mesmo lead a cada ciclo e o Meta reentrega
 *  lote em erro. Sem esta checagem, cada reenvio criaria um Lead novo.
 *
 *  Busca-se pelo E-MAIL, não pelo leadgen_id: testado em 06/08 contra a API,
 *  `search` cobre o e-mail do contato (total 1) e **não** cobre customFields
 *  (total 0). O leadgen_id serve pra filtrar o retorno. */
export async function leadJaExiste(
  contactId: string,
  email: string,
  leadgenId: string,
): Promise<boolean> {
  const q = email.trim() ? `search=${encodeURIComponent(email.trim())}&` : "";
  const r = await chamar<Pagina<Lead>>(`/leads?${q}pageSize=50&sort=createdAt&direction=desc`);
  if (!r.ok) return false; // na dúvida, deixa criar: perder lead é pior que duplicar
  return (r.data?.items ?? []).some(
    (l) => l.contactId === contactId && String(l.customFields?.leadgen_id ?? "") === leadgenId,
  );
}

/** Lead ainda aberto (`status: "new"`) daquele contato, se houver.
 *
 *  Devolve o registro inteiro, não só o id: quem for atualizá-lo precisa
 *  devolver campos à API pra não perdê-los — ver `enriquecerLead`. */
export async function leadAbertoDoContato(
  contactId: string,
  email: string,
): Promise<Lead | null> {
  const q = email.trim() ? `search=${encodeURIComponent(email.trim())}&` : "";
  const r = await chamar<Pagina<Lead>>(
    `/leads?${q}status=new&pageSize=50&sort=createdAt&direction=desc`,
  );
  if (!r.ok) return null;
  return (r.data?.items ?? []).find((l) => l.contactId === contactId) ?? null;
}

/** Junta dados novos num lead que já existe, em vez de criar um segundo.
 *
 *  O caso real: a pessoa preenche o formulário do Meta (vira Lead com segmento,
 *  faturamento e desafio) e depois preenche a landing (que traz fbc, fbp, ip e
 *  user_agent). São a mesma pessoa — o certo é somar, não duplicar.
 *
 *  ⚠️ O `PATCH /leads/{id}` do vos NÃO é um patch: o schema declara `default`
 *  em `customFields` ({}), `tags` ([]), `source` ("manual") e `status` ("new"),
 *  então tudo que não for enviado é sobrescrito pelo default em vez de ficar
 *  como está. Confirmado contra a API em 06/08: mandar só `{status}` zerou as
 *  11 respostas do formulário de um lead real. Por isso devolvemos os quatro
 *  campos junto — se o vos ganhar campo novo com default, ele entra aqui. */
export async function enriquecerLead(
  lead: Lead,
  novo: { customFields: Record<string, string>; tags?: string[] },
): Promise<boolean> {
  const tags = new Set([...(lead.tags ?? []), ...(novo.tags ?? [])]);
  const r = await chamar(`/leads/${lead.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "new",
      source: lead.source ?? "ads",
      tags: [...tags],
      // O que já estava vem primeiro: dado novo só preenche buraco, não
      // sobrescreve resposta que a pessoa já tinha dado.
      customFields: { ...novo.customFields, ...(lead.customFields ?? {}) },
    }),
  });
  return r.ok;
}

/** Resposta de "desafio" → tag de roteamento do fluxo de automação do vos.
 *
 *  O builder de fluxos só consegue condicionar em `lead.tags` (não lê
 *  customFields), então o desafio vira tag pra cadência escolher a variante
 *  do primeiro toque (M0). Casa por substring porque o texto vem levemente
 *  diferente do form do Meta e da landing. Sempre devolve algo — "outro" é a
 *  variante genérica, não um erro. */
export function tagDesafio(desafio: unknown): string {
  const d = String(desafio ?? "").toLowerCase();
  if (d.includes("centralizar")) return "desafio-centralizar";
  if (d.includes("atendimento") || d.includes("automatizar")) return "desafio-atendimento";
  if (d.includes("custo") || d.includes("assinatura")) return "desafio-custos";
  if (d.includes("processo") || d.includes("equipe")) return "desafio-processos";
  return "desafio-outro";
}

export async function criarLead(l: {
  contactId: string;
  companyId?: string | null;
  title: string;
  customFields: Record<string, string>;
  tags?: string[];
  source?: string;
}): Promise<{ id: string | null; erro?: string }> {
  const r = await chamar<{ id: string }>("/leads", {
    method: "POST",
    body: JSON.stringify({
      contactId: l.contactId,
      ...(l.companyId ? { companyId: l.companyId } : {}),
      title: l.title.slice(0, 200),
      status: "new", // topo de funil — NÃO é negociação
      source: l.source ?? "ads", // veio de anúncio; o vos aceita este valor
      tags: l.tags ?? [],
      customFields: l.customFields,
    }),
  });
  return { id: r.ok ? (r.data?.id ?? null) : null, erro: r.erro };
}
