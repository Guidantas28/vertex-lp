"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import CalEmbed from "./CalEmbed";
import ConfettiBurst from "./ConfettiBurst";
import { GetStartedButton } from "../ui/get-started-button";

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

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

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
      // client_id do GA vai como `client_id` (o webhook do Cal grava com esse nome).
      if (ft.clientId) out.client_id = ft.clientId;
      // Stape User ID: é o external_id dos eventos, tem que ser o MESMO do site.
      if (ft.stapeUserId) out.stape_user_id = ft.stapeUserId;
      // user agent entra abreviado: o Cal limita o tamanho da metadata.
      if (ft.userAgent) out.ua = ft.userAgent.slice(0, 300);
    }
  } catch {
    /* cookie corrompido: segue sem atribuição */
  }
  if (phone) out.phone = phone;
  return out;
}

const STEPS = [
  { n: 1 as const, label: "Seus dados" },
  { n: 2 as const, label: "Sua empresa" },
  { n: 3 as const, label: "Agenda" },
  { n: 4 as const, label: "Confirmado" },
];

// Opções exatas do brief do Orlando.
const SEGMENT_OPTS = [
  "Comércio e varejo",
  "Serviços",
  "Saúde e bem-estar",
  "Educação",
  "Tecnologia e SaaS",
  "Indústria",
  "Construção e imobiliário",
  "Alimentação",
  "Agência ou consultoria",
  "Outro",
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
// menor que isso — era o zoom que quebrava o modal no celular.
const inputCls =
  "w-full rounded-[10px] border border-black/10 bg-[#F7F6FA] px-3 py-2.5 text-[16px] text-[#1A202C] outline-none transition placeholder:text-[#A8A3B3] focus:border-[#ED4B00] focus:bg-white focus:ring-[3px] focus:ring-[#ED4B00]/12";

function formatPhone(raw: string, country: string) {
  const c = COUNTRIES.find((x) => x.code === country) ?? COUNTRIES[0];
  let d = raw.replace(/\D/g, "");
  // Quem digita/cola o número COM o DDI ("5562998649558") estourava o máximo
  // nacional e o slice comia os últimos dígitos — daí o pushLeadEvent prefixava
  // 55 de novo e a Meta/CRM recebiam telefone corrompido (caso real de 05/08).
  // Só removemos o DDI quando o total passa do máximo: "(55) 9xxxx-xxxx"
  // legítimo (DDD 55 existe) tem no máximo 11 dígitos e não entra aqui.
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

// Contrato de dataLayer do GTM do VOS (servido por vx.voshq.com). Ver brief.
// event: 'lead' exato; o GTM lê lead.nome, lead.email, lead.resposta_1 etc.
function pushLeadEvent(form: FormData, country: Country) {
  const parts = form.name.trim().split(/\s+/);
  const nome = parts[0] ?? "";
  const sobrenome = parts.slice(1).join(" ");
  // telefone: só dígitos com DDI na frente (ex.: 55 + DDD + número) p/ match da Meta.
  const telefone = `${country.dial}${form.phone}`.replace(/\D/g, "");
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: "lead",
    lead: {
      nome,
      sobrenome,
      email: normEmail(form.email),
      telefone,
      empresa: form.company.trim(),
      segmento: form.segment,
      resposta_1: form.revenue, // pergunta qualificatória 1 = faturamento
      resposta_2: form.challenge, // pergunta qualificatória 2 = desafio
      faturamento: form.revenue,
      desafio: form.challenge,
      ...(form.instagram ? { instagram: normInstagram(form.instagram) } : {}),
    },
  });
}

