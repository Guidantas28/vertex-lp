// Captura screenshots reais do produto Vertex OS (prototipo em /_proto/system.html).
// Renomeia Comércio->Commerce e Serviços->Services no DOM. Salva webp em public/assets/product/.
import { chromium } from "playwright";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "assets", "product");
const BASE = process.env.BASE || "http://localhost:4321/_proto/system.html";

const SHOTS = [
  { file: "core-dashboard", nav: "Dashboard" },
  { file: "core-whatsapp", nav: "WhatsApp" },
  { file: "core-crm", nav: "CRM", tab: "Pipeline" },
  { file: "core-crm-funil", nav: "CRM", tab: "Dashboard" },
  { file: "core-documentos", nav: "Documentos" },
  { file: "core-tarefas", nav: "Tarefas" },
  { file: "commerce-catalogo", nav: "Catálogo" },
  { file: "commerce-ordens", nav: "Ordens" },
  { file: "services-ordens", nav: "Serviços" },
  { file: "services-agenda", nav: "Agendamento" },
  { file: "services-gestao", nav: "Gestão" },
  { file: "finance-visao", nav: "Visão" },
  { file: "finance-fluxo", nav: "Fluxo de caixa" },
  { file: "finance-nota", nav: "Nota fiscal" },
  { file: "ai-copiloto", nav: "Ativar módulo" },
];

const clickByText = (label, maxWidth = 9999) =>
  `(() => {
    const want = ${JSON.stringify(label)};
    const items = [...document.querySelectorAll('a,button,div,span,li')];
    const el = items.find(e => e.children.length <= 2 && (e.textContent||'').trim() === want && e.offsetWidth > 0 && e.offsetWidth < ${maxWidth});
    if (el) { el.click(); return true; }
    return false;
  })()`;

// Renomeia Comércio->Commerce, Serviços->Services nos nós de texto.
const RELABEL = `(() => {
  const map = [[/Comércio/g,'Commerce'],[/Serviços/g,'Services'],[/Comercio/g,'Commerce'],[/Servicos/g,'Services'],[/ — /g,' · ']];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const ns = []; let n; while (n = w.nextNode()) ns.push(n);
  ns.forEach(t => { let v = t.nodeValue; map.forEach(([re,to]) => { v = v.replace(re,to); }); if (v !== t.nodeValue) t.nodeValue = v; });
})()`;

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  for (const shot of SHOTS) {
    let okNav = await page.evaluate(clickByText(shot.nav, 240));
    if (!okNav) {
      const alt = shot.nav.replace("Serviços", "Services").replace("Comércio", "Commerce");
      if (alt !== shot.nav) okNav = await page.evaluate(clickByText(alt, 240));
    }
    await page.waitForTimeout(650);
    if (shot.tab) {
      await page.evaluate(clickByText(shot.tab, 400));
      await page.waitForTimeout(650);
    }
    await page.evaluate(RELABEL);
    await page.waitForTimeout(120);
    const buf = await page.screenshot();
    await sharp(buf).resize({ width: 2200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, `${shot.file}.webp`));
    console.log(`${okNav ? "✓" : "✗(nav?)"} ${shot.file}.webp`);
  }
  await browser.close();
};
run().catch((e) => { console.error(e); process.exit(1); });
