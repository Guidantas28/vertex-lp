import type { Config } from "tailwindcss";

/**
 * Vertex Brand Manual v2 — light-first.
 * Base creme #F7F6F4 · tinta #14131C · acento laranja #ED4B00.
 * Assinatura: sidebar/footer/CTA em slate escuro #0D0C1A sobre canvas claro.
 * Cada módulo tem cor própria (wayfinding).
 */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Acento de marca (laranja)
        accent: {
          DEFAULT: "#ED4B00",
          400: "#FF6A2B",
          500: "#ED4B00",
          600: "#C63D00",
          soft: "rgba(237,75,0,0.10)",
          line: "rgba(237,75,0,0.28)",
        },
        // Cores de módulo (wayfinding)
        module: {
          core: "#ED4B00",
          commerce: "#1F6FEB",
          services: "#15935A",
          finance: "#C9810C",
          ai: "#6D4AFF",
        },
        // Superfícies claras
        bg: "#F7F6F4",
        panel: {
          DEFAULT: "#FFFFFF",
          2: "#FBFAF8",
          3: "#F1F0ED",
        },
        // Tinta / texto
        ink: {
          DEFAULT: "#14131C",
          2: "#5B5A68",
          3: "#8C8B98",
        },
        // Slate escuro (sidebar/footer/CTA — assinatura)
        slate: {
          DEFAULT: "#0D0C1A",
          2: "#16142A",
          ink: "#EDECF4",
          "ink-2": "#9A99AE",
          "ink-3": "#67667C",
          line: "rgba(255,255,255,0.10)",
        },
        // Semântico
        ok: "#15935A",
        warn: "#C9810C",
        bad: "#DC3B2B",
        info: "#1F6FEB",
        // Linhas (sobre claro)
        line: {
          DEFAULT: "rgba(13,12,26,0.09)",
          2: "rgba(13,12,26,0.14)",
        },
        // shadcn-space / preview-switch tokens
        border: "rgba(20,19,28,0.12)",
        background: "var(--zx-paper, #F7F6F4)",
        foreground: "var(--zx-ink, #14131C)",
        muted: {
          DEFAULT: "var(--zx-hover, rgba(20,19,28,0.05))",
          foreground: "var(--zx-ink2, #5B5A68)",
        },
        primary: {
          DEFAULT: "#ED4B00",
          foreground: "#FFFFFF",
        },
        ring: "#ED4B00",
      },
      fontFamily: {
        display: ["Geist", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        display: "-0.045em",
        tightest: "-0.02em",
        eyebrow: "0.12em",
        label: "0.06em",
      },
      borderRadius: {
        xs: "7px",
        sm: "11px",
        DEFAULT: "14px",
        lg: "16px",
        xl: "20px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(13,12,26,0.04), 0 10px 30px rgba(13,12,26,0.06)",
        lift: "0 30px 80px rgba(13,12,26,0.14)",
        slate: "0 20px 60px rgba(13,12,26,0.45)",
        glow: "0 0 0 1px rgba(237,75,0,0.30), 0 12px 36px -10px rgba(237,75,0,0.40)",
      },
      transitionTimingFunction: {
        vos: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: { content: "1200px" },
      spacing: {
        section: "clamp(56px, 9vw, 110px)",
        pad: "clamp(20px, 4vw, 48px)",
        // orbiting-circles-02 (shadcnspace)
        75: "18.75rem",
        110: "27.5rem",
        145: "36.25rem",
        150: "37.5rem",
        160: "40rem",
        180: "45rem",
        220: "55rem",
        265: "66.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
