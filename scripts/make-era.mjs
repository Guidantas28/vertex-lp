// Vídeo estilo ClickUp — 3 atos kinetic (base branca) + hero de vidro (Higgsfield) no Ato 3.
// Captura os atos com fundo transparente (omitBackground) e compõe o vidro por baixo via ffmpeg.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import os from "node:os";

const SRC = "file:///Users/victorsouza/landing-page-vertex/video-src/vos-era.html";
const BUILD = "/Users/victorsouza/landing-page-vertex/video-build/era";
const DESK = os.homedir() + "/Desktop";
const FPS = 30, W = 3840, H = 2160, T = 21;
const FRAMES = `${BUILD}/frames`;
mkdirSync(FRAMES, { recursive: true });

(async () => {
  const total = Math.round(T * FPS);
  // 1) captura os atos (texto) com transparência — pula se já capturado (re-composição rápida)
  if (!existsSync(`${FRAMES}/${String(total - 1).padStart(5, "0")}.png`)) {
    const b = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
    const page = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
    await page.goto(`${SRC}?t=${T}`, { waitUntil: "load" });
    await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
    const t0 = Date.now();
    for (let n = 0; n < total; n++) {
      await page.evaluate((tt) => { window.__seek(tt); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, n / FPS);
      await page.screenshot({ path: `${FRAMES}/${String(n).padStart(5, "0")}.png`, type: "png", omitBackground: true });
      if (n % 120 === 0) console.log(`  frame ${n}/${total} · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await b.close();
  } else console.log("frames já capturados — só compondo");
  console.log("compondo…");

  // 2) compõe: base branca + vidro (deslocado p/ ato 3, slow 5s->~8s) + texto por cima
  const out4k = `${BUILD}/VOS-era-4k.mp4`;
  execFileSync("ffmpeg", ["-y",
    "-i", `${BUILD}/glass.mp4`,
    "-framerate", String(FPS), "-i", `${FRAMES}/%05d.png`,
    "-filter_complex",
    // [0] vidro: zera PTS, escala 4K, slow 5s->8s, fades, e prepende 13s de branco -> fundo de 21s
    `[0:v]scale=${W}:${H}:flags=lanczos,fps=${FPS},setpts=PTS-STARTPTS,setpts=PTS*1.6,fade=t=in:st=0:d=0.7,fade=t=out:st=7.4:d=0.6,tpad=start_duration=13:start_mode=add:color=white[bg];` +
    `[bg][1:v]overlay=format=auto,fade=t=in:st=0:d=0.35,fade=t=out:st=20.4:d=0.6[v]`,
    "-map", "[v]", "-t", String(T),
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-movflags", "+faststart", out4k], { stdio: ["ignore", "ignore", "inherit"] });

  // 1080p
  execFileSync("ffmpeg", ["-y", "-i", out4k, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-maxrate", "12M", "-bufsize", "20M", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", `${BUILD}/VOS-era-1080p.mp4`], { stdio: ["ignore", "ignore", "inherit"] });
  execFileSync("cp", [out4k, `${DESK}/VOS-era-4k.mp4`]); execFileSync("cp", [`${BUILD}/VOS-era-1080p.mp4`, `${DESK}/VOS-era-1080p.mp4`]);
  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", out4k]).toString().trim();
  console.log(`=== PRONTO · ${dur}s · ${out4k} ===`);
})().catch((e) => { console.error(e); process.exit(1); });
