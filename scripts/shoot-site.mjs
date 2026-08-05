// Full-page screenshots do site para revisão. Salva no scratchpad.
import { chromium } from "playwright";

const OUT = process.env.OUT || "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad";
const pages = (process.env.PAGES || "/").split(",");

const run = async () => {
  const browser = await chromium.launch();
  for (const p of pages) {
    const slug = p === "/" ? "home" : p.replace(/\//g, "");
    for (const [w, tag] of [[1440, "desktop"], [390, "mobile"]]) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
      await page.goto(`http://localhost:4321${p}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")));
      // rola até o fim p/ disparar lazy-load, depois volta
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${slug}-${tag}.png`, fullPage: true });
      console.log(`${slug}-${tag}.png`);
      await page.close();
    }
  }
  await browser.close();
};
run().catch((e) => { console.error(e); process.exit(1); });
