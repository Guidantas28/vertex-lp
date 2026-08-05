"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroPillProps {
  href: string;
  label: string;
  announcement?: string;
  className?: string;
  isExternal?: boolean;
}

export function HeroPill({
  href,
  label,
  announcement = "Novo",
  className,
  isExternal = false,
}: HeroPillProps) {
  return (
    <motion.a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn("zx-clickup-pill group relative inline-flex rounded-full", className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <span className="relative z-[1] inline-flex w-auto items-center gap-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 sm:px-3.5">
        <span className="w-fit rounded-full bg-accent px-2 py-px text-center text-[11px] font-semibold leading-4 text-white">
          {announcement}
        </span>
        <span className="m-0 text-xs font-medium text-ink sm:text-sm">{label}</span>
        <svg
          width="12"
          height="12"
          className="text-ink/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8.78141 5.33312L5.20541 1.75712L6.14808 0.814453L11.3334 5.99979L6.14808 11.1851L5.20541 10.2425L8.78141 6.66645H0.666748V5.33312H8.78141Z"
            fill="currentColor"
          />
        </svg>
      </span>

      <style>{`
        .zx-clickup-pill {
          /* borda cinza suave + highlight colorido no topo (estilo ClickUp) */
          background:
            linear-gradient(#fff, #fff) padding-box,
            linear-gradient(
              105deg,
              transparent 0%,
              transparent 18%,
              #f5a623 28%,
              #e84a8a 48%,
              #5b7cfa 68%,
              transparent 82%,
              transparent 100%
            ) border-box,
            linear-gradient(#e8e8ee, #e8e8ee) border-box;
          border: 1px solid transparent;
          border-radius: 999px;
          box-shadow: 0 1px 2px rgba(20, 19, 28, 0.04);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .zx-clickup-pill:hover {
          box-shadow: 0 8px 22px -14px rgba(20, 19, 28, 0.28);
          transform: translateY(-1px);
        }
        /* reforça o brilho só na borda superior */
        .zx-clickup-pill::before {
          content: "";
          position: absolute;
          left: 18%;
          right: 18%;
          top: -1px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #f5a623 18%,
            #e84a8a 50%,
            #5b7cfa 82%,
            transparent 100%
          );
          opacity: 0.95;
          pointer-events: none;
        }
        .zx-clickup-pill::after {
          content: "";
          position: absolute;
          left: 22%;
          right: 22%;
          top: -2px;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(245, 166, 35, 0.35) 20%,
            rgba(232, 74, 138, 0.35) 50%,
            rgba(91, 124, 250, 0.35) 80%,
            transparent 100%
          );
          filter: blur(4px);
          opacity: 0.7;
          pointer-events: none;
        }
        :global(html[data-theme="dark"]) .zx-clickup-pill {
          background:
            linear-gradient(var(--zx-panel, #16142A), var(--zx-panel, #16142A)) padding-box,
            linear-gradient(
              105deg,
              transparent 0%,
              transparent 18%,
              #f5a623 28%,
              #e84a8a 48%,
              #5b7cfa 68%,
              transparent 82%,
              transparent 100%
            ) border-box,
            linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)) border-box;
        }
        :global(html[data-theme="dark"]) .zx-clickup-pill > span:first-of-type {
          background: var(--zx-panel, #16142A);
        }
        @media (prefers-reduced-motion: reduce) {
          .zx-clickup-pill:hover { transform: none; }
        }
      `}</style>
    </motion.a>
  );
}
