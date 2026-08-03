# VOS · Landing de anúncio

Landing de campanha do VOS. Página única, estática, sem build: o `index.html` já é o site inteiro (CSS e JS inline).

## Rodar local

```bash
python3 -m http.server 3251 --directory .
```

Depois abra http://localhost:3251.

## Arquivos

- `index.html` · a landing completa (hero, faixa escura com o dashboard, player, preço e CTA fixo).
- `broll.mp4` · vídeo vertical (9:16) do player "Conheça o VOS". **Ainda não está no repo** — sem ele a capa aparece, mas o play não roda.

## Deploy

Site estático: basta apontar o host (Vercel, Netlify, Cloudflare Pages, GitHub Pages) pra raiz do repo. Não tem passo de build.

## Dependências externas

As fontes vêm do Google Fonts (Anton, Plus Jakarta Sans, Luckiest Guy, Titan One, Baloo 2). O resto é tudo local.
