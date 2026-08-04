"use client";

/**
 * ZeDelegaScene — narrativa premium estilo Shopify Agentic Storefronts:
 * 1) Você pede (composer digitando + bloom)
 * 2) Coisa real aparece (telefone com UI VOS / WhatsApp / orçamento)
 * 3) Nuvem 3D de confirmações (“feito”)
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Kind = "quote" | "pix" | "wa" | "cal" | "doc" | "mem" | "cash" | "team";

type Thanks = { who: string; what: string; tone: string; kind: Kind };

type Scene = {
  ask: string;
  phone: {
    title: string;
    subtitle: string;
    messages: { from: "user" | "ze" | "client"; text: string }[];
    sheet: { label: string; value: string; meta: string; status: string; kind: Kind };
  };
  thanks: Thanks[];
};

const SCENES: Scene[] = [
  {
    ask: "Zé, fecha a venda da Carla · 3 climatizadores",
    phone: {
      title: "Zé do VOS",
      subtitle: "Executando · Vendas",
      messages: [
        { from: "user", text: "Fecha a venda da Carla · 3 climatizadores" },
        { from: "ze", text: "Orçamento #OS-214 pronto. Mandei no WhatsApp." },
        { from: "client", text: "Carla: Aprovado! Pode gerar o PIX 🙌" },
      ],
      sheet: {
        label: "Orçamento #OS-214",
        value: "R$ 4.890",
        meta: "Carla Mendes · 3 un.",
        status: "Aprovado",
        kind: "quote",
      },
    },
    thanks: [
      { who: "Carla", what: "Orçamento aprovado", tone: "#1EB258", kind: "quote" },
      { who: "Caixa", what: "PIX +R$ 4.890", tone: "#ED4B00", kind: "pix" },
      { who: "Fiscal", what: "NF-e na fila", tone: "#2E6BFF", kind: "doc" },
      { who: "Zé", what: "Lembrei pra próxima", tone: "#8B76FF", kind: "mem" },
    ],
  },
  {
    ask: "Zé, agenda a instalação com a equipe do Caio",
    phone: {
      title: "Zé do VOS",
      subtitle: "Executando · Agenda",
      messages: [
        { from: "user", text: "Agenda a instalação com a equipe do Caio" },
        { from: "ze", text: "Qui 14:00 · time do Caio confirmado." },
        { from: "client", text: "Carla: Perfeito, te vejo quinta!" },
      ],
      sheet: {
        label: "Instalação",
        value: "Qui · 14:00",
        meta: "Equipe Caio · endereço na agenda",
        status: "Confirmado",
        kind: "cal",
      },
    },
    thanks: [
      { who: "Agenda", what: "Horário reservado", tone: "#7A5BFF", kind: "cal" },
      { who: "Carla", what: "Avisada no WhatsApp", tone: "#25D366", kind: "wa" },
      { who: "Caio", what: "Time notificado", tone: "#0E97A8", kind: "team" },
      { who: "Zé", what: "Lembrete 1h antes", tone: "#C9810C", kind: "mem" },
    ],
  },
  {
    ask: "Zé, cobra os orçamentos parados da semana",
    phone: {
      title: "Zé do VOS",
      subtitle: "Executando · Cobrança",
      messages: [
        { from: "user", text: "Cobra os orçamentos parados da semana" },
        { from: "ze", text: "3 cobranças educadas no WhatsApp." },
        { from: "client", text: "2 PIX caíram · +R$ 2.140 no caixa" },
      ],
      sheet: {
        label: "Cobranças da semana",
        value: "+R$ 2.140",
        meta: "2 pagos · 1 follow-up sexta",
        status: "Em dia",
        kind: "cash",
      },
    },
    thanks: [
      { who: "Marina", what: "PIX recebido", tone: "#1EB258", kind: "pix" },
      { who: "Rafa", what: "PIX recebido", tone: "#1EB258", kind: "pix" },
      { who: "Lia", what: "Lembrete sexta", tone: "#C9810C", kind: "cal" },
      { who: "Caixa", what: "Saldo atualizado", tone: "#ED4B00", kind: "cash" },
    ],
  },
];

const KIND_ICON: Record<Kind, ReactNode> = {
  quote: (<><rect x="5" y="3" width="14" height="18" rx="2.4" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4.5" /></>),
  pix: <path d="M12 3.5 20.5 12 12 20.5 3.5 12z" />,
  wa: <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z" />,
  cal: (<><rect x="4" y="4.5" width="16" height="16" rx="2.4" /><path d="M4 9.5h16M8.5 2.5v4M15.5 2.5v4" /></>),
  doc: (<><path d="M8 3h6l4 4v14H8z" /><path d="M14 3v5h5M10 13h6M10 17h4" /></>),
  mem: (<><path d="M12 3a6 6 0 0 1 6 6c0 4-6 12-6 12S6 13 6 9a6 6 0 0 1 6-6Z" /><circle cx="12" cy="9" r="2" /></>),
  cash: (<><rect x="3" y="6" width="18" height="12" rx="2.4" /><circle cx="12" cy="12" r="2.5" /></>),
  team: (<><circle cx="9" cy="9" r="2.5" /><circle cx="16" cy="10" r="2" /><path d="M4.5 18c.8-2.4 2.6-3.6 4.5-3.6s3.7 1.2 4.5 3.6M13.5 18c.4-1.4 1.4-2.4 2.5-2.4 1.3 0 2.3 1 2.8 2.4" /></>),
};

function KindMark({ kind, tone }: { kind: Kind; tone: string }) {
  return (
    <div className="zds-kind" style={{ ["--c" as string]: tone }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        {KIND_ICON[kind]}
      </svg>
    </div>
  );
}

type Phase = "ask" | "result" | "thanks";

const TYPE_MS = 28;
const AFTER_TYPE = 500;
const RESULT_HOLD = 3200;
const THANKS_HOLD = 2800;

const CLOUD = [
  { x: -6, y: 10, z: 110, ry: -3, rx: 2, s: 1.05, blur: 0 },
  { x: -130, y: -36, z: 20, ry: 26, rx: 10, s: 0.78, blur: 2.4 },
  { x: 128, y: -22, z: 36, ry: -22, rx: 8, s: 0.82, blur: 1.6 },
  { x: 18, y: -88, z: -10, ry: 8, rx: 14, s: 0.7, blur: 3.2 },
] as const;

const CLOUD_M = [
  { x: 0, y: 28, z: 90, ry: 0, rx: 2, s: 1, blur: 0 },
  { x: -58, y: -48, z: 24, ry: 16, rx: 8, s: 0.76, blur: 1.8 },
  { x: 62, y: -36, z: 30, ry: -14, rx: 6, s: 0.78, blur: 1.4 },
  { x: 4, y: -100, z: 0, ry: 4, rx: 12, s: 0.68, blur: 2.6 },
] as const;

export default function ZeDelegaScene() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [typed, setTyped] = useState(0);
  const [sent, setSent] = useState(false);
  const [msgN, setMsgN] = useState(0);
  const [sheetOn, setSheetOn] = useState(false);
  const [thanksN, setThanksN] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const paused = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENES[scene];
  const slots = narrow ? CLOUD_M : CLOUD;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce) {
      setTyped(SCENES[0].ask.length);
      setSent(true);
      setPhase("thanks");
      setThanksN(SCENES[0].thanks.length);
      setMsgN(SCENES[0].phone.messages.length);
      setSheetOn(true);
      return;
    }

    let alive = true;
    const T = (fn: () => void, ms: number) => {
      const t = setTimeout(() => alive && fn(), ms);
      timers.current.push(t);
    };

    setPhase("ask");
    setTyped(0);
    setSent(false);
    setMsgN(0);
    setSheetOn(false);
    setThanksN(0);

    // Act 1 — digita
    for (let i = 1; i <= sc.ask.length; i++) T(() => setTyped(i), i * TYPE_MS);
    const tDone = sc.ask.length * TYPE_MS;
    T(() => setSent(true), tDone + 280);

    // Act 2 — telefone + mensagens + sheet
    T(() => {
      setPhase("result");
      setMsgN(1);
    }, tDone + AFTER_TYPE);
    sc.phone.messages.forEach((_, i) => {
      if (i === 0) return;
      T(() => setMsgN(i + 1), tDone + AFTER_TYPE + 550 * i);
    });
    T(() => setSheetOn(true), tDone + AFTER_TYPE + 550 * sc.phone.messages.length + 200);

    // Act 3 — nuvem
    const toThanks = tDone + AFTER_TYPE + RESULT_HOLD;
    T(() => {
      setPhase("thanks");
      setThanksN(0);
    }, toThanks);
    sc.thanks.forEach((_, i) => {
      T(() => setThanksN(i + 1), toThanks + 220 + i * 320);
    });

    const total = toThanks + 220 + sc.thanks.length * 320 + THANKS_HOLD;
    const advance = () => {
      if (paused.current) {
        T(advance, 700);
        return;
      }
      setScene((v) => (v + 1) % SCENES.length);
    };
    T(advance, total);

    return () => {
      alive = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [scene, reduce, sc]);

  return (
    <div
      className="zds"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      aria-label="Demonstração: você pede e o Zé executa no VOS"
    >
      <div className={`zds-glow${sent ? " is-on" : ""}`} aria-hidden="true" />

      <div className="zds-stage" aria-hidden="true">
        <AnimatePresence mode="wait">
          {/* ACT 1 — pedido */}
          {phase === "ask" && (
            <motion.div
              key={`ask-${scene}`}
              className="zds-ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96, transition: { duration: 0.35 } }}
            >
              <div className={`zds-composer${sent ? " is-sent" : ""}`}>
                <img src="/assets/ze/ze-heroi-sm.webp" alt="" width={36} height={36} draggable={false} />
                <p>
                  {sc.ask.slice(0, typed)}
                  {!sent && typed < sc.ask.length && <span className="zds-caret" />}
                  {typed === 0 && <span className="zds-ph">Peça algo pro Zé…</span>}
                </p>
                <motion.span
                  className="zds-send"
                  animate={sent ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </motion.span>
              </div>
              <p className="zds-hint">Você pede · o Zé executa</p>
            </motion.div>
          )}

          {/* ACT 2 — telefone com UI real */}
          {phase === "result" && (
            <motion.div
              key={`result-${scene}`}
              className="zds-phone-wrap"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)", transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              <div className="zds-phone">
                <div className="zds-phone-notch" />
                <header className="zds-phone-head">
                  <span className="zds-avatar" />
                  <div>
                    <strong>{sc.phone.title}</strong>
                    <em>{sc.phone.subtitle}</em>
                  </div>
                  <i className="zds-live">AO VIVO</i>
                </header>

                <div className="zds-chat">
                  <AnimatePresence>
                    {sc.phone.messages.slice(0, msgN).map((m, i) => (
                      <motion.div
                        key={`${scene}-m-${i}`}
                        className={`zds-bubble zds-bubble--${m.from}`}
                        initial={{ opacity: 0, y: 16, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      >
                        {m.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <AnimatePresence>
                    {sheetOn && (
                      <motion.div
                        className="zds-sheet"
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 240, damping: 20 }}
                      >
                        <div
                          className="zds-sheet-img"
                          style={{
                            ["--c" as string]:
                              sc.phone.sheet.kind === "quote" ? "#C9810C" :
                              sc.phone.sheet.kind === "cal" ? "#7A5BFF" :
                              sc.phone.sheet.kind === "cash" ? "#ED4B00" : "#1EB258",
                          }}
                        >
                          <KindMark
                            kind={sc.phone.sheet.kind}
                            tone={
                              sc.phone.sheet.kind === "quote" ? "#C9810C" :
                              sc.phone.sheet.kind === "cal" ? "#7A5BFF" :
                              sc.phone.sheet.kind === "cash" ? "#ED4B00" : "#1EB258"
                            }
                          />
                        </div>
                        <div className="zds-sheet-body">
                          <span>{sc.phone.sheet.status}</span>
                          <strong>{sc.phone.sheet.label}</strong>
                          <p>{sc.phone.sheet.meta}</p>
                          <b>{sc.phone.sheet.value}</b>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACT 3 — nuvem 3D */}
          {phase === "thanks" && (
            <motion.div
              key={`thanks-${scene}`}
              className="zds-cloud"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              {sc.thanks.slice(0, thanksN).map((t, i) => {
                const slot = slots[i] ?? slots[0];
                return (
                  <motion.article
                    key={`${scene}-t-${i}`}
                    className={`zds-card${i === 0 ? " is-hero" : ""}`}
                    style={{ zIndex: 10 + Math.round(slot.z / 8) }}
                    initial={{
                      opacity: 0,
                      x: 0,
                      y: 50,
                      z: -200,
                      scale: 0.5,
                      rotateY: 0,
                      rotateX: 28,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      opacity: 1,
                      x: slot.x,
                      y: slot.y,
                      z: slot.z,
                      scale: slot.s,
                      rotateY: slot.ry,
                      rotateX: slot.rx,
                      filter: `blur(${slot.blur}px)`,
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 20, mass: 0.85 }}
                  >
                    <span className="zds-check" style={{ ["--c" as string]: t.tone }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <div className="zds-card-visual" style={{ ["--c" as string]: t.tone }}>
                      <KindMark kind={t.kind} tone={t.tone} />
                    </div>
                    <p>
                      Feito, <strong>{t.who}</strong>!
                    </p>
                    <em>{t.what}</em>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="zds-status" aria-hidden="true">
        {phase === "ask" && (
          <>
            <span className={`zds-dot${sent ? " is-on" : ""}`} />
            {sent ? "Enviando…" : "Zé online"}
          </>
        )}
        {phase === "result" && (
          <>
            <span className="zds-dot is-on" />
            Executando no VOS…
          </>
        )}
        {phase === "thanks" && (
          <>
            <span className="zds-dot is-on" />
            Tudo resolvido · memória atualizada
          </>
        )}
      </p>

      <style>{`
        .zds {
          position: relative;
          width: 100%;
          height: 100%;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 4px 0 2px;
          perspective: 1400px;
          isolation: isolate;
          overflow: hidden;
        }
        .zds-glow {
          position: absolute;
          left: 50%; top: 42%;
          width: min(440px, 95%);
          height: 280px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background:
            radial-gradient(closest-side, rgba(255, 190, 120, 0.5), transparent 70%),
            radial-gradient(closest-side, rgba(120, 90, 255, 0.42), transparent 76%);
          filter: blur(30px);
          opacity: 0.32;
          transition: opacity .7s ease, transform .7s ease;
          pointer-events: none;
          z-index: 0;
        }
        .zds-glow.is-on { opacity: 0.92; transform: translate(-50%, -50%) scale(1.1); }

        .zds-stage {
          position: relative;
          z-index: 1;
          flex: 1 1 auto;
          width: 100%;
          min-height: 0;
          display: grid;
          place-items: center;
          transform-style: preserve-3d;
          overflow: hidden;
        }

        /* ACT 1 */
        .zds-ask {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
        }
        .zds-composer {
          display: flex;
          align-items: center;
          gap: 11px;
          width: min(400px, 100%);
          padding: 10px 11px 10px 13px;
          border-radius: 999px;
          background: #fff;
          box-shadow:
            0 28px 60px -22px rgba(20, 8, 40, 0.75),
            0 0 0 1px rgba(255,255,255,.4);
        }
        .zds-composer.is-sent {
          box-shadow:
            0 28px 60px -22px rgba(20, 8, 40, 0.75),
            0 0 0 3px rgba(255, 190, 90, 0.35);
        }
        .zds-composer img { border-radius: 11px; flex: 0 0 auto; }
        .zds-composer p {
          flex: 1; min-width: 0; margin: 0;
          font-size: 13.5px; font-weight: 600; color: #14131C;
          line-height: 1.35; white-space: nowrap; overflow: hidden;
        }
        .zds-ph { color: rgba(20,19,28,.38); font-weight: 500; }
        .zds-caret {
          display: inline-block; width: 1.5px; height: 1em;
          margin-left: 2px; vertical-align: text-bottom;
          background: #ED4B00; animation: zds-blink .8s steps(1) infinite;
        }
        @keyframes zds-blink { 50% { opacity: 0 } }
        .zds-send {
          display: grid; place-items: center;
          width: 36px; height: 36px; flex: 0 0 auto;
          border-radius: 99px; background: #14131C; color: #fff;
        }
        .zds-send svg { width: 16px; height: 16px; }
        .zds-hint {
          margin: 0;
          font-family: var(--zx-mono, monospace);
          font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
          color: rgba(255,255,255,.65);
        }

        /* ACT 2 — phone (já grande + borda infinita no chat) */
        .zds-phone-wrap {
          height: 100%;
          max-height: 100%;
          width: 100%;
          display: flex;
          align-items: stretch;
          justify-content: center;
          transform-style: preserve-3d;
          filter: drop-shadow(0 40px 60px rgba(10, 4, 30, 0.55));
          /* fade do aparelho no palco — simula borda infinita */
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            #000 7%,
            #000 90%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            #000 7%,
            #000 90%,
            transparent 100%
          );
        }
        .zds-phone {
          width: min(300px, 92%);
          height: 100%;
          max-height: 100%;
          border-radius: 40px;
          background: linear-gradient(165deg, #2a2438 0%, #12101a 55%, #0c0a12 100%);
          border: 2px solid rgba(255,255,255,.18);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.2),
            0 0 0 1px rgba(0,0,0,.35);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .zds-phone-notch {
          position: absolute; top: 10px; left: 50%;
          width: 96px; height: 24px;
          transform: translateX(-50%);
          border-radius: 99px;
          background: #050508;
          z-index: 2;
        }
        .zds-phone-head {
          display: flex; align-items: center; gap: 10px;
          padding: 44px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          flex: 0 0 auto;
        }
        .zds-avatar {
          width: 32px; height: 32px; border-radius: 99px; flex: 0 0 auto;
          background:
            url("/assets/ze/ze-heroi-sm.webp") center/cover,
            linear-gradient(135deg, #7A5BFF, #ED4B00);
        }
        .zds-phone-head strong {
          display: block; font-size: 13px; font-weight: 700; color: #fff;
        }
        .zds-phone-head em {
          display: block; font-style: normal; font-size: 10.5px;
          color: rgba(255,255,255,.5); margin-top: 1px;
        }
        .zds-live {
          margin-left: auto;
          font-style: normal;
          font-family: var(--zx-mono, monospace);
          font-size: 8.5px; letter-spacing: .12em;
          padding: 4px 7px; border-radius: 99px;
          color: #4AE583; background: rgba(74,229,131,.12);
          border: 1px solid rgba(74,229,131,.35);
        }
        .zds-chat {
          flex: 1 1 auto;
          min-height: 0;
          padding: 14px 14px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
          background: radial-gradient(80% 50% at 50% 0%, rgba(91,69,209,.18), transparent 60%);
          /* conteúdo some suave — não corta seco */
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            #000 6%,
            #000 72%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            #000 6%,
            #000 72%,
            transparent 100%
          );
        }
        .zds-bubble {
          max-width: 92%;
          padding: 9px 12px;
          border-radius: 16px;
          font-size: 12px; font-weight: 550; line-height: 1.35;
        }
        .zds-bubble--user {
          align-self: flex-end;
          background: #fff; color: #14131C;
          border-bottom-right-radius: 5px;
        }
        .zds-bubble--ze {
          align-self: flex-start;
          background: rgba(255,255,255,.12); color: rgba(255,255,255,.92);
          border: 1px solid rgba(255,255,255,.14);
          border-bottom-left-radius: 5px;
        }
        .zds-bubble--client {
          align-self: flex-start;
          background: rgba(37, 211, 102, 0.18); color: #E8FFE8;
          border: 1px solid rgba(37, 211, 102, 0.28);
          border-bottom-left-radius: 5px;
        }
        .zds-sheet {
          flex: 0 0 auto;
          margin-top: 4px;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 18px 40px -18px rgba(0,0,0,.5);
        }
        .zds-sheet-img {
          height: 64px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(80% 80% at 30% 20%, color-mix(in srgb, var(--c, #7A5BFF) 45%, transparent), transparent 60%),
            linear-gradient(145deg, #2a1f3d, #161022);
        }
        .zds-sheet-body { padding: 10px 12px 12px; color: #14131C; }
        .zds-sheet-body span {
          display: inline-block;
          font-size: 10px; font-weight: 700;
          color: #0F7A3C; background: rgba(30,178,88,.12);
          padding: 2px 7px; border-radius: 99px; margin-bottom: 6px;
        }
        .zds-sheet-body strong {
          display: block; font-size: 13.5px; font-weight: 750; letter-spacing: -.02em;
        }
        .zds-sheet-body p {
          margin: 2px 0 0; font-size: 11.5px; color: rgba(20,19,28,.55);
        }
        .zds-sheet-body b {
          display: block; margin-top: 8px;
          font-size: 18px; font-weight: 800; color: #0F7A3C; letter-spacing: -.03em;
        }

        /* ACT 3 — cloud */
        .zds-cloud {
          position: relative;
          width: 100%; height: 100%;
          min-height: 0;
          display: grid; place-items: center;
          transform-style: preserve-3d;
          perspective: 1200px;
          padding: 8px;
          overflow: hidden;
        }
        .zds-card {
          position: absolute;
          width: min(196px, 54vw);
          border-radius: 18px;
          overflow: visible;
          background: #fff;
          color: #14131C;
          box-shadow:
            0 30px 60px -24px rgba(20, 8, 40, 0.7),
            inset 0 1px 0 #fff;
          transform-style: preserve-3d;
          will-change: transform, opacity, filter;
        }
        .zds-card.is-hero { width: min(210px, 58vw); }
        .zds-check {
          position: absolute; top: 10px; left: 10px; z-index: 2;
          display: grid; place-items: center;
          width: 28px; height: 28px; border-radius: 99px;
          background: #fff; color: var(--c);
          border: 2px solid color-mix(in srgb, var(--c) 45%, #fff);
          box-shadow: 0 6px 16px -6px rgba(20,8,40,.4);
        }
        .zds-check svg { width: 14px; height: 14px; }
        .zds-card-visual {
          height: 84px;
          border-radius: 18px 18px 0 0;
          overflow: hidden;
          display: grid;
          place-items: center;
          background:
            radial-gradient(90% 90% at 70% 20%, color-mix(in srgb, var(--c) 50%, transparent), transparent 62%),
            linear-gradient(150deg, #2a2140, #14101f 70%);
        }
        .zds-card.is-hero .zds-card-visual { height: 92px; }
        .zds-kind {
          width: 48px; height: 48px;
          display: grid; place-items: center;
          border-radius: 14px;
          color: var(--c);
          background: color-mix(in srgb, var(--c) 16%, #fff);
          border: 1px solid color-mix(in srgb, var(--c) 35%, transparent);
          box-shadow: 0 10px 24px -12px color-mix(in srgb, var(--c) 70%, transparent);
        }
        .zds-kind svg { width: 24px; height: 24px; }
        .zds-sheet-img .zds-kind { width: 44px; height: 44px; }
        .zds-sheet-img .zds-kind svg { width: 22px; height: 22px; }
        .zds-card p {
          margin: 10px 12px 0;
          font-size: 13.5px; font-weight: 650; letter-spacing: -.02em;
        }
        .zds-card em {
          display: block; margin: 2px 12px 12px;
          font-style: normal; font-size: 11.5px; color: rgba(20,19,28,.55);
        }

        .zds-status {
          position: relative; z-index: 5;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          margin: 0;
          font-family: var(--zx-mono, monospace);
          font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.78);
        }
        .zds-dot {
          width: 6px; height: 6px; border-radius: 99px;
          background: rgba(255,255,255,.45);
        }
        .zds-dot.is-on {
          background: #4AE583;
          box-shadow: 0 0 10px #4AE583;
          animation: zds-blink 1.6s ease infinite;
        }

        @media (max-width: 900px) {
          .zds { min-height: 0; }
          .zds-stage { min-height: 0; }
          .zds-phone { width: min(270px, 86%); }
          .zds-composer { width: min(360px, 100%); }
        }
        @media (max-width: 560px) {
          .zds { min-height: 0; }
          .zds-phone { width: min(250px, 88%); border-radius: 32px; }
          .zds-card { width: min(158px, 48vw); }
          .zds-card.is-hero { width: min(172px, 52vw); }
          .zds-card-visual { height: 70px; }
          .zds-card.is-hero .zds-card-visual { height: 78px; }
        }
      `}</style>
    </div>
  );
}
