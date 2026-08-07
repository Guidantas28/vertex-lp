import type { APIRoute } from "astro";
import { contatoPorEmail, enriquecerLead, leadAbertoDoContato } from "../../lib/vos";

// Serverless (Vercel). Marca o Lead com a tag `vos-agendado` no momento em que
// o Cal confirma o booking (onBookingSuccess do embed na landing).
//
// Por que existe: o fluxo de automação do vos roteia por `lead.tags` — é a tag
// que separa o Ramo A (cadência de quem NÃO agendou) do Ramo B (lembretes de
// quem agendou). Sem ela, quem acabou de marcar call receberia o primeiro
// toque de "vi que você não agendou".
//
// Limite conhecido: só cobre agendamento feito PELA LANDING. Quem agenda pelo
// link direto do Cal (ex.: remarcação via M2) entra por /public/cal-booking e
// não passa aqui — o portão do fluxo também confere a última mensagem, então o
// dano é lembrete a mais, não mensagem errada.
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

    const aberto = await leadAbertoDoContato(contato.id, email);
    if (!aberto) return json({ ok: true, persisted: false, motivo: "sem lead aberto" });

    // enriquecerLead devolve customFields/tags/source junto — obrigatório,
    // porque o PATCH do vos zera todo campo omitido (defaults no schema).
    const ok = await enriquecerLead(aberto, { customFields: {}, tags: ["vos-agendado"] });
    console.info("[agendou] tag vos-agendado", aberto.id, ok);
    return json({ ok: true, persisted: ok });
  } catch (err) {
    console.error("[agendou] erro", err);
    return json({ ok: false, message: "Não foi possível registrar agora." }, 502);
  }
};
