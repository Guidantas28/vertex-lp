/**
 * Captura as 3 telas da HERO direto do app local, em 4x (6400px de largura).
 * Uso: VOS_EMAIL=... VOS_PASS=... node scripts/hero-capture.mjs
 * Saída: public/assets/hero/raw/hero-*.png
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const APP = "http://localhost:3001";
const OUT = new URL("../public/assets/hero/raw/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const EMAIL = process.env.VOS_EMAIL;
const PASS = process.env.VOS_PASS;
if (!EMAIL || !PASS) {
  console.error("Faltou credencial. Rode: VOS_EMAIL=... VOS_PASS=... node scripts/hero-capture.mjs");
  process.exit(1);
}

const SHOTS = [
  { id: "dashboard", path: "/home", settle: 5000 },
  { id: "prospect", path: "/prospect", settle: 4500 },
  { id: "atendimento", path: "/whatsapp", settle: 5000 },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 4 });
const page = await ctx.newPage();

await page.goto(`${APP}/login`, { waitUntil: "networkidle" });
await page.fill("#email", EMAIL);
await page.fill("#pass", PASS);
await page.getByRole("button", { name: /entrar/i }).first().click();
await page.waitForTimeout(5000);
if (page.url().includes("login")) {
  console.error("Login falhou (continua em /login). Confere e-mail/senha.");
  await browser.close();
  process.exit(1);
}
console.log("login ok →", page.url());

for (const t of SHOTS) {
  await page.goto(`${APP}${t.path}`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(t.settle);
  await page.screenshot({ path: `${OUT}hero-${t.id}.png` });
  console.log("shot ✓", t.id);
}
await browser.close();
console.log("PRONTO · 3 capturas 4x em public/assets/hero/raw/");
