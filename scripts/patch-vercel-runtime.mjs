import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = ".vercel/output/functions";
const CONFIG = ".vercel/output/config.json";
const RUNTIME = "nodejs22.x";

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name === ".vc-config.json") patch(path);
  }
}

function patch(file) {
  const cfg = JSON.parse(readFileSync(file, "utf8"));
  if (cfg.runtime?.startsWith("nodejs") && cfg.runtime !== RUNTIME) {
    cfg.runtime = RUNTIME;
    writeFileSync(file, JSON.stringify(cfg, null, "\t") + "\n");
    console.log(`patched ${file} → ${RUNTIME}`);
  }
}

// ── Uma URL por página: barra final obrigatória ──────────────────────────────
// O adapter da Vercel deixa o handler de filesystem servir /blog E /blog/ com
// 200, e o Astro gera diretórios (/blog/index.html). Resultado no Search
// Console: "Duplicate without user-selected canonical" — duas URLs, mesmo
// conteúdo, nenhuma escolhida. A forma canônica aqui é COM barra, porque é a
// que o `Astro.url.pathname` produz (e portanto a que já está no <link
// rel="canonical"> e no sitemap).
//
// Feito em rota da Build Output API, e não com `trailingSlash: "always"` do
// Astro, de propósito: aquela flag também passa a exigir barra nas rotas de
// API, e o LeadWizardModal faz POST em /api/lead sem barra. Um 308 no meio de
// um POST de lead é risco que não vale a pena.
//
// A regex casa só caminho SEM barra final, SEM ponto (deixa .png/.xml/.txt em
// paz) e que não comece com api/ ou _ (rotas de função e assets do Astro).
const REDIRECT_BARRA = {
  src: "^/(?!api/)(?!_)([^.]*[^/.])$",
  headers: { Location: "/$1/" },
  status: 308,
};

function patchConfig() {
  const cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
  cfg.routes ??= [];
  if (cfg.routes.some((r) => r.src === REDIRECT_BARRA.src)) return;
  // Antes do `handle: filesystem`, senão o arquivo estático responde 200 e o
  // redirect nunca roda.
  const i = cfg.routes.findIndex((r) => r.handle === "filesystem");
  cfg.routes.splice(i === -1 ? cfg.routes.length : i, 0, REDIRECT_BARRA);
  writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + "\n");
  console.log(`patched ${CONFIG} → 308 para a barra final`);
}

try {
  walk(OUT);
  patchConfig();
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}
