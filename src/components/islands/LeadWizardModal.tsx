"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SEGMENTS } from "../../data/content";
import CalEmbed from "./CalEmbed";
import ConfettiBurst from "./ConfettiBurst";

/**
 * Modal de lead da LP e da home — RESTAURADO POR INTEIRO em 17/09/2026.
 *
 * O PR #16 ("o redesign entra na main sem derrubar blog, legais e rastreio",
 * `fe054ac`, 15/09) reescreveu este arquivo de 1.297 para 560 linhas e levou
 * junto: o evento `lead` do dataLayer, os click-ids, o `lead_event_id`, o
 * `utm_id`, a metadata do Cal, a chamada de `/api/agendou`, a verificação real
 * de WhatsApp, o cartão do Instagram, e os campos empresa / faturamento /
 * desafio / instagram. Medido no bundle em produção: `dataLayer` 0 ocorrências.
 * Sem o evento `lead` o gatilho `2 | Lead` do GTM não dispara, e com ele ficam
 * mudos o Meta CAPI de Lead, o GA4 `generate_lead`, a planilha EMQ e o Store.
 *
 * O que este arquivo é: a função do modal de `71c243d` (o último bom) dentro da
 * casca do redesign. Ficou o que o redesign ganhou — framer-motion, os segmentos
 * vindos de `data/content`, a pele nova — e voltou tudo o que ele derrubou.
 *
 * Três regressões silenciosas que também voltaram, e que não estavam na lista:
 *  · o honeypot continuava no HTML mas ninguém lia o valor;
 *  · o `formatPhone` perdeu a remoção de DDI colado (corrompia telefone — caso
 *    real de 05/08), e o `min` por país sumiu da validação;
 *  · o input caiu para 13,5px: abaixo de 16px o iOS Safari dá auto-zoom, que era
 *    exatamente o bug de celular consertado antes.
 *
 * 21/09/2026 — o "Já agendei" do passo 3 SAIU. Ele levava ao "Reunião confirmada"
 * (confete + tag `vos-agendado`) sem reserva nenhuma no Cal: caso real do dia, lead
 * pago que clicou 18 s depois do cadastro, disse "marquei 11h" no WhatsApp e não
 * tinha reunião em lugar nenhum. Só a confirmação real do Cal (`bookingSuccessful`)
 * avança agora. Junto: a descrição do evento saiu do embed (`hideEventTypeDetails`)
 * e a caixa cresceu — no celular ela abria numa descrição rolável e o calendário
 * ficava escondido; e `/api/agendou` passou a ser 1 chamada por e-mail (o embed
 * dispara `bookingSuccessfulV2` e `bookingSuccessful` para a mesma reserva).
 */

type Step = 1 | 2 | 3 | 4;

type FormData = {
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  segment: string;
  revenue: string;
  challenge: string;
  instagram: string;
};

/** Handle limpo: aceita colado com @, URL inteira ou espaço perdido — handle de
 *  Instagram não tem espaço, então dá pra remover enquanto digita sem atrapalhar. */
