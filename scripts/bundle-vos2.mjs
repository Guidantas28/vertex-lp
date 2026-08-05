// Regenera o VOS-v2.html (bundle self-contained) a partir do index.html modular.
// Inlina vos2.css/vos2-ext.css em <style> e cada vos2-*.js em <script>.
// Fonte única de verdade = arquivos externos. Uso: node scripts/bundle-vos2.mjs
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "..", "public", "_proto", "vos2");
const read = (f) => fs.readFileSync(path.join(DIR, f), "utf8");

let html = read("index.html");

// 1) CSS externo -> <style> inline
const inlineCss = (file) => {
  const css = read(file);
  const re = new RegExp(`<link[^>]*href="${file.replace(/[.]/g, "\\.")}"[^>]*>`);
  html = html.replace(re, `<style data-from="${file}">\n${css}\n</style>`);
};
["vos2.css", "vos2-ext.css"].forEach(inlineCss);

// 2) JS externo -> <script> inline (preserva ordem, escapa </script>)
const inlineJs = (file) => {
  const js = read(file).replace(/<\/script>/gi, "<\\/script>");
  const re = new RegExp(`<script src="${file.replace(/[.]/g, "\\.")}"></script>`);
  html = html.replace(re, `<script data-from="${file}">\n${js}\n</script>`);
};
["vos2-data.js", "vos2-core.js", "vos2-modules.js", "vos2-ext.js", "vos2-rel.js", "vos2-app.js"].forEach(inlineJs);

// 3) SVGs de fundo (doodle) -> data-URI, pra bundle 100% self-contained (abre solto)
const inlineSvg = (file) => {
  const svg = read(path.join("assets", file)).replace(/\s+/g, " ").trim();
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  html = html.split(`assets/${file}`).join(uri);
};
["wa-doodles.svg", "wa-doodles-dark.svg"].forEach(inlineSvg);

// sanidade: nenhum <link>/<script src> de arquivo local deve sobrar
const leftover = [...html.matchAll(/(?:src|href)="(vos2[^"]*)"/g)].map((m) => m[1]);
if (leftover.length) {
  console.error("⚠ referências locais não inlinadas:", leftover);
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, "VOS-v2.html"), html);
console.log(`✓ VOS-v2.html regenerado (${(html.length / 1024).toFixed(0)} KB)`);
