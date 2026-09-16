/* O mínimo que TODA página do site precisa, fora a nav (que cuida de si):
   o clique que abre a modal de lead e o observador que abre as faixas.

   Morava só no script da home; a página de preço (15/09) usa as mesmas faixas
   (o CTA final) e ficaria com elas encolhidas em `scale(.96)` pra sempre. */

// ── CTAs → a mesma modal de lead ──────────────────────────────────────────
document.addEventListener("click", (e) => {
  const el = e.target instanceof Element ? e.target.closest("[data-action='lead']") : null;
  if (!el) return;
  e.preventDefault();
  window.dispatchEvent(new CustomEvent("vos:open-lead"));
});

// ── IO genérico: bandas, staggers e funis ─────────────────────────────────
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      if (el.hasAttribute("data-band")) el.classList.add("is-open");
      else el.classList.add("is-in");
      io.unobserve(el);
    }
  },
  { threshold: 0.18 },
);
document
  .querySelectorAll("[data-band], [data-stagger], [data-funnel]")
  .forEach((el) => io.observe(el));
