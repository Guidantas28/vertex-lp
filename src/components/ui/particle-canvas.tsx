"use client";

/**
 * PARTÍCULAS QUE SEGUEM O MOUSE (17/09): o founder pediu o Particle Canvas do 21st.dev
 * "só nessa parte do Zé". Adaptado pra casa: o canvas NÃO pinta fundo preto (ele fica
 * transparente sobre a noite e a aurora), o rastro é feito apagando um pouco do quadro
 * anterior (destination-out) em vez de pintar preto por cima, as cores ficam na faixa do
 * violeta em vez do arco-íris, o tamanho é o do contêiner (não a janela) e o mouse é
 * ouvido no documento, porque a camada fica atrás do conteúdo e não recebe eventos. Só
 * anima com a camada na tela, e fica parado com prefers-reduced-motion.
 */
import { useEffect, useRef } from "react";

export interface ParticleCanvasProps {
  particulas?: number;
  tamanhoPonteiro?: number;
  corPonteiro?: string;
  luzBase?: number;
  luzExtra?: number;
  distBase?: number;
  distVariada?: number;
  /** matiz central (graus); a faixa varia ±28 em volta dele */
  matiz?: number;
  className?: string;
}

type Particula = { dist: number; rad: number; angBase: number; angVar: number; tam: number };

export function ParticleCanvas({ particulas = 160, tamanhoPonteiro = 3, corPonteiro = "rgba(255,255,255,0.9)", luzBase = 6, luzExtra = 30, distBase = 130, distVariada = 50, matiz = 258, className = "" }: ParticleCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tau = Math.PI * 2;
    let W = 0, H = 0, s = 1, dpr = 1;
    const mede = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = Math.min(W, H);
    };
    mede();
    const ro = new ResizeObserver(mede);
    ro.observe(c);

    const lista: Particula[] = [];
    const fonte = { x: 0, y: 0, rad: Math.random() * tau, mouse: false };
    let tick = 0;
    const nova = (): Particula => ({
      dist: (Math.sqrt(Math.random()) * s) / 2,
      rad: Math.random() * tau,
      angBase: 0.001 + 0.001 * Math.random(),
      angVar: 0.0005 + 0.0005 * Math.random(),
      tam: 4 + Math.random(),
    });

    const quadro = () => {
      tick++;
      // o rastro: apaga um pouco do quadro anterior, sem pintar preto
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      if (lista.length < particulas) lista.push(nova());
      ctx.save();
      ctx.translate(W / 2, H / 2);
      if (!fonte.mouse) {
        fonte.rad += -0.01 + Math.sin(fonte.rad * 6 + tick / 100) * 0.005;
        const d = distBase + Math.sin(fonte.rad * 5 + tick / 100) * distVariada;
        fonte.x = d * Math.cos(fonte.rad);
        fonte.y = d * Math.sin(fonte.rad);
      }
      ctx.fillStyle = corPonteiro;
      ctx.beginPath();
      ctx.arc(fonte.x, fonte.y, tamanhoPonteiro, 0, tau);
      ctx.fill();
      for (const p of lista) {
        p.rad += p.angBase + p.angVar * Math.sin(p.rad * 7 + tick / 100);
        const x = p.dist * Math.cos(p.rad), y = p.dist * Math.sin(p.rad);
        const d2 = (x - fonte.x) ** 2 + (y - fonte.y) ** 2;
        const prop = Math.sqrt(s) / Math.sqrt(Math.max(1, d2));
        const hue = matiz + 28 * Math.sin(p.rad * 3 + tick / 240);
        ctx.fillStyle = `hsla(${hue.toFixed(0)},80%,${(luzBase + prop * luzExtra).toFixed(1)}%,0.8)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.min(p.tam * prop, 5), 0, tau);
        ctx.fill();
      }
      ctx.restore();
    };

    let raf = 0;
    let visivel = false;
    const laco = () => { quadro(); raf = requestAnimationFrame(laco); };
    const liga = () => { if (!raf && !parado) raf = requestAnimationFrame(laco); };
    const desliga = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) liga(); else desliga(); }, { threshold: 0 });
    io.observe(c);
    if (parado) { for (let i = 0; i < particulas; i++) lista.push(nova()); quadro(); }

    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (dentro) {
        fonte.x = e.clientX - r.left - W / 2;
        fonte.y = e.clientY - r.top - H / 2;
        fonte.mouse = true;
      } else if (fonte.mouse) {
        fonte.rad = Math.atan2(fonte.y, fonte.x);
        fonte.mouse = false;
      }
    };
    const sai = () => { if (fonte.mouse) { fonte.rad = Math.atan2(fonte.y, fonte.x); fonte.mouse = false; } };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", sai);
    return () => {
      desliga();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", sai);
    };
  }, [particulas, tamanhoPonteiro, corPonteiro, luzBase, luzExtra, distBase, distVariada, matiz]);

  return <canvas ref={ref} className={className} style={{ display: "block", width: "100%", height: "100%", background: "transparent" }} aria-hidden="true" />;
}

export default ParticleCanvas;
