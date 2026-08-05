import { chromium } from "playwright";
import fs from "node:fs";
const DIR = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad/video";
const SCENE = process.env.SCENE || "scene1.html";
const T = parseFloat(process.env.SCENE_T || "6.6"); // duração do timeline (s)

const run = async () => {
  const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
  const context = await browser.newContext({
    viewport: { width: 3840, height: 2160 },
    deviceScaleFactor: 1,
    recordVideo: { dir: DIR, size: { width: 3840, height: 2160 } },
  });
  const page = await context.newPage();
  const t0 = Date.now();
  await page.goto("file://" + DIR + "/" + SCENE, { waitUntil: "load" });
  await page.waitForSelector("body.go", { timeout: 8000 });
  const lead = (Date.now() - t0) / 1000;
  await page.waitForTimeout(T * 1000 + 700);
  await page.close();
  const vp = await page.video()?.path();
  await context.close();
  await browser.close();
  console.log(JSON.stringify({ video: vp, lead }));
};
run().catch((e) => { console.error(e); process.exit(1); });
