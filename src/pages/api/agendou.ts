import type { APIRoute } from "astro";
import { contatoPorEmail, enriquecerLead, leadAbertoDoContato, marcarContatoTag } from "../../lib/vos";

// Serverless (Vercel). Marca `vos-agendado` no momento em que o Cal confirma o
// booking (onBookingSuccess do embed na landing) — no LEAD e no CONTATO.
//
// Por que nos DOIS: as condições dos fluxos do vos leem as tags do CONTATO
// (provado em teste real 08/08 — a tag só no lead é invisível pra automação e
// quem agendou recebia a cadência de "não agendou"). A tag no lead fica pra
// relatório/filtro da aba Leads.
//
// Limite conhecido: só cobre agendamento feito PELA LANDING. Quem agenda pelo
// link direto do Cal entra por /public/cal-booking e não passa aqui — esse
// caso é coberto pelo vigia-recuperado da VPS, que tagueia o contato em toda
// reunião nova (atraso de até 10min, suficiente pros toques 2 e 3 do fluxo).
export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request }) => {
  let data: any;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, message: "JSON inválido" }, 400);
  }

  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!email) return json({ ok: false, message: "email obrigatório" }, 422);

  if (!import.meta.env.VOS_API_TOKEN) {
    console.error("[agendou] VOS_API_TOKEN ausente; tag não gravada", { email });
    return json({ ok: true, persisted: false });
  }

  try {
    const contato = await contatoPorEmail(email);
    if (!contato) return json({ ok: true, persisted: false, motivo: "contato não encontrado" });

    // O CONTATO primeiro — é o que a automação lê. Mesmo sem lead aberto.
    const okContato = await marcarContatoTag(contato.id, "vos-agendado");

    const aberto = await leadAbertoDoContato(contato.id, email);
    if (!aberto)
      return json({ ok: true, persisted: okContato, motivo: "sem lead aberto (contato marcado)" });

    // enriquecerLead devolve customFields/tags/source junto — obrigatório,
    // porque o PATCH do vos zera todo campo omitido (defaults no schema).
    const okLead = await enriquecerLead(aberto, { customFields: {}, tags: ["vos-agendado"] });
    console.info("[agendou] vos-agendado contato:", okContato, "lead:", okLead);
    return json({ ok: true, persisted: okContato && okLead });
  } catch (err) {
    console.error("[agendou] erro", err);
    return json({ ok: false, message: "Não foi possível registrar agora." }, 502);
  }
};
