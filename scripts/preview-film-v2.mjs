import { chromium } from "playwright";
import { spawn, execFileSync } from "child_process";
const ROOT = "/Users/victorsouza/landing-page-vertex";
const DESK = "/Users/victorsouza/Desktop";
const T = 105, FPS = 12, W = 3840, H = 2160, N = Math.round(T*FPS);
const OUT = `${DESK}/VOS-film-v2-PREVIEW.mp4`;
console.log(`preview ${T}s · ${N} frames · 1280x720 · ${FPS}fps`);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:1 });
await page.goto(`file://${ROOT}/video-src/vos-film-v2.html?t=${T}`);
await page.waitForFunction(()=>window.__ready===true,{timeout:60000});
const ff = spawn("ffmpeg", ["-y","-f","image2pipe","-framerate",String(FPS),"-c:v","mjpeg","-i","-",
  "-vf",`scale=1280:720:flags=bilinear,fps=${FPS},format=yuv420p`,"-c:v","libx264","-preset","veryfast","-crf","23",
  "-pix_fmt","yuv420p","-movflags","+faststart",OUT], { stdio:["pipe","ignore","inherit"] });
const write = (b)=>new Promise(r=>{ if(ff.stdin.write(b)) r(); else ff.stdin.once("drain",r); });
for(let n=0;n<N;n++){
  await page.evaluate(t=>window.__seek(t), n/FPS);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));
  await write(await page.screenshot({type:"jpeg",quality:72}));
  if(n%120===0) console.log(`  ${n}/${N}`);
}
ff.stdin.end();
await new Promise((res,rej)=>ff.on("close",c=>c===0?res():rej(new Error("ffmpeg "+c))));
await browser.close();
console.log("=== "+OUT+" ===");
