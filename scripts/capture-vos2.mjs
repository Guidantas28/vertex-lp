// Captura screenshots reais das telas do VOS v2 (protótipo em /_proto/vos2/VOS-v2.html).
// Dirige o app via go('<rota>') e captura o container de conteúdo (#view) de cada tela.
// Salva webp em public/assets/vos2/. Uso: node scripts/capture-vos2.mjs
import { chromium } from "playwright";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "assets", "vos2");
const BASE = process.env.BASE || "http://localhost:4321/_proto/vos2/VOS-v2.html";

// rota do app → arquivo de saída
const SHOTS = [
  { route: "prospect:buscar", file: "prospect" },
  { route: "dashboard", file: "dashboard" },
  { route: "whatsapp", file: "atendimento" },
  { route: "crm", file: "crm" },
  { route: "documentos", file: "esign" },
  { route: "tarefas", file: "tarefas" },
  { route: "comercio:cat", file: "catalogo" },
  { route: "comercio:est", file: "estoque" },
  { route: "comercio:ord", file: "pedidos" },
  { route: "comercio:pdv", file: "pdv" },
  { route: "servicos:ges", file: "servicos-lista" },
  { route: "servicos:cot", file: "cotacoes" },
  { route: "servicos:srv", file: "controle-servico" },
  { route: "servicos:age", file: "agendamento" },
  { route: "financeiro:vis", file: "fin-visao" },
  { route: "financeiro:rec", file: "fin-receber" },
  { route: "financeiro:pag", file: "fin-pagar" },
  { route: "financeiro:flx", file: "fin-fluxo" },
  { route: "financeiro:nf", file: "fin-nf" },
  { route: "financeiro:forn", file: "fin-fornecedores" },
  { route: "financeiro:eq", file: "fin-equipe" },
  { route: "ia:main", file: "copiloto" },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 2,
});

await page.goto(BASE, { waitUntil: "networkidle" });
// destrava todos os módulos p/ poder capturar as telas (não ficar em "Ativar módulo")
await page.evaluate(() => {
  window.VOS = window.VOS || {};
  VOS.unlocked = { prospect: true, comercio: true, servicos: true, financeiro: true, ia: true };
});
await page.waitForTimeout(400);

let ok = 0;
for (const s of SHOTS) {
  try {
    await page.evaluate((r) => window.go(r), s.route);
    await page.waitForTimeout(700); // deixa render/animações assentarem
    const view = await page.$("#view");
    if (!view) {
      console.warn("!! sem #view para", s.route);
      continue;
    }
    const buf = await view.screenshot();
    await sharp(buf)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(OUT, `${s.file}.webp`));
    ok++;
    console.log("ok", s.file, "←", s.route);
  } catch (e) {
    console.warn("!! falhou", s.route, e.message);
  }
}

await browser.close();
console.log(`\n${ok}/${SHOTS.length} telas capturadas em public/assets/vos2/`);
