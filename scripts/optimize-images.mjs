// Converte os PNGs de assets para webp (qualidade boa, peso baixo).
// people: máx 1600px largura. product: mantém (telas), só recomprime para webp.
import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const ROOT = "/Users/victorsouza/landing-page-vertex/public/assets";
const jobs = [
  { dir: "people", maxW: 1600, q: 80 },
  { dir: "product", maxW: 2200, q: 82 },
];

let saved = 0, count = 0;
for (const j of jobs) {
  const d = path.join(ROOT, j.dir);
  for (const f of readdirSync(d).filter((f) => f.endsWith(".png"))) {
    const src = path.join(d, f);
    const out = src.replace(/\.png$/, ".webp");
    const info = await sharp(src).resize({ width: j.maxW, withoutEnlargement: true }).webp({ quality: j.q }).toFile(out);
    count++;
    console.log(`${j.dir}/${f} -> ${(info.size / 1024).toFixed(0)}KB`);
  }
}
console.log(`\n${count} imagens convertidas para webp.`);
