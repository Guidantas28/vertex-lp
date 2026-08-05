import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad";
const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-visible")));
  await page.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));} window.scrollTo(0,0); });
  await page.waitForTimeout(400);
  const shots = [
    { sel: "#modular", name: "sec-modular" },
    { sel: "#core", name: "sec-core" },
  ];
  for (const s of shots) {
    const el = await page.$(s.sel);
    if (el) { await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1700); await el.screenshot({ path: `${OUT}/${s.name}.png` }); console.log(s.name); }
    else console.log("MISS " + s.sel);
  }
  await browser.close();
};
run().catch((e) => { console.error(e); process.exit(1); });
