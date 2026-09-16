import type { Config } from "tailwindcss";

/**
 * VOS UNO (docs/VOS-UNO.md · packages/ui/tokens.json v4.9).
 * Claro = R11 Ink #FAFAFA (a peça branca É a tela clara), tinta #171717,
 * hairline Porcelain #E4DFD6. Escuro = Carvão, a única família escura.
 * #ED4B00 é SINAL e só sinal (acento único: cor por módulo morreu);
 * o violeta #6D4AFF é do Zé. Botão primário é MONO (§26.1).
 */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Sinal
        accent: {
          DEFAULT: "#ED4B00",
          400: "#FF7A33",
          500: "#ED4B00",
          600: "#C63D00",
          soft: "rgba(237,75,0,0.12)",
          line: "rgba(237,75,0,0.30)",
        },
        // Acento único: os módulos resolvem pro sinal. Só o Zé tem cor própria.
        module: {
          core: "#ED4B00",
          commerce: "#ED4B00",
          services: "#ED4B00",
          finance: "#ED4B00",
          ai: "#6D4AFF",
        },
        // Superfícies claras (R11 Ink)
        bg: "#FAFAFA",
        panel: {
          DEFAULT: "#FFFFFF",
          2: "#F5F5F5",
          3: "#F0F0F0",
        },
        pick: "#F4F4F4",
        // Tinta
        ink: {
          DEFAULT: "#171717",
          2: "#4A4A4A",
          3: "#6B6B6B",
        },
        // Carvão (UNO C4.2 S1)
        slate: {
          DEFAULT: "#101214",
          2: "#15181A",
          3: "#1B2126",
          deep: "#08090A",
          ink: "#EDEDED",
          "ink-2": "#A1A1A1",
          "ink-3": "#8A8A8A",
          line: "rgba(255,255,255,0.12)",
        },
        // Status (semântica, não decoração)
        ok: "#15935A",
        warn: "#C9810C",
        bad: "#DC3B2B",
        info: "#1F6FEB",
        // Hairlines
        line: {
          DEFAULT: "#E4DFD6",
          2: "rgba(23,23,23,0.18)",
        },
        // tokens dos snippets shadcn (preview-switch etc.)
        border: "rgba(23,23,23,0.12)",
        background: "var(--zx-paper, #FAFAFA)",
        foreground: "var(--zx-ink, #171717)",
        muted: {
          DEFAULT: "var(--zx-hover, rgba(23,23,23,0.05))",
          foreground: "var(--zx-ink2, #4A4A4A)",
        },
        // primário MONO (§26.1): preto no claro
        primary: {
          DEFAULT: "#171717",
          foreground: "#FAFAFA",
        },
        ring: "#ED4B00",
      },
      fontFamily: {
        display: ["'Inter Tight'", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "'SF Mono'", "Menlo", "Consolas", "monospace"],
      },
      letterSpacing: {
        display: "-0.025em",
        tightest: "-0.02em",
        eyebrow: "0.06em",
        label: "0.06em",
      },
      // Família do UNO (C6/§22): 8 controle · 12 card · 16 superfície; pílula só em badge.
      borderRadius: {
        xs: "6px",
        sm: "8px",
        DEFAULT: "10px",
        lg: "12px",
        xl: "16px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,23,23,0.04), 0 12px 32px rgba(23,23,23,0.06)",
        lift: "0 30px 80px rgba(23,23,23,0.14)",
        slate: "0 20px 60px rgba(8,9,10,0.45)",
        glow: "0 0 0 1px rgba(237,75,0,0.30), 0 12px 36px -10px rgba(237,75,0,0.40)",
      },
      transitionTimingFunction: {
        vos: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        vos: "240ms",
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
