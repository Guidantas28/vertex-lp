# VOS · Landing de anúncio

Landing de campanha do VOS. Página única, estática, sem build: o `index.html` já é o site inteiro (CSS e JS inline).

## Rodar local

```bash
python3 -m http.server 3251 --directory .
```

Depois abra http://localhost:3251.

## Arquivos

- `index.html` · a landing completa (hero, faixa escura com o dashboard, player, preço e CTA fixo).
- `broll.mp4` · vídeo vertical 1080×1920 do player, 39s, H.264 + AAC, 7,7 MB.
- `broll-poster.jpg` · primeiro quadro, mostrado enquanto o vídeo carrega.
- `vos-logo-mono-dark.png` / `vos-logo-mono-white.png` · lockup mono oficial (o chrome foi aposentado em 24/07).

### Trocar o vídeo

O original é `.mov` HEVC de 52 MB, que Chrome e Android não tocam. Receita do que está no repo:

```bash
ffmpeg -i entrada.mov -c:v libx264 -preset medium -crf 25 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart broll.mp4
```

Depois o pôster:

```bash
ffmpeg -ss 1.2 -i broll.mp4 -frames:v 1 -vf scale=540:960 -q:v 5 broll-poster.jpg
```

Precisa ser 9:16 e ter **legenda queimada**: o vídeo toca sozinho e mudo quando entra na tela (nenhum navegador permite autoplay com som), e o som só liga se a pessoa tocar no chip.

## Deploy

Site estático: basta apontar o host (Vercel, Netlify, Cloudflare Pages, GitHub Pages) pra raiz do repo. Não tem passo de build.

## Dependências externas

Só a Inter, do Google Fonts. Todo o resto é local. O design segue o `docs/DESIGN-SYSTEM.md` do vertex-saas, com uma exceção de campanha registrada no topo do CSS: a ação primária é laranja em vez de mono.
