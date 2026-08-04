// Recorta as fotos reais dos clientes pra 3:4 SEM ampliar (resolução nativa),
// recorte centrado suave, webp de alta qualidade — aspecto natural.
import sharp from "sharp";
const SRC = "/Users/victorsouza/Desktop/business_owner_photos_separated";
const OUT = "/Users/victorsouza/landing-page-vertex/public/assets/people";

// social-N -> número do arquivo business_owner_<n>.png
const MAP = [3, 2, 7, 10, 1, 9, 6, 4, 5, 8];
const RATIO = 3 / 4; // largura/altura alvo (retrato)

let i = 0;
for (const n of MAP) {
  i++;
  const src = `${SRC}/business_owner_${n}.png`;
  const m = await sharp(src).metadata();
  // fotos largas (768px) têm fresta da imagem vizinha no topo/base — apara
  const vInset = m.width > 500 ? 20 : 6;
  const usableTop = vInset, usableH = m.height - vInset * 2;
  // maior recorte 3:4 que cabe na área útil (sem ampliar)
  let cw = m.width, ch = Math.round(cw / RATIO);
  if (ch > usableH) { ch = usableH; cw = Math.round(ch * RATIO); }
  const left = Math.round((m.width - cw) / 2);
  const top = usableTop + Math.max(0, Math.round((usableH - ch) * 0.35)); // leve viés p/ cima
  const out = `${OUT}/social-${i}.webp`;
  const info = await sharp(src)
    .extract({ left, top, width: cw, height: ch })
    .modulate({ brightness: 1.1 })       // clareia levemente
    .linear(1.05, -4)                     // leve contraste pra não lavar
    .webp({ quality: 90 })
    .toFile(out);
  console.log(`social-${i}.webp  (business_owner_${n}: ${m.width}x${m.height} -> ${cw}x${ch})  ${(info.size / 1024).toFixed(0)}KB`);
}
console.log(`\n${i} fotos reais — recorte nativo, sem upscale.`);
