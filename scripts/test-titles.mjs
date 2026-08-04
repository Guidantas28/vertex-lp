import { chromium } from "playwright";
import { execFileSync } from "child_process";
const ROOT = "/Users/victorsouza/landing-page-vertex";
const DIR = `${ROOT}/video-build/film`;
const W = 3840, H = 2160;
const times = [3.0, 34.0, 60.5, 140.5, 146.5];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto(`file://${ROOT}/video-src/film-titles.html?t=147.64`);
await p.waitForFunction(() => window.__ready === true, { timeout: 60000 });
let idx = 0;
for (const t of times) {
  await p.evaluate((x) => window.__seek(x), t);
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await p.screenshot({ omitBackground: true, type: "png", path: `${DIR}/frames/tt_${idx}.png` });
  // extrai frame do corte e compõe
  execFileSync("ffmpeg", ["-y", "-ss", String(t), "-i", `${DIR}/VOS-filme-4k.mp4`, "-frames:v", "1", `${DIR}/frames/base_${idx}.png`], { stdio: "ignore" });
  execFileSync("ffmpeg", ["-y", "-i", `${DIR}/frames/base_${idx}.png`, "-i", `${DIR}/frames/tt_${idx}.png`,
    "-filter_complex", "[0][1]overlay=format=auto,scale=760:-1", `${DIR}/frames/comp_${idx}.png`], { stdio: "ignore" });
  idx++;
}
await b.close();
// sheet vertical-ish
execFileSync("ffmpeg", ["-y",
  "-i", `${DIR}/frames/comp_0.png`, "-i", `${DIR}/frames/comp_1.png`, "-i", `${DIR}/frames/comp_2.png`,
  "-i", `${DIR}/frames/comp_3.png`, "-i", `${DIR}/frames/comp_4.png`, "-i", `${DIR}/frames/comp_0.png`,
  "-filter_complex", "[0][1][2]hstack=3[a];[3][4][5]hstack=3[b];[a][b]vstack", `${DIR}/frames/_titletest.png`], { stdio: "ignore" });
console.log("ok");
