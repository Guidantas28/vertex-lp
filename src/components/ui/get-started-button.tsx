"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A PORTA: todo botão de ação do site leva pro ONBOARDING do produto (founder
 * 15/09, "coloca o link de onboarding em todas as CTA"). Antes eles abriam a
 * modal de lead, que pedia os dados aqui pra depois mandar pra lá . era um
 * formulário a mais entre a pessoa e a conta dela.
 *
 * O endereço é inlinado no build (o Vite troca `import.meta.env.PUBLIC_*`),
 * então servidor e cliente escrevem o MESMO href e a hidratação não reclama.
 */
export const PORTA = import.meta.env.PUBLIC_SIGNUP_URL ?? "https://app.voshq.com/onboarding";

/** A modal de lead segue viva pros gatilhos `data-action="lead"`. */
export function openLeadModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vos:open-lead"));
}

type GetStartedButtonProps = {
  label?: string;
  className?: string;
  /** MONO (UNO §26.1): dark = tinta no claro · white = branco sobre Carvão · soft = contorno · outline = contorno sobre Carvão */
  variant?: "dark" | "white" | "soft" | "outline";
  /** Outro destino que não a porta do onboarding. */
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const VARIANT: Record<
  NonNullable<GetStartedButtonProps["variant"]>,
  { btn: string; chevron: string; icon: string }
> = {
  dark: {
    btn: "bg-[var(--zx-ink)] text-[var(--zx-paper)] hover:bg-black",
    chevron: "bg-white/15 text-white",
    icon: "text-white",
  },
  white: {
    btn: "bg-white text-[#101214] hover:bg-[#ECECEC]",
    chevron: "bg-[#101214]/10 text-[#101214]",
    icon: "text-[#101214]",
  },
  soft: {
    btn: "bg-white text-[var(--zx-ink)] border-[1.5px] border-[var(--zx-line-2)] hover:border-[var(--zx-ink)] hover:bg-[var(--zx-pick)]",
    chevron: "bg-[#171717]/8 text-[#171717]",
    icon: "text-[#171717]",
  },
  outline: {
    btn: "bg-transparent text-white border-[1.5px] border-white/40 hover:border-white hover:bg-white/5",
    chevron: "bg-white/15 text-white",
    icon: "text-white",
  },
};

export function GetStartedButton({
  label = "Teste grátis",
  className,
  variant = "dark",
  href,
  type = "button",
  onClick,
  disabled,
}: GetStartedButtonProps) {
  const v = VARIANT[variant];

  const classNames = cn(
    "group relative h-auto overflow-hidden rounded-[10px] py-[14px] pl-[22px] pr-[14px]",
    "text-[16px] font-semibold leading-[22px] shadow-none",
    v.btn,
    className,
  );

  const inner = (
    <>
      <span className="mr-16 transition-opacity duration-300 group-hover:opacity-0">
        {label}
      </span>
      <i
        className={cn(
          "absolute bottom-1 right-1 top-1 z-10 grid w-11 place-items-center rounded-sm not-italic transition-all duration-300",
          "group-hover:w-[calc(100%-0.5rem)] group-active:scale-95",
          v.chevron,
        )}
      >
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" className={v.icon} />
      </i>
    </>
  );

  /* BOTÃO de verdade só quando ele manda um formulário ou faz algo na própria
     página; o resto é LINK, porque é navegação . e link abre em outra aba, se
     copia, e o leitor de tela anuncia como link. */
  if (type === "submit" || (onClick && !href)) {
    return (
      <Button
        type={type}
        size="lg"
        disabled={disabled}
        className={classNames}
        onClick={(e) => {
          if (!onClick) return;
          e.preventDefault();
          onClick();
        }}
      >
        {inner}
      </Button>
    );
  }

  return (
    <Button asChild size="lg" className={classNames}>
      <a href={href ?? PORTA} onClick={onClick}>
        {inner}
      </a>
    </Button>
  );
}
