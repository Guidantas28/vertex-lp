"use client";

import { useEffect, useState } from "react";

const POOL = Array.from({ length: 15 }, (_, i) => `/assets/people/social-${11 + i}.webp`);
const SLOTS = 5;
const INTERVAL = 1400;

export default function HeroAvatars() {
  const [shown, setShown] = useState(() => POOL.slice(0, SLOTS));
  const [flash, setFlash] = useState(-1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cursor = SLOTS;
    const id = window.setInterval(() => {
      const next = cursor % POOL.length;
      const slot = (cursor - SLOTS) % SLOTS;
      cursor += 1;

      setShown((prev) => {
        const copy = [...prev];
        copy[slot] = POOL[next];
        return copy;
      });
      setFlash(slot);
      window.setTimeout(() => setFlash((f) => (f === slot ? -1 : f)), 420);
    }, INTERVAL);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="zx-hero-avatars" aria-hidden="true">
      {shown.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          width={34}
          height={34}
          className={flash === i ? "is-swap" : undefined}
          style={{ zIndex: 9 - i }}
          loading={i < 3 ? "eager" : "lazy"}
        />
      ))}
      <style>{`
        .zx-hero-avatars { display: flex; }
        .zx-hero-avatars img {
          width: 34px; height: 34px;
          border-radius: 11px;
          border: 2px solid var(--zx-paper, #fff);
          object-fit: cover;
          position: relative;
          margin-left: -10px;
          transform: rotate(-4deg);
          transition: transform 0.25s ease;
          background: #eee;
          box-shadow: 0 2px 6px -3px rgba(20, 19, 28, 0.35);
        }
        .zx-hero-avatars img:nth-child(even) { transform: rotate(5deg); }
        .zx-hero-avatars img:first-child { margin-left: 0; }
        .zx-hero-avatars:hover img { transform: rotate(0) translateY(-2px); }
        .zx-hero-avatars img.is-swap {
          animation: zx-av-swap 0.42s ease;
        }
        @keyframes zx-av-swap {
          0% { opacity: 0.25; filter: blur(2px); transform: scale(0.82); }
          60% { opacity: 1; filter: none; transform: scale(1.06); }
          100% { opacity: 1; filter: none; transform: scale(1) rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .zx-hero-avatars img.is-swap { animation: none; }
        }
      `}</style>
    </div>
  );
}
