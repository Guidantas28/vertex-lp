import { useEffect, useState } from "react";

type Feature = { icon: string; label: string };
type Quote = { text: string; name: string; biz: string; photo: string; stars: number };
type Segment = {
  id: string;
  icon: string;
  label: string;
  color: string;
  title: string;
  body: string;
  bullets: string[];
  features: Feature[];
  quote: Quote;
};

const IC: Record<string, string> = {
  dash: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  whats: '<path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z"/>',
  crm: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M22 21v-2a4 4 0 0 0-3-3.8"/><path d="M16 3.5a4 4 0 0 1 0 7"/>',
  doc: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M19 8.5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6Z"/><path d="M9 13l1.5 1.5L14 11"/>',
  task: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  commerce: '<path d="M3 9h18l-1.2 9.2A2 2 0 0 1 17.8 20H6.2a2 2 0 0 1-2-1.8L3 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>',
  services: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6L5 19.7l6-6a4 4 0 0 0 5.4-5.4l-2.1 2.1-2-2 2.1-2.1Z"/>',
  finance: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.4"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  box: '<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
};

function Svg({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: IC[name] ?? "" }} />
  );
}

const ROTATE_MS = 5200;

export default function SegmentTabs({
  segments,
  cta,
  signupUrl = "https://app.vos.com/signup",
}: {
  segments: Segment[];
  cta: string;
  signupUrl?: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [locked, setLocked] = useState(false);
  const s = segments[active];

  useEffect(() => {
    if (locked || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % segments.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [locked, paused, segments.length]);

  const pick = (i: number) => {
    setLocked(true);
    setActive(i);
  };

  const lighten = (hex: string, amt = 50) => `color-mix(in srgb, ${hex} ${amt}%, #fff)`;

  return (
    <div className="seg-tabs mt-10 sm:mt-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Tabs — scroll horizontal no mobile */}
      <div className="seg-tabs__nav" role="tablist" aria-label="Segmentos">
        {segments.map((seg, i) => {
          const on = i === active;
          return (
            <button
              key={seg.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => pick(i)}
              className="seg-tabs__tab group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-300 sm:gap-2.5 sm:px-4 sm:py-3"
              style={{
                background: on ? `color-mix(in srgb, ${seg.color} 20%, transparent)` : "rgba(255,255,255,.05)",
                borderColor: on ? seg.color : "var(--slate-line)",
                boxShadow: on ? `0 16px 38px -18px ${seg.color}` : "none",
              }}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors sm:h-9 sm:w-9"
                style={{ background: on ? seg.color : "rgba(255,255,255,.08)", color: on ? "#fff" : "var(--slate-ink-2)" }}
              >
                <Svg name={seg.icon} size={17} />
              </span>
              <span className="whitespace-nowrap text-[0.8rem] font-semibold sm:text-[0.86rem]" style={{ color: on ? "var(--slate-ink)" : "var(--slate-ink-2)" }}>
                {seg.label}
              </span>
              {on && !locked && (
                <span key={active} className="seg-bar" style={{ background: seg.color, animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? "paused" : "running" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Painel */}
      <div
        key={s.id}
        className="seg-panel mt-5 grid gap-5 rounded-[20px] border p-4 sm:mt-7 sm:gap-6 sm:rounded-[24px] sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8"
        style={{ borderColor: "var(--slate-line)", background: "rgba(255,255,255,.04)" }}
      >
        {/* Esquerda */}
        <div className="flex min-w-0 flex-col">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-pill px-3 py-1 font-mono text-[0.66rem] uppercase tracking-wide"
            style={{
              background: `color-mix(in srgb, ${s.color} 22%, transparent)`,
              color: lighten(s.color, 45),
              border: `1px solid color-mix(in srgb, ${s.color} 45%, transparent)`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: lighten(s.color, 35) }} />
            {s.label}
          </span>
          <h3
            className="mt-3 font-display text-[clamp(24px,3vw,32px)] font-bold leading-[1.1] tracking-[-0.02em] sm:mt-4"
            style={{ color: "var(--slate-ink)", fontFamily: "var(--zx-display, Plus Jakarta Sans, system-ui, sans-serif)" }}
          >
            {s.title}
          </h3>
          <p
            className="mt-2.5 max-w-xl text-[16px] font-normal leading-[22px] sm:mt-3"
            style={{ color: "var(--slate-ink-2)", fontFamily: "var(--zx-body, Inter, system-ui, sans-serif)" }}
          >
            {s.body}
          </p>

          <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.16em]" style={{ color: "var(--slate-ink-2)" }}>
            Como ajudamos
          </p>
          <ul className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
            {s.bullets.slice(0, 6).map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[16px] font-normal leading-[22px]" style={{ color: "var(--slate-ink)" }}>
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ background: s.color }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>

          <figure
            className="mt-8 flex items-start gap-3 rounded-2xl border p-3.5 sm:gap-3.5 sm:p-4"
            style={{ borderColor: "var(--slate-line)", background: "rgba(255,255,255,.04)" }}
          >
            <img
              src={s.quote.photo}
              alt={s.quote.name}
              loading="lazy"
              className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
              style={{ border: `2px solid ${s.color}` }}
            />
            <div className="min-w-0">
              <div className="flex gap-0.5" style={{ color: lighten(s.color, 35) }}>
                {Array.from({ length: s.quote.stars }).map((_, k) => (
                  <svg key={k} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.9 6.1 21l1.1-6.5L2.5 9.9l6.5-1L12 2.5Z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mt-1.5 text-[0.86rem] leading-snug sm:text-[0.9rem]" style={{ color: "var(--slate-ink)" }}>
                "{s.quote.text}"
              </blockquote>
              <figcaption className="mt-1.5 text-[0.75rem] sm:text-[0.78rem]" style={{ color: "var(--slate-ink-2)" }}>
                <span className="font-semibold" style={{ color: "var(--slate-ink)" }}>
                  {s.quote.name}
                </span>{" "}
                · {s.quote.biz}
              </figcaption>
            </div>
          </figure>
        </div>

        {/* Direita — card enriquecido */}
        <aside
          className="seg-side flex flex-col rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--slate-line)", background: "rgba(255,255,255,.03)" }}
        >
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em]" style={{ color: "var(--slate-ink-2)" }}>
            Nesta solução
          </p>
          <h4 className="mt-1.5 text-[1.05rem] font-bold leading-snug" style={{ color: "var(--slate-ink)" }}>
            O que entra no fluxo
          </h4>

          <ul className="mt-3 flex flex-col sm:mt-4">
            {s.features.map((f, i) => (
              <li key={f.label} className="flex items-center gap-3 py-3" style={{ borderTop: i ? "1px solid var(--slate-line)" : "none" }}>
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: `color-mix(in srgb, ${s.color} 18%, transparent)`, color: lighten(s.color, 55) }}
                >
                  <Svg name={f.icon} size={18} />
                </span>
                <span className="text-[0.9rem] font-medium leading-snug" style={{ color: "var(--slate-ink)" }}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>

          {/* Resultado + CTA — mesmo respiro dos bullets → review */}
          <div className="mt-auto pt-2">
            <div
              className="rounded-xl border px-3.5 py-3"
              style={{
                borderColor: `color-mix(in srgb, ${s.color} 35%, transparent)`,
                background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
              }}
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em]" style={{ color: lighten(s.color, 45) }}>
                Resultado
              </p>
              <p className="mt-1 text-[0.88rem] font-semibold leading-snug" style={{ color: "var(--slate-ink)" }}>
                {s.quote.text}
              </p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                data-action="lead"
                className="group relative flex w-full items-center overflow-hidden rounded-[12px] py-[14px] pl-[22px] pr-[14px] text-[16px] font-semibold leading-[22px] text-white transition-transform hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(120deg, ${s.color}, color-mix(in srgb, ${s.color} 55%, #6D4AFF))`,
                  boxShadow: `0 12px 28px -14px ${s.color}`,
                }}
              >
                <span className="mr-12 transition-opacity duration-500 group-hover:opacity-0">{cta}</span>
                <i className="absolute bottom-1 right-1 top-1 z-10 grid w-1/4 place-items-center rounded-sm bg-white/20 not-italic transition-all duration-500 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </i>
              </button>
            </div>
            <a href="#features" className="mt-3 text-center text-[0.82rem] font-semibold underline-offset-2 hover:underline" style={{ color: lighten(s.color, 50) }}>
              Ver como funciona →
            </a>
          </div>
        </aside>
      </div>

      <style>{`
        .seg-tabs__nav {
          display: flex;
          gap: 8px;
          justify-content: flex-start;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-inline: -4px;
          padding-inline: 4px;
          scroll-snap-type: x proximity;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .seg-tabs__nav::-webkit-scrollbar { display: none; }
        .seg-tabs__tab { scroll-snap-align: start; }
        @media (min-width: 768px) {
          .seg-tabs__nav {
            flex-wrap: wrap;
            justify-content: center;
            overflow: visible;
            margin-inline: 0;
            padding-inline: 0;
          }
        }
        .seg-panel { animation: seg-in .45s var(--ease-vos, ease) both; }
        @keyframes seg-in { from { opacity: 0; transform: translateY(10px); } }
        .seg-bar {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 100%;
          border-radius: 2px;
          transform-origin: left center;
          transform: scaleX(0);
          animation: seg-fill linear forwards;
        }
        @keyframes seg-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @media (prefers-reduced-motion: reduce) {
          .seg-panel { animation: none; }
          .seg-bar { display: none; }
        }
      `}</style>
    </div>
  );
}
