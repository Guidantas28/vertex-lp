import { chromium } from "playwright";
import fs from "node:fs";
const ROOT="/Users/victorsouza/landing-page-vertex";
const DIR=`${ROOT}/video-src/clips`;
const ids=["crm","whatsapp","pedidos","os","catalogo","pdv","tasks","dashboard","notas","documentos"];
const REC=6.8;
const b=await chromium.launch({args:["--force-color-profile=srgb"]});
for(const id of ids){
  const ctx=await b.newContext({viewport:{width:2200,height:1375},deviceScaleFactor:1,recordVideo:{dir:DIR,size:{width:2200,height:1375}}});
  const pg=await ctx.newPage();
  await pg.goto(`file://${ROOT}/public/hero-motion/app/VOS-Hero-Motion.html?only=${id}`,{waitUntil:"load"});
  await pg.waitForTimeout(REC*1000);
  const vp=await pg.video().path();
  await pg.close(); await ctx.close();
  fs.renameSync(vp, `${DIR}/${id}.webm`);
  console.log("saved", id);
}
await b.close();
console.log("DONE");
