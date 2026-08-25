# BASELINE da /lp — antes da reforma

Capturado em 18/08/2026 · commit `bd2818b` · `node scripts/baseline-lp.mjs`
Artefatos: `desktop-full.png`, `mobile-full.png`, `*-modal-1..3.png`, `baseline.json`.

O script intercepta `/api/lead`, `/api/first-touch` e `/api/agendou` e aborta o Cal —
nada chega no CRM. O dataLayer é client-side e dispara igual, que é o contrato a registrar.

## Contratos CONGELADOS (não podem mudar sem PR pro dev)

### 1. Evento de dataLayer — o único que a LP dispara

```
event: "lead"
lead: { nome, sobrenome, email, telefone, empresa, segmento,
        resposta_1, resposta_2, faturamento, desafio, instagram }
```

Verificado idêntico em desktop e mobile. Dispara **uma vez**, só no submit validado da
etapa 2, com guarda por e-mail (`eventEmailRef`) e bloqueio de honeypot.
`resposta_1` = faturamento · `resposta_2` = desafio — nomes genéricos que o GTM consome;
**renomear quebra tag que vive fora deste repo**.
`instagram` entrou em 24/08 (wizard v2): antes era condicional (só quando preenchido),
agora o campo é obrigatório e a chave é **fixa** — contrato de 11 chaves. As 10
anteriores não mudaram de nome nem de significado.

### 2. Contrato de DOM / eventos de janela

| Contrato | Valor na baseline |
|---|---|
| Seletor de CTA | `[data-action="lead"]` — **3 ocorrências** (hero, faixa final, barra sticky) |
| Evento de abertura | `window` → `vos:open-lead` (+ flag `window.__vosLeadPending`) |
| Título do modal | `#lead-wizard-title` |
| Honeypot | `input[name="company_url"]` (tem que continuar oculto e vazio) |
| Cookie de primeiro toque | `vos_ft`, 180 dias, primeiro toque vence |
| GTM | `GTM-TFB84W2D` via `vx.voshq.com` (Stape) · server v19, workspace sincronizado |

### 3. Rede

`POST /api/first-touch` (1,5s após load, só se não houver cookie) e `POST /api/lead`
(submit da etapa 2). O agendamento não empurra dataLayer — o GTM escuta o Cal sozinho.
Desde 24/08 (wizard v2) existem também `POST /api/whatsapp-check` (blur/Continuar da
etapa 1; só "no" confirmado bloqueia — qualquer falha passa) e
`GET /api/instagram-check` (blur do @ na etapa 2; cartão é enfeite, nunca porteiro).
O baseline mocka os dois com `{status:"unknown"}`.

## Estado visual e de console

- Console: **nenhum erro**. Só 2 warnings do Meta pixel ("unavailable ... traffic
  permission settings") — pré-existentes, vêm do container, não do código da página.
- `<h1>`: "A maneira mais fácil de atender / vender / gerenciar seu negócio em um só lugar."
- Modal abre e navega as 2 etapas em desktop e mobile; etapa 3 carrega o embed do Cal.

## Seções existentes (ordem real)

1. Header só com logo (sem nav) · 2. Hero + CTA + redutor de atrito + integrações ·
3. Faixa dark: IA com conhecimento da empresa · 4. Carrossel de 3 provas vivas
(fluxo / inbox / caixa) · 5. Vídeo b-roll · 6. Esteira de 15 depoimentos ·
7. CTA final · 8. Rodapé · 9. Barra sticky.

## Lacunas contra a arquitetura da spec

Faltam: **problema/Core Complex**, **mechanism nomeado**, **preço**, **objeções/FAQ**.
Existem: hero, prova (formato), CTA final.

🔴 Os 15 depoimentos são **fictícios** (`lp.astro` l.400-416) e o aviso de rascunho está
desligado (`ehRascunho = false`). A spec §7 proíbe — tratado na Fase 4.
