"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function openLeadModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vos:open-lead"));
}

type GetStartedButtonProps = {
  label?: string;
  className?: string;
  /** dark = hero · white = faixa escura · soft = card claro · outline = secundário dark */
  variant?: "dark" | "white" | "soft" | "outline";
  /** Navega em vez de abrir a modal */
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
    btn: "bg-[#1A202C] text-white hover:bg-[#11151c]",
    chevron: "bg-white/15 text-white",
    icon: "text-white",
  },
  white: {
    btn: "bg-white text-[#14131C] hover:bg-white",
    chevron: "bg-[#14131C]/10 text-[#14131C]",
    icon: "text-[#14131C]",
  },
  soft: {
    btn: "bg-white text-[#14131C] border-[1.5px] border-[rgba(20,19,28,0.18)] hover:border-[#14131C] hover:bg-white",
    chevron: "bg-[#14131C]/8 text-[#14131C]",
    icon: "text-[#14131C]",
  },
  outline: {
    btn: "bg-transparent text-white border-[1.5px] border-white/40 hover:border-white hover:bg-white/5",
    chevron: "bg-white/15 text-white",
    icon: "text-white",
  },
};

export function GetStartedButton({
  label = "Começar Agora",
  className,
  variant = "dark",
  href,
  type = "button",
  onClick,
  disabled,
}: GetStartedButtonProps) {
  const v = VARIANT[variant];

  const classNames = cn(
    "group relative h-auto overflow-hidden rounded-[12px] py-[14px] pl-[22px] pr-[14px]",
    "text-[16px] font-semibold leading-[22px] shadow-none",
    v.btn,
    className,
  );

  const inner = (
    <>
      <span className="mr-16 transition-opacity duration-500 group-hover:opacity-0">
        {label}
      </span>
      <i
        className={cn(
          "absolute bottom-1 right-1 top-1 z-10 grid w-11 place-items-center rounded-sm not-italic transition-all duration-500",
          "group-hover:w-[calc(100%-0.5rem)] group-active:scale-95",
          v.chevron,
        )}
      >
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" className={v.icon} />
      </i>
    </>
  );

  if (href) {
    return (
      <Button asChild size="lg" className={classNames}>
        <a href={href} onClick={onClick}>
          {inner}
        </a>
      </Button>
    );
  }

  return (
    <Button
      type={type}
      size="lg"
      disabled={disabled}
      className={classNames}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
          return;
        }
        // submit = deixa o form cuidar; button = abre modal de lead
        if (type === "submit") return;
        openLeadModal();
      }}
    >
      {inner}
    </Button>
  );
}
