import sharp from "sharp";
const SRC = "/Users/victorsouza/Desktop/VOS_10_Fotos_Separadas";
const OUT = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad/vos10-contact.png";
const cols = 5, rows = 2, cw = 230, ch = 307, pad = 8, labelH = 24;
const W = cols * cw + (cols + 1) * pad;
const H = rows * (ch + labelH) + (rows + 1) * pad;
const comps = [];
for (let i = 1; i <= 10; i++) {
  const idx = i - 1, c = idx % cols, r = Math.floor(idx / cols);
  const x = pad + c * (cw + pad), y = pad + r * (ch + labelH + pad);
  const buf = await sharp(`${SRC}/vos_business_${i}.png`).resize(cw, ch, { fit: "cover" }).toBuffer();
  comps.push({ input: buf, left: x, top: y });
  comps.push({ input: Buffer.from(`<svg width="${cw}" height="${labelH}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="17" font-family="sans-serif" font-size="15" fill="#fff">#${i}</text></svg>`), left: x, top: y + ch });
}
await sharp({ create: { width: W, height: H, channels: 3, background: "#222" } }).composite(comps).png().toFile(OUT);
console.log(OUT);
