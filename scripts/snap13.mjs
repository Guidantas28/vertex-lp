import { chromium } from "playwright";
import { execFileSync } from "child_process";
const ROOT="/Users/victorsouza/landing-page-vertex";const DIR=`${ROOT}/video-build/film/frames`;
const W=3840,H=2160;const times=[6,17,25,35,48,71,80,89,100,114,128,140,146];
const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errs=[];p.on("pageerror",e=>errs.push(String(e)));
await p.goto(`file://${ROOT}/video-src/vos-film.html?t=147.64`);
await p.waitForFunction(()=>window.__ready===true,{timeout:60000});
let i=0;for(const t of times){await p.evaluate(x=>window.__seek(x),t);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await p.screenshot({path:`${DIR}/s13_${i}.png`});execFileSync("ffmpeg",["-y","-i",`${DIR}/s13_${i}.png`,"-vf","scale=620:-1",`${DIR}/v13_${i}.png`],{stdio:"ignore"});i++;}
await b.close();console.log("ERRORS:",errs.length,errs.slice(0,3));
const f=times.map((_,i)=>`${DIR}/v13_${i}.png`);
execFileSync("ffmpeg",["-y",...f.flatMap(x=>["-i",x]),"-i",f[0],"-filter_complex",
 "[0][1][2][3][4]hstack=5[a];[5][6][7][8][9]hstack=5[b];[10][11][12][13]hstack=4,pad=3100:ih[c];[a][b][c]vstack=3","-frames:v","1",`${DIR}/_sheet13.png`],{stdio:"ignore"});
console.log("sheet ok");
