// Monta o vídeo final com transições 3D (xfade zoom/dissolve) + acrossfade no áudio.
import { execFileSync } from "node:child_process";
const DIR = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad/video";
const HOME = "/Users/victorsouza/Desktop";
const D = 0.6; // overlap das transições

// [arquivo, duração(s)=T+0.7]
const S = [
  ["scene-welcome.mp4", 6.1],
  ["scene-conecta.mp4", 9.6],
  ["scene-produtos.mp4", 10.4],
  ["scene-servicos.mp4", 8.4],
  ["scene-cresce.mp4", 8.6],
  ["scene-crm.mp4", 8.9],
  ["scene-cascata.mp4", 16.1],
  ["scene-dashboard.mp4", 10.8],
  ["scene-ia.mp4", 9.2],
  ["scene-modular.mp4", 9.4],
  ["scene-beneficios.mp4", 13.0],
  ["scene-fecho.mp4", 5.2],
];
const TR = ["fade","smoothleft","zoomin","smoothup","circleopen","smoothright","zoomin","wiperight","circleclose","smoothleft","fade"];

const inputs = S.flatMap(([f]) => ["-i", `${DIR}/${f}`]);
const fc = [];
let vlast = "0:v", alast = "0:a", running = S[0][1];
for (let i = 1; i < S.length; i++) {
  const off = (running - D).toFixed(3);
  const vout = i === S.length - 1 ? "vout" : `v${i}`;
  const aout = i === S.length - 1 ? "aout" : `a${i}`;
  fc.push(`[${vlast}][${i}:v]xfade=transition=${TR[i-1]}:duration=${D}:offset=${off}[${vout}]`);
  fc.push(`[${alast}][${i}:a]acrossfade=d=${D}[${aout}]`);
  vlast = vout; alast = aout; running = running + S[i][1] - D;
}
const filter = fc.join(";");

const enc4k = ["-map","[vout]","-map","[aout]","-c:v","libx264","-preset","medium","-crf","16","-pix_fmt","yuv420p","-r","30","-c:a","aac","-b:a","192k","-movflags","+faststart",`${DIR}/VOS-video-full-4k.mp4`];
console.log("encode 4K (xfade)…");
execFileSync("ffmpeg", ["-y", ...inputs, "-filter_complex", filter, ...enc4k], { stdio: ["ignore","ignore","inherit"] });
console.log("encode 1080p…");
execFileSync("ffmpeg", ["-y","-i",`${DIR}/VOS-video-full-4k.mp4`,"-vf","scale=1920:1080:flags=lanczos","-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart",`${DIR}/VOS-video-full-1080p.mp4`], { stdio:["ignore","ignore","inherit"] });
execFileSync("cp", [`${DIR}/VOS-video-full-4k.mp4`, `${HOME}/VOS-video-full-4k.mp4`]);
execFileSync("cp", [`${DIR}/VOS-video-full-1080p.mp4`, `${HOME}/VOS-video-full-1080p.mp4`]);
const dur = execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",`${DIR}/VOS-video-full-4k.mp4`]).toString().trim();
console.log("PRONTO · duração:", dur, "s");
