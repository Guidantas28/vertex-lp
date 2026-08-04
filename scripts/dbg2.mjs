import { chromium } from "playwright";
const ROOT="/Users/victorsouza/landing-page-vertex";
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:3840,height:2160}});
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=40`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
await p.evaluate(x=>window.__seek(x),12.5);
const r=await p.evaluate(()=>{
  const s=document.querySelectorAll(".scene")[1];
  const anims=s.getAnimations().map(a=>({ct:a.currentTime, ps:a.playState, dur:a.effect.getTiming().duration}));
  // ler keyframes da primeira anim
  const kf=s.getAnimations()[0]?.effect.getKeyframes().map(k=>({o:k.offset, op:k.opacity}));
  return {opacity:getComputedStyle(s).opacity, nAnims:s.getAnimations().length, anims, kf};
});
console.log(JSON.stringify(r,null,1));
await b.close();
