// Captura a baseline funcional+visual da /lp (spec Big Black Book §3 e §10).
//
// Por que existe: o deploy da LP não carrega metadado de git, então a única prova
// de que a reforma não quebrou o funil é comparar captura antes × depois. Este
// script roda o mesmo roteiro nas duas pontas.
//
// IMPORTANTE: /api/lead, /api/first-touch e /api/agendou são INTERCEPTADOS e
// respondidos localmente. Nada chega no CRM — o dataLayer é client-side e dispara
// igual, que é justamente o contrato que queremos registrar.
//
// Uso:  node scripts/baseline-lp.mjs [--out <dir>] [--url http://localhost:4321/lp]
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const args = process.argv.slice(2);
const arg = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const ALVO = arg("--url", "http://localhost:4321/lp");
const OUT = path.resolve(arg("--out", "baseline"));
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];

// Rotas do funil que NÃO podem sair da máquina durante a captura.
const BLOQUEADAS = ["**/api/lead", "**/api/first-touch", "**/api/agendou"];

const relatorio = { url: ALVO, capturadoEm: new Date().toISOString(), viewports: {} };

for (const vp of VIEWPORTS) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: 2,
  });

  for (const rota of BLOQUEADAS) {
    await ctx.route(rota, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, _interceptado: true }),
      }),
    );
  }
  // Cal.com é iframe externo — fora do escopo da captura.
  await ctx.route("**cal.osvertex.com/**", (route) => route.abort());

  const page = await ctx.newPage();
  const console_ = [];
  const chamadasApi = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") console_.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => console_.push(`[pageerror] ${e.message}`));
  page.on("request", (r) => {
    if (r.url().includes("/api/")) chamadasApi.push(`${r.method()} ${new URL(r.url()).pathname}`);
  });

  await page.goto(ALVO, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);

  const r = { console: console_, api: chamadasApi };

  // --- Contrato de DOM que o GTM depende ---
  r.contratoDom = await page.evaluate(() => ({
    ctasLead: document.querySelectorAll("[data-action='lead']").length,
    titulo: document.title,
    h1: document.querySelector("h1")?.innerText?.replace(/\s+/g, " ").trim() ?? null,
    temGtmNoScript: !!document.querySelector("iframe[src*='ns.html']"),
    dataLayerExiste: Array.isArray(window.dataLayer),
    secoes: [...document.querySelectorAll("section,header,footer")].map(
      (s) => s.className?.toString().split(" ")[0] || s.tagName.toLowerCase(),
    ),
  }));

  await page.screenshot({ path: path.join(OUT, `${vp.id}-full.png`), fullPage: true });
  await page.screenshot({ path: path.join(OUT, `${vp.id}-hero.png`) });

  // --- Abre o modal pelo mesmo caminho do usuário ---
  await page.locator("[data-action='lead']").first().click();
  await page.waitForTimeout(900);
  r.modalAbriu = await page.locator("#lead-wizard-title").isVisible().catch(() => false);
  if (r.modalAbriu) {
    await page.screenshot({ path: path.join(OUT, `${vp.id}-modal-1.png`) });

    await page.getByPlaceholder("Maria Silva").fill("Baseline Teste");
    await page.getByPlaceholder("maria@empresa.com").fill("baseline@exemplo-teste.com");
    await page.getByPlaceholder("(11) 99999-9999").fill("11988887777");
    await page.getByPlaceholder("Empresa Ltda").fill("Empresa Baseline");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${vp.id}-modal-2.png`) });

    // Os três selects da etapa 2, na ordem: segmento, faturamento, desafio.
    const selects = page.locator("select").filter({ hasNot: page.locator("option[value='BR']") });
    const n = await selects.count();
    for (let i = 0; i < Math.min(n, 3); i++) {
      const opts = await selects.nth(i).locator("option").all();
      for (const o of opts) {
        const v = await o.getAttribute("value");
        if (v) {
          await selects.nth(i).selectOption(v);
          break;
        }
      }
    }
    await page.waitForTimeout(300);

    const btn = page.getByRole("button", { name: /horário|Enviando/i });
    if (await btn.count()) {
      await btn.first().click();
      await page.waitForTimeout(2500);
    }

    // --- O contrato que o GTM consome ---
    r.dataLayer = await page.evaluate(() =>
      (window.dataLayer || [])
        .filter((e) => e && e.event)
        .map((e) => ({ event: e.event, chaves: e.lead ? Object.keys(e.lead) : Object.keys(e) })),
    );
    await page.screenshot({ path: path.join(OUT, `${vp.id}-modal-3.png`) });
  }

  relatorio.viewports[vp.id] = r;
  await browser.close();
}

fs.writeFileSync(path.join(OUT, "baseline.json"), JSON.stringify(relatorio, null, 2));
console.log(JSON.stringify(relatorio, null, 2));
console.log("\nArtefatos em:", OUT);
