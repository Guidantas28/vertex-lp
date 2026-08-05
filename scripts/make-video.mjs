// Pipeline determinística do vídeo VOS — captura frame-a-frame (sem recordVideo) + ffmpeg alta qualidade.
// Uso: node scripts/make-video.mjs            -> todas as cenas + concat 4K/1080p
//      node scripts/make-video.mjs welcome,crm -> só essas cenas (sem concat) p/ validar
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import os from "node:os";

const SRC = "file:///Users/victorsouza/landing-page-vertex/video-src/vos-scene.html";
const BUILD = "/Users/victorsouza/landing-page-vertex/video-build";
const DESK = os.homedir() + "/Desktop";
const BASE = "https://d8j0ntlcm91z4.cloudfront.net/user_3FDtPkZ7XHquIQgCfeVHHz10y2g";
const FPS = 30;
const W = 3840, H = 2160;

// [id, mp3, T(s), narração]  — ordem do vídeo
const SCENES = [
  ["welcome", "hf_20260628_042008_f9f47c45-d211-4d31-9d92-6b863799081a.mp3", 5.4],
  ["conecta", "hf_20260628_131704_a713c57d-458d-42d7-90c7-93062929083b.mp3", 8.9],
  ["produtos", "hf_20260628_131708_61085831-7c54-432f-9ef4-cf2c6861760e.mp3", 9.7],
  ["servicos", "hf_20260628_131954_3b39fdf7-162a-4d48-b0de-5f7dda2ecb4d.mp3", 7.7],
  ["cresce", "hf_20260628_131958_4ab2f3c4-4467-4c09-956d-02490a7852a1.mp3", 7.9],
  ["crm", "hf_20260628_131737_f9a892c9-43af-4131-889c-346119ec4421.mp3", 8.2],
  ["cascata", "hf_20260628_140118_a2db8ec5-d699-42b4-95d3-f36ab4794add.mp3", 15.4],
  ["dashboard", "hf_20260628_131853_58f992b7-826c-4bac-81b0-92e379737c6b.mp3", 10.1],
  ["ia", "hf_20260628_131858_2c60c0ba-e19e-4b5a-b6f3-13cc4d2723bd.mp3", 8.5],
  ["modular", "hf_20260628_131902_1a152947-1ce7-4c50-b106-0401e60ced51.mp3", 8.7],
  ["beneficios", "hf_20260628_131908_c3e65b69-481f-4529-bd5f-ff9ea9dfd3d8.mp3", 12.3],
  ["fecho", "hf_20260628_131912_36debce0-51c2-4153-976c-efe3655df41e.mp3", 5.5],
];

const arg = process.argv[2];
const only = arg && arg !== "all" ? arg.split(",") : null;
const list = only ? SCENES.filter((s) => only.includes(s[0])) : SCENES;

mkdirSync(BUILD, { recursive: true });
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });

async function captureScene(page, id, T) {
  const frames = `${BUILD}/frames-${id}`;
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  await page.goto(`${SRC}?s=${id}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
  const total = Math.round((T + 0.6) * FPS); // +0.6s de cauda (fill:both segura o último frame)
  for (let n = 0; n < total; n++) {
    const t = n / FPS;
    await page.evaluate((tt) => { window.__seek(tt); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);
    await page.screenshot({ path: `${frames}/${String(n).padStart(5, "0")}.png`, type: "png" });
  }
  return { frames, total };
}

function encodeScene(id, T, frames) {
  const mp3 = `${BUILD}/n-${id}.mp3`;
  const out = `${BUILD}/scene-${id}.mp4`;
  const len = T + 0.6;
  const isFecho = id === "fecho";
  const vf = `fade=t=in:st=0:d=0.3${isFecho ? "" : `,fade=t=out:st=${(len - 0.45).toFixed(2)}:d=0.4`}`;
  const af = `atempo=1.2,adelay=150|150,afade=t=out:st=${(T - 0.4).toFixed(2)}:d=0.4,apad`;
  sh("ffmpeg", [
    "-y", "-framerate", String(FPS), "-i", `${frames}/%05d.png`, "-i", mp3,
    "-vf", vf, "-af", af, "-shortest",
    "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-vsync", "cfr", "-x264-params", "keyint=60:min-keyint=60:scenecut=0",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out,
  ]);
  return out;
}

(async () => {
  // narração
  for (const [id, mp3] of list) {
    const dst = `${BUILD}/n-${id}.mp3`;
    if (!existsSync(dst)) sh("curl", ["-sL", `${BASE}/${mp3}`, "-o", dst]);
  }

  const browser = await chromium.launch({ args: ["--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const [id, , T] of list) {
    const t0 = Date.now();
    const { frames, total } = await captureScene(page, id, T);
    encodeScene(id, T, frames);
    rmSync(frames, { recursive: true, force: true }); // libera disco
    console.log(`  ✓ ${id}: ${total} frames · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();

  if (only) { console.log("cenas prontas (sem concat)"); return; }

  // concat -> 4K
  const listFile = `${BUILD}/concat.txt`;
  const txt = SCENES.map(([id]) => `file 'scene-${id}.mp4'`).join("\n");
  execFileSync("bash", ["-c", `printf '%s' ${JSON.stringify(txt)} > ${listFile}`]);
  const out4k = `${BUILD}/VOS-video-4k.mp4`;
  sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", "-movflags", "+faststart", out4k]);
  // 1080p companheira (bitrate alto)
  const out1080 = `${BUILD}/VOS-video-1080p.mp4`;
  sh("ffmpeg", ["-y", "-i", out4k, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "14M", "-bufsize", "24M", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out1080]);
  sh("cp", [out4k, `${DESK}/VOS-video-4k.mp4`]);
  sh("cp", [out1080, `${DESK}/VOS-video-1080p.mp4`]);
  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", out4k]).toString().trim();
  console.log(`=== PRONTO · ${dur}s · 4K em ${out4k} ===`);
})().catch((e) => { console.error(e); process.exit(1); });
