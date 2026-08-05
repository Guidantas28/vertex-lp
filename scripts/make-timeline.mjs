// Vídeo MASTER (timeline sincronizada à narração) — render 4K frame-a-frame em SEGMENTOS (resume-safe).
// Cada segmento de 30s vira seg-N.mp4 (vídeo); no fim concatena + muxa o mp3 original.
// Uso: node scripts/make-timeline.mjs probe   -> frames-chave
//      node scripts/make-timeline.mjs         -> renderiza segmentos faltantes; quando todos existem, monta o final
import { chromium } from "playwright";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import os from "node:os";

const SRC = "file:///Users/victorsouza/landing-page-vertex/video-src/vos-timeline.html";
const MP3 = "/Users/victorsouza/Downloads/Empresas_estão_pagando_cada_ve_Gravity_Eleven_v3_019f1553-b888-78c6-8548-93ac04c18e7f.mp3";
const BUILD = "/Users/victorsouza/landing-page-vertex/video-build/master";
const DESK = os.homedir() + "/Desktop";
const FPS = 30, W = 3840, H = 2160, T = 149.5, SEG = 30;
mkdirSync(BUILD, { recursive: true });
const TOTAL = Math.round(T * FPS);
const NSEG = Math.ceil(T / SEG);

const newPage = async () => {
  const b = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
  const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  await page.goto(`${SRC}?t=${T}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
  return { b, page };
};
const shot = async (page, t) => {
  await page.evaluate((tt) => { window.__seek(tt); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);
  return page.screenshot({ type: "png" });
};
const segOk = (i, expect) => {
  if (!existsSync(`${BUILD}/seg-${i}.mp4`)) return false;
  try { const n = +execFileSync("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "default=nk=1:nw=1", `${BUILD}/seg-${i}.mp4`]).toString().trim(); return Math.abs(n - expect) <= 1; } catch { return false; }
};

if (process.argv[2] === "probe") {
  const { b, page } = await newPage();
  for (const t of [2, 14, 19, 25, 45, 60, 67, 80, 100, 112, 145]) { const buf = await shot(page, t); execFileSync("bash", ["-c", `cat > ${BUILD}/probe-${String(t).padStart(3, "0")}.png`], { input: buf }); }
  await b.close(); console.log("probe ok"); process.exit(0);
}

(async () => {
  // quais segmentos faltam
  const todo = [];
  for (let i = 0; i < NSEG; i++) {
    const sf = Math.round(i * SEG * FPS), ef = Math.min(Math.round((i + 1) * SEG * FPS), TOTAL);
    if (!segOk(i, ef - sf)) todo.push([i, sf, ef]);
  }
  console.log(`segmentos: ${NSEG} · faltam ${todo.length} (${todo.map((t) => t[0]).join(",")})`);

  if (todo.length) {
    const { b, page } = await newPage();
    for (const [i, sf, ef] of todo) {
      const t0 = Date.now();
      const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "pipe:0",
        "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(FPS),
        "-x264-params", "keyint=60:min-keyint=60:scenecut=0", `${BUILD}/seg-${i}.mp4`], { stdio: ["pipe", "ignore", "inherit"] });
      for (let n = sf; n < ef; n++) { const buf = await shot(page, n / FPS); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r)); }
      ff.stdin.end();
      await new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg " + c)))));
      console.log(`  ✓ seg-${i} (${ef - sf} frames · ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    await b.close();
  }

  // todos prontos? monta o final
  for (let i = 0; i < NSEG; i++) { const sf = Math.round(i * SEG * FPS), ef = Math.min(Math.round((i + 1) * SEG * FPS), TOTAL); if (!segOk(i, ef - sf)) { console.log(`seg-${i} ainda falta — rode de novo p/ continuar`); process.exit(0); } }
  const list = Array.from({ length: NSEG }, (_, i) => `file 'seg-${i}.mp4'`).join("\n");
  execFileSync("bash", ["-c", `printf '%s' ${JSON.stringify(list)} > ${BUILD}/segs.txt`]);
  execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", `${BUILD}/segs.txt`, "-c", "copy", `${BUILD}/silent.mp4`], { stdio: ["ignore", "ignore", "inherit"] });
  const out4k = `${BUILD}/VOS-master-4k.mp4`;
  execFileSync("ffmpeg", ["-y", "-i", `${BUILD}/silent.mp4`, "-i", MP3, "-map", "0:v:0", "-map", "1:a:0",
    "-af", "afade=t=out:st=146.4:d=1.1,apad", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out4k], { stdio: ["ignore", "ignore", "inherit"] });
  execFileSync("ffmpeg", ["-y", "-i", out4k, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-maxrate", "16M", "-bufsize", "28M", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${BUILD}/VOS-master-1080p.mp4`], { stdio: ["ignore", "ignore", "inherit"] });
  execFileSync("cp", [out4k, `${DESK}/VOS-master-4k.mp4`]); execFileSync("cp", [`${BUILD}/VOS-master-1080p.mp4`, `${DESK}/VOS-master-1080p.mp4`]);
  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", out4k]).toString().trim();
  console.log(`=== PRONTO · ${dur}s · ${out4k} ===`);
})().catch((e) => { console.error(e); process.exit(1); });
