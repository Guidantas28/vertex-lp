"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SEGMENTS } from "../../data/content";
import CalEmbed from "./CalEmbed";
import ConfettiBurst from "./ConfettiBurst";
import { GetStartedButton } from "../ui/get-started-button";

type Step = 1 | 2 | 3;

type FormData = {
  name: string;
  phone: string;
  email: string;
  segment: string;
  country: string;
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

const STEPS = [
  { n: 1 as const, label: "Seus dados" },
  { n: 2 as const, label: "Agenda" },
  { n: 3 as const, label: "Confirmado" },
];

const COUNTRIES = [
  { code: "BR", dial: "+55", flag: "🇧🇷", label: "Brasil", max: 11 },
  { code: "PT", dial: "+351", flag: "🇵🇹", label: "Portugal", max: 9 },
  { code: "US", dial: "+1", flag: "🇺🇸", label: "Estados Unidos", max: 10 },
  { code: "AR", dial: "+54", flag: "🇦🇷", label: "Argentina", max: 10 },
  { code: "MX", dial: "+52", flag: "🇲🇽", label: "México", max: 10 },
  { code: "CO", dial: "+57", flag: "🇨🇴", label: "Colômbia", max: 10 },
  { code: "CL", dial: "+56", flag: "🇨🇱", label: "Chile", max: 9 },
  { code: "PE", dial: "+51", flag: "🇵🇪", label: "Peru", max: 9 },
  { code: "UY", dial: "+598", flag: "🇺🇾", label: "Uruguai", max: 8 },
  { code: "PY", dial: "+595", flag: "🇵🇾", label: "Paraguai", max: 9 },
  { code: "ES", dial: "+34", flag: "🇪🇸", label: "Espanha", max: 9 },
  { code: "GB", dial: "+44", flag: "🇬🇧", label: "Reino Unido", max: 10 },
] as const;

const inputCls =
  "w-full rounded-[10px] border border-black/10 bg-[#FAFAFA] px-3 py-2.5 text-[13.5px] text-[#171717] outline-none transition placeholder:text-[#8A8A8A] focus:border-[#ED4B00] focus:bg-white focus:ring-[3px] focus:ring-[#ED4B00]/12";

function formatPhone(raw: string, country: string) {
  const c = COUNTRIES.find((x) => x.code === country) ?? COUNTRIES[0];
  const d = raw.replace(/\D/g, "").slice(0, c.max);
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

const emptyForm = (): FormData => ({
  name: "",
  phone: "",
  email: "",
  segment: "",
  country: "BR",
});

export default function LeadWizardModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const firstRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const calLink = import.meta.env.PUBLIC_CAL_LINK || "vertex/demo";
  const calOrigin = import.meta.env.PUBLIC_CAL_ORIGIN || "https://cal.osvertex.com";

  const segments = useMemo(
    () => SEGMENTS.items.map((s) => ({ id: s.id, label: s.label })),
    [],
  );

  const country = COUNTRIES.find((c) => c.code === form.country) ?? COUNTRIES[0];
  const fullPhone = `${country.dial} ${form.phone}`.trim();

  const reset = () => {
    setStep(1);
    setSubmitting(false);
    setError(null);
    setForm(emptyForm());
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

  async function submitLead() {
    setError(null);
    if (form.name.trim().length < 2) {
      setError("Informe seu nome.");
      return;
    }
    if (!isValidEmail(form.email.trim())) {
      setError("E-mail inválido.");
      return;
    }
    const digits = form.phone.replace(/\D/g, "");
    const minLen = form.country === "BR" ? 10 : 8;
    if (digits.length < minLen) {
      setError("Informe um telefone válido.");
      return;
    }
    if (!form.segment) {
      setError("Escolha o segmento do seu negócio.");
      return;
    }

    setSubmitting(true);
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });

    const segmentLabel = segments.find((s) => s.id === form.segment)?.label ?? form.segment;

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: fullPhone,
          company: segmentLabel,
          segment: form.segment,
          country: form.country,
          utm,
        }),
      });
    } catch {
      /* best-effort */
    }

    setSubmitting(false);
    setStep(2);
  }

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
          step === 2 ? "max-w-[680px]" : "max-w-[480px]",
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
                {step === 2 && "Escolha um horário"}
                {step === 3 && "Tudo certo!"}
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
                      done
                        ? "bg-[#15935A] text-white"
                        : on
                          ? "bg-[#171717] text-white"
                          : "bg-black/[0.06] text-[#6B6B6B]",
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
                        "ml-auto hidden h-px w-full max-w-[28px] sm:block",
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
                  void submitLead();
                }}
              >
                <input
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
                      className="w-[118px] shrink-0 appearance-none rounded-[10px] border border-black/10 bg-[#FAFAFA] px-2 py-2.5 text-[12.5px] text-[#171717] outline-none transition focus:border-[#ED4B00] focus:bg-white focus:ring-[3px] focus:ring-[#ED4B00]/12"
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
                        setForm((f) => ({
                          ...f,
                          phone: formatPhone(e.target.value, f.country),
                        }))
                      }
                      placeholder={form.country === "BR" ? "(11) 99999-9999" : "Número"}
                      inputMode="tel"
                      autoComplete="tel-national"
                      className={inputCls}
                    />
                  </div>
                </label>

                <Field
                  label="E-mail"
                  required
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  placeholder="maria@empresa.com"
                  autoComplete="email"
                />

                <label className="block">
                  <span className="mb-1 block text-[11.5px] font-medium text-[#4A4A4A]">
                    Segmento <span className="text-[#ED4B00]">*</span>
                  </span>
                  <select
                    required
                    value={form.segment}
                    onChange={(e) => setForm((f) => ({ ...f, segment: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Tipo de negócio
                    </option>
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                    <option value="outro">Outro / ainda não sei</option>
                  </select>
                </label>

                {error && (
                  <p className="text-[12px] font-medium text-[#DC3B2B]" role="alert">
                    {error}
                  </p>
                )}

                <div className="pt-0.5">
                  <GetStartedButton
                    type="submit"
                    disabled={submitting}
                    label={submitting ? "Salvando…" : "Agendar agora"}
                    className="!w-full !justify-center !py-[11px] !pl-4 !pr-3 !text-[14px] !leading-5"
                  />
                </div>
                <p className="text-center text-[11px] leading-snug text-[#6B6B6B]">
                  Sem spam. Usamos seus dados só pra marcar a conversa.
                </p>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
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
                  email={form.email}
                  notes={`Segmento: ${segments.find((s) => s.id === form.segment)?.label ?? form.segment} · Tel: ${fullPhone}`}
                  onBookingSuccess={() => setStep(3)}
                  className="h-[min(480px,56dvh)] w-full overflow-hidden rounded-xl border border-black/[0.06] bg-[#FAFAFA]"
                />
                <div className="mt-2.5 flex items-center justify-between gap-3 px-1 sm:px-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[12px] font-semibold text-[#4A4A4A] underline-offset-2 hover:text-[#171717] hover:underline"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#ED4B00] hover:underline"
                  >
                    Já agendei
                    <ChevronRight size={13} strokeWidth={2.4} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
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
                  <h3
                    className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#171717]"
                  >
                    Reunião confirmada
                  </h3>
                  <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-[18px] text-[#4A4A4A]">
                    Enviamos os detalhes pro seu e-mail
                    {form.email ? (
                      <>
                        {" "}
                        <strong className="font-semibold text-[#171717]">{form.email}</strong>
                      </>
                    ) : null}
                    . Até logo, {form.name.split(" ")[0] || "parceiro"}!
                  </p>

                  <div className="mx-auto mt-5 max-w-sm rounded-xl border border-black/[0.06] bg-[#FAFAFA] px-3.5 py-3 text-left">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#6B6B6B]">
                      Resumo
                    </p>
                    <ul className="mt-1.5 space-y-1 text-[12.5px] text-[#171717]">
                      <li>
                        <span className="text-[#6B6B6B]">Nome · </span>
                        {form.name}
                      </li>
                      <li>
                        <span className="text-[#6B6B6B]">WhatsApp · </span>
                        {fullPhone}
                      </li>
                      <li>
                        <span className="text-[#6B6B6B]">País · </span>
                        {country.flag} {country.label}
                      </li>
                      <li>
                        <span className="text-[#6B6B6B]">Segmento · </span>
                        {segments.find((s) => s.id === form.segment)?.label ??
                          (form.segment === "outro" ? "Outro" : form.segment)}
                      </li>
                    </ul>
                  </div>

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
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] font-medium text-[#4A4A4A]">
        {label}
        {required ? <span className="text-[#ED4B00]"> *</span> : null}
      </span>
      <input
        ref={inputRef}
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