const normInstagram = (v: string) =>
  v
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@+/, "")
    .replace(/[/?#].*$/, "")
    .replace(/\s+/g, "")
    .slice(0, 60);

// `utm_id` = {{ad.id}} da geração nova de anúncios (Rodada 11): é o que torna a
// atribuição determinística.
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"] as const;

/**
 * E-mail SEMPRE minúsculo em tudo que sai daqui (dataLayer, CRM, agenda). É a
 * chave que amarra formulário, comparecimento e venda no banco de atribuição:
 * "Joao@Gmail.com" e "joao@gmail.com" viram duas pessoas e a recuperação falha.
 */
const normEmail = (v: string) => v.trim().toLowerCase();

/**
 * Primeiro toque (cookie `vos_ft`) no formato de metadata do Cal. Vai junto do
 * booking → webhook do Cal → atribuição do lead. Sem isto, o comparecimento
 * (evento offline, sem navegador) não teria fbp/fbc/IP pra Meta casar com o anúncio.
 */
function firstTouchMetadata(phone?: string): Record<string, string> {
  if (typeof document === "undefined") return {};
  const out: Record<string, string> = {};
  try {
    const m = document.cookie.match("(?:^|; )vos_ft=([^;]*)");
    if (m) {
      const ft = JSON.parse(decodeURIComponent(m[1]!)) as Record<string, string>;
      for (const k of ["fbp", "fbc", "fbclid", "gclid", "ip"] as const) {
        if (ft[k]) out[k] = ft[k]!;
      }
      if (ft.clientId) out.client_id = ft.clientId;
      if (ft.stapeUserId) out.stape_user_id = ft.stapeUserId;
      if (ft.userAgent) out.ua = ft.userAgent.slice(0, 300);
    }
  } catch {
    /* cookie corrompido: segue sem atribuição */
  }
  if (phone) out.phone = phone;
  return out;
}

/**
 * O `event_id` do Lead — a chave que reconcilia o evento da Meta com o registro
 * do CRM. A LP gera o id, manda no dataLayer (o GTM usa) E no `/api/lead` (o CRM
 * guarda em `lead_event_id`). Sem ele, o join site↔CRM fica só no e-mail.
 */
export function novoLeadEventId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return `lead_${crypto.randomUUID()}`;
  } catch {
    /* ambiente sem crypto: cai no fallback */
  }
  return `lead_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

const STEPS = [
  { n: 1 as const, label: "Seus dados" },
  { n: 2 as const, label: "Sua empresa" },
  { n: 3 as const, label: "Agenda" },
  { n: 4 as const, label: "Confirmado" },
];

const REVENUE_OPTS = [
  "Ainda não estamos faturando",
  "Até R$ 10 mil",
  "De R$ 10 mil a R$ 20 mil",
  "De R$ 20 mil a R$ 50 mil",
  "De R$ 50 mil a R$ 100 mil",
  "De R$ 100 mil a R$ 300 mil",
  "De R$ 300 mil a R$ 1 milhão",
  "Acima de R$ 1 milhão",
];

const CHALLENGE_OPTS = [
  "Centralizar toda a operação em um único sistema",
  "Substituir ferramentas e sistemas que não se comunicam",
  "Automatizar tarefas e reduzir trabalhos manuais",
  "Organizar processos, equipes e responsabilidades",
  "Melhorar a gestão comercial e o acompanhamento de clientes",
  "Acompanhar indicadores e tomar decisões com mais clareza",
  "Reduzir custos com diferentes ferramentas e assinaturas",
  "Outro",
];

const COUNTRIES = [
  { code: "BR", dial: "+55", flag: "🇧🇷", label: "Brasil", min: 10, max: 11 },
  { code: "PT", dial: "+351", flag: "🇵🇹", label: "Portugal", min: 9, max: 9 },
  { code: "US", dial: "+1", flag: "🇺🇸", label: "Estados Unidos", min: 10, max: 10 },
  { code: "AR", dial: "+54", flag: "🇦🇷", label: "Argentina", min: 10, max: 10 },
  { code: "MX", dial: "+52", flag: "🇲🇽", label: "México", min: 10, max: 10 },
  { code: "CO", dial: "+57", flag: "🇨🇴", label: "Colômbia", min: 10, max: 10 },
  { code: "CL", dial: "+56", flag: "🇨🇱", label: "Chile", min: 9, max: 9 },
  { code: "PE", dial: "+51", flag: "🇵🇪", label: "Peru", min: 9, max: 9 },
  { code: "UY", dial: "+598", flag: "🇺🇾", label: "Uruguai", min: 8, max: 8 },
  { code: "PY", dial: "+595", flag: "🇵🇾", label: "Paraguai", min: 9, max: 9 },
  { code: "ES", dial: "+34", flag: "🇪🇸", label: "Espanha", min: 9, max: 9 },
  { code: "GB", dial: "+44", flag: "🇬🇧", label: "Reino Unido", min: 10, max: 10 },
] as const;

type Country = (typeof COUNTRIES)[number];

// 16px é o piso: o iOS Safari dá auto-zoom em qualquer campo focado com fonte
// menor que isso — era o zoom que quebrava o modal no celular. O redesign
// baixou para 13,5px e trouxe o bug de volta.
const inputCls =
  "w-full rounded-[10px] border border-black/10 bg-[#FAFAFA] px-3 py-2.5 text-[16px] text-[#171717] outline-none transition placeholder:text-[#8A8A8A] focus:border-[#ED4B00] focus:bg-white focus:ring-[3px] focus:ring-[#ED4B00]/12";

function formatPhone(raw: string, country: string) {
  const c = COUNTRIES.find((x) => x.code === country) ?? COUNTRIES[0];
  let d = raw.replace(/\D/g, "");
  // Quem digita/cola o número COM o DDI ("5562998649558") estourava o máximo
  // nacional e o slice comia os últimos dígitos — daí o evento prefixava 55 de
  // novo e a Meta/CRM recebiam telefone corrompido (caso real de 05/08). Só
  // removemos o DDI quando o total passa do máximo: "(55) 9xxxx-xxxx" legítimo
  // (DDD 55 existe) tem no máximo 11 dígitos e não entra aqui.
  const dial = c.dial.replace("+", "");
  if (d.startsWith(dial) && d.length > c.max) d = d.slice(dial.length);
  d = d.slice(0, c.max);
  if (country === "BR") {
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (country === "US") {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return d;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Só dígitos = quase certamente CNPJ, telefone ou lixo pra passar do campo.
function pareceLixo(v: string) {
  const c = v.trim();
  return c.length > 0 && /^[\d\s.\-/]+$/.test(c);
}

/**
 * Cor do botão principal = a do botão da página que abriu o modal (decisão do
 * Orlando, 22/09): laranja na /lp, tinta nas páginas `zx` (/lp1, /lp2, site).
 * O laranja é o #ED4B00 um tom abaixo: branco sobre #ED4B00 dá 3,75:1, e texto
 * de 16px pede 4,5:1 (WCAG AA); #D24300 dá 4,62:1.
 */
type Tema = "laranja" | "tinta";
const COR_PRIMARIA: Record<Tema, string> = {
  laranja: "bg-[#D24300] hover:bg-[#B83B00] active:bg-[#A33400]",
  tinta: "bg-[#171717] hover:bg-black active:bg-black",
};

/**
 * Botão principal do modal. Não é o GetStartedButton de propósito: aquele pinta
 * o fundo com `var(--zx-ink)`, que só existe dentro do `.zx` da página, e o
 * modal é montado fora dele — de 15 a 22/09 o "Continuar" saiu sem fundo nas
 * três LPs. E o efeito de hover dele esconde o rótulo, o que num formulário
 * tira do lead a certeza do que ele está clicando.
 */
function BotaoPrimario({
  tema,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tema: Tema }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-[10px] px-5 text-[16px] font-semibold leading-5 text-white",
        "transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#ED4B00]/35 focus-visible:ring-offset-2",
        "disabled:cursor-wait disabled:opacity-75",
        COR_PRIMARIA[tema],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const emptyForm = (): FormData => ({
  name: "",
  email: "",
  phone: "",
  country: "BR",
  company: "",
  segment: "",
  revenue: "",
  challenge: "",
  instagram: "",
});

export default function LeadWizardModal({ tema = "tinta" }: { tema?: Tema }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const firstRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Honeypot: o input existia no HTML, mas o PR #16 deixou de ler o valor.
  const honeypotRef = useRef<HTMLInputElement>(null);
  const isBotRef = useRef(false);
  // O mesmo `lead_event_id` nos dois destinos, gerado uma vez por e-mail.
  const eventIdRef = useRef<{ email: string; id: string }>({ email: "", id: "" });
  // Dedupe por e-mail: "Voltar" + re-submeter não pode duplicar o POST nem o
  // evento `lead`; trocar o e-mail conta como lead novo e libera os dois.
  const sentEmailRef = useRef<string | null>(null);
  const eventEmailRef = useRef<string | null>(null);
  // Uma chamada de `/api/agendou` por e-mail (4 POSTs medidos numa reserva só, 21/09).
  const agendouEmailRef = useRef<string | null>(null);
  const [leadApiFailed, setLeadApiFailed] = useState(false);

  // Verificação real de WhatsApp (uazapi via /api/whatsapp-check). Regra de
  // 24/08 (Orlando): "no" CONFIRMADO bloqueia o avanço; qualquer falha nossa
  // vira "unknown" e passa — nunca se perde lead por infra (fail-open).
  const [phoneCheck, setPhoneCheck] = useState<"idle" | "checking" | "yes" | "no" | "unknown">("idle");
  const phoneCheckRef = useRef<{ num: string; v: "yes" | "no" | "unknown" } | null>(null);
  // Cartão "É este seu perfil?" do Instagram (business_discovery). Só perfis
  // Business/Creator retornam — "not_found" quase sempre é perfil pessoal,
  // então a UI trata como neutro, nunca como erro.
  const [igCard, setIgCard] = useState<
    | { status: "found"; username: string; name: string; followers: number | null; picture: string | null }
    | { status: "not_found" }
    | null
  >(null);
  const [igChecking, setIgChecking] = useState(false);
  const igCheckedRef = useRef<string>("");

  const calLink = import.meta.env.PUBLIC_CAL_LINK || "vos/diagnostico";
  const calOrigin = import.meta.env.PUBLIC_CAL_ORIGIN || "https://cal.osvertex.com";
  const calGuests = (import.meta.env.PUBLIC_CAL_GUESTS || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const segments = useMemo(() => SEGMENTS.items.map((s) => ({ id: s.id, label: s.label })), []);
  const segmentLabel = useMemo(
    () => segments.find((s) => s.id === form.segment)?.label ?? (form.segment === "outro" ? "Outro" : form.segment),
    [segments, form.segment],
  );

  const country: Country = COUNTRIES.find((c) => c.code === form.country) ?? COUNTRIES[0];
  // Dois formatos, cada um no seu lugar: E.164 só dígitos pro CRM e pra
  // atribuição (match da Meta espera assim); o mascarado é só leitura humana.
  const phoneE164 = `${country.dial}${form.phone}`.replace(/[^\d+]/g, "");
  const fullPhone = `${country.dial} ${form.phone}`.trim();

  const reset = () => {
    setStep(1);
    setSubmitting(false);
    setError(null);
    setForm(emptyForm());
    isBotRef.current = false;
    setLeadApiFailed(false);
    setPhoneCheck("idle");
    setIgCard(null);
    igCheckedRef.current = "";
  };

  const close = () => {
    setOpen(false);
    window.setTimeout(reset, 280);
  };

  useEffect(() => {
    const onOpen = () => {
      reset();
      setOpen(true);
    };
    window.addEventListener("vos:open-lead", onOpen);
    return () => window.removeEventListener("vos:open-lead", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    if (step === 1) firstRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  /** Erro + foco no campo culpado: mensagem sem destino é mensagem perdida. */
  function failAt(field: string, msg: string) {
    setError(msg);
    setSubmitting(false);
    window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
      el?.focus();
    }, 0);
  }

  /** Pergunta ao servidor se o número existe no WhatsApp. Memoizado por
   *  número (mudou o número, consulta de novo). Qualquer falha = "unknown". */
  async function consultaWhatsApp(e164: string): Promise<"yes" | "no" | "unknown"> {
    const memo = phoneCheckRef.current;
    if (memo && memo.num === e164) return memo.v;
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch("/api/whatsapp-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: e164.replace(/\D/g, "") }),
        signal: ctrl.signal,
      });
      window.clearTimeout(timer);
      const d = await res.json().catch(() => null);
      const v: "yes" | "no" | "unknown" = d?.status === "yes" || d?.status === "no" ? d.status : "unknown";
      phoneCheckRef.current = { num: e164, v };
      return v;
    } catch {
      return "unknown";
    }
  }

  /** Busca o cartão de confirmação do @ (nome/seguidores/foto quando houver). */
  async function consultaInstagram(handle: string) {
    if (!handle || igCheckedRef.current === handle) return;
    igCheckedRef.current = handle;
    setIgChecking(true);
    setIgCard(null);
    try {
      const res = await fetch(`/api/instagram-check?u=${encodeURIComponent(handle)}`, {
        signal: AbortSignal.timeout(4000),
      });
      const d = await res.json().catch(() => null);
      if (d?.status === "found" && d.username) {
        setIgCard({
          status: "found",
          username: d.username,
          name: d.name ?? "",
          followers: typeof d.followers === "number" ? d.followers : null,
          picture: d.picture ?? null,
        });
      } else if (d?.status === "not_found") {
        setIgCard({ status: "not_found" });
      }
    } catch {
      // silêncio: cartão é enfeite, não porteiro
    } finally {
      setIgChecking(false);
    }
  }

  /** Contrato de dataLayer do GTM do VOS (servido por vx.voshq.com).
   *  `event: "lead"` exato — é o gatilho `2 | Lead`, com filtro de e-mail válido. */
  function pushLeadEvent(leadEventId: string) {
    const parts = form.name.trim().split(/\s+/);
    const nome = parts[0] ?? "";
    const sobrenome = parts.slice(1).join(" ");
    // telefone: só dígitos com DDI na frente (ex.: 55 + DDD + número) p/ match da Meta.
    const telefone = `${country.dial}${form.phone}`.replace(/\D/g, "");
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "lead",
      ...(leadEventId ? { lead_event_id: leadEventId } : {}),
      lead: {
        nome,
        sobrenome,
        email: normEmail(form.email),
        telefone,
        empresa: form.company.trim(),
        segmento: segmentLabel,
        resposta_1: form.revenue, // pergunta qualificatória 1 = faturamento
        resposta_2: form.challenge, // pergunta qualificatória 2 = desafio
        faturamento: form.revenue,
        desafio: form.challenge,
        instagram: normInstagram(form.instagram),
      },
    });
  }

  // Etapa 1 → 2: valida dados pessoais + empresa.
  async function goToCompanyStep() {
    setError(null);
    // Honeypot preenchido = bot. Deixa "passar" (sem denunciar o campo), mas
    // marca pra não enviar nada ao CRM nem disparar evento lá na frente.
    if (honeypotRef.current?.value) isBotRef.current = true;
    if (form.name.trim().length < 2) {
      failAt("name", "Informe seu nome completo.");
      return;
    }
    if (!isValidEmail(normEmail(form.email))) {
      failAt("email", "Digite um e-mail válido (ex.: nome@empresa.com).");
      return;
    }
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < country.min || digits.length > country.max) {
      failAt("phone", "Informe um WhatsApp válido com DDD.");
      return;
    }
    // Verificação REAL de WhatsApp — bloqueia SÓ o negativo confirmado.
    let veredito = phoneCheckRef.current?.num === phoneE164 ? phoneCheckRef.current.v : null;
    if (!veredito) {
      setPhoneCheck("checking");
      veredito = await consultaWhatsApp(phoneE164);
      setPhoneCheck(veredito);
    }
    if (veredito === "no") {
      failAt("phone", "Esse número não tem WhatsApp. Confere o DDD e o número?");
      return;
    }
    // Empresa é OBRIGATÓRIA de propósito: quem não tem empresa não é público do
    // VOS. O campo é filtro, não cadastro (decisão do Orlando, 06/08).
    if (form.company.trim().length < 2) {
      failAt("company", "Informe o nome da empresa.");
      return;
    }
    // Só dígitos é o jeito de furar o filtro — foi o caso real do "987654".
    if (pareceLixo(form.company)) {
      failAt("company", "Coloque o nome da empresa, não um número.");
      return;
    }
    setStep(2);
  }

  // Etapa 2 → 3: valida qualificatórias, persiste o lead e dispara o evento.
  async function submitAndSchedule() {
    setError(null);
    if (!form.segment) {
      failAt("segment", "Selecione o segmento da sua empresa.");
      return;
    }
    if (!form.revenue) {
      failAt("revenue", "Selecione a faixa de faturamento.");
      return;
    }
    if (!form.challenge) {
      failAt("challenge", "Selecione o principal desafio.");
      return;
    }
    // Instagram OBRIGATÓRIO (decisão do Orlando, 24/08): todo lead sai completo
    // — o time olha o perfil antes da call.
    const igNow = normInstagram(form.instagram);
    if (!/^[a-z0-9._]{1,30}$/i.test(igNow) || /^\.+$/.test(igNow)) {
      failAt("instagram", "Informe o @ do Instagram da empresa.");
      return;
    }

    setSubmitting(true);
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });
    // Se a URL do submit não tem UTM (a pessoa navegou para outra página), vale
    // a UTM do PRIMEIRO TOQUE guardada no cookie `vos_ft`.
    if (!UTM_KEYS.some((k) => utm[k])) {
      try {
        const rawFt = document.cookie.split("; ").find((c) => c.startsWith("vos_ft="));
        const ftUtm = rawFt
          ? (JSON.parse(decodeURIComponent(rawFt.slice(7))) as { utm?: Record<string, string> }).utm
          : undefined;
        if (ftUtm) UTM_KEYS.forEach((k) => { if (ftUtm[k]) utm[k] = ftUtm[k]!; });
      } catch {
        /* cookie ausente/corrompido: fica sem UTM */
      }
    }
    // Respostas qualificatórias → customFields no CRM do VOS (via utm). O
    // `api/lead.ts` lê `utm.desafio` para montar a tag `desafio-*`, que é o que
    // roteia a cadência — sem isto toda lead nasce `desafio-outro`.
    utm.faturamento = form.revenue;
    utm.desafio = form.challenge;

    // Click-ids de 1º toque p/ atribuição server-side (Meta CAPI / Google Ads):
    // fbclid/gclid vêm da URL; _fbc/_fbp são cookies setados pelo pixel (GTM).
    const readCookie = (n: string) => {
      const m = document.cookie.match("(?:^|; )" + n + "=([^;]*)");
      return m ? decodeURIComponent(m[1]!) : undefined;
    };
    // PRIMEIRO TOQUE vence: o cookie `vos_ft` guarda os valores de quando a
    // pessoa chegou (provavelmente pelo anúncio). Só caímos pra sessão atual
    // quando ele não existe — senão atribuiríamos a call ao toque errado.
    let ft: Record<string, string> = {};
    try {
      const raw = readCookie("vos_ft");
      if (raw) ft = JSON.parse(raw) as Record<string, string>;
    } catch {
      /* cookie corrompido: ignora e usa a sessão atual */
    }
    const clickIds: Record<string, string> = {};
    const fbclid = ft.fbclid || params.get("fbclid");
    if (fbclid) clickIds.fbclid = fbclid;
    const gclid = ft.gclid || params.get("gclid");
    if (gclid) clickIds.gclid = gclid;
    const fbc = ft.fbc || readCookie("_fbc");
    if (fbc) clickIds.fbc = fbc;
    const fbp = ft.fbp || readCookie("_fbp");
    if (fbp) clickIds.fbp = fbp;
    // client_id do GA: 1º toque vence; fallback = cookie `_ga` da sessão atual.
    const gaCookie = readCookie("_ga");
    const gaParts = gaCookie ? gaCookie.split(".") : [];
    const clientId = ft.clientId || (gaParts.length >= 4 ? gaParts.slice(-2).join(".") : undefined);
    if (clientId) clickIds.clientId = clientId;
    const stapeUserId = ft.stapeUserId || readCookie("stape_user_id") || readCookie("_stape_user_id");
    if (stapeUserId) clickIds.stapeUserId = stapeUserId;

    const emailNow = normEmail(form.email);
    const instagramNow = normInstagram(form.instagram);
    // Identidade site → CRM: o mesmo id nos DOIS destinos (dataLayer e API),
    // gerado uma vez por e-mail — o retry do POST reusa o mesmo.
    if (eventIdRef.current.email !== emailNow) {
      eventIdRef.current = { email: emailNow, id: novoLeadEventId() };
    }
    const leadEventId = eventIdRef.current.id;
    // vos_uid: cookie próprio de 1ª parte (setado no FirstTouch, 400 dias).
    const vosUid = readCookie("vos_uid");

    const payload = JSON.stringify({
      name: form.name.trim(),
      email: emailNow,
      phone: phoneE164,
      company: form.company.trim(),
      segment: segmentLabel,
      country: form.country,
      instagram: instagramNow,
      utm,
      ...clickIds,
      leadEventId,
      ...(vosUid ? { vosUid } : {}),
      ...(ft.landing ? { landing: ft.landing } : {}),
      ...(ft.referrer ? { referrer: ft.referrer } : {}),
    });

    // Timeout de 10s + 1 retry: cold start da Vercel não pode travar o botão nem
    // falhar em silêncio. Se ainda assim falhar, seguimos pro calendário — call
    // agendada vale mais que o registro imediato (o Cal notifica o time) — e a
    // falha viaja na metadata do booking pra auditoria.
    const postLead = async () => {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 10000);
      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          signal: ctrl.signal,
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        window.clearTimeout(timer);
      }
    };

    if (!isBotRef.current && sentEmailRef.current !== emailNow) {
      let ok = await postLead();
      if (!ok) ok = await postLead();
      if (ok) {
        sentEmailRef.current = emailNow;
        setLeadApiFailed(false);
      } else {
        setLeadApiFailed(true);
        console.error("[lead] /api/lead falhou após retry — seguindo pro agendamento mesmo assim");
      }
    }

    // GTM — evento 'lead' no submit VALIDADO. Dispara UMA vez por e-mail.
    // NÃO disparamos dataLayer no agendamento: o GTM escuta o Cal sozinho.
    if (!isBotRef.current && eventEmailRef.current !== emailNow) {
      pushLeadEvent(leadEventId);
      eventEmailRef.current = emailNow;
    }

    setSubmitting(false);
    setStep(3);
  }

  /**
   * Marca `vos-agendado` (contato + lead) e avança pra confirmação. É UM callback
   * estável de propósito: como arrow inline ele entrava nas deps do effect do
   * CalEmbed e re-registrava o listener a cada render — risco de `/api/agendou`
   * duplicado. Só o booking confirmado pelo Cal chama isto: não existe mais
   * atalho humano para o passo 4 (o "Já agendei" confirmava reunião inexistente).
   */
  const marcarAgendadoEConfirmar = useCallback(() => {
    const email = normEmail(form.email);
    if (email && agendouEmailRef.current !== email) {
      agendouEmailRef.current = email;
      fetch("/api/agendou", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    }
    setStep(4);
  }, [form.email]);

  if (!open) return null;

  const igNow = normInstagram(form.instagram);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-wizard-title"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-[#08090A]/72 backdrop-blur-[6px]"
        onClick={close}
      />

      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={[
          "relative z-10 flex max-h-[min(92dvh,860px)] w-full flex-col overflow-hidden rounded-[16px] bg-white transition-[max-width] duration-300",
          "shadow-[0_0_0_1px_rgba(23,23,23,0.12),0_40px_100px_-36px_rgba(8,9,10,0.6)]",
          step === 3 ? "max-w-[680px]" : "max-w-[480px]",
        ].join(" ")}
        data-step={step}
      >
        {/* Régua de acento do Dialog (VOS UNO): a linha --mc no topo, o único laranja do modal. */}
        <span aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-[3px] bg-accent" />
        <div className="relative shrink-0 border-b border-black/[0.06] px-4 pb-3.5 pt-5 sm:px-5 sm:pt-6">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <h2
                id="lead-wizard-title"
                className="text-[18px] font-semibold tracking-[-0.02em] text-[#171717] sm:text-[20px]"
              >
                {step === 1 && "Vamos conhecer seu negócio"}
                {step === 2 && "Sobre a sua empresa"}
                {step === 3 && "Escolha um horário"}
                {step === 4 && "Tudo certo!"}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 text-[#6B6B6B] transition hover:border-black/20 hover:text-[#171717]"
              aria-label="Fechar"
            >
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>

          <ol className="relative mt-3.5 flex items-center gap-1.5" aria-label="Etapas">
            {STEPS.map((s, i) => {
              const done = step > s.n;
              const on = step === s.n;
              return (
                <li key={s.n} className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span
                    className={[
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold transition",
                      done ? "bg-[#15935A] text-white" : on ? "bg-[#171717] text-white" : "bg-black/[0.06] text-[#6B6B6B]",
                    ].join(" ")}
                  >
                    {done ? <Check size={12} strokeWidth={2.6} /> : s.n}
                  </span>
                  <span
                    className={[
                      "truncate text-[11px] font-semibold",
                      on || done ? "text-[#171717]" : "text-[#6B6B6B]",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      className={[
                        "ml-auto hidden h-px w-full max-w-[20px] sm:block",
                        done ? "bg-[#15935A]/50" : "bg-black/10",
                      ].join(" ")}
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                className="space-y-3 px-4 py-4 sm:px-5 sm:py-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void goToCompanyStep();
                }}
              >
                <input
                  ref={honeypotRef}
                  type="text"
                  name="company_url"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <Field
                  label="Nome"
                  required
                  field="name"
                  inputRef={firstRef}
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="Maria Silva"
                  autoComplete="name"
                />

                <label className="block">
                  <span className="mb-1 block text-[11.5px] font-medium text-[#4A4A4A]">
                    Telefone / WhatsApp <span className="text-[#ED4B00]">*</span>
                  </span>
                  <div className="flex gap-2">
                    <select
                      aria-label="País"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          country: e.target.value,
                          phone: formatPhone(f.phone, e.target.value),
                        }))
                      }
                      className="w-[118px] shrink-0 appearance-none rounded-[10px] border border-black/10 bg-[#FAFAFA] px-2 py-2.5 text-[16px] text-[#171717] outline-none transition focus:border-[#ED4B00] focus:bg-white focus:ring-[3px] focus:ring-[#ED4B00]/12"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.dial}
                        </option>
                      ))}
                    </select>
                    <input
                      data-field="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: formatPhone(e.target.value, f.country) }))
                      }
                      placeholder={form.country === "BR" ? "(11) 99999-9999" : "Número"}
                      inputMode="tel"
                      autoComplete="tel-national"
                      className={inputCls}
                    />
                  </div>
                  {phoneCheck === "checking" && (
                    <span className="mt-1 block text-[11px] text-[#6B6B6B]">Conferindo no WhatsApp…</span>
                  )}
                </label>

                <Field
                  label="E-mail"
                  required
                  field="email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  placeholder="maria@empresa.com"
                  autoComplete="email"
                />

                <Field
                  label="Empresa"
                  required
                  field="company"
                  value={form.company}
                  onChange={(v) => setForm((f) => ({ ...f, company: v }))}
                  placeholder="Nome da sua empresa"
                  autoComplete="organization"
                />

                {error && (
                  <p className="text-[12px] font-medium text-[#DC3B2B]" role="alert">
                    {error}
                  </p>
                )}

                {/* Preso no pé da área que rola: em tela baixa ou com o teclado
                    aberto, o próximo passo continua à vista. */}
                <div className="sticky bottom-0 -mx-4 bg-white px-4 pb-1 pt-2 sm:-mx-5 sm:px-5">
                  <BotaoPrimario
                    tema={tema}
                    type="submit"
                    className="w-full"
                    disabled={submitting || phoneCheck === "checking"}
                  >
                    {phoneCheck === "checking" ? "Conferindo…" : "Continuar"}
                    <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
                  </BotaoPrimario>
                </div>
                <p className="text-center text-[11px] leading-snug text-[#6B6B6B]">
                  Sem spam. Usamos seus dados só pra marcar a conversa.
                </p>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step-2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                className="space-y-3 px-4 py-4 sm:px-5 sm:py-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitAndSchedule();
                }}
              >
                <SelectField
                  label="Segmento"
                  required
                  field="segment"
                  value={form.segment}
                  onChange={(v) => setForm((f) => ({ ...f, segment: v }))}
                  placeholder="Tipo de negócio"
                  options={[...segments.map((s) => s.id), "outro"]}
                  labels={Object.fromEntries([
                    ...segments.map((s) => [s.id, s.label]),
                    ["outro", "Outro / ainda não sei"],
                  ])}
                />

                <SelectField
                  label="Faturamento mensal"
                  required
                  field="revenue"
                  value={form.revenue}
                  onChange={(v) => setForm((f) => ({ ...f, revenue: v }))}
                  placeholder="Selecione a faixa"
                  options={REVENUE_OPTS}
                />

                <SelectField
                  label="Principal desafio hoje"
                  required
                  field="challenge"
                  value={form.challenge}
                  onChange={(v) => setForm((f) => ({ ...f, challenge: v }))}
                  placeholder="Selecione o desafio"
                  options={CHALLENGE_OPTS}
                />

                <label className="block">
                  <span className="mb-1 block text-[11.5px] font-medium text-[#4A4A4A]">
                    Instagram da empresa <span className="text-[#ED4B00]">*</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-[#6B6B6B]">@</span>
                    <input
                      data-field="instagram"
                      type="text"
                      required
                      value={form.instagram}
                      onChange={(e) => setForm((f) => ({ ...f, instagram: normInstagram(e.target.value) }))}
                      onBlur={() => void consultaInstagram(igNow.toLowerCase())}
                      placeholder="suaempresa"
                      autoComplete="off"
                      className={inputCls}
                    />
                  </div>
                  {igChecking && (
                    <span className="mt-1 block text-[11px] text-[#6B6B6B]">Procurando o perfil…</span>
                  )}
                  {igCard?.status === "found" && (
                    <span className="mt-2 flex items-center gap-2 rounded-[10px] border border-black/[0.06] bg-[#FAFAFA] px-2.5 py-2">
                      {igCard.picture ? (
                        <img src={igCard.picture} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] font-semibold text-[#171717]">
                          @{igCard.username}
                        </span>
                        <span className="block truncate text-[11px] text-[#6B6B6B]">
                          {igCard.name}
                          {igCard.followers != null ? ` · ${igCard.followers.toLocaleString("pt-BR")} seguidores` : ""}
                        </span>
                      </span>
                    </span>
                  )}
                </label>

                {error && (
                  <p className="text-[12px] font-medium text-[#DC3B2B]" role="alert">
                    {error}
                  </p>
                )}

                <div className="sticky bottom-0 -mx-4 flex items-center gap-2 bg-white px-4 pb-1 pt-2 sm:-mx-5 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="shrink-0 text-[12px] font-semibold text-[#4A4A4A] underline-offset-2 hover:text-[#171717] hover:underline"
                  >
                    Voltar
                  </button>
                  <BotaoPrimario tema={tema} type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? "Salvando…" : "Agendar agora"}
                    <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
                  </BotaoPrimario>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                className="px-3 py-3 sm:px-4"
              >
                <p className="mb-2.5 px-1 text-[12.5px] leading-[18px] text-[#4A4A4A] sm:px-2">
                  Olá, <strong className="font-semibold text-[#171717]">{form.name.split(" ")[0]}</strong>,
                  escolha o melhor horário pra gente te mostrar o VOS.
                </p>
                <CalEmbed
                  calLink={calLink}
                  calOrigin={calOrigin}
                  name={form.name}
                  email={normEmail(form.email)}
                  guests={calGuests}
                  notes={`Empresa: ${form.company} · Segmento: ${segmentLabel} · Faturamento: ${form.revenue} · Desafio: ${form.challenge}${igNow ? ` · Instagram: @${igNow}` : ""} · WhatsApp: ${fullPhone}`}
                  /* Sem esta metadata o comparecimento (evento offline, sem
                     navegador) chega na Meta sem fbp/fbc/IP e não casa com o
                     anúncio. É o que sustenta o CallShow. */
                  metadata={{
                    ...firstTouchMetadata(phoneE164),
                    ...(leadApiFailed ? { lead_api_failed: "1" } : {}),
                  }}
                  onBookingSuccess={marcarAgendadoEConfirmar}
                  className="h-[min(600px,62dvh)] w-full overflow-hidden rounded-xl border border-black/[0.06] bg-[#FAFAFA]"
                />
                {/* Sem atalho para o passo 4: quem chega ao "Reunião confirmada" é
                    o `bookingSuccessful` do Cal, com reserva de verdade. */}
                <div className="mt-2.5 flex items-center justify-start gap-3 px-1 sm:px-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[12px] font-semibold text-[#4A4A4A] underline-offset-2 hover:text-[#171717] hover:underline"
                  >
                    Voltar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden px-5 py-8 text-center sm:px-8 sm:py-10"
              >
                <ConfettiBurst />

                <div className="relative z-10">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#15935A] text-white">
                    <Check size={26} strokeWidth={2.6} />
                  </div>
                  <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#171717]">
                    Reunião confirmada
                  </h3>
                  <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-[18px] text-[#4A4A4A]">
                    Enviamos os detalhes pro seu e-mail
                    {form.email ? (
                      <>
                        {" "}
                        <strong className="font-semibold text-[#171717]">{normEmail(form.email)}</strong>
                      </>
                    ) : null}
                    . Até logo, {form.name.split(" ")[0] || "parceiro"}!
                  </p>

                  <div className="mx-auto mt-5 max-w-sm rounded-xl border border-black/[0.06] bg-[#FAFAFA] px-3.5 py-3 text-left">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#6B6B6B]">Resumo</p>
                    <ul className="mt-1.5 space-y-1 text-[12.5px] text-[#171717]">
                      <li>
                        <span className="text-[#6B6B6B]">Nome · </span>
                        {form.name}
                      </li>
                      <li>
                        <span className="text-[#6B6B6B]">Empresa · </span>
                        {form.company}
                      </li>
                      <li>
                        <span className="text-[#6B6B6B]">WhatsApp · </span>
                        {fullPhone}
                      </li>
                      <li>
                        <span className="text-[#6B6B6B]">Segmento · </span>
                        {segmentLabel}
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <BotaoPrimario tema={tema} type="button" className="min-w-[160px]" onClick={close}>
                      Fechar
                    </BotaoPrimario>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  inputMode,
  autoComplete,
  inputRef,
  field,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  field?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] font-medium text-[#4A4A4A]">
        {label}
        {required ? <span className="text-[#ED4B00]"> *</span> : null}
      </span>
      <input
        ref={inputRef}
        data-field={field}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={inputCls}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  labels,
  required,
  field,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  labels?: Record<string, string>;
  required?: boolean;
  field?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] font-medium text-[#4A4A4A]">
        {label}
        {required ? <span className="text-[#ED4B00]"> *</span> : null}
      </span>
      <select
        data-field={field}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}
