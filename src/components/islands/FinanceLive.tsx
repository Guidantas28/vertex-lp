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
        <defs>
          <linearGradient id="ffin-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ED4B00" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ED4B00" stopOpacity="0" />
          </linearGradient>
        </defs>
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
        <span><img src="/assets/icons/nfe.svg" alt="" width={13} height={13} loading="lazy" />NF-e emitida</span>
        <span><img src="/assets/icons/pix.svg" alt="" width={13} height={13} loading="lazy" />PIX conciliado</span>
        <span><i className="ffin-live__ok" />Contas em dia</span>
      </div>

      {/* CSS por dangerouslySetInnerHTML, não como filho do <style>: como filho,
          o React quebra a string em nós de texto e a remontagem no cliente não
          bate com a do servidor, e a hidratação da página cai inteira. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ffin-live { margin-top: 18px; }
        .ffin-live__n {
          font-family: var(--zx-body, Inter, system-ui, sans-serif);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #fff;
          font-variant-numeric: tabular-nums;
          transition: color .35s ease, text-shadow .35s ease;
        }
        .ffin-live__n span {
          margin-left: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #3DBE7A;
        }
        .ffin-live.is-flash .ffin-live__n {
          color: #fff;
          text-shadow: 0 0 24px rgba(61, 190, 122, 0.45);
        }
        .ffin-live.is-flash .ffin-live__n span {
          color: #3DBE7A;
        }
        .ffin-live__chart {
          width: 100%;
          height: clamp(78px, 15vh, 130px);
          display: block;
          margin-top: 12px;
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
          fill: url(#ffin-grad);
          opacity: 0.6;
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
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--zx-body, Inter, system-ui, sans-serif);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0;
          text-transform: none;
          color: rgba(237, 237, 237, 0.7);
          padding: 4px 9px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
        }
        .ffin-live__tags img { display: block; width: 13px; height: 13px; }
        .ffin-live__ok {
          width: 7px; height: 7px;
          border-radius: 999px;
          background: #3DBE7A;
        }
      ` }} />
    </div>
  );
}
