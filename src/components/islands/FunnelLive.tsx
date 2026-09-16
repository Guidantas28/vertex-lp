"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Stage = { id: string; label: string };

/** Etapa é categoria (cinza); só "Fechado" é ESTADO e leva cor (UNO §41c-ter). */
const EASE = [0.22, 1, 0.36, 1] as const;

const STAGES: Stage[] = [
  { id: "novo", label: "Novo lead" },
  { id: "qual", label: "Qualificado" },
  { id: "prop", label: "Proposta" },
  { id: "fech", label: "Fechado" },
];

/** Gente de verdade no funil: cada negócio tem rosto, nome e de onde veio. */
type Lead = { nome: string; foto: string; canal: string; empresa: string };

const LEADS: Lead[] = [
  { nome: "Rafael Duarte", foto: "/assets/people/social-11.webp", canal: "/assets/icons/whatsapp.svg", empresa: "Construla Obras" },
  { nome: "Marina Silva", foto: "/assets/people/social-14.webp", canal: "/assets/icons/instagram.svg", empresa: "Empório Sabor" },
  { nome: "Carla Mendes", foto: "/assets/people/social-19.webp", canal: "/assets/icons/whatsapp.svg", empresa: "Café Aroma" },
  { nome: "Diego Prado", foto: "/assets/people/social-20.webp", canal: "/assets/icons/whatsapp.svg", empresa: "Prime Elétrica" },
  { nome: "Aline Costa", foto: "/assets/people/social-21.webp", canal: "/assets/icons/instagram.svg", empresa: "Adega Premium" },
  { nome: "Tiago Moraes", foto: "/assets/people/social-16.webp", canal: "/assets/icons/whatsapp.svg", empresa: "Oficina Forte" },
];

/** Evento: funil fechou deal → caixa sobe */
export const DEAL_CLOSED_EVENT = "vos:deal-closed";

function barWidth(n: number, ceiling: number) {
  return Math.max(18, Math.min(100, (n / ceiling) * 100));
}

