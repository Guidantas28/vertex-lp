#!/usr/bin/env node
// Render HQ quadro-a-quadro do vos-film-v4.html (seek determinístico + vídeos seekáveis).
// uso: node render-film-v4.mjs <T> <out.mp4> [scale=1080|4k] [t0] [t1]
//   screenshots em 4K nativo -> downscale lanczos (1080p supersample = nítido) ou 4K master.
import { chromium } from "playwright";
import { spawn, execFileSync } from "child_process";
const ROOT="/Users/victorsouza/landing-page-vertex";
const DESK="/Users/victorsouza/Desktop";
const [,,Targ,OUT,SCALE="1080",t0s,t1s]=process.argv;
const T=parseFloat(Targ), FPS=30, W=3840, H=2160;
const t0=t0s?parseFloat(t0s):0, t1=t1s?parseFloat(t1s):T;
const n0=Math.round(t0*FPS), n1=Math.round(t1*FPS), N=n1-n0;
const ow=SCALE==="4k"?3840:1920, oh=SCALE==="4k"?2160:1080;
console.log(`render v4 ${t0}-${t1}s · ${N} frames · ${ow}x${oh}`);
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
await page.goto(`file://${ROOT}/video-src/vos-film-v4.html?t=${T}`);
await page.waitForFunction(()=>window.__ready===true,{timeout:120000});
const vf=`scale=${ow}:${oh}:flags=lanczos,fps=${FPS},format=yuv420p`;
const ff=spawn("ffmpeg",["-y","-f","image2pipe","-framerate",String(FPS),"-c:v","png","-i","-",
  "-vf",vf,"-c:v","libx264","-preset","slow","-crf","15","-pix_fmt","yuv420p","-r",String(FPS),
  "-movflags","+faststart",`${OUT}.silent.mp4`],{stdio:["pipe","ignore","inherit"]});
const write=(buf)=>new Promise((res)=>{if(ff.stdin.write(buf))res();else ff.stdin.once("drain",res);});
for(let n=n0;n<n1;n++){
  await page.evaluate((t)=>window.__seek(t), n/FPS);
  await page.evaluate(()=>window.__videosReady());
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await write(await page.screenshot({type:"png"}));
  if((n-n0)%150===0)console.log(`  ${n-n0}/${N}`);
}
ff.stdin.end();
await new Promise((res,rej)=>ff.on("close",c=>c===0?res():rej(new Error("ffmpeg "+c))));
await browser.close();
execFileSync("cp",[`${OUT}.silent.mp4`,OUT]);
try{execFileSync("cp",[OUT,`${DESK}/${OUT.split("/").pop()}`]);}catch(e){}
console.log(`=== ${OUT} ===`);
