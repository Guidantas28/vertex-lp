import { chromium } from "playwright";
const ROOT="/Users/victorsouza/landing-page-vertex";
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:3840,height:2160}});
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=40`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
for(const t of [3.5,16.5,3.5]){
  const r=await p.evaluate(x=>{ window.__seek(x);
    const sc=[...document.querySelectorAll(".scene")];
    return sc.map(s=>{const a=s.getAnimations()[0]; return {ct:a?a.currentTime:null, ps:a?a.playState:null, op:(+getComputedStyle(s).opacity).toFixed(2)};});
  },t);
  console.log(`seek ${t}:`, JSON.stringify(r));
}
await b.close();
