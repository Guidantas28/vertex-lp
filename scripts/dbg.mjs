import { chromium } from "playwright";
const ROOT="/Users/victorsouza/landing-page-vertex";
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:3840,height:2160}});
const errs=[]; p.on("pageerror",e=>errs.push(String(e)));
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=40`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
await p.evaluate(x=>window.__seek(x),12.5);
await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const info=await p.evaluate(()=>{
  const out=[];
  document.querySelectorAll(".scene").forEach((s,i)=>{
    const cs=getComputedStyle(s);
    const head=s.querySelector(".head");
    out.push({i, display:cs.display, opacity:cs.opacity, hasHead:!!head, headTxt:head?head.textContent.slice(0,20):null, headOp:head?getComputedStyle(head).opacity:null, childCount:s.querySelector(".wrap")?.children.length});
  });
  return out;
});
console.log("ERRORS:",errs);
console.log(JSON.stringify(info,null,1));
await b.close();
