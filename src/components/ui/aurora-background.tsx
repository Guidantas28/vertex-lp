"use client";

/**
 * AURORA: o fundo vivo do mundo do Zé (founder 16/09: "coloca esse fundo aqui no Zé").
 *
 * Adaptado do Aurora Background do 21st.dev pra casa: as cores saem da paleta do Zé
 * (o violeta `--zx-ai`, o índigo da noite e um sopro do laranja-queimado da rampa da
 * palavra) em vez do roxo/fúcsia genérico; as manchas têm TAMANHO FIXO em px (o
 * original media meio contêiner, e o mundo do Zé tem 4.000px de altura); as estrelas
 * moram em % do contêiner (não em vw/vh) e nascem de um sorteio DETERMINÍSTICO, senão o
 * servidor e o cliente sorteiam números diferentes e a hidratação da ilha reclama; o
 * pulso tem nome próprio (`aurora-pulso`) pra não sobrescrever o `pulse` do Tailwind;
 * e existe o modo `asLayer`, que é como o mundo do Zé usa: uma camada absoluta atrás
 * do conteúdo, sem `w-screen h-screen` nem fundo preto próprio.
 *
 * Com `prefers-reduced-motion`, tudo fica parado (as manchas e as estrelas continuam,
 * só não se mexem).
 */
import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface AuroraBackgroundProps {
  /** Classes extras no invólucro */
  className?: string;
  /** O que fica por cima do fundo (só no modo invólucro) */
  children?: React.ReactNode;
  /** Quantas estrelas */
  starCount?: number;
  /** As duas cores dos gradientes radiais que pulsam */
  gradientColors?: [string, string];
  /** Duração do pulso, em segundos */
  pulseDuration?: number;
  /** Rótulo ARIA do fundo animado */
  ariaLabel?: string;
  /** Camada absoluta atrás do conteúdo do pai (que precisa ser `position: relative`) */
  asLayer?: boolean;
  /** Semente do sorteio das estrelas: a mesma semente dá o mesmo céu no servidor e no cliente */
  seed?: number;
}

/* As manchas: cor, canto de partida (% do contêiner), tamanho em px, curso e ritmo. */
const MANCHAS = [
  { cor: "var(--aurora-blob1, #6D4AFF)", left: "-12%", top: "-4%", size: 760, opacidade: 0.38, x: [-50, 50, -50], y: [-20, 20, -20], scale: [1, 1.2, 1], dur: 30 },
  { cor: "var(--aurora-blob2, #C2452F)", left: "62%", top: "18%", size: 620, opacidade: 0.22, x: [50, -50, 50], y: [20, -20, 20], scale: [1, 1.3, 1], dur: 40 },
  { cor: "var(--aurora-blob3, #3B2A8C)", left: "28%", top: "42%", size: 700, opacidade: 0.34, x: [20, -20, 20], y: [-30, 30, -30], scale: [1, 1.15, 1], dur: 50 },
  { cor: "var(--aurora-blob1, #6D4AFF)", left: "66%", top: "66%", size: 680, opacidade: 0.3, x: [-40, 40, -40], y: [30, -30, 30], scale: [1.1, 0.95, 1.1], dur: 36 },
  { cor: "var(--aurora-blob2, #C2452F)", left: "-8%", top: "82%", size: 560, opacidade: 0.18, x: [30, -30, 30], y: [-20, 20, -20], scale: [1, 1.25, 1], dur: 44 },
];

/* mulberry32: sorteio pequeno e repetível */
function sorteio(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  className = "",
  children,
  starCount = 50,
  gradientColors = ["var(--aurora-color1, rgba(109, 74, 255, 0.22))", "var(--aurora-color2, rgba(82, 48, 159, 0.22))"],
  pulseDuration = 10,
  ariaLabel = "Fundo animado, uma aurora",
  asLayer = false,
  seed = 7,
}) => {
  const [corA, corB] = gradientColors;
  const parado = useReducedMotion();

  const estrelas = useMemo(() => {
    const r = sorteio(seed);
    return Array.from({ length: starCount }, () => ({
      left: `${(r() * 100).toFixed(2)}%`,
      top: `${(r() * 100).toFixed(2)}%`,
      pico: (0.25 + r() * 0.6).toFixed(2),
      dur: `${(2 + r() * 3).toFixed(2)}s`,
      atraso: `${(r() * 5).toFixed(2)}s`,
      tamanho: r() > 0.85 ? 3 : 2,
    }));
  }, [starCount, seed]);

  const casca = asLayer
    ? `absolute inset-0 overflow-hidden pointer-events-none ${className}`
    : `relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-slate-50 ${className}`;

  return (
    <div role="img" aria-label={ariaLabel} className={casca}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* os dois gradientes radiais que pulsam */}
        <div
          className="absolute inset-0 opacity-50 aurora-pulso"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, ${corA} 0%, transparent 60%), radial-gradient(circle at 70% 80%, ${corB} 0%, transparent 60%)`,
            animationDuration: `${pulseDuration}s`,
            animationPlayState: parado ? "paused" : "running",
          }}
        />

        {/* as manchas de cor desfocadas, que passeiam devagar */}
        <motion.div className="absolute inset-0 mix-blend-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: "easeInOut" }}>
          {MANCHAS.map((m, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{ left: m.left, top: m.top, width: m.size, height: m.size, background: m.cor, opacity: m.opacidade, willChange: "transform" }}
              animate={parado ? undefined : { x: m.x, y: m.y, scale: m.scale }}
              transition={{ duration: m.dur, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
          ))}
        </motion.div>

        {/* as estrelas: CSS puro, uma animação leve por ponto */}
        {estrelas.map((e, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white aurora-estrela"
            style={{
              left: e.left,
              top: e.top,
              width: e.tamanho,
              height: e.tamanho,
              ["--pico" as string]: e.pico,
              animationDuration: e.dur,
              animationDelay: e.atraso,
              animationPlayState: parado ? "paused" : "running",
              opacity: parado ? Number(e.pico) * 0.6 : undefined,
            }}
          />
        ))}
      </div>

      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
};

const CSS = `
  .aurora-pulso { animation: aurora-pulso 10s ease-in-out infinite; transform-origin: center; }
  @keyframes aurora-pulso {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
  .aurora-estrela { opacity: 0; animation: aurora-pisca 3s ease-in-out infinite; }
  @keyframes aurora-pisca {
    0%, 100% { opacity: 0; }
    50% { opacity: var(--pico, 0.6); }
  }
`;

export default AuroraBackground;
