"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
};

const COLORS = ["#ED4B00", "#FF6B2C", "#5B45D1", "#8B76FF", "#1EB258", "#EFB008", "#2E6BFF", "#fff"];

/** Confetti canvas leve — dispara uma vez ao montar. */
export default function ConfettiBurst({ duration = 3200 }: { duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    const parts: Particle[] = [];
    const spawn = (n: number, fromX?: number) => {
      for (let i = 0; i < n; i++) {
        const x = fromX ?? W() * (0.25 + Math.random() * 0.5);
        parts.push({
          x,
          y: H() * 0.15 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 11,
          vy: -Math.random() * 12 - 4,
          w: 5 + Math.random() * 6,
          h: 3 + Math.random() * 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          life: 1,
        });
      }
    };

    spawn(90);
    const burst2 = window.setTimeout(() => spawn(50, W() * 0.2), 180);
    const burst3 = window.setTimeout(() => spawn(50, W() * 0.8), 320);

    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const elapsed = t - t0;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.22;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.008;
        if (p.life <= 0 || p.y > height + 40) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < duration || parts.length) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(burst2);
      clearTimeout(burst3);
      window.removeEventListener("resize", resize);
    };
  }, [duration]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      aria-hidden="true"
    />
  );
}
