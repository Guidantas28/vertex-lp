// Vídeo "produtos do VOS" — captura frame-a-frame 4K (mesma pipeline determinística).
// Resume: pula cena cujo scene-<id>.mp4 já existe (a menos que passe a cena no argv).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import os from "node:os";

const SRC = "file:///Users/victorsouza/landing-page-vertex/video-src/vos-product.html";
const BUILD = "/Users/victorsouza/landing-page-vertex/video-build/prod";
const DESK = os.homedir() + "/Desktop";
const BASE = "https://d8j0ntlcm91z4.cloudfront.net/user_3FDtPkZ7XHquIQgCfeVHHz10y2g";
const FPS = 30, W = 3840, H = 2160;

// [id, mp3, T(s)]  T = duração da narração ÷ 1.2 + buffer
const SCENES = [
  ["intro", "hf_20260629_134633_5a15dc49-88e9-4c3f-addf-39d693f18fef.mp3", 8.4],
  ["prospect", "hf_20260629_134654_67a0ebda-0371-470e-8c4f-be7f1c615e6d.mp3", 10.8],
  ["crm", "hf_20260629_134715_d13f5c27-5823-40ec-aa45-cbea3cf0d339.mp3", 10.8],
  ["whatsapp", "hf_20260629_134734_336c54b8-6e63-4cd9-b4ac-ffa0d60528ce.mp3", 10.4],
  ["contracts", "hf_20260629_134756_70e43642-92a2-4749-8c2b-eb328c82b2be.mp3", 7.8],
  ["services", "hf_20260629_134814_de0136ce-cb3e-4661-ba7d-0e59ecabfb66.mp3", 8.8],
  ["commerce", "hf_20260629_134833_509538f5-de6f-4246-bb0c-0b3d1c97e41c.mp3", 7.8],
  ["projects", "hf_20260629_134851_dd7eeac9-014e-4a48-aab3-ca4e8fcc3dd6.mp3", 9.4],
  ["finance", "hf_20260629_134913_9ca40e24-53a6-426b-8c17-c548f868cfeb.mp3", 9.4],
  ["ai", "hf_20260629_134932_7b2bfd02-8132-4be2-b7a9-97b07ec7bb64.mp3", 14.4],
  ["pay", "hf_20260629_134950_a8cf9609-0cee-4b15-8c07-702c14b39660.mp3", 6.2],
  ["close", "hf_20260629_135007_0746c945-8540-49c1-81d1-ca7799bc9be1.mp3", 4.5],
];

const arg = process.argv[2];
const only = arg && arg !== "all" ? arg.split(",") : null;
mkdirSync(BUILD, { recursive: true });
const sh = (c, a) => execFileSync(c, a, { stdio: ["ignore", "ignore", "inherit"] });

async function capture(page, id, T) {
  const frames = `${BUILD}/frames-${id}`;
  rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });
  await page.goto(`${SRC}?s=${id}&t=${T}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
  const total = Math.round((T + 0.6) * FPS);
  for (let n = 0; n < total; n++) {
    await page.evaluate((tt) => { window.__seek(tt); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, n / FPS);
    await page.screenshot({ path: `${frames}/${String(n).padStart(5, "0")}.png`, type: "png" });
  }
  return { frames, total };
}
function encode(id, T, frames) {
  const len = T + 0.6, isClose = id === "close";
  const vf = `fade=t=in:st=0:d=0.3${isClose ? "" : `,fade=t=out:st=${(len - 0.45).toFixed(2)}:d=0.4`}`;
  const af = `atempo=1.2,adelay=150|150,afade=t=out:st=${(T - 0.4).toFixed(2)}:d=0.4,apad`;
  sh("ffmpeg", ["-y", "-framerate", String(FPS), "-i", `${frames}/%05d.png`, "-i", `${BUILD}/n-${id}.mp3`,
    "-vf", vf, "-af", af, "-shortest", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-vsync", "cfr", "-x264-params", "keyint=60:min-keyint=60:scenecut=0", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${BUILD}/scene-${id}.mp4`]);
}

(async () => {
  const todo = only ? SCENES.filter((s) => only.includes(s[0])) : SCENES;
  for (const [id, mp3] of todo) { const d = `${BUILD}/n-${id}.mp3`; if (!existsSync(d)) sh("curl", ["-sL", `${BASE}/${mp3}`, "-o", d]); }
  const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [id, , T] of todo) {
    if (!only && existsSync(`${BUILD}/scene-${id}.mp4`)) { console.log(`  • ${id}: já existe, pulando`); continue; }
    const t0 = Date.now();
    const { frames, total } = await capture(page, id, T);
    encode(id, T, frames); rmSync(frames, { recursive: true, force: true });
    console.log(`  ✓ ${id}: ${total} frames · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
  if (only) { console.log("cenas prontas (sem concat)"); return; }
  const txt = SCENES.map(([id]) => `file 'scene-${id}.mp4'`).join("\n");
  execFileSync("bash", ["-c", `printf '%s' ${JSON.stringify(txt)} > ${BUILD}/concat.txt`]);
  const out4k = `${BUILD}/VOS-produtos-4k.mp4`;
  sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", `${BUILD}/concat.txt`, "-c", "copy", "-movflags", "+faststart", out4k]);
  sh("ffmpeg", ["-y", "-i", out4k, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-maxrate", "16M", "-bufsize", "28M", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${BUILD}/VOS-produtos-1080p.mp4`]);
  sh("cp", [out4k, `${DESK}/VOS-produtos-4k.mp4`]); sh("cp", [`${BUILD}/VOS-produtos-1080p.mp4`, `${DESK}/VOS-produtos-1080p.mp4`]);
  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", out4k]).toString().trim();
  console.log(`=== PRONTO · ${dur}s ===`);
})().catch((e) => { console.error(e); process.exit(1); });
