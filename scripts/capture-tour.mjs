// Captura as 22 telas do "VOS Tour Explicativo" (public/_tour-src.html) sem cortar
// callouts (união das bounding boxes) e SEM a barra lateral de navegação — que no
// tour mostra um menu diferente do sistema real e confundiria. → public/assets/tour/NN.webp
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "assets", "tour");

const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1600,height:1000}, deviceScaleFactor:2 });
await p.goto("http://localhost:4323/_tour-src.html", { waitUntil:"networkidle" });
await p.waitForTimeout(1500);
await p.evaluate(()=>document.fonts.ready);
await p.waitForTimeout(400);
const n = await p.evaluate(()=>document.querySelectorAll('section').length);
let ok=0;
for(let i=0;i<Math.min(n,22);i++){
  await p.evaluate((idx)=>document.querySelectorAll('section')[idx].scrollIntoView({block:'center'}), i);
  await p.waitForTimeout(300);
  // esconde a sidebar de nav (elemento com >=3 labels de menu) — só a Painel tem
  await p.evaluate((idx)=>{
    const col=document.querySelectorAll('section')[idx].children[1]; if(!col) return;
    const NAV=['Painel','WhatsApp','CRM','Documentos','Tarefas','Dashboard'];
    let side=null;
    col.querySelectorAll('*').forEach(e=>{ const hits=NAV.filter(x=>(e.textContent||'').includes(x)).length; const br=e.getBoundingClientRect();
      if(hits>=3 && br.height>140 && br.width>90 && br.width<330){ if(!side||br.width<side.getBoundingClientRect().width) side=e; }});
    if(side) side.style.display='none';
  }, i);
  await p.waitForTimeout(250);
  const box = await p.evaluate((idx)=>{
    const s=document.querySelectorAll('section')[idx]; const col=s.children[1] || s;
    const base=col.getBoundingClientRect(); let l=base.left,t=base.top,r=base.right,btm=base.bottom;
    col.querySelectorAll('*').forEach(e=>{ const b=e.getBoundingClientRect(); if(b.width<6||b.height<6) return;
      if(getComputedStyle(e).display==='none') return; if(parseFloat(getComputedStyle(e).opacity)<0.05) return;
      l=Math.min(l,b.left);t=Math.min(t,b.top);r=Math.max(r,b.right);btm=Math.max(btm,b.bottom); });
    const pad=14; return {x:Math.max(0,Math.round(l-pad)),y:Math.max(0,Math.round(t-pad)),w:Math.round(r-l+pad*2),h:Math.round(btm-t+pad*2)};
  }, i);
  if(!box.w||!box.h){ console.log("skip",i); continue; }
  const buf = await p.screenshot({ clip:{x:box.x,y:box.y,width:box.w,height:box.h} });
  const file = String(i+1).padStart(2,'0');
  await sharp(buf).resize({width:1500,withoutEnlargement:true}).webp({quality:88}).toFile(path.join(OUT,`${file}.webp`));
  ok++; console.log("ok",file,`${box.w}x${box.h}`);
}
await b.close();
console.log(`${ok} telas`);
