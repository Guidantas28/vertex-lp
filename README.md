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

### Webhook de lead ads do Meta (`/api/meta-leads`)

| Var | Descrição |
|-----|-----------|
| `META_WEBHOOK_VERIFY_TOKEN` | Token do handshake `GET` que o Meta usa ao salvar o webhook. |
| `META_APP_SECRET` | App Secret — valida a assinatura `X-Hub-Signature-256`. Sem ele a rota responde `503`. |
| `META_PAGE_TOKEN` | Page Access Token usado pra buscar o lead completo na Graph API. |
| `VHQ_TOKEN` | (opcional) token do Data Client do GTM server. Sem ele o lead ainda vai pro CRM, só não vira linha na planilha de auditoria. |
| `VHQ_ENDPOINT` | (opcional) padrão `https://vx.voshq.com/vhq`. |

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
