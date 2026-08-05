/**
 * Captura as 5 telas do tour direto do app local, em 3x.
 * Uso (suas credenciais ficam só no seu shell):
 *   VOS_EMAIL=seu@email VOS_PASS=suasenha node scripts/tour-capture.mjs
 * Saída: public/assets/tour/raw/tour-*.png (4800px de largura)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const APP = "http://localhost:3001";
const OUT = new URL("../public/assets/tour/raw/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const EMAIL = process.env.VOS_EMAIL;
const PASS = process.env.VOS_PASS;
if (!EMAIL || !PASS) {
  console.error("Faltou credencial. Rode: VOS_EMAIL=... VOS_PASS=... node scripts/tour-capture.mjs");
  process.exit(1);
}

const TABS = [
  { id: "dashboard", path: "/home", settle: 4500 },
  { id: "automacoes", path: "/fluxos", settle: 3500 },
  { id: "crm", path: "/crm/pipeline", settle: 3500 },
  { id: "atendimento", path: "/whatsapp", settle: 4500 },
  { id: "agenda", path: "/agenda", settle: 3500 },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 3 });
const page = await ctx.newPage();

await page.goto(`${APP}/login`, { waitUntil: "networkidle" });
await page.fill("#email", EMAIL);
await page.fill("#pass", PASS);
await page.locator("button[type=submit], form button").first().click();
await page.waitForTimeout(5000);
if (page.url().includes("login")) {
  console.error("Login falhou (continua em /login). Confere e-mail/senha.");
  await browser.close();
  process.exit(1);
}
console.log("login ok →", page.url());

for (const t of TABS) {
  await page.goto(`${APP}${t.path}`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(t.settle);
  await page.screenshot({ path: `${OUT}tour-${t.id}.png` });
  console.log("shot ✓", t.id);
}
await browser.close();
console.log("PRONTO · 5 capturas em public/assets/tour/raw/");
