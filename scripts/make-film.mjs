#!/usr/bin/env node
// Monta o filme de marca VOS: clipes 3D (Higgsfield) -> retime p/ janelas da narração
// -> crossfades -> mux narração. Saída 4K + 1080p. Resume-safe (norm/ cacheado).
import { execFileSync } from "child_process";
import fs from "fs";

const ROOT = "/Users/victorsouza/landing-page-vertex";
const DIR = `${ROOT}/video-build/film`;
const NORM = `${DIR}/norm`;
const W = 3840, H = 2160, FPS = 30, XF = 0.7;
const DESK = "/Users/victorsouza/Desktop";
fs.mkdirSync(NORM, { recursive: true });

const man = JSON.parse(fs.readFileSync(`${DIR}/clips.json`, "utf8"));
const ff = (a) => execFileSync("ffmpeg", ["-y", ...a], { stdio: ["ignore", "ignore", "inherit"] });
const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", f]).toString().trim());

// 1) normaliza cada plano: 4K, retime p/ janela, fps, zoom lento sutil
const segs = [];
man.shots.forEach((s, i) => {
  const src = s.mode === "local" ? `${DIR}/glass.mp4` : `${DIR}/clips/${s.id}.mp4`;
  if (!fs.existsSync(src)) { console.error(`FALTA clipe: ${src}`); process.exit(1); }
  const win = +(s.end - s.at).toFixed(3);
  const last = i === man.shots.length - 1;
  // alvo: janela + XF (p/ overlap), exceto último. Se clipe > alvo e for o último, mantém natural.
  let target = last ? Math.max(win, dur(src)) : win + XF;
  const sd = dur(src);
  const pts = (target / sd).toFixed(5);
  const out = `${NORM}/${s.id}.mp4`;
  segs.push({ out, target, id: s.id });
  if (fs.existsSync(out) && Math.abs(dur(out) - target) < 0.15) { console.log(`= ${s.id} (cache ${target}s)`); return; }
  console.log(`~ ${s.id}: ${sd.toFixed(1)}s -> ${target.toFixed(1)}s (x${pts}) [${s.mode}]`);
  ff(["-i", src, "-vf",
    `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},` +
    `setpts=PTS*${pts},fps=${FPS},format=yuv420p`,
    "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-r", String(FPS), out]);
});

// 2) xfade chain
const dom = segs.map(s => dur(s.out));
let inputs = [];
segs.forEach(s => { inputs.push("-i", s.out); });
let fc = "", prev = "[0:v]", cum = dom[0];
for (let i = 1; i < segs.length; i++) {
  const off = (cum - XF).toFixed(3);
  const lbl = i === segs.length - 1 ? "[vx]" : `[v${i}]`;
  fc += `${prev}[${i}:v]xfade=transition=fade:duration=${XF}:offset=${off}${lbl};`;
  prev = lbl;
  cum = +(+off + dom[i]).toFixed(3);
}
const total = cum;
console.log(`total vídeo = ${total.toFixed(2)}s`);
fc += `[vx]fade=t=in:st=0:d=0.6,format=yuv420p[v]`;

// 3) render vídeo mudo 4K
const silent = `${DIR}/_silent4k.mp4`;
console.log("montando vídeo 4K…");
ff([...inputs, "-filter_complex", fc, "-map", "[v]", "-t", String(total),
  "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(FPS),
  "-movflags", "+faststart", silent]);

// 4) mux narração (+ fade out no fim)
const out4k = `${DIR}/VOS-filme-4k.mp4`;
const aEnd = (total - 1.2).toFixed(2);
console.log("mux áudio…");
ff(["-i", silent, "-i", `${DIR}/narration.mp3`, "-filter_complex",
  `[1:a]afade=t=out:st=${aEnd}:d=1.2[a]`, "-map", "0:v", "-map", "[a]",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", out4k]);

// 5) 1080p companheira
const out1080 = `${DIR}/VOS-filme-1080p.mp4`;
ff(["-i", out4k, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow",
  "-crf", "16", "-maxrate", "14M", "-bufsize", "24M", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out1080]);

execFileSync("cp", [out4k, `${DESK}/VOS-filme-4k.mp4`]);
execFileSync("cp", [out1080, `${DESK}/VOS-filme-1080p.mp4`]);
console.log(`=== PRONTO · ${dur(out4k).toFixed(1)}s · ${out4k} ===`);
