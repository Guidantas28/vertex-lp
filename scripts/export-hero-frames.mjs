// Exporta frames estáticos do VOS-Hero-Motion.html para public/assets/product/.
// Usa ?only=1 (tamanho nativo 2200×1375) e espera sidebar hidratada antes do screenshot.
import { chromium } from "playwright";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "assets", "product");
const DEFAULT_HTML = path.join(__dirname, "..", "public", "_proto", "VOS-Hero-Motion.html");
const DOWNLOADS_HTML = path.join(process.env.HOME || "", "Downloads", "VOS-Hero-Motion.html");

function resolveHtml() {
  if (process.env.HERO_HTML) return process.env.HERO_HTML;
  if (fs.existsSync(DOWNLOADS_HTML)) {
    fs.mkdirSync(path.dirname(DEFAULT_HTML), { recursive: true });
    fs.copyFileSync(DOWNLOADS_HTML, DEFAULT_HTML);
    return DEFAULT_HTML;
  }
  return DEFAULT_HTML;
}

const FRAMES = [
  { id: "crm", file: "core-crm" },
  { id: "whatsapp", file: "core-whatsapp" },
  { id: "tasks", file: "core-tarefas" },
  { id: "pedidos", file: "operacoes-funnel" },
  { id: "os", file: "services-funnel" },
  { id: "dashboard", file: "core-dashboard" },
];

const cleanupFrame = async (page, id) => {
  const ok = await page.evaluate((frameId) => {
    const frame = document.querySelector(`.frame[data-id="${frameId}"]`);
    if (!frame) return false;
    frame.style.zoom = "1";
    frame.querySelectorAll(
      ".dragdeal,.dragcur,.dropslot,.wontoast,.statuscard,.replay,.rail,.taskfly,.floatup,.ghost,.corrpush,.shareov,.sigdraw,.stamp,.spark,.ring,.flydeal",
    ).forEach((el) => el.remove());
    frame.querySelectorAll(".kcol").forEach((c) => c.classList.remove("lit"));
    const kb = frame.querySelector(".kanban");
    if (kb?._html) kb.innerHTML = kb._html;
    const wa = frame.querySelector(".wa-msgs");
    if (wa?._html) wa.innerHTML = wa._html;
    return true;
  }, id);
  return ok;
};

const run = async () => {
  const HTML = resolveHtml();
  console.log("Source:", HTML);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: 1 });
  await page.goto(`file://${HTML}?only=1`, { waitUntil: "networkidle", timeout: 120_000 });

  await page.waitForFunction(
    () => typeof window.buildSidebar === "function" && document.querySelector('.frame[data-id="crm"] .sb'),
    { timeout: 60_000 },
  );
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(300);

  for (const { id, file } of FRAMES) {
    const ok = await cleanupFrame(page, id);
    if (!ok) {
      console.log(`✗ frame missing: ${id}`);
      continue;
    }
    const el = await page.$(`.frame[data-id="${id}"]`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    const buf = await el.screenshot({ type: "png" });
    const meta = await sharp(buf).metadata();
    await sharp(buf)
      .resize(2200, 1375, { fit: "fill" })
      .webp({ quality: 86 })
      .toFile(path.join(OUT, `${file}.webp`));
    console.log(`✓ ${file}.webp ← ${id} (${meta.width}×${meta.height} → 2200×1375)`);
  }
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
