"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MouseState = { x: number | null; y: number | null };

/** Mouse relativo ao elemento (não viewport) — ideal pra overlay em cards. */
export const useMouse = (): [MouseState, RefObject<HTMLDivElement | null>] => {
  const [mouseState, setMouseState] = useState<MouseState>({ x: null, y: null });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (event: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouseState({
        x: event.clientX - r.left,
        y: event.clientY - r.top,
      });
    };

    const handleMouseLeave = () => {
      setMouseState({ x: null, y: null });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return [mouseState, ref];
};

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  intensity: number;
};

/**
 * Overlay de cursor gradient. Escuta o parent (card) e pinta partículas
 * por cima do fundo existente, sem bloquear cliques.
 */
export function CursorGradient({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mouse, setMouse] = useState<MouseState>({ x: null, y: null });
  const [hue, setHue] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const host = hostRef.current;
    const parent = host?.parentElement;
    if (!parent) return;

    const onMove = (event: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      const x = event.clientX - r.left;
      const y = event.clientY - r.top;
      setMouse({ x, y });
      setHue(((x / Math.max(r.width, 1)) * 360) % 360);

      setParticles((prev) =>
        [
          ...prev,
          ...Array.from({ length: 2 }, () => ({
            id: Date.now() + Math.random(),
            x: x + (Math.random() - 0.5) * 18,
            y: y + (Math.random() - 0.5) * 18,
            size: Math.random() * 3 + 2,
            intensity: Math.random() * 0.5 + 0.5,
          })),
        ].slice(-28),
      );
    };

    const onLeave = () => setMouse({ x: null, y: null });

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`pointer-events-none absolute inset-0 z-[1] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {mouse.x !== null && mouse.y !== null && (
        <>
          <motion.div
            className="absolute"
            style={{
              left: mouse.x,
              top: mouse.y,
              x: "-50%",
              y: "-50%",
              width: 56,
              height: 56,
            }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div
              className="h-full w-full rounded-full mix-blend-screen"
              style={{
                background: `radial-gradient(
                  circle at center,
                  hsl(${hue}, 100%, 70%),
                  hsl(${(hue + 60) % 360}, 100%, 60%)
                )`,
                boxShadow: `0 0 28px hsl(${hue}, 100%, 50%, 0.45)`,
                opacity: 0.85,
              }}
            />
          </motion.div>

          <AnimatePresence>
            {particles.map((particle, index) => (
              <motion.div
                key={particle.id}
                className="absolute mix-blend-screen"
                style={{
                  left: particle.x,
                  top: particle.y,
                  x: "-50%",
                  y: "-50%",
                }}
                initial={{ opacity: particle.intensity, scale: 0 }}
                animate={{ opacity: 0, scale: particle.size }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: `${particle.size * 4}px`,
                    height: `${particle.size * 4}px`,
                    background: `radial-gradient(
                      circle at center,
                      hsl(${(hue + index * 10) % 360}, 100%, ${70 + particle.intensity * 30}%),
                      transparent
                    )`,
                    filter: "blur(2px)",
                    boxShadow: `0 0 ${particle.size * 2}px hsl(${(hue + index * 10) % 360}, 100%, 50%, ${particle.intensity})`,
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/** Alias pedido no snippet original */
export const Component = CursorGradient;
