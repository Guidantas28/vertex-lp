#!/usr/bin/env node
// Sobrepõe a tipografia (film-titles.html) sobre o corte visual, frame-a-frame
// em streaming direto pro ffmpeg (sem guardar PNGs). Saída: VOS-filme-titled-4k.mp4 + 1080p.
import { chromium } from "playwright";
import { spawn, execFileSync } from "child_process";
import fs from "fs";

const ROOT = "/Users/victorsouza/landing-page-vertex";
const DIR = `${ROOT}/video-build/film`;
const DESK = "/Users/victorsouza/Desktop";
const W = 3840, H = 2160, FPS = 30;
const BASE = `${DIR}/VOS-filme-4k.mp4`;            // corte visual + narração
const OUT = `${DIR}/VOS-filme-titled-4k.mp4`;
const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", f]).toString().trim());

const T = dur(BASE);
const N = Math.round(T * FPS);
console.log(`base ${T.toFixed(1)}s · ${N} frames`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(`file://${ROOT}/video-src/film-titles.html?t=${T.toFixed(2)}`);
await page.waitForFunction(() => window.__ready === true, { timeout: 60000 });

// ffmpeg: [0]=base mp4, [1]=png sequence via pipe -> overlay -> copia áudio do base
const ff = spawn("ffmpeg", ["-y",
  "-i", BASE,
  "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
  "-filter_complex", "[1:v]format=rgba[t];[0:v][t]overlay=format=auto[v]",
  "-map", "[v]", "-map", "0:a",
  "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(FPS),
  "-c:a", "copy", "-movflags", "+faststart", OUT], { stdio: ["pipe", "ignore", "inherit"] });

const write = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once("drain", res); });

for (let n = 0; n < N; n++) {
  await page.evaluate((t) => window.__seek(t), n / FPS);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const png = await page.screenshot({ omitBackground: true, type: "png" });
  await write(png);
  if (n % 150 === 0) console.log(`  frame ${n}/${N}`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on("close", c => c === 0 ? res() : rej(new Error("ffmpeg " + c))));
await browser.close();

// 1080p
const OUT1080 = `${DIR}/VOS-filme-titled-1080p.mp4`;
execFileSync("ffmpeg", ["-y", "-i", OUT, "-vf", "scale=1920:1080:flags=lanczos",
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-maxrate", "14M", "-bufsize", "24M",
  "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", OUT1080], { stdio: ["ignore", "ignore", "inherit"] });
execFileSync("cp", [OUT, `${DESK}/VOS-filme-4k.mp4`]);
execFileSync("cp", [OUT1080, `${DESK}/VOS-filme-1080p.mp4`]);
console.log(`=== PRONTO · ${dur(OUT).toFixed(1)}s · ${OUT} ===`);
