#!/usr/bin/env node
// Renderiza vos-film.html frame-a-frame -> mp4 (streaming pro ffmpeg).
// uso: node render-film.mjs <T> <out.mp4> [audio.mp3] [scale]
//   scale: "4k" (3840x2160) | "1080" (1920x1080, default)
import { chromium } from "playwright";
import { spawn, execFileSync } from "child_process";
const ROOT = "/Users/victorsouza/landing-page-vertex";
const DESK = "/Users/victorsouza/Desktop";
const [,, Targ, OUT, AUDIO, SCALE="1080"] = process.argv;
const T = parseFloat(Targ);
const W = 3840, H = 2160, FPS = 30;
const N = Math.round(T * FPS);
const ow = SCALE === "4k" ? 3840 : 1920, oh = SCALE === "4k" ? 2160 : 1080;
console.log(`render ${T}s · ${N} frames · ${ow}x${oh}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(`file://${ROOT}/video-src/vos-film.html?t=${T}`);
await page.waitForFunction(() => window.__ready === true, { timeout: 60000 });

const vf = `scale=${ow}:${oh}:flags=lanczos,fps=${FPS},format=yuv420p`;
const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
  "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-pix_fmt", "yuv420p", "-r", String(FPS),
  "-movflags", "+faststart", `${OUT}.silent.mp4`], { stdio: ["pipe", "ignore", "inherit"] });
const write = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once("drain", res); });

for (let n = 0; n < N; n++) {
  await page.evaluate((t) => window.__seek(t), n / FPS);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await write(await page.screenshot({ type: "png" }));
  if (n % 150 === 0) console.log(`  ${n}/${N}`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", c => c === 0 ? res() : rej(new Error("ffmpeg " + c))));
await browser.close();

if (AUDIO && AUDIO !== "-") {
  const aEnd = (T - 1.2).toFixed(2);
  execFileSync("ffmpeg", ["-y", "-i", `${OUT}.silent.mp4`, "-i", AUDIO, "-filter_complex",
    `[1:a]afade=t=out:st=${aEnd}:d=1.2[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy",
    "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", OUT], { stdio: ["ignore", "ignore", "inherit"] });
} else execFileSync("cp", [`${OUT}.silent.mp4`, OUT]);
try { execFileSync("cp", [OUT, `${DESK}/${OUT.split("/").pop()}`]); } catch (e) {}
console.log(`=== ${OUT} ===`);
