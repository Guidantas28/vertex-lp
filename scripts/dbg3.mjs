import { chromium } from "playwright";
const ROOT="/Users/victorsouza/landing-page-vertex";
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:3840,height:2160}});
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=40`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
for(const t of [3.5,12.5,16.5,21.5,29,37]){
  await p.evaluate(x=>window.__seek(x),t);
  const ops=await p.evaluate(()=>[...document.querySelectorAll(".scene")].map(s=>(+getComputedStyle(s).opacity).toFixed(2)));
  console.log(`t=${t}: [problem,cascade,dash,fecho] = ${ops.join("  ")}`);
}
await b.close();
