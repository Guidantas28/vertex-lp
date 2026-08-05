import sharp from "sharp";
const SRC = "/Users/victorsouza/Desktop/business_owner_photos_separated";
const OUT = "/private/tmp/claude-501/-Users-victorsouza-master-os/d6ff4b66-24a4-435e-aa3e-e2c50b4988c8/scratchpad/clientes-contact.png";
const cols = 5, rows = 2, cw = 280, ch = 373, pad = 8, labelH = 26;
const W = cols * cw + (cols + 1) * pad;
const H = rows * (ch + labelH) + (rows + 1) * pad;
const comps = [];
for (let i = 1; i <= 10; i++) {
  const idx = i - 1;
  const c = idx % cols, r = Math.floor(idx / cols);
  const x = pad + c * (cw + pad);
  const y = pad + r * (ch + labelH + pad);
  const buf = await sharp(`${SRC}/business_owner_${i}.png`).resize(cw, ch, { fit: "cover" }).toBuffer();
  comps.push({ input: buf, left: x, top: y });
  const label = Buffer.from(`<svg width="${cw}" height="${labelH}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="18" font-family="sans-serif" font-size="16" fill="#fff">#${i}</text></svg>`);
  comps.push({ input: label, left: x, top: y + ch });
}
await sharp({ create: { width: W, height: H, channels: 3, background: "#222" } }).composite(comps).png().toFile(OUT);
console.log(OUT);
