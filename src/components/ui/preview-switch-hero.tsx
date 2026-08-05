"use client";

import * as React from "react";
import { Mail, Star } from "lucide-react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { GetStartedButton } from "@/components/ui/get-started-button";

/* ── types ───────────────────────────────────────────────────── */

export interface PreviewTab {
  id: string;
  /** Text label shown in the switcher rail. */
  label: string;
  /** Panel shown when this tab is active. All panels should share one size. */
  media: React.ReactNode;
}

export interface HeroRating {
  source: string;
  score: string;
  /** Defaults to a filled star. */
  icon?: React.ReactNode;
}

export interface HeroLogo {
  name: string;
  /** Optional custom mark; falls back to the name as a text wordmark. */
  logo?: React.ReactNode;
}

export interface HeroAvatar {
  initials?: string;
  src?: string;
}

export interface Cta {
  label: string;
  href?: string;
}

export interface PreviewSwitchHeroProps {
  /** Small pill above the title, e.g. `{ tag: "NEW", label: "…" }`. */
  badge?: { tag?: string; label: React.ReactNode };
  title: React.ReactNode;
  description?: React.ReactNode;
  ratings?: HeroRating[];
  /**
   * Show the email-capture field above the CTAs. When `false`, the CTAs render
   * on their own as plain actions (no form/input). Default `true`.
   */
  showEmail?: boolean;
  /** Label above the email field. */
  emailLabel?: React.ReactNode;
  emailPlaceholder?: string;
  /** Called with the email on submit. */
  onSubmit?: (email: string) => void;
  /** Submits the form when no `href`; otherwise renders as a link. */
  primaryCta?: Cta;
  secondaryCta?: Cta;
  avatars?: HeroAvatar[];
  socialProof?: React.ReactNode;
  /** Text tabs that switch the preview. */
  tabs: PreviewTab[];
  /** Logo strip rendered full-width below the split. */
  logos?: HeroLogo[];
  /**
   * Scroll-track height when the hero is pinned (md+ / motion on). Taller =
   * more scroll per tab. Default `"340vh"`.
   */
  scrollLength?: string;
  /** When false, tabs are click-only (better mid-page). Default true. */
  enableScrollDrive?: boolean;
  /** Auto-cycle tabs when scroll drive is off. Pass ms or `true` (3200). */
  autoRotate?: boolean | number;
  /**
   * Highlight tabs as the section moves through the viewport (no tall sticky
   * track). Good for mid-page cards. Default false.
   */
  viewportScrollHighlight?: boolean;
  className?: string;
}

/* ── helpers ─────────────────────────────────────────────────── */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* ── pieces ──────────────────────────────────────────────────── */

