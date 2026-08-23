// Gera src/pages/lp.astro + src/styles/lp.css do projeto Astro (voshq.com) a
// partir do index.html estático da LP (lp-source/, o antigo conteúdo do repo
// vertex-lp). Transformações:
//  · assets relativos -> /lp/... (servidos de public/lp)
//  · CTAs "#agendar" -> data-action="lead" (abre a mesma modal do site)
//  · CSS da LP entra DEPOIS do preflight do Tailwind, no mesmo arquivo
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ⛔ TRAVA (18/08/2026). Este gerador SOBRESCREVE lp.astro e lp.css inteiros,
// fatiando lp-source/index.html por número de linha fixo. Depois da reforma do
// Big Black Book, os gerados têm ~180 linhas que NÃO existem no lp-source
// (problema, mecanismo, preços, objeções) — rodar isto apaga tudo em silêncio.
// Pior: o passo de CTA só casa `<a href="#agendar" class="cta">`, então os
// botões dos planos (class="cta plano-cta") sairiam SEM data-action="lead" e
// parariam de abrir a modal — a captura de lead morreria.
// Para voltar a usar: reconcilie lp-source/index.html com o lp.astro atual e
// então rode com --forcar.
if (!process.argv.includes("--forcar")) {
  console.error(
    [
      "",
      "gen-lp.mjs esta TRAVADO.",
      "",
      "  Ele sobrescreve src/pages/lp.astro e src/styles/lp.css a partir do",
      "  lp-source/index.html, que esta DEFASADO: nao tem as secoes de problema,",
      "  mecanismo, precos e objecoes, e nao poria data-action=lead nos botoes",
      "  dos planos (a modal de captura pararia de abrir).",
      "",
      "  Reconcilie o lp-source/index.html antes. Para ignorar: --forcar",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = `${ROOT}lp-source/index.html`;
const DEST = ROOT.replace(/\/$/, "");

const lines = readFileSync(SRC, "utf8").split("\n");
const at = (a, b) => lines.slice(a - 1, b).join("\n"); // 1-indexed inclusivo

// ── fatias do documento original ────────────────────────────────────────────
const headMeta = at(4, 16); // charset, viewport, icons, theme-color, description, fonts
const resetCss = at(17, 18).replace(/<\/?style>/g, "");
const lpCss = at(22, 600); // conteúdo do <style> grande
const body = at(603, 1171); // svg defs -> fim do <script>

const rewriteAssets = (s) =>
  s
    .replace(/href="favicon\.png"/g, 'href="/lp/favicon.png"')
    .replace(/href="icon-192\.png"/g, 'href="/lp/icon-192.png"')
    .replace(/href="icon-512\.png"/g, 'href="/lp/icon-512.png"')
    .replace(/href="apple-touch-icon\.png"/g, 'href="/lp/apple-touch-icon.png"')
    .replace(/src="vos-logo-mono-dark\.png"/g, 'src="/lp/vos-logo-mono-dark.png"')
    .replace(/src="vos-logo-mono-white\.png"/g, 'src="/lp/vos-logo-mono-white.png"')
    .replace(/src="broll\.mp4/g, 'src="/lp/broll.mp4')
    .replace(/poster="broll-poster\.jpg"/g, 'poster="/lp/broll-poster.jpg"')
    .replace(/src="pessoas\//g, 'src="/lp/pessoas/')
    .replace(/'pessoas\//g, "'/lp/pessoas/");

// CTA: mantém o <a> (o CSS é .cta) e liga na modal de lead do site.
const wireCtas = (s) =>
  s.replace(/<a href="#agendar" class="cta">/g, '<a href="#agendar" class="cta" data-action="lead">');

const headOut = rewriteAssets(headMeta);
const bodyOut = wireCtas(rewriteAssets(body));

// ── CSS ─────────────────────────────────────────────────────────────────────
const css = `/**
 * CSS da rota /lp (campanha) — portado do repo vertex-lp (index.html).
 *
 * Ordem importa: o preflight do Tailwind entra primeiro (a modal de lead é
 * React + utilitários e depende dele), e o CSS da LP vem DEPOIS, então ele
 * vence nos elementos que estiliza (body, h1/h2/h3, p, input...).
 * A LP não usa as classes do site (.zx / global.css) — é um documento próprio.
 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* reset original da LP */
${resetCss}

${lpCss}
`;
writeFileSync(`${DEST}/src/styles/lp.css`, css);

// ── página ──────────────────────────────────────────────────────────────────
const page = `---
// Rota /lp · landing de campanha (anúncios). Documento próprio: o HTML, o CSS
// e o JS vêm do repo vertex-lp e ficam intactos (\`is:inline\`), sem o chrome
// da home (Nav/Footer/tema). O que é compartilhado com o resto do site:
//   · GTM + primeiro toque (vos_ft)                     -> GtmHead/GtmNoScript/FirstTouch
//   · CTA -> mesma modal de lead (2 etapas) -> Cal.com  -> <LeadWizardModal/>
// Os CTAs têm data-action="lead"; o listener no fim do body dispara o evento
// "vos:open-lead", exatamente como na home.
import "../styles/lp.css";
import GtmHead from "../components/tracking/GtmHead.astro";
import GaHead from "../components/tracking/GaHead.astro";
import GtmNoScript from "../components/tracking/GtmNoScript.astro";
import FirstTouch from "../components/tracking/FirstTouch.astro";
import LeadWizardModal from "../components/islands/LeadWizardModal.tsx";

const title = "VOS · A maneira mais fácil de atender, vender e gerenciar seu negócio";
const description =
  "O VOS transforma conversas em vendas e conecta agenda, estoque, operação e financeiro no mesmo fluxo. Agende uma demonstração de 15 minutos.";
// Domínio REAL do site (o \`site\` do astro.config aponta pra osvertex.com, que
// hoje devolve 404 — canonical/og apontando pra lá quebrariam preview e SEO).
const SITE_URL = "https://www.voshq.com";
const url = \`\${SITE_URL}/lp/\`;
const ogImage = \`\${SITE_URL}/og.png\`;
---

<!doctype html>
<html lang="pt-BR">
<head>
  <GtmHead />
  <GaHead />
${headOut}
  <!-- Fontes da modal de lead (Geist/Jakarta/JetBrains Mono), pro wizard ficar
       igual ao do resto do site. A LP em si é Inter. -->
  <link
    href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
    rel="stylesheet"
  />
  <title>{title}</title>
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:url" content={url} />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />
</head>
<body>
<GtmNoScript />
${bodyOut}

<LeadWizardModal client:idle />

<script is:inline>
  /* CTA -> modal de lead (mesmo contrato da home: [data-action='lead']). */
  document.addEventListener("click", function (e) {
    var el = e.target instanceof Element ? e.target.closest("[data-action='lead']") : null;
    if (!el) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("vos:open-lead"));
  });
</script>

<FirstTouch />
</body>
</html>
`;

// os <style>/<script> originais viram is:inline pra Astro não tocar neles
const pageOut = page
  .replace(/<script>/g, "<script is:inline>")
  .replace(/<script is:inline is:inline>/g, "<script is:inline>");

writeFileSync(`${DEST}/src/pages/lp.astro`, pageOut);
console.log("ok: lp.astro + lp.css gerados");
