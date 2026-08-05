import sharp from "sharp";
const SRC = "/Users/victorsouza/Desktop/Fotos_VOS_Avulsas";
const OUT = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad/avulsas-contact.png";
const n = 5, cw = 300, ch = 300, pad = 8, labelH = 26;
const W = n * cw + (n + 1) * pad;
const H = ch + labelH + 2 * pad;
const comps = [];
for (let i = 1; i <= n; i++) {
  const x = pad + (i - 1) * (cw + pad);
  const buf = await sharp(`${SRC}/foto_${i}.jpg`).resize(cw, ch, { fit: "cover" }).toBuffer();
  comps.push({ input: buf, left: x, top: pad });
  const label = Buffer.from(`<svg width="${cw}" height="${labelH}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="18" font-family="sans-serif" font-size="16" fill="#fff">foto_${i}</text></svg>`);
  comps.push({ input: label, left: x, top: pad + ch });
}
await sharp({ create: { width: W, height: H, channels: 3, background: "#222" } }).composite(comps).png().toFile(OUT);
console.log(OUT);
