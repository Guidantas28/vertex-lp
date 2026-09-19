"use client";

/**
 * O CONFETE DOS PREÇOS, versão VITÓRIA (founder 17/09: "quando terminar ali embaixo já
 * estoura os confetes e já entra nos preços; quero confetes bonitos como se fosse uma
 * vitória mesmo").
 *
 * Dois canhões nos cantos de baixo atiram pra cima e pro meio, em duas levas cada; os
 * papéis são retângulos, fitas e discos nas cores da marca (violeta, laranja, branco e um
 * carvão), giram em três eixos (a face vira e a largura aparente encolhe até o fio, com o
 * brilho acompanhando), sobem com impulso e depois caem devagar, esvoaçando, até sumir.
 * Dispara quando o topo dos preços chega a um quarto da tela, com 20 s entre estouradas
 * (quem sobe e desce não leva confete toda hora). Com movimento reduzido, não dispara.
 */
import { useEffect, useRef } from "react";

const CORES = ["#6D4AFF", "#A899FF", "#ED4B00", "#FF8A3D", "#FFFFFF", "#FFD8C2", "#3B2A8C"];
type Peca = { x: number; y: number; vx: number; vy: number; w: number; h: number; forma: 0 | 1 | 2; cor: string; ang: number; vang: number; giro: number; vgiro: number; fase: number; vida: number; atraso: number };

export default function ConfetePrecos() {
  const raiz = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = raiz.current, c = tela.current;
    const alvo = document.getElementById("precos") ?? el?.parentElement;
    if (!el || !c || !alvo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, raf = 0, pecas: Peca[] = [], ultimo = -Infinity;
    const mede = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(mede);
    ro.observe(el);
    mede();

    // um canhão: `lado` -1 atira do canto esquerdo pra direita, +1 do direito pra esquerda
    const canhao = (lado: -1 | 1, n: number, atraso: number, forca: number) => {
      const x0 = lado < 0 ? W * 0.04 : W * 0.96, y0 = H * 0.9;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 - lado * (0.28 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.35;
        const v = forca * (0.6 + Math.random() * 0.55);
        const forma = (Math.random() < 0.18 ? 2 : Math.random() < 0.3 ? 1 : 0) as 0 | 1 | 2;
        pecas.push({
          x: x0, y: y0, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: forma === 1 ? 3.5 + Math.random() * 2 : 8 + Math.random() * 7,
          h: forma === 1 ? 18 + Math.random() * 14 : forma === 2 ? 7 + Math.random() * 5 : 5 + Math.random() * 3,
          forma, cor: CORES[(Math.random() * CORES.length) | 0],
          ang: Math.random() * Math.PI, vang: (Math.random() - 0.5) * 0.28,
          giro: Math.random() * Math.PI * 2, vgiro: 0.08 + Math.random() * 0.16,
          fase: Math.random() * Math.PI * 2, vida: 1, atraso,
        });
      }
    };
    const estoura = () => {
      pecas = [];
      const forca = Math.min(30, 18 + W / 80);
      canhao(-1, 130, 0, forca); canhao(1, 130, 0, forca);
      canhao(-1, 90, 260, forca * 0.9); canhao(1, 90, 260, forca * 0.9);
      canhao(-1, 60, 620, forca * 0.8); canhao(1, 60, 620, forca * 0.8);
      const t0 = performance.now();
      let tAnt = t0;
      cancelAnimationFrame(raf);
      const quadro = (agora: number) => {
        const dt = Math.min(2.2, (agora - tAnt) / 16.7); tAnt = agora;
        const t = agora - t0;
        ctx.clearRect(0, 0, W, H);
        let vivas = 0;
        for (const p of pecas) {
          if (t < p.atraso) { vivas++; continue; }
          const idade = t - p.atraso;
          p.vy += 0.16 * dt;                       // gravidade
          p.vx *= Math.pow(0.975, dt);             // arrasto
          p.vy *= Math.pow(p.vy > 0 ? 0.962 : 0.985, dt); // caindo, o ar segura mais
          p.x += (p.vx + Math.sin(idade / 240 + p.fase) * 0.9) * dt; // esvoaça
          p.y += p.vy * dt;
          p.ang += p.vang * dt;
          p.giro += p.vgiro * dt;
          if (idade > 2600) p.vida -= 0.011 * dt;
          if (p.vida <= 0 || p.y > H + 30) continue;
          vivas++;
          const face = Math.cos(p.giro);           // a face vira: largura aparente e brilho
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.vida);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.ang);
          ctx.scale(Math.max(0.12, Math.abs(face)), 1);
          ctx.fillStyle = p.cor;
          if (p.forma === 2) { ctx.beginPath(); ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2); ctx.fill(); }
          else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          if (face > 0.55) { ctx.globalAlpha *= (face - 0.55) * 0.8; ctx.fillStyle = "#fff"; if (p.forma === 2) { ctx.beginPath(); ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
          ctx.restore();
        }
        if (vivas > 0) raf = requestAnimationFrame(quadro);
        else ctx.clearRect(0, 0, W, H);
      };
      raf = requestAnimationFrame(quadro);
    };

    // dispara quando o topo dos preços chega a um quarto da tela
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      const agora = performance.now();
      if (agora - ultimo < 20000) return;
      ultimo = agora;
      estoura();
    }, { threshold: 0, rootMargin: "0px 0px -25% 0px" });
    io.observe(alvo);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={raiz} className="zx-confete-precos" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "-50vh", height: "calc(min(88vh, 820px) + 50vh)", zIndex: 5, pointerEvents: "none", overflow: "hidden" }}>
      <canvas ref={tela} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