export default function FunnelLive() {
  const [counts, setCounts] = useState([36, 29, 22, 17]);
  const [ceiling, setCeiling] = useState(72);
  // quem está em cada etapa agora (índices em LEADS), pra mostrar as caras
  const [faces, setFaces] = useState<number[][]>([[0, 1, 2], [3, 4], [5, 0], [1]]);
  const [nota, setNota] = useState<{ lead: Lead; texto: string }>({ lead: LEADS[0], texto: "acabou de virar lead quente" });
  const [acesa, setAcesa] = useState(-1);
  const tick = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const id = window.setInterval(() => {
      tick.current += 1;
      const t = tick.current;

      setCounts((prev) => {
        const next = [...prev];
        const roll = Math.random();

        if (roll < 0.38) {
          next[0] += 1;
        } else if (roll < 0.78) {
          const from = Math.floor(Math.random() * 3);
          if (next[from] > 8) {
            next[from] -= 1;
            next[from + 1] += 1;
            if (from + 1 === 3) {
              const amount = 780 + Math.floor(Math.random() * 1800);
              window.dispatchEvent(new CustomEvent(DEAL_CLOSED_EVENT, { detail: { amount } }));
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
            window.dispatchEvent(new CustomEvent(DEAL_CLOSED_EVENT, { detail: { amount } }));
          }
        }

        const peak = Math.max(...next);
        setCeiling((c) => Math.max(c, Math.ceil(peak * 1.35)));
        return next;
      });

      // a cada 3 batidas uma pessoa muda de etapa: a cara sai de uma fileira e entra na outra
      if (t % 3 === 0) {
        setFaces((prev) => {
          const next = prev.map((row) => [...row]);
          const from = Math.floor(Math.random() * 3);
          if (next[from].length > 1) {
            const moved = next[from].shift()!;
            next[from + 1] = [moved, ...next[from + 1]].slice(0, 3);
            setAcesa(from + 1);
            window.setTimeout(() => setAcesa(-1), 520);
            const lead = LEADS[moved];
            setNota({
              lead,
              texto:
                from + 1 === 3
                  ? "fechou negócio · PIX confirmado"
                  : `avançou pra ${STAGES[from + 1].label}`,
            });
          } else {
            const novo = Math.floor(Math.random() * LEADS.length);
            next[0] = [novo, ...next[0]].slice(0, 3);
            setAcesa(0);
            window.setTimeout(() => setAcesa(-1), 520);
            setNota({ lead: LEADS[novo], texto: "acabou de virar lead quente" });
          }
          return next;
        });
      }
    }, 1400);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flive-funnel" aria-hidden="true">
      <div className="flive-funnel__rows">
        {STAGES.map((s, i) => {
          const n = counts[i];
          const w = barWidth(n, ceiling);
          const ganhou = i === 3;
          return (
            <div key={s.id} className="flive-funnel__row">
              <div
                className={`flive-funnel__bar${ganhou ? " is-won" : ""}${acesa === i ? " is-acesa" : ""}`}
                style={{ "--w": `${w}%` } as CSSProperties}
              >
                <i />
                <span>{s.label}</span>
                <div className="flive-funnel__faces">
                  <AnimatePresence initial={false} mode="popLayout">
                    {faces[i].map((li, k) => (
                      <motion.img
                        key={li}
                        layout
                        src={LEADS[li].foto}
                        alt=""
                        width={30}
                        height={30}
                        loading="lazy"
                        decoding="async"
                        style={{ zIndex: 3 - k } as CSSProperties}
                        /* entra pela esquerda, de onde veio, e sai pela direita,
                           pra onde vai: a migração fica legível sem cartão voando */
                        initial={{ opacity: 0, x: -16, scale: 0.7 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 18, scale: 0.8 }}
                        transition={{ duration: 0.32, ease: EASE }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <motion.b
                key={`${s.id}-${n}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.14, 1] }}
                transition={{ duration: 0.24, ease: EASE, times: [0, 0.4, 1] }}
              >
                {n}
              </motion.b>
            </div>
          );
        })}
      </div>

      <p className="flive-funnel__note">
        <span className="flive-funnel__note-av">
          <img src={nota.lead.foto} alt="" width={20} height={20} loading="lazy" decoding="async" />
          <img className="flive-funnel__note-canal" src={nota.lead.canal} alt="" width={10} height={10} loading="lazy" />
        </span>
        <b>{nota.lead.nome}</b> {nota.texto}
      </p>

      {/* CSS por dangerouslySetInnerHTML, não como filho do <style>: como filho,
          o React quebra a string em nós de texto e a remontagem no cliente não
          bate com a do servidor, e a hidratação da página cai inteira. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .flive-funnel {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          min-height: 0;
        }
        .flive-funnel__rows {
          display: grid;
          gap: 10px;
          align-content: center;
          flex: 1;
        }
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
          display: inline-block;
          font-variant-numeric: tabular-nums;
        }
        .flive-funnel__bar {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          height: 52px;
          padding: 0 12px 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.03);
          overflow: hidden;
          transition: border-color 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* encenação: a etapa que acabou de receber alguém acende por meio segundo */
        .flive-funnel__bar.is-acesa {
          border-color: rgba(237, 75, 0, 0.45);
          background: rgba(237, 75, 0, 0.07);
        }
        .flive-funnel__bar i {
          position: absolute;
          inset: 0 auto 0 0;
          width: var(--w);
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.03));
          border-right: 2px solid rgba(255, 255, 255, 0.3);
          transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Ganhou é ESTADO: leva a cor de sucesso. As outras etapas são categoria, ficam cinza. */
        .flive-funnel__bar.is-won i {
          background: linear-gradient(90deg, rgba(61, 190, 122, 0.34), rgba(61, 190, 122, 0.08));
          border-right-color: #3DBE7A;
        }
        .flive-funnel__bar span {
          position: relative;
          z-index: 1;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.88);
          white-space: nowrap;
        }
        /* As caras de quem está na etapa, empilhadas como no CRM */
        .flive-funnel__faces {
          position: relative;
          z-index: 1;
          display: flex;
          margin-left: auto;
          padding-left: 8px;
        }
        .flive-funnel__faces img {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          object-fit: cover;
          object-position: top center;
          border: 2px solid rgba(24, 27, 30, 0.95);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
          margin-left: -9px;
        }
        .flive-funnel__faces img:first-child { margin-left: 0; }
        .flive-funnel__note-av > img:first-child { filter: none; }

        .flive-funnel__note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 6px 0 0;
          font-size: 11.5px;
          color: rgba(237, 237, 237, 0.55);
        }
        .flive-funnel__note b {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.86);
        }
        .flive-funnel__note-av {
          position: relative;
          flex: 0 0 auto;
          width: 20px;
          height: 20px;
        }
        .flive-funnel__note-av > img:first-child {
          width: 20px;
          height: 20px;
          border-radius: 999px;
          object-fit: cover;
          object-position: top center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .flive-funnel__note-canal {
          position: absolute;
          right: -2px;
          bottom: -2px;
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background: #0b0d0f;
          padding: 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          .flive-funnel__bar i { transition: none; }
          .flive-funnel__bar { transition: none; }
        }
      ` }} />
    </div>
  );
}
