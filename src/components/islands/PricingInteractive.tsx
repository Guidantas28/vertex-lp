"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { GetStartedButton } from "../ui/get-started-button";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number | null;
  seats: string;
  desc: string;
  bullets: string[];
  cta: string;
  featured?: boolean;
  contact?: boolean;
  ribbon?: string;
};

type Addon = {
  id: string;
  name: string;
  monthlyPrice: number;
  was?: number;
};

type Cycle = "mensal" | "semestral" | "anual";

const CYCLES: { id: Cycle; label: string; off: number; hint: string }[] = [
  { id: "mensal", label: "Mensal", off: 0, hint: "preço cheio" },
  { id: "semestral", label: "Semestral", off: 30, hint: "30% off" },
  { id: "anual", label: "Anual", off: 50, hint: "50% off" },
];

function discountFactor(cycle: Cycle) {
  if (cycle === "anual") return 0.5;
  if (cycle === "semestral") return 0.7;
  return 1;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

type Props = {
  plans: Plan[];
  addons: Addon[];
  signupUrl?: string;
};

export default function PricingInteractive({ plans, addons }: Props) {
  const [cycle, setCycle] = useState<Cycle>("anual");
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  const factor = discountFactor(cycle);

  const toggleAddon = (planId: string, addonId: string) => {
    setSelected((prev) => {
      const cur = prev[planId] ?? [];
      const next = cur.includes(addonId)
        ? cur.filter((id) => id !== addonId)
        : [...cur, addonId];
      return { ...prev, [planId]: next };
    });
  };

  const totals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of plans) {
      if (p.monthlyPrice == null) continue;
      const addonSum = (selected[p.id] ?? []).reduce((acc, id) => {
        const a = addons.find((x) => x.id === id);
        return acc + (a?.monthlyPrice ?? 0);
      }, 0);
      map[p.id] = Math.round((p.monthlyPrice + addonSum) * factor);
    }
    return map;
  }, [plans, addons, selected, factor]);

  return (
    <div className="zx-pi">
      <div className="zx-pi__cycle" role="tablist" aria-label="Periodicidade">
        <span className="zx-pi__cycle-glow" data-cycle={cycle} aria-hidden="true" />
        {CYCLES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cycle === c.id}
            className={cycle === c.id ? "is-on" : undefined}
            onClick={() => setCycle(c.id)}
          >
            {c.label}
            {c.off > 0 && <em>-{c.off}%</em>}
          </button>
        ))}
      </div>
      <p className="zx-pi__hint">
        {cycle === "anual" && "Preço mensal com 50% off no plano anual"}
        {cycle === "semestral" && "Preço mensal com 30% off no plano semestral"}
        {cycle === "mensal" && "Cobrança mês a mês"}
      </p>

      <div className="zx-pi__grid">
        {plans.map((p) => {
          const isCustom = Boolean(p.contact) || p.monthlyPrice == null;
          const activeAddons = selected[p.id] ?? [];
          const monthlyBase = p.monthlyPrice;
          const display = isCustom ? null : totals[p.id];
          const baseDiscounted =
            monthlyBase == null ? null : Math.round(monthlyBase * factor);

          return (
            <article
              key={p.id}
              className={[
                "zx-pi__card",
                p.featured ? "is-featured" : "",
                isCustom ? "is-custom" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {(p.featured || p.ribbon) && (
                <span className={`zx-pi__ribbon ${p.featured ? "" : "is-soft"}`}>
                  {p.ribbon ?? "Mais vendido"}
                </span>
              )}

              <header>
                <h3>{p.name}</h3>
                <p className="zx-pi__desc">{p.desc}</p>
                {isCustom ? (
                  <p className="zx-pi__value">
                    <strong>Sob consulta</strong>
                  </p>
                ) : (
                  <p className="zx-pi__value">
                    {cycle !== "mensal" && baseDiscounted != null && monthlyBase != null && (
                      <s>{formatBRL(monthlyBase + activeAddons.reduce((a, id) => a + (addons.find((x) => x.id === id)?.monthlyPrice ?? 0), 0))}</s>
                    )}
                    <strong>{formatBRL(display ?? 0)}</strong>
                    <span>/mês</span>
                  </p>
                )}
                <p className="zx-pi__seats">{p.seats}</p>
              </header>

              <ul className="zx-pi__list">
                {p.bullets.map((b) => (
                  <li key={b}>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M4.5 10.5l3.5 3.5 7.5-8"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {!isCustom && (
                <div className="zx-pi__addons">
                  <p>Add-ons</p>
                  <ul>
                    {addons.map((a) => {
                      const on = activeAddons.includes(a.id);
                      const priceNow = Math.round(a.monthlyPrice * factor);
                      return (
                        <li key={a.id} className={on ? "is-on" : undefined}>
                          <button
                            type="button"
                            className="zx-pi__addbtn"
                            aria-pressed={on}
                            aria-label={`${on ? "Remover" : "Adicionar"} ${a.name}`}
                            onClick={() => toggleAddon(p.id, a.id)}
                          >
                            {on ? <Minus size={14} strokeWidth={2.4} /> : <Plus size={14} strokeWidth={2.4} />}
                          </button>
                          <div className="zx-pi__addon-copy">
                            <strong>{a.name}</strong>
                            <span>
                              {a.was != null && <s>{formatBRL(a.was)}</s>}
                              <em>+{formatBRL(priceNow)}/mês</em>
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="zx-pi__cta">
                <GetStartedButton
                  label={p.cta}
                  variant={p.featured ? "dark" : "soft"}
                />
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        .zx-pi { width: 100%; }
        .zx-pi__cycle {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 4px;
          margin-top: 22px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--zx-lar, #ED4B00) 6%, var(--zx-panel, #fff));
          border: 1px solid var(--zx-line, rgba(20,19,28,.1));
          box-shadow: 0 8px 24px -18px rgba(20,19,28,.35);
        }
        .zx-pi__cycle-glow {
          position: absolute;
          top: 4px; bottom: 4px; left: 4px;
          width: calc((100% - 8px) / 3);
          border-radius: 999px;
          background: #14131C;
          transition: transform .3s cubic-bezier(.22,1,.36,1);
          z-index: 0;
        }
        .zx-pi__cycle-glow[data-cycle="semestral"] { transform: translateX(100%); }
        .zx-pi__cycle-glow[data-cycle="anual"] { transform: translateX(200%); }
        .zx-pi__cycle button {
          position: relative;
          z-index: 1;
          appearance: none;
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 9px 16px;
          min-width: 108px;
          border-radius: 999px;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          color: var(--zx-ink2, #646464);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .zx-pi__cycle button.is-on { color: #fff; }
        .zx-pi__cycle button em {
          font-style: normal;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .04em;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(237,75,0,.16);
          color: #ED4B00;
        }
        .zx-pi__cycle button.is-on em {
          background: rgba(255,255,255,.16);
          color: #FFB088;
        }
        .zx-pi__hint {
          margin: 10px 0 0;
          font-size: 12.5px;
          color: var(--zx-ink3, #8A8696);
        }

        .zx-pi__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 22px;
          align-items: stretch;
        }
        .zx-pi__card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 28px 20px 20px;
          border-radius: 20px;
          background:
            linear-gradient(var(--zx-panel, #fff), var(--zx-panel, #fff)) padding-box,
            linear-gradient(145deg, rgba(237,75,0,.35), rgba(91,69,209,.28), rgba(46,107,255,.22)) border-box;
          border: 1.5px solid transparent;
          box-shadow: 0 16px 40px -28px rgba(20,19,28,.35);
        }
        .zx-pi__card.is-featured {
          background:
            linear-gradient(var(--zx-panel, #fff), var(--zx-panel, #fff)) padding-box,
            linear-gradient(140deg, #ED4B00, #B5179E 50%, #5B45D1) border-box;
          border: 2px solid transparent;
          box-shadow: 0 34px 80px -36px rgba(181,23,158,.45);
        }
        .zx-pi__card.is-custom {
          background:
            linear-gradient(var(--zx-panel, #fff), var(--zx-panel, #fff)) padding-box,
            linear-gradient(145deg, rgba(14,151,168,.45), rgba(91,69,209,.35), rgba(237,75,0,.28)) border-box;
        }
        .zx-pi__ribbon {
          position: absolute;
          top: -12px; left: 50%;
          transform: translateX(-50%);
          padding: 5px 14px;
          border-radius: 999px;
          background: linear-gradient(120deg, #ED4B00, #B5179E);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .zx-pi__ribbon.is-soft { background: #14131C; }

        .zx-pi__card h3 {
          margin: 0;
          font-family: var(--zx-display, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: 18px;
          font-weight: var(--zx-fw-title, 700);
          letter-spacing: -0.01em;
          color: var(--zx-ink, #1A202C);
        }
        .zx-pi__desc {
          margin: 6px 0 0;
          font-family: var(--zx-body, Inter, system-ui, sans-serif);
          font-size: var(--zx-fs-meta, 13px);
          line-height: var(--zx-lh-meta, 1.4);
          color: var(--zx-ink3, #8A8696);
          min-height: 38px;
        }
        .zx-pi__value {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 6px;
          margin: 12px 0 0;
        }
        .zx-pi__value strong {
          font-family: var(--zx-display, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: clamp(28px, 2.8vw, 36px);
          font-weight: 800;
          letter-spacing: -.04em;
          color: var(--zx-ink, #1A202C);
        }
        .zx-pi__value span { font-size: 13px; color: var(--zx-ink3, #8A8696); }
        .zx-pi__value s {
          font-size: 13px;
          font-weight: 650;
          color: var(--zx-ink3, #8A8696);
        }
        .zx-pi__seats {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid var(--zx-line, rgba(20,19,28,.1));
          font-family: var(--zx-mono, ui-monospace, monospace);
          font-size: 10.5px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--zx-ink2, #646464);
        }

        .zx-pi__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }
        .zx-pi__list li {
          display: flex;
          gap: 9px;
          font-size: 12.5px;
          line-height: 1.45;
          color: var(--zx-ink, #1A202C);
        }
        .zx-pi__list svg {
          width: 15px; height: 15px;
          margin-top: 2px;
          color: var(--zx-verde, #1EB258);
          flex: 0 0 auto;
        }

        .zx-pi__addons {
          margin-top: 2px;
          padding: 12px;
          border-radius: 14px;
          border: 1px dashed var(--zx-line-2, rgba(20,19,28,.18));
          background: color-mix(in srgb, var(--zx-lar, #ED4B00) 5%, var(--zx-panel, #fff));
        }
        .zx-pi__addons > p {
          margin: 0 0 8px;
          font-family: var(--zx-mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--zx-ink3, #8A8696);
        }
        .zx-pi__addons ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }
        .zx-pi__addons li {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .zx-pi__addbtn {
          flex: 0 0 auto;
          width: 28px; height: 28px;
          border-radius: 9px;
          border: 1.5px solid var(--zx-line-2, rgba(20,19,28,.18));
          background: #fff;
          color: var(--zx-ink, #1A202C);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: .2s ease;
        }
        .zx-pi__addons li.is-on .zx-pi__addbtn {
          background: #ED4B00;
          border-color: #ED4B00;
          color: #fff;
        }
        .zx-pi__addon-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .zx-pi__addon-copy strong {
          font-size: 12px;
          font-weight: 700;
          color: var(--zx-ink, #1A202C);
        }
        .zx-pi__addon-copy span {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          font-size: 11.5px;
        }
        .zx-pi__addon-copy s { color: var(--zx-ink3, #8A8696); }
        .zx-pi__addon-copy em {
          font-style: normal;
          font-weight: 750;
          color: #ED4B00;
        }

        .zx-pi__cta {
          margin-top: auto;
          display: flex;
          width: 100%;
        }
        .zx-pi__cta > button {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 1100px) {
          .zx-pi__grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 620px) {
          .zx-pi__grid { grid-template-columns: 1fr; }
          .zx-pi__cycle { width: 100%; }
          .zx-pi__cycle button { flex: 1; min-width: 0; padding: 9px 8px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
