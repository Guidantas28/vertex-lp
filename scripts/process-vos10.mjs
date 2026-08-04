// vos_business_1..10 -> social-16..25 (3:4, foco no rosto, clareada leve).
import sharp from "sharp";
const SRC = "/Users/victorsouza/Desktop/VOS_10_Fotos_Separadas";
const OUT = "/Users/victorsouza/landing-page-vertex/public/assets/people";
const RATIO = 3 / 4;
for (let n = 1; n <= 10; n++) {
  const src = `${SRC}/vos_business_${n}.png`;
  const m = await sharp(src).metadata();
  let cw = m.width, ch = Math.round(cw / RATIO);
  if (ch > m.height) { ch = m.height; cw = Math.round(ch * RATIO); }
  const left = Math.round((m.width - cw) / 2);
  const top = Math.max(0, Math.round((m.height - ch) * 0.18)); // viés p/ cima (rosto)
  const out = `${OUT}/social-${15 + n}.webp`;
  const info = await sharp(src).extract({ left, top, width: cw, height: ch })
    .modulate({ brightness: 1.05 }).webp({ quality: 90 }).toFile(out);
  console.log(`social-${15 + n}.webp (vos_business_${n}: ${m.width}x${m.height} -> ${cw}x${ch}) ${(info.size/1024).toFixed(0)}KB`);
}
