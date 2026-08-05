# Vertex OS — Landing Page

Landing page de marketing do **Vertex OS** (o "sistema operacional do seu negócio").
Astro + ilhas React + Tailwind. Deploy na Vercel.

## Rodar localmente

```bash
cp .env.example .env   # ajuste as variáveis
npm install
npm run dev            # http://localhost:4321
```

## Variáveis de ambiente

| Var | Descrição |
|-----|-----------|
| `VOS_LEAD_ENDPOINT` | Endpoint público de lead no backend do vos (`/public/marketing-lead`). |
| `VOS_LEAD_SECRET` | (opcional) segredo compartilhado enviado em `X-Lead-Secret`. |
| `PUBLIC_CAL_LINK` | Slug do event-type no Cal.com (ex.: `vertex/demo`). |
| `PUBLIC_CAL_ORIGIN` | Origem do Cal self-hosted (`https://cal.osvertex.com`). |
| `PUBLIC_SIGNUP_URL` | Destino após virar lead (signup do app). |

## Fluxo dos CTAs

- **Começar / Criar conta** → modal de lead → `POST /api/lead` (serverless) → repassa pro vos → redireciona pro signup.
- **Agendar demo** → rola até o embed do Cal.com (seção `#agendar`).

## Estrutura

```
src/
├─ layouts/Base.astro        SEO/OG, fontes, scroll-reveal
├─ pages/index.astro         compõe as seções + delegação dos CTAs
├─ pages/api/lead.ts         serverless proxy → vos
├─ components/*.astro        seções (Nav, Hero, Pains, Turn, Modules, …)
├─ components/islands/*.tsx  LeadModal, CalEmbed (React)
├─ data/content.ts           toda a copy PT-BR
└─ styles/global.css         tokens, aurora, animações
```

> ⚠️ Falta: `public/og.png` (1200×630) e screenshots reais do produto (hoje mockups CSS de alta fidelidade).
