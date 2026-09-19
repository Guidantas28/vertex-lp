"use client";

/**
 * MAPA PONTILHADO com arcos (17/09): o founder trocou o globo da seção "Eles trabalham
 * enquanto você dorme" pelo World Map do 21st.dev. Adaptado pra casa: sem next/image e
 * sem next-themes (a noite do Zé é sempre escura); o mapa é RECORTADO no Brasil pelo
 * `region` do dotted-map, porque num mapa-múndi o país vira um selo e os arcos entre
 * cidades brasileiras não se leem; a projeção usa `getPin` do próprio mapa, que sabe o
 * recorte; e o mapa é montado só no cliente (o SVG tem milhares de círculos, e no HTML do
 * servidor viraria 250 KB de data URI). Os arcos correm em laço, com um pulso em cada
 * ponta, na tinta violeta do Zé.
 */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import DottedMap from "dotted-map";

export type Ponto = { lat: number; lng: number };
export interface WorldMapProps {
  arcos?: { de: Ponto; para: Ponto }[];
  corLinha?: string;
  corPonto?: string;
  /** altura da grade de pontos (mais = mais denso) */
  altura?: number;
  className?: string;
  /** pontos que a cena quer ancorar por cima do mapa: volta a posição de cada um em % do mapa */
  pontos?: Ponto[];
  aoProjetar?: (posicoes: { x: number; y: number }[]) => void;
}

/* SÓ O BRASIL (founder 17/09: "deixa só o Brasil aí, o formato certinho"): o recorte por
   região pegava a terra dos vizinhos junto e a silhueta virava um pedaço de continente;
   `countries` pontilha só o território do país e enquadra nele. */
const PAISES = ["BRA"];

type Mapa = { svg: string; w: number; h: number; pins: { x: number; y: number }[][] };

export function WorldMap({ arcos = [], corLinha = "#A899FF", corPonto = "rgba(168, 153, 255, 0.42)", altura = 110, className = "", pontos = [], aoProjetar }: WorldMapProps) {
  const [mapa, setMapa] = useState<Mapa | null>(null);
  const parado = useReducedMotion();

  useEffect(() => {
    const m = new DottedMap({ height: altura, grid: "diagonal", countries: PAISES });
    const svg = m.getSVG({ radius: 0.2, color: corPonto, shape: "circle", backgroundColor: "transparent" });
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
    const w = vb ? Number(vb[1]) : 100;
    const h = vb ? Number(vb[2]) : altura;
    const pins = arcos.map((a) => [m.getPin(a.de), m.getPin(a.para)].map((p) => ({ x: p.x, y: p.y })));
    setMapa({ svg, w, h, pins });
    if (aoProjetar && pontos.length) aoProjetar(pontos.map((p) => { const q = m.getPin(p); return { x: (q.x / w) * 100, y: (q.y / h) * 100 }; }));
    // arcos e cores mudam por prop, nunca por estado: o mapa se monta uma vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [altura, corPonto]);

  const curva = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2;
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const my = Math.min(a.y, b.y) - d * 0.22;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  };

  return (
    <div className={className} style={{ position: "relative", width: "100%", aspectRatio: mapa ? `${mapa.w} / ${mapa.h}` : "105 / 110" }} aria-hidden="true">
      {mapa ? (
        <>
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(mapa.svg)}`}
            alt=""
            draggable={false}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", userSelect: "none", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)", maskImage: "linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)" }}
          />
          <svg viewBox={`0 0 ${mapa.w} ${mapa.h}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
            <defs>
              <linearGradient id="mdz-arco" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={corLinha} stopOpacity="0" />
                <stop offset="12%" stopColor={corLinha} stopOpacity="1" />
                <stop offset="88%" stopColor={corLinha} stopOpacity="1" />
                <stop offset="100%" stopColor={corLinha} stopOpacity="0" />
              </linearGradient>
            </defs>
            {mapa.pins.map(([a, b], i) => (
              <g key={i}>
                <path d={curva(a, b)} fill="none" stroke={corLinha} strokeOpacity="0.14" strokeWidth="0.32" />
                <motion.path
                  d={curva(a, b)}
                  fill="none"
                  stroke="url(#mdz-arco)"
                  strokeWidth="0.42"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={parado ? { pathLength: 1, opacity: 1 } : { pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
                  transition={parado ? { duration: 0 } : { duration: 3.2, times: [0, 0.55, 1], ease: "easeInOut", delay: i * 0.7, repeat: Infinity, repeatDelay: 1.4 }}
                />
                {[a, b].map((p, j) => (
                  <g key={j}>
                    <circle cx={p.x} cy={p.y} r="0.55" fill={corLinha} />
                    <circle cx={p.x} cy={p.y} r="0.55" fill={corLinha} opacity="0.5">
                      {!parado ? (
                        <>
                          <animate attributeName="r" from="0.55" to="2.4" dur="1.6s" begin={`${(i * 0.3 + j * 0.8).toFixed(1)}s`} repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" begin={`${(i * 0.3 + j * 0.8).toFixed(1)}s`} repeatCount="indefinite" />
                        </>
                      ) : null}
                    </circle>
                  </g>
                ))}
              </g>
            ))}
          </svg>
        </>
      ) : null}
    </div>
  );
}

export default WorldMap;
