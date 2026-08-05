// Telas customizadas injetadas sobre o protótipo (mesmo CSS), com topbar próprio:
// funil de Pedidos (Commerce) e funil de Ordens de Serviço (Services).
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "assets", "product");
const BASE = "http://localhost:4321/_proto/system.html";

const RELABEL = `(() => {
  const map=[[/Comércio/g,'Commerce'],[/Serviços/g,'Services']];
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const ns=[];let n;while(n=w.nextNode())ns.push(n);
  ns.forEach(t=>{let v=t.nodeValue;map.forEach(([re,to])=>v=v.replace(re,to));if(v!==t.nodeValue)t.nodeValue=v;});
})()`;

const buildFunnel = (side, cfg) => `
(() => {
  document.getElementById('vos-funnel')?.remove();
  const C = ${JSON.stringify(cfg)};
  const card = (cl,id,vl,sub,color) => '<div style="background:var(--panel,#fff);border:1px solid var(--line,rgba(13,12,26,.09));border-radius:12px;padding:13px 14px;box-shadow:0 1px 2px rgba(13,12,26,.04)">'
    + '<div style="display:flex;justify-content:space-between;align-items:start;gap:8px"><span style="font-weight:700;font-size:13.5px;color:var(--ink,#14131C)">'+cl+'</span><span style="font-weight:800;font-size:13.5px;color:'+color+'">'+vl+'</span></div>'
    + '<div style="font-family:JetBrains Mono,monospace;font-size:10px;color:var(--ink-3,#8C8B98);margin-top:3px">'+id+'</div>'
    + '<div style="display:flex;align-items:center;gap:6px;margin-top:9px"><span style="width:6px;height:6px;border-radius:99px;background:'+color+'"></span><span style="font-size:11.5px;color:var(--ink-2,#5B5A68)">'+sub+'</span></div></div>';
  const col = (c) => '<div style="min-width:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    + '<span style="width:8px;height:8px;border-radius:99px;background:'+c.color+'"></span>'
    + '<span style="font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2,#5B5A68)">'+c.name+'</span>'
    + '<span style="font-family:JetBrains Mono,monospace;font-size:10px;color:var(--ink-3,#8C8B98);background:var(--panel-3,#F1F0ED);border-radius:99px;padding:1px 7px">'+c.count+'</span></div>'
    + '<div style="display:flex;flex-direction:column;gap:10px">'+c.cards.map(k=>card(k[0],k[1],k[2],k[3],c.color)).join('')+'</div></div>';
  const o = document.createElement('div');
  o.id = 'vos-funnel';
  o.style.cssText = 'position:fixed;left:${side}px;top:0;right:0;bottom:0;background:var(--bg,#F7F6F4);overflow:hidden;font-family:Archivo,system-ui,sans-serif;z-index:5';
  o.innerHTML =
    '<div style="height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 30px;border-bottom:1px solid var(--line,rgba(13,12,26,.09));background:var(--panel-2,#FBFAF8)">'
      + '<div style="display:flex;align-items:center;gap:9px;font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3,#8C8B98)"><span>Vertex OS</span><span>/</span><span style="display:inline-flex;align-items:center;gap:5px;color:'+C.moduleColor+'"><span style="width:6px;height:6px;border-radius:99px;background:'+C.moduleColor+'"></span>'+C.module+'</span><span>/</span><span>'+C.view+'</span></div>'
      + '<div style="display:flex;align-items:center;gap:6px;font-family:JetBrains Mono,monospace;font-size:10px;color:#15935A"><span style="width:6px;height:6px;border-radius:99px;background:#15935A"></span>Sincronizado</div>'
    + '</div>'
    + '<div style="padding:24px 30px">'
      + '<div style="font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:'+C.moduleColor+';display:flex;align-items:center;gap:7px"><span style="width:7px;height:7px;border-radius:99px;background:'+C.moduleColor+'"></span>'+C.eyebrow+'</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 18px"><h1 style="font-family:Archivo Expanded,Archivo,sans-serif;font-weight:800;font-size:30px;letter-spacing:-.02em;color:var(--ink,#14131C);margin:0">'+C.title+'</h1><span style="background:#ED4B00;color:#fff;font-weight:600;font-size:12.5px;border-radius:99px;padding:8px 14px">'+C.btn+'</span></div>'
      + '<div style="display:flex;gap:26px;border-bottom:1px solid var(--line,rgba(13,12,26,.09));margin-bottom:22px">'
        + C.tabs.map(t=>'<div style="display:flex;align-items:center;gap:7px;padding-bottom:12px;border-bottom:2px solid '+(t[3]?'#ED4B00':'transparent')+';margin-bottom:-1px"><span style="font-weight:'+(t[3]?700:600)+';font-size:13.5px;color:'+(t[3]?'var(--ink,#14131C)':'var(--ink-3,#8C8B98)')+'">'+t[0]+'</span><span style="font-family:JetBrains Mono,monospace;font-size:10px;color:#fff;background:'+t[2]+';border-radius:99px;padding:1px 7px">'+t[1]+'</span></div>').join('')
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;align-items:start">'+C.cols.map(col).join('')+'</div>'
    + '</div>';
  document.body.appendChild(o);
})()`;

