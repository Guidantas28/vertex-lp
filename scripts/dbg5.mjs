import { chromium } from "playwright";
const ROOT="/Users/victorsouza/landing-page-vertex";
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:3840,height:2160}});
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=40`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
const r=await p.evaluate(()=>{ window.__seek(3.5);
  return [...document.querySelectorAll(".scene")].map((s,i)=>{
    const a=s.getAnimations()[0];
    const kf=a.effect.getKeyframes().filter(k=>k.opacity==="1").map(k=>+k.offset.toFixed(3));
    const head=s.querySelector(".head,.vos");
    return {i, txt:head?head.textContent.slice(0,16):"?", op:(+getComputedStyle(s).opacity).toFixed(2), op1at:kf};
  });
});
console.log(JSON.stringify(r,null,1));
await b.close();