function TabRail({
  tabs,
  active,
  onSelect,
}: {
  tabs: PreviewTab[];
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Soluções por time"
      className="flex shrink-0 gap-2 overflow-x-auto [scrollbar-width:none] md:flex-col md:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((t, i) => {
        const isActive = i === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(i)}
            className={cn(
              "group/tab relative whitespace-nowrap rounded-full px-4 py-2.5 text-left text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-white font-bold text-[#1A202C] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] scale-[1.03]"
                : "font-medium text-white/55 hover:bg-white/10 hover:text-white",
            )}
          >
            {isActive && (
              <span
                className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-400 align-middle shadow-[0_0_0_3px_rgba(52,211,153,0.25)]"
                aria-hidden="true"
              />
            )}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function PreviewStack({
  tabs,
  active,
}: {
  tabs: PreviewTab[];
  active: number;
}) {
  return (
    <div className="relative w-full min-w-0 md:flex-1">
      {tabs.map((t, i) => {
        const isActive = i === active;
        return (
          <div
            key={t.id}
            role="tabpanel"
            aria-hidden={!isActive}
            className={cn(
              "transition-opacity duration-500",
              isActive
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0",
            )}
          >
            {t.media}
          </div>
        );
      })}
    </div>
  );
}

function CtaButton({
  cta,
  variant,
}: {
  cta: Cta;
  variant: "primary" | "secondary";
  type?: "submit" | "button";
}) {
  if (variant === "primary") {
    return (
      <GetStartedButton
        label={cta.label}
        variant="white"
        className="!bg-white !text-[#14131C]"
      />
    );
  }
  return (
    <a
      href={cta.href ?? "#segmentos"}
      className={cn(
        "inline-flex h-auto items-center justify-center whitespace-nowrap rounded-[12px]",
        "border-[1.5px] border-white/40 bg-transparent px-[22px] py-[14px]",
        "text-[16px] font-semibold leading-[22px] text-white transition-colors hover:border-white",
      )}
    >
      {cta.label}
    </a>
  );
}

/* ── component ───────────────────────────────────────────────── */

export function PreviewSwitchHero({
  badge,
  title,
  description,
  ratings,
  showEmail = true,
  emailLabel = "Seu e-mail",
  emailPlaceholder = "voce@empresa.com",
  onSubmit,
  primaryCta,
  secondaryCta,
  avatars,
  socialProof,
  tabs,
  logos,
  scrollLength = "340vh",
  enableScrollDrive = true,
  autoRotate = false,
  viewportScrollHighlight = false,
  className,
}: PreviewSwitchHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const emailId = React.useId();
  const [active, setActive] = React.useState(0);
  const pauseUntil = React.useRef(0);

  const [scrollDriven, setScrollDriven] = React.useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!enableScrollDrive || prefersReducedMotion) {
      setScrollDriven(false);
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setScrollDriven(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [prefersReducedMotion, enableScrollDrive]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!scrollDriven) return;
    const n = tabs.length;
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n - 1e-6)));
    setActive((prev) => (prev === i ? prev : i));
  });

  React.useEffect(() => {
    if (!viewportScrollHighlight || scrollDriven || prefersReducedMotion || tabs.length < 2) {
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const track =
      (el.closest("#solucoes") as HTMLElement | null) ??
      (el.closest(".zx-zeai") as HTMLElement | null) ??
      el;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // bloco atravessando a viewport enquanto o usuário desce
      const start = vh * 0.85;
      const end = vh * 0.12 - Math.min(rect.height * 0.35, vh * 0.35);
      const p = (start - rect.top) / (start - end);
      if (p < -0.08 || p > 1.08) return;
      const clamped = Math.min(1, Math.max(0, p));
      const i = Math.min(
        tabs.length - 1,
        Math.max(0, Math.floor(clamped * tabs.length - 1e-6)),
      );
      pauseUntil.current = Date.now() + 1400;
      setActive((prev) => (prev === i ? prev : i));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [viewportScrollHighlight, scrollDriven, prefersReducedMotion, tabs.length]);

  React.useEffect(() => {
    if (!autoRotate || scrollDriven || prefersReducedMotion || tabs.length < 2) return;
    const ms = typeof autoRotate === "number" ? autoRotate : 3200;
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntil.current) return;
      setActive((prev) => (prev + 1) % tabs.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [autoRotate, scrollDriven, prefersReducedMotion, tabs.length]);

  const handleSelect = (i: number) => {
    pauseUntil.current = Date.now() + 8000;
    const el = sectionRef.current;
    if (scrollDriven && el) {
      const top = window.scrollY + el.getBoundingClientRect().top;
      const range = el.offsetHeight - window.innerHeight;
      const target = top + ((i + 0.5) / tabs.length) * range;
      window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    } else {
      setActive(i);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit?.(String(data.get("email") ?? ""));
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Soluções por time"
      className={cn("relative w-full bg-background", className)}
      style={scrollDriven ? { height: scrollLength } : undefined}
    >
      <div
        className={cn(
          scrollDriven && "sticky top-0 flex h-screen flex-col overflow-hidden",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-7xl flex-col justify-center px-0 py-6 lg:py-10",
            scrollDriven && "min-h-0 flex-1",
          )}
        >
          <div className="flex flex-col-reverse justify-center gap-8 md:flex-row md:items-center md:gap-6 lg:gap-8 xl:gap-12">
            <div
              className={cn(
                "flex min-w-0 flex-col gap-4 md:w-[420px] md:shrink-0 md:flex-row md:items-center md:gap-2 lg:w-[500px] lg:gap-3",
                badge && "md:mt-11",
              )}
            >
              <TabRail tabs={tabs} active={active} onSelect={handleSelect} />
              <PreviewStack tabs={tabs} active={active} />
            </div>

            <div className="flex min-w-0 flex-col items-center text-center md:max-w-[496px] md:flex-1 md:items-start md:text-left">
              {badge && (
                <div className="mb-4 flex w-fit items-center gap-2 rounded-lg bg-muted py-1 pl-1.5 pr-2.5">
                  {badge.tag && (
                    <span className="inline-flex h-4 items-center rounded-[5px] bg-background px-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary shadow-sm">
                      {badge.tag}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">{badge.label}</span>
                </div>
              )}

              <h2 className="mb-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:mb-5 lg:text-5xl xl:text-[56px] xl:leading-[1.05]">
                {title}
              </h2>

              {description && (
                <p className="text-balance text-base text-muted-foreground lg:text-lg">
                  {description}
                </p>
              )}

              {ratings && ratings.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start lg:mt-8">
                  {ratings.map((r, i) => (
                    <div
                      key={`${r.source}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-2 pr-3"
                    >
                      {r.icon ?? (
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      )}
                      <span className="text-sm font-semibold text-foreground">
                        {r.score}
                      </span>
                      <span className="text-sm text-muted-foreground">{r.source}</span>
                    </div>
                  ))}
                </div>
              )}

              {showEmail ? (
                <form onSubmit={handleSubmit} className="mt-6 lg:mt-8">
                  <div className="mx-auto flex w-full max-w-[420px] flex-col gap-2 md:mx-0">
                    <label htmlFor={emailId} className="text-sm text-muted-foreground">
                      {emailLabel}
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 shadow-sm transition focus-within:border-foreground focus-within:ring-2 focus-within:ring-ring">
                      <Mail className="size-5 shrink-0 text-muted-foreground" />
                      <input
                        id={emailId}
                        name="email"
                        type="email"
                        placeholder={emailPlaceholder}
                        className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                    </div>

                    {(primaryCta || secondaryCta) && (
                      <div className="mt-2 flex flex-wrap justify-center gap-3 md:justify-start">
                        {primaryCta && (
                          <CtaButton cta={primaryCta} variant="primary" type="submit" />
                        )}
                        {secondaryCta && (
                          <CtaButton cta={secondaryCta} variant="secondary" />
                        )}
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                (primaryCta || secondaryCta) && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start lg:mt-8">
                    {primaryCta && (
                      <CtaButton cta={primaryCta} variant="primary" type="button" />
                    )}
                    {secondaryCta && (
                      <CtaButton cta={secondaryCta} variant="secondary" />
                    )}
                  </div>
                )
              )}

              {(avatars?.length || socialProof) && (
                <div className="mt-6 flex flex-col items-center gap-y-3 md:flex-row">
                  {avatars && avatars.length > 0 && (
                    <div className="flex items-center">
                      {avatars.map((a, i) => (
                        <span
                          key={i}
                          className={cn(
                            "flex size-7 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground",
                            i > 0 && "-ml-2",
                          )}
                        >
                          {a.src ? (
                            <img src={a.src} alt="" className="size-full object-cover" />
                          ) : (
                            a.initials
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  {socialProof && (
                    <span className={cn("text-sm text-muted-foreground", avatars?.length && "md:ml-3")}>
                      {socialProof}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {logos && logos.length > 0 && (
          <div className="border-y border-border">
            <div className="mx-auto max-w-7xl lg:px-7">
              <div className="flex items-center overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
                {logos.map((l, i) => (
                  <div
                    key={`${l.name}-${i}`}
                    className="flex shrink-0 items-center lg:w-full lg:shrink"
                  >
                    <div className="flex w-full items-center justify-center px-6 py-5 lg:px-0 lg:py-7">
                      {l.logo ?? (
                        <span className="whitespace-nowrap text-base font-semibold tracking-tight text-muted-foreground">
                          {l.name}
                        </span>
                      )}
                    </div>
                    {i < logos.length - 1 && (
                      <div aria-hidden className="h-9 w-px shrink-0 bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PreviewSwitchHero;