export default function LeadWizardModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  // Erro POR CAMPO: a mensagem aparece embaixo do campo que falhou e o foco vai
  // pra ele (Baymard/NN/g — erro global no rodapé é o que o usuário não vê).
  const [error, setError] = useState<{ field: string; msg: string } | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [leadApiFailed, setLeadApiFailed] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const isBotRef = useRef(false);
  // Dedupe por e-mail: "Voltar" + re-submeter não pode duplicar o POST nem o
  // evento `lead`; trocar o e-mail conta como lead novo e libera os dois.
  const sentEmailRef = useRef<string | null>(null);
  const eventEmailRef = useRef<string | null>(null);

  const calLink = import.meta.env.PUBLIC_CAL_LINK || "vos/diagnostico";
  const calOrigin = import.meta.env.PUBLIC_CAL_ORIGIN || "https://cal.osvertex.com";
  const calGuests = (import.meta.env.PUBLIC_CAL_GUESTS || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const country = COUNTRIES.find((c) => c.code === form.country) ?? COUNTRIES[0];
  // Dois formatos, cada um no seu lugar: E.164 só dígitos pro CRM e pra
  // atribuição (match da Meta espera assim); o mascarado é só leitura humana.
  const phoneE164 = `${country.dial}${form.phone}`.replace(/[^\d+]/g, "");
  const fullPhone = `${country.dial} ${form.phone}`.trim();

  const reset = () => {
    setStep(1);
    setSubmitting(false);
    setError(null);
    setForm(emptyForm());
    setLeadApiFailed(false);
    isBotRef.current = false;
    sentEmailRef.current = null;
    eventEmailRef.current = null;
  };

  const close = () => {
    setOpen(false);
    // Só zera depois do fluxo concluído. Fechar no meio (inclusive toque
    // acidental no backdrop) preserva o que a pessoa já digitou.
    if (step === 4) window.setTimeout(reset, 280);
  };

  useEffect(() => {
    const onOpen = () => {
      (window as unknown as { __vosLeadPending?: boolean }).__vosLeadPending = false;
      setError(null);
      setOpen(true);
    };
    window.addEventListener("vos:open-lead", onOpen);
    // Clique no CTA antes desta ilha hidratar (4G): o script inline da página
    // guarda a intenção em __vosLeadPending e a gente abre assim que montar.
    const w = window as unknown as { __vosLeadPending?: boolean };
    if (w.__vosLeadPending) {
      w.__vosLeadPending = false;
      setOpen(true);
    }
    return () => window.removeEventListener("vos:open-lead", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // O lock de scroll vive só de `open`: com `step` aqui ele piscava a cada
    // troca de passo (remove/re-aplica o overflow no meio da navegação).
  }, [open]);

  useEffect(() => {
    if (open && step === 1) firstRef.current?.focus();
  }, [open, step]);

  // Marca o erro no campo e leva o foco até ele (o rodapé não basta: em tela
  // pequena a mensagem longe do campo passa batida).
  function failAt(field: string, msg: string) {
    setError({ field, msg });
    window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
      el?.focus();
    }, 0);
  }

  // Etapa 1 → 2: valida dados pessoais + empresa.
  function goToCompanyStep() {
    setError(null);
    // Honeypot preenchido = bot. Deixa "passar" (sem denunciar o campo), mas
    // marca pra não enviar nada ao CRM nem disparar evento lá na frente.
    if (honeypotRef.current?.value) isBotRef.current = true;
    if (form.name.trim().length < 2) {
      failAt("name", "Informe seu nome completo.");
      return;
    }
    if (!isValidEmail(normEmail(form.email))) {
      failAt("email", "E-mail inválido.");
      return;
    }
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < country.min || digits.length > country.max) {
      failAt("phone", "Informe um WhatsApp válido: só DDD + número, sem o +55.");
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

    setSubmitting(true);
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });
    // Respostas qualificatórias → customFields no CRM do vos (via utm).
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
    const payload = JSON.stringify({
      name: form.name.trim(),
      email: emailNow,
      phone: phoneE164,
      company: form.company.trim(),
      segment: form.segment,
      country: form.country,
      ...(instagramNow ? { instagram: instagramNow } : {}),
      utm,
      ...clickIds,
    });

    // Timeout de 10s + 1 retry: cold start da Vercel não pode travar o botão
    // em "Enviando…" nem falhar em silêncio. Se ainda assim falhar, seguimos
    // pro calendário — call agendada vale mais que o registro imediato (o Cal
    // notifica o time) — e a falha viaja na metadata do booking pra auditoria.
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
    // NÃO disparamos dataLayer no agendamento — o GTM escuta o Cal sozinho.
    if (!isBotRef.current && eventEmailRef.current !== emailNow) {
      pushLeadEvent(form, country);
      eventEmailRef.current = emailNow;
    }

    setSubmitting(false);
    setStep(3);
  }

  // Marca `vos-agendado` (contato + lead) e avança pra confirmação. É UM
  // callback estável de propósito: como arrow inline, ele entrava nas deps do
  // effect do CalEmbed e re-registrava o listener a cada render — risco de
  // /api/agendou duplicado. Usado pelo booking do Cal E pelo "Já agendei"
  // (que antes pulava a tag e jogava quem agendou na cadência de não-agendou).
  const marcarAgendadoEConfirmar = useCallback(() => {
    fetch("/api/agendou", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normEmail(form.email) }),
    }).catch(() => {});
    setStep(4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email]);

  if (!open) return null;

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
        className="absolute inset-0 bg-[#0B0A12]/72 backdrop-blur-[6px]"
        onClick={close}
      />

      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={[
          "relative z-10 flex max-h-[min(92dvh,860px)] w-full flex-col overflow-hidden rounded-[24px] bg-white transition-[max-width] duration-300",
          "border-2 border-white/90",
          "shadow-[0_0_0_1px_rgba(20,19,28,0.14),0_0_0_6px_rgba(255,255,255,0.08),0_40px_100px_-36px_rgba(20,19,28,0.72)]",
          "ring-1 ring-black/10",
          step === 3 ? "max-w-[680px]" : "max-w-[480px]",
        ].join(" ")}
        data-step={step}
      >
        <div className="relative shrink-0 border-b border-black/[0.06] px-4 pb-3.5 pt-4 sm:px-5 sm:pt-5">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(237,75,0,.28), transparent 68%)" }}
          />
          <div
            className="pointer-events-none absolute -left-10 top-0 h-36 w-36 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(91,69,209,.22), transparent 70%)" }}
          />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8A8696]">
                {step === 1 && "Etapa 1 de 4"}
                {step === 2 && "Etapa 2 de 4"}
                {step === 3 && "Etapa 3 de 4"}
                {step === 4 && "Tudo certo"}
              </p>
              <h2
                id="lead-wizard-title"
                className="mt-0.5 text-[18px] font-bold tracking-[-0.02em] text-[#1A202C] sm:text-[20px]"
                style={{ fontFamily: "var(--zx-display, 'Plus Jakarta Sans', system-ui, sans-serif)" }}
              >
                {step === 1 && "Vamos entender sua empresa"}
                {step === 2 && "Sobre sua empresa"}
                {step === 3 && "Escolha o melhor horário"}
                {step === 4 && "Demonstração agendada!"}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 text-[#8A8696] transition hover:border-black/20 hover:text-[#1A202C]"
              aria-label="Fechar"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>

          <ol className="relative mt-3.5 flex items-center gap-1.5" aria-label="Etapas">
            {STEPS.map((s, i) => {
              const done = step > s.n;
              const on = step === s.n;
              return (
                <li
                  key={s.n}
                  /* Em tela estreita só o passo ATUAL ocupa espaço; os outros
                     encolhem pro número. Com os quatro rótulos lado a lado
                     sobravam 44px pra textos de 61 a 68px e três dos quatro
                     apareciam cortados ("Seus d…", "Sua e…", "Confirm…"). */
                  className={[
                    "flex min-w-0 items-center gap-1.5",
                    on ? "flex-1" : "flex-none",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold transition",
                      done
                        ? "bg-[#1EB258] text-white"
                        : on
                          ? "bg-[#1A202C] text-white"
                          : "bg-black/[0.06] text-[#8A8696]",
                    ].join(" ")}
                  >
                    {done ? <Check size={12} strokeWidth={2.6} /> : s.n}
                  </span>
                  <span
                    className={[
                      "truncate text-[11px] font-semibold",
                      /* Rótulo só no passo ATUAL, em qualquer tamanho de tela.
                         A modal tem largura fixa de 480px, então o espaço do
                         stepper não cresce com a viewport: com os quatro
                         rótulos, dois ficavam cortados até no desktop. */
                      on ? "inline" : "hidden",
                      on || done ? "text-[#1A202C]" : "text-[#8A8696]",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      className={[
                        "ml-auto hidden h-px w-full max-w-[22px] sm:block",
                        done ? "bg-[#1EB258]/50" : "bg-black/10",
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
                  goToCompanyStep();
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
                  label="Nome completo"
                  required
                  inputRef={firstRef}
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="Maria Silva"
                  autoComplete="name"
                  autoCorrect="off"
                  field="name"
                  error={error?.field === "name" ? error.msg : undefined}
                />

                <Field
                  label="E-mail profissional"
                  required
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  placeholder="maria@empresa.com"
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  field="email"
                  error={error?.field === "email" ? error.msg : undefined}
                />

                <label className="block">
                  <span className="mb-1 block text-[11.5px] font-medium text-[#646464]">
                    WhatsApp <span className="text-[#ED4B00]">*</span>
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
                      className="w-[128px] shrink-0 appearance-none rounded-[10px] border border-black/10 bg-[#F7F6FA] px-2 py-2.5 text-[16px] text-[#1A202C] outline-none transition focus:border-[#ED4B00] focus:bg-white focus:ring-[3px] focus:ring-[#ED4B00]/12"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.dial}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: formatPhone(e.target.value, f.country) }))
                      }
                      placeholder={form.country === "BR" ? "(11) 99999-9999" : "Número com DDD"}
                      inputMode="tel"
                      autoComplete="tel-national"
                      autoCorrect="off"
                      data-field="phone"
                      aria-invalid={error?.field === "phone" ? true : undefined}
                      className={`${inputCls}${error?.field === "phone" ? " border-[#D32F2F]" : ""}`}
                    />
                  </div>
                  {error?.field === "phone" && (
                    <p className="mt-1 text-[12px] font-medium text-[#D32F2F]" role="alert">
                      {error.msg}
                    </p>
                  )}
                </label>

                <Field
                  label="Nome da empresa"
                  required
                  value={form.company}
                  onChange={(v) => setForm((f) => ({ ...f, company: v }))}
                  placeholder="Empresa Ltda"
                  autoComplete="organization"
                  field="company"
                  error={error?.field === "company" ? error.msg : undefined}
                />

                <div className="pt-0.5">
                  <GetStartedButton
                    type="submit"
                    label="Continuar"
                    className="!w-full !justify-center !py-[13px] !pl-4 !pr-3 !text-[14px] !leading-5"
                  />
                </div>
                <p className="text-center text-[11px] leading-snug text-[#8A8696]">
                  Leva menos de 1 minuto. Sem spam.
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
                  label="Qual é o segmento da sua empresa?"
                  value={form.segment}
                  onChange={(v) => setForm((f) => ({ ...f, segment: v }))}
                  placeholder="Selecione uma opção"
                  options={SEGMENT_OPTS}
                  field="segment"
                  error={error?.field === "segment" ? error.msg : undefined}
                />

                <SelectField
                  label="Qual é a faixa de faturamento mensal?"
                  value={form.revenue}
                  onChange={(v) => setForm((f) => ({ ...f, revenue: v }))}
                  placeholder="Selecione uma opção"
                  options={REVENUE_OPTS}
                  field="revenue"
                  error={error?.field === "revenue" ? error.msg : undefined}
                />

                <SelectField
                  label="Qual é o principal desafio que você quer resolver?"
                  value={form.challenge}
                  onChange={(v) => setForm((f) => ({ ...f, challenge: v }))}
                  placeholder="Selecione uma opção"
                  options={CHALLENGE_OPTS}
                  field="challenge"
                  error={error?.field === "challenge" ? error.msg : undefined}
                />

                <Field
                  label="Instagram da empresa"
                  optional
                  value={form.instagram}
                  onChange={(v) => setForm((f) => ({ ...f, instagram: normInstagram(v) }))}
                  placeholder="suaempresa"
                  prefix="@"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  hint="A gente dá uma olhada no seu perfil antes da conversa."
                  field="instagram"
                />

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(1);
                    }}
                    className="shrink-0 rounded-[12px] border border-black/12 px-4 py-[13px] text-[13px] font-semibold text-[#646464] transition hover:border-black/25 hover:text-[#1A202C]"
                  >
                    Voltar
                  </button>
                  <GetStartedButton
                    type="submit"
                    disabled={submitting}
                    label={submitting ? "Enviando…" : "Escolher o melhor horário"}
                    className="!flex-1 !justify-center !py-[13px] !pl-4 !pr-3 !text-[14px] !leading-5"
                  />
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
                <p className="mb-2.5 px-1 text-[12.5px] leading-[18px] text-[#646464] sm:px-2">
                  Olá, <strong className="font-semibold text-[#1A202C]">{form.name.split(" ")[0]}</strong> —
                  selecione o melhor dia e horário. Na demonstração vamos entender sua operação e mostrar o
                  VOS aplicado à realidade da <strong className="font-semibold text-[#1A202C]">{form.company}</strong>.
                </p>
                <CalEmbed
                  calLink={calLink}
                  calOrigin={calOrigin}
                  name={form.name}
                  email={normEmail(form.email)}
                  guests={calGuests}
                  metadata={{
                    ...firstTouchMetadata(phoneE164),
                    ...(leadApiFailed ? { lead_api_falhou: "1" } : {}),
                  }}
                  notes={`Empresa: ${form.company} · Segmento: ${form.segment} · Faturamento: ${form.revenue} · Desafio: ${form.challenge}${normInstagram(form.instagram) ? ` · Instagram: @${normInstagram(form.instagram)}` : ""} · WhatsApp: ${fullPhone}`}
                  onBookingSuccess={marcarAgendadoEConfirmar}
                  className="min-h-[min(520px,62dvh)] w-full rounded-xl border border-black/[0.06] bg-[#FAFAFC]"
                />
                <div className="mt-2.5 flex items-center justify-between gap-3 px-1 sm:px-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[12px] font-semibold text-[#646464] underline-offset-2 hover:text-[#1A202C] hover:underline"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={marcarAgendadoEConfirmar}
                    className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#ED4B00] hover:underline"
                  >
                    Já agendei
                    <ChevronRight size={13} strokeWidth={2.4} />
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
                className="relative overflow-hidden px-5 py-8 text-center sm:px-8 sm:py-9"
              >
                <ConfettiBurst />
                <div
                  className="pointer-events-none absolute inset-0 opacity-80"
                  style={{
                    background:
                      "radial-gradient(60% 50% at 50% 20%, rgba(237,75,0,.12), transparent 70%), radial-gradient(50% 40% at 80% 80%, rgba(91,69,209,.1), transparent 70%)",
                  }}
                  aria-hidden
                />

                <div className="relative z-10">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#1EB258] to-[#0F7A3C] text-white shadow-[0_14px_32px_-10px_rgba(30,178,88,.65)]">
                    <Check size={26} strokeWidth={2.6} />
                  </div>
                  <h3
                    className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-[#1A202C]"
                    style={{ fontFamily: "var(--zx-display, 'Plus Jakarta Sans', system-ui, sans-serif)" }}
                  >
                    Sua demonstração foi agendada!
                  </h3>
                  <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-[18px] text-[#646464]">
                    Enviamos os detalhes da reunião para o seu e-mail
                    {form.email ? (
                      <>
                        {" "}
                        <strong className="font-semibold text-[#1A202C]">{form.email}</strong>
                      </>
                    ) : null}{" "}
                    e WhatsApp. Até logo, {form.name.split(" ")[0] || "parceiro"}!
                  </p>

                  <div className="mx-auto mt-5 max-w-sm rounded-xl border border-black/[0.06] bg-[#F7F6FA] px-3.5 py-3 text-left">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#8A8696]">
                      Durante a call, vamos
                    </p>
                    <ul className="mt-1.5 space-y-1 text-[12.5px] leading-[17px] text-[#1A202C]">
                      <li>· Entender como sua empresa funciona hoje;</li>
                      <li>· Identificar os principais gargalos da operação;</li>
                      <li>· Apresentar o VOS de forma personalizada;</li>
                      <li>· Mostrar como centralizar processos, dados e ferramentas;</li>
                      <li>· Explicar os próximos passos para implementação.</li>
                    </ul>
                  </div>
                  <p className="mx-auto mt-3 max-w-[320px] text-[11.5px] leading-snug text-[#8A8696]">
                    Reserve o horário na sua agenda e participe em um ambiente tranquilo.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <GetStartedButton
                      label="Fechar"
                      variant="dark"
                      className="!min-w-[140px] !justify-center !py-[11px] !pl-4 !pr-3 !text-[14px] !leading-5"
                      onClick={close}
                    />
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

/** Mensagem de erro SOB o campo que falhou (Baymard/NN/g: erro global no
 *  rodapé passa batido; junto do campo, com aria, não passa). */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[12px] font-medium text-[#D32F2F]" role="alert">
      {msg}
    </p>
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
  autoCapitalize,
  autoCorrect,
  inputRef,
  field,
  error,
  hint,
  optional,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  /** id do campo pro foco-no-erro (data-field). */
  field?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Prefixo visual dentro do input (ex.: "@" do Instagram). */
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] font-medium text-[#646464]">
        {label}
        {required ? <span className="text-[#ED4B00]"> *</span> : null}
        {optional ? <span className="font-normal text-[#8A8696]"> (opcional)</span> : null}
      </span>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#8A8696]">
            {prefix}
          </span>
        ) : null}
        <input
          ref={inputRef}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          data-field={field}
          aria-invalid={error ? true : undefined}
          className={`${inputCls}${prefix ? " pl-8" : ""}${error ? " border-[#D32F2F]" : ""}`}
        />
      </div>
      {hint && !error ? (
        <p className="mt-1 text-[11px] leading-snug text-[#8A8696]">{hint}</p>
      ) : null}
      <FieldError msg={error} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  field,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  field?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] font-medium text-[#646464]">
        {label} <span className="text-[#ED4B00]">*</span>
      </span>
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-field={field}
        aria-invalid={error ? true : undefined}
        className={`${inputCls}${error ? " border-[#D32F2F]" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FieldError msg={error} />
    </label>
  );
}