const COMMERCE = {
  module: "Commerce", moduleColor: "#1F6FEB", view: "Pedidos",
  eyebrow: "Commerce · Pedidos", title: "Pedidos", btn: "+ Novo pedido",
  tabs: [["Novo Pedido", 8, "#ED4B00", 1], ["Pronto p/ Despacho", 5, "#1F6FEB", 0], ["Em Delivery", 3, "#6D4AFF", 0], ["Entregue", 142, "#15935A", 0]],
  cols: [
    { name: "Novo Pedido", count: 8, color: "#ED4B00", cards: [["Padaria Trigo", "#PV-8821", "R$ 340", "12 itens · agora"], ["Óticas Vista", "#PV-8822", "R$ 1.250", "3 itens · há 4 min"], ["Studio Vox", "#PV-8823", "R$ 690", "1 item · há 12 min"]] },
    { name: "Pronto p/ Despacho", count: 5, color: "#1F6FEB", cards: [["Móveis Norte", "#PV-8810", "R$ 2.480", "Sofá 3 lugares"], ["Auto Center BH", "#PV-8809", "R$ 1.120", "8 itens · separado"]] },
    { name: "Em Delivery", count: 3, color: "#6D4AFF", cards: [["Distribuidora Alfa", "#PV-8801", "R$ 3.900", "A caminho · 14h20"], ["Loja Bibi", "#PV-8799", "R$ 410", "Saiu para entrega"]] },
    { name: "Entregue", count: 142, color: "#15935A", cards: [["Clínica Mais", "#PV-8788", "R$ 540", "Entregue · 11h02"], ["Tech Sul", "#PV-8770", "R$ 1.980", "Entregue · ontem"]] },
  ],
};
const SERVICES = {
  module: "Services", moduleColor: "#15935A", view: "Ordens de serviço",
  eyebrow: "Services · Ordens de serviço", title: "Ordens de serviço", btn: "+ Nova OS",
  tabs: [["Novo Orçamento", 6, "#ED4B00", 1], ["Agendado", 4, "#1F6FEB", 0], ["Em Execução", 3, "#6D4AFF", 0], ["Concluído", 88, "#15935A", 0]],
  cols: [
    { name: "Novo Orçamento", count: 6, color: "#ED4B00", cards: [["Condomínio Sol", "#OS-3310", "R$ 1.800", "Pintura · enviado"], ["Padaria Trigo", "#OS-3311", "R$ 640", "Refrigeração"]] },
    { name: "Agendado", count: 4, color: "#1F6FEB", cards: [["Tech Sul", "#OS-3302", "R$ 2.400", "Amanhã 09h · Equipe A"], ["Clínica Mais", "#OS-3301", "R$ 980", "Sex 14h"]] },
    { name: "Em Execução", count: 3, color: "#6D4AFF", cards: [["Distribuidora Alfa", "#OS-3290", "R$ 3.200", "Em campo · Marcos"]] },
    { name: "Concluído", count: 88, color: "#15935A", cards: [["Auto Center BH", "#OS-3270", "R$ 1.150", "Faturado"], ["Studio Vox", "#OS-3265", "R$ 520", "Faturado"]] },
  ],
};

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1100);
  await page.evaluate(RELABEL);
  const side = await page.evaluate(`(() => { const a=document.querySelector('aside')||document.querySelector('nav'); return a? Math.round(a.getBoundingClientRect().width):236; })()`);

  for (const [cfg, file, nav] of [[COMMERCE, "operacoes-funnel", "Ordens"], [SERVICES, "services-funnel", "Services"]]) {
    await page.evaluate(`(() => { const el=[...document.querySelectorAll('a,button,div,span,li')].find(e=>e.children.length<=2 && (e.textContent||'').trim()===${JSON.stringify(nav)} && e.offsetWidth>0 && e.offsetWidth<240); el&&el.click(); })()`);
    await page.waitForTimeout(350);
    await page.evaluate(buildFunnel(side, cfg));
    await page.waitForTimeout(250);
    const buf = await page.screenshot();
    await sharp(buf).resize({ width: 2200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, `${file}.webp`));
    console.log(`${file}.webp`);
  }
  await browser.close();
};
run().catch((e) => { console.error(e); process.exit(1); });
