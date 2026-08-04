import { chromium } from "playwright";
import { execFileSync } from "child_process";
const ROOT="/Users/victorsouza/landing-page-vertex";
const DIR=`${ROOT}/video-build/film/frames`;
const W=3840,H=2160;
const times=[4,14,21,29,33.5,38];
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=40`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
let i=0;
for(const t of times){
  await p.evaluate(x=>window.__seek(x),t);
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await p.screenshot({path:`${DIR}/film_${i}.png`});
  execFileSync("ffmpeg",["-y","-i",`${DIR}/film_${i}.png`,"-vf","scale=900:-1",`${DIR}/fv_${i}.png`],{stdio:"ignore"});
  i++;
}
await b.close();
execFileSync("ffmpeg",["-y","-i",`${DIR}/fv_0.png`,"-i",`${DIR}/fv_1.png`,"-i",`${DIR}/fv_2.png`,"-i",`${DIR}/fv_3.png`,"-i",`${DIR}/fv_4.png`,"-i",`${DIR}/fv_5.png`,"-filter_complex","[0][1][2]hstack=3[a];[3][4][5]hstack=3[b];[a][b]vstack",`${DIR}/_filmproof.png`],{stdio:"ignore"});
console.log("ok");
