"use client";

import { useEffect, useRef, useState } from "react";
import { DEAL_CLOSED_EVENT } from "./FunnelLive";

function formatBRL(n: number) {
  return Math.round(n).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function FinanceLive() {
  const [display, setDisplay] = useState(48230);
  const [pct, setPct] = useState(12);
  const [flash, setFlash] = useState(false);
  const target = useRef(48230);
  const current = useRef(48230);
  const raf = useRef(0);

  useEffect(() => {
    const onDeal = (e: Event) => {
      const amount = (e as CustomEvent<{ amount: number }>).detail?.amount ?? 900;
      target.current += amount;
      setPct((p) => Math.min(48, +(p + amount / 12000).toFixed(1)));
      setFlash(true);
      window.setTimeout(() => setFlash(false), 900);

      cancelAnimationFrame(raf.current);
      const from = current.current;
      const to = target.current;
      const start = performance.now();
      const dur = 900;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const next = from + (to - from) * eased;
        current.current = next;
        setDisplay(next);
        if (t < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener(DEAL_CLOSED_EVENT, onDeal);
    return () => {
      window.removeEventListener(DEAL_CLOSED_EVENT, onDeal);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className={`ffin-live${flash ? " is-flash" : ""}`} aria-hidden="true">
      <div className="ffin-live__n">
        {formatBRL(display)}{" "}
        <span>
          ↗ {pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% no mês
        </span>
      </div>
      <svg className="ffin-live__chart" viewBox="0 0 220 70" preserveAspectRatio="none">
        <path
          className="ffin-live__fill"
          d="M0 56 C 28 48, 44 60, 66 48 S 104 22, 126 34 S 164 10, 186 22 S 208 16, 220 10 L220 70 L0 70 Z"
        />
        <path
          className="ffin-live__line"
          d="M0 56 C 28 48, 44 60, 66 48 S 104 22, 126 34 S 164 10, 186 22 S 208 16, 220 10"
          pathLength="100"
        />
      </svg>
      <div className="ffin-live__tags">
        <span>NF-e emitida</span>
        <span>PIX conciliado</span>
        <span>Contas em dia</span>
      </div>

      <style>{`
        .ffin-live { margin-top: 18px; }
        .ffin-live__n {
          font-family: var(--zx-display, Geist, system-ui, sans-serif);
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
          font-variant-numeric: tabular-nums;
          transition: color .35s ease, text-shadow .35s ease;
        }
        .ffin-live__n span {
          margin-left: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #1EB258;
        }
        .ffin-live.is-flash .ffin-live__n {
          color: #fff;
          text-shadow: 0 0 24px rgba(30, 178, 88, 0.55);
        }
        .ffin-live.is-flash .ffin-live__n span {
          color: #4ADE80;
        }
        .ffin-live__chart {
          width: 100%;
          height: 70px;
          display: block;
          margin-top: 10px;
        }
        .ffin-live__line {
          fill: none;
          stroke: #ED4B00;
          stroke-width: 2.4;
          stroke-linecap: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
        }
        .ffin-live__fill {
          fill: #ED4B00;
          opacity: 0.08;
        }
        .ffin-live.is-flash .ffin-live__line {
          filter: drop-shadow(0 0 6px rgba(237, 75, 0, 0.55));
        }
        .ffin-live__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }
        .ffin-live__tags span {
          font-family: Inter, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(242, 240, 250, 0.55);
          padding: 5px 9px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.09);
        }
      `}</style>
    </div>
  );
}
