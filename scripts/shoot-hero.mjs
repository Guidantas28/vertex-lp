import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad";
const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1040 }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")));
  const labels = ["vendas", "automacoes", "administrativo", "operacoes", "financeiro"];
  // clica cada pill do stepper e captura
  for (let i = 0; i < 5; i++) {
    await page.evaluate((idx) => {
      const btns = [...document.querySelectorAll("button")].filter((b) => /Vendas|Automações|Operações|Administrativo|Financeiro/.test(b.textContent || ""));
      btns[idx] && btns[idx].click();
    }, i);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/hero-${labels[i]}.png` });
    console.log("hero-" + labels[i]);
  }
  await browser.close();
};
run().catch((e) => { console.error(e); process.exit(1); });
