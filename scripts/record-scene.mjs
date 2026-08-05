import { chromium } from "playwright";
import fs from "node:fs";
const OUT = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad/video";
fs.mkdirSync(OUT, { recursive: true });

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")));
  // posiciona a janela de produto centralizada (scroll instantâneo)
  await page.evaluate(() => { const el = document.querySelector(".prodwin"); el && el.scrollIntoView({ block: "center" }); });
  await page.waitForTimeout(13000); // deixa o fluxo percorrer ~3 etapas
  await page.close();
  const vp = await page.video()?.path();
  await context.close();
  await browser.close();
  console.log(vp || "no video");
};
run().catch((e) => { console.error(e); process.exit(1); });
