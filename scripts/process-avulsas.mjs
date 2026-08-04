// Processa as fotos avulsas reais -> social-11..15 (recorte 3:4 nativo, clareada leve).
import sharp from "sharp";
const SRC = "/Users/victorsouza/Desktop/Fotos_VOS_Avulsas";
const OUT = "/Users/victorsouza/landing-page-vertex/public/assets/people";
const RATIO = 3 / 4;

for (let f = 1; f <= 5; f++) {
  const src = `${SRC}/foto_${f}.jpg`;
  const m = await sharp(src).metadata();
  const vInset = m.width > 500 ? 18 : 6;
  const usableTop = vInset, usableH = m.height - vInset * 2;
  let cw = m.width, ch = Math.round(cw / RATIO);
  if (ch > usableH) { ch = usableH; cw = Math.round(ch * RATIO); }
  const left = Math.round((m.width - cw) / 2);
  const top = usableTop + Math.max(0, Math.round((usableH - ch) * 0.3));
  const outN = 10 + f; // social-11..15
  const out = `${OUT}/social-${outN}.webp`;
  const info = await sharp(src)
    .extract({ left, top, width: cw, height: ch })
    .modulate({ brightness: 1.08 })
    .linear(1.04, -3)
    .webp({ quality: 90 })
    .toFile(out);
  console.log(`social-${outN}.webp (foto_${f}: ${m.width}x${m.height} -> ${cw}x${ch}) ${(info.size/1024).toFixed(0)}KB`);
}
