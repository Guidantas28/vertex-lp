"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Stage = {
  id: string;
  label: string;
  color: string;
};

const STAGES: Stage[] = [
  { id: "novo", label: "Novo lead", color: "#8B76FF" },
  { id: "qual", label: "Qualificado", color: "#ED4B00" },
  { id: "prop", label: "Proposta", color: "#2E6BFF" },
  { id: "fech", label: "Fechado", color: "#1EB258" },
];

const NOTES = [
  "Rafael Duarte acabou de virar lead quente",
  "Marina Silva entrou em Proposta",
  "Deal da Alfa Clima fechado · PIX",
  "Novo lead · Instagram Ads",
  "Carla Mendes avançou pra Qualificado",
];

/** Evento: funil fechou deal → caixa sobe */
export const DEAL_CLOSED_EVENT = "vos:deal-closed";

function barWidth(n: number, ceiling: number) {
  return Math.max(18, Math.min(100, (n / ceiling) * 100));
}

export default function FunnelLive() {
  // Começa em 36/29/22/17, mas o “teto” visual é o dobro → barras no meio
  const [counts, setCounts] = useState([36, 29, 22, 17]);
  const [ceiling, setCeiling] = useState(72);
  const [note, setNote] = useState(NOTES[0]);
  const noteIdx = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const id = window.setInterval(() => {
      setCounts((prev) => {
        const next = [...prev];
        const roll = Math.random();

        if (roll < 0.35) {
          next[0] += 1;
          noteIdx.current = (noteIdx.current + 1) % NOTES.length;
          setNote(NOTES[noteIdx.current]);
        } else if (roll < 0.7) {
          const from = Math.floor(Math.random() * 3);
          if (next[from] > 8) {
            next[from] -= 1;
            next[from + 1] += 1;
            if (from + 1 === 3) {
              const amount = 780 + Math.floor(Math.random() * 1800);
              window.dispatchEvent(
                new CustomEvent(DEAL_CLOSED_EVENT, { detail: { amount } }),
              );
              setNote(NOTES[2]);
            } else {
              noteIdx.current = (noteIdx.current + 1) % NOTES.length;
              setNote(NOTES[noteIdx.current]);
            }
          } else {
            next[0] += 1;
          }
        } else {
          next[0] += Math.random() > 0.5 ? 1 : 0;
          next[1] += Math.random() > 0.6 ? 1 : 0;
          next[2] += Math.random() > 0.7 ? 1 : 0;
          if (Math.random() > 0.82) {
            next[3] += 1;
            const amount = 650 + Math.floor(Math.random() * 1400);
            window.dispatchEvent(
              new CustomEvent(DEAL_CLOSED_EVENT, { detail: { amount } }),
            );
            setNote(NOTES[2]);
          }
        }

        const peak = Math.max(...next);
        setCeiling((c) => Math.max(c, Math.ceil(peak * 1.35)));
        return next;
      });
    }, 380);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flive-funnel" aria-hidden="true">
      <div className="flive-funnel__rows">
        {STAGES.map((s, i) => {
          const n = counts[i];
          const w = barWidth(n, ceiling);
          return (
            <div key={s.id} className="flive-funnel__row">
              <div
                className="flive-funnel__bar"
                style={{ "--w": `${w}%`, "--bc": s.color } as CSSProperties}
              >
                <i />
                <span>{s.label}</span>
              </div>
              <b>{n}</b>
            </div>
          );
        })}
      </div>
      <p className="flive-funnel__note">
        <i />
        {note}
      </p>

      <style>{`
        .flive-funnel {
          margin-top: 18px;
          display: grid;
          gap: 8px;
        }
        .flive-funnel__rows { display: grid; gap: 8px; }
        .flive-funnel__row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .flive-funnel__row > b {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          min-width: 28px;
          text-align: right;
          font-variant-numeric: tabular-nums;
          transition: color .3s ease;
        }
        .flive-funnel__bar {
          position: relative;
          flex: 1;
          height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.03);
          overflow: hidden;
        }
        .flive-funnel__bar i {
          position: absolute;
          inset: 0 auto 0 0;
          width: var(--w);
          background: linear-gradient(
            90deg,
            color-mix(in srgb, var(--bc) 34%, transparent),
            color-mix(in srgb, var(--bc) 10%, transparent)
          );
          border-right: 2px solid var(--bc);
          transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .flive-funnel__bar span {
          position: relative;
          z-index: 1;
          display: inline-block;
          padding: 8px 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.88);
        }
        .flive-funnel__note {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 6px 0 0;
          font-size: 11.5px;
          color: rgba(242, 240, 250, 0.5);
        }
        .flive-funnel__note i {
          width: 6px;
          height: 6px;
          border-radius: 99px;
          background: #1EB258;
          box-shadow: 0 0 0 0 rgba(30, 178, 88, 0.5);
          animation: flive-funnel-ping 1.2s ease-out infinite;
        }
        @keyframes flive-funnel-ping {
          0% { box-shadow: 0 0 0 0 rgba(30, 178, 88, 0.45); }
          70%, 100% { box-shadow: 0 0 0 7px transparent; }
        }
        @media (prefers-reduced-motion: reduce) {
          .flive-funnel__bar i { transition: none; }
          .flive-funnel__note i { animation: none; }
        }
      `}</style>
    </div>
  );
}
