import { chromium } from "playwright";
import { execFileSync } from "child_process";
import fs from "node:fs";
const ROOT="/Users/victorsouza/landing-page-vertex";
const DESK="/Users/victorsouza/Desktop";
const DIR=`${ROOT}/video-build/v3raw`; fs.mkdirSync(DIR,{recursive:true});
const T=parseFloat(process.argv[2]||"138");
const SCALE=process.argv[3]||"1080";              // 1080 (leve, tempo real fluido) | 4k
const full=SCALE==="4k";
const vw=full?3840:1920, vh=full?2160:1080;
const OUT=`${DESK}/VOS-film-v3-${SCALE}.mp4`;
console.log(`real-time record ${T}s -> ${vw}x${vh}`);
const b=await chromium.launch({args:["--force-color-profile=srgb","--autoplay-policy=no-user-gesture-required"]});
const ctx=await b.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:1,recordVideo:{dir:DIR,size:{width:vw,height:vh}}});
if(!full){
  // filme é autorado em 3840x2160; escala p/ caber no viewport 1080p (render mais leve = tempo real fluido)
  await ctx.addInitScript(()=>{const s=document.createElement("style");s.textContent="body{transform:scale(.5);transform-origin:0 0}";const add=()=>{(document.head||document.documentElement).appendChild(s);};if(document.head)add();else document.addEventListener("DOMContentLoaded",add);});
}
const pg=await ctx.newPage();
await pg.goto(`file://${ROOT}/video-src/vos-film-v3.html?t=${T}&play=1`,{waitUntil:"load"});
await pg.waitForFunction(()=>window.__ready===true,{timeout:60000});
await pg.evaluate(()=>{document.querySelectorAll('video[data-clip]').forEach(v=>{v.muted=true;});window.__play&&window.__play();});
await pg.waitForTimeout((T+1.5)*1000);   // espera fixa (t é wall-clock via performance.now)
const vp=await pg.video().path();
await pg.close(); await ctx.close(); await b.close();
console.log("raw webm:",vp,(fs.statSync(vp).size/1e6).toFixed(1)+"MB");
const args=["-y","-i",vp];
if(full)args.push("-vf","scale=3840:2160:flags=lanczos,fps=30,format=yuv420p");
else args.push("-vf","fps=30,format=yuv420p");
args.push("-c:v","libx264","-preset","medium","-crf","16","-pix_fmt","yuv420p","-movflags","+faststart",OUT);
execFileSync("ffmpeg",args,{stdio:["ignore","ignore","inherit"]});
console.log("=== "+OUT+" ("+(fs.statSync(OUT).size/1e6).toFixed(1)+"MB) ===");
