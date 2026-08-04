import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad";
const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")));
  const labels = ["vendas", "automacoes", "administrativo", "operacoes", "financeiro"];
  for (let i = 0; i < 5; i++) {
    await page.evaluate((idx) => {
      const b = [...document.querySelectorAll("button")].filter((x) => /Vendas|Automações|Operações|Administrativo|Financeiro/.test(x.textContent || ""));
      b[idx] && b[idx].click();
    }, i);
    await page.waitForTimeout(2600);
    const el = await page.$(".prodwin");
    const box = await el.boundingBox();
    await page.screenshot({ path: `${OUT}/w-${labels[i]}.png`, clip: { x: box.x - 60, y: box.y - 20, width: box.width + 120, height: box.height + 40 } });
    console.log("w-" + labels[i]);
  }
  await browser.close();
};
run().catch((e) => { console.error(e); process.exit(1); });
