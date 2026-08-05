import { chromium } from "playwright";
const ROOT="/Users/victorsouza/landing-page-vertex";
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:3840,height:2160}});
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=40`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
const r=await p.evaluate(()=>{ window.__seek(3.5);
  return [...document.querySelectorAll(".scene")].slice(0,2).map((s,i)=>{
    const a=s.getAnimations()[0];
    return {i, ct:a.currentTime, dur:a.effect.getTiming().duration, nAnim:s.getAnimations().length,
      op:(+getComputedStyle(s).opacity).toFixed(2),
      kf:a.effect.getKeyframes().map(k=>({o:+(+k.offset).toFixed(3),op:k.opacity}))};
  });
});
console.log(JSON.stringify(r,null,1));
await b.close();
