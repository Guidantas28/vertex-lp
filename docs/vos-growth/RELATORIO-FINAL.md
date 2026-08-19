# Relatório final — VOS Big Black Book

18–19/08/2026 · base `bd2818b` · **nada publicado em produção**

## 1. Arquivos alterados

| Arquivo | Δ | O quê |
|---|---|---|
| `src/pages/lp.astro` | +505 / −102 (acumulado) | reescrita das seções, seção nova do mecanismo, FAQ com as respostas do Orlando, planos centralizados no frontmatter, guarda `js` do reveal |
| `src/styles/lp.css` | +391 | escala tipográfica de marketing, breakout de 1120px, CSS da seção do fluxo, demoção do laranja |
| `scripts/gen-lp.mjs` | +27 | **trava** — o gerador apagava a reforma em silêncio |

**Novos, fora do deploy** (`scripts/*` está no `.vercelignore`): `scripts/baseline-lp.mjs` e os
7 documentos em `docs/vos-growth/`.

🔒 **Nenhum arquivo de backend tocado.** `src/pages/api/`, `src/lib/`, `astro.config.mjs` e
`package.json` intactos — confirmado por `git status`.

## 2. Verificações executadas e resultado

| Verificação | Resultado |
|---|---|
| `npm run build` | ✅ Complete |
| `npx tsc --noEmit` | 4 erros, **os mesmos 4 de antes** do trabalho (TeamPreviewSwitch + 3 por falta de `@types/node` em meta-leads) — nenhum novo |
| `node scripts/baseline-lp.mjs` (desktop + mobile) | dataLayer `lead` com as **10 chaves idênticas**; modal abre; `POST /api/first-touch` + `POST /api/lead`; console só com os 2 avisos pré-existentes do Meta pixel |
| `[data-action="lead"]` | 7 (era 3) — aditivo: 3 planos + "Me ajuda a escolher" |
| Overflow horizontal | nenhum em 390 / 900 / 1440 |
| Acessibilidade | 1 `<h1>`, ordem de headings sem pulo, foco por teclado no FAQ, zero imagem sem `alt`, CTAs são `<a>` reais |
| Seção do fluxo — só compositor | animam apenas `transform`, `opacity` e cor |
| Seção do fluxo — duração | maior transição **320 ms** (limite 500) |
| Seção do fluxo — sem loop | **0** `setInterval` (WCAG 2.2.2) |
| Seção do fluxo — `prefers-reduced-motion` | 12 etapas visíveis, com texto, nenhuma apagada |
| Seção do fluxo — **sem JavaScript** | 12 etapas renderizam em ordem, com texto |
| Seção do fluxo — altura no mobile | 1,2 viewport (limite 3) |

## 3. Control validado — intacto

Hash e data de modificação dos 4 arquivos de referência, conferidos ao final:

```
b0a05b12a2  14/08 09:10  v3 (1).png                  <- o Control
5ca1b5c6da  14/08 09:10  v3 (3).png
1da3bb13fd  14/08 09:10  vos-estatico-4x5-1440.png
091f91ebb9  14/08 09:10  vos-estatico-9x16-1080.png
```

Data de 14/08, quatro dias antes deste trabalho. **Nenhum foi tocado.**

## 4. Challengers — feitos e depois removidos por decisão do Orlando

16 masters foram renderizados (8 conceitos × 9:16 1080×1920 e 4:5 1440×1800), com dimensões
conferidas por `sharp`: **16/16 corretas**. A primeira leva saiu de template HTML; a segunda
foi refeita em **Remotion**, na composição `VosControlFamily`, reproduzindo a peça validada.

**Em 19/08 o Orlando apagou os arquivos e pediu para remover o trabalho de Remotion.** Foi
feito: composição, registro no `Root.tsx`, schemas, assets e renders — tudo removido, com o
engine do VIDEO-FACTORY conferido depois (mesmos 3 erros de typecheck de antes, nenhum novo).

**Confirmado com ele em 19/08, ao fim do trabalho:** perguntei se queria os Challengers de
volta e a resposta foi **não — fica como está**. O material era anterior à reescrita da LP, e
a pasta foi apagada por decisão dele.

**Este item está ENCERRADO como entregue-e-revertido, não como pendente.** Foi feito
(16 masters, dimensões 16/16 conferidas), foi apagado a pedido, e a reversão foi confirmada
duas vezes. Para refazer no futuro, o caminho está no `CREATIVE_MATRIX.md`.

## 5. Preço — fonte e decisões

Valores e itens saem **só** do `PRECOS_VOS_ATUAL.png`. Nenhum número inventado: cada dígito
publicado (1, 2, 5, 10, 15, 20, 297, 497, 797) rastreia até a fonte.

- ✅ **Taxa de implantação:** decisão do Orlando (19/08) — **não vai na LP**, é assunto da
  call. Por isso o eyebrow é "quanto custa" e não "sem surpresa na demonstração".
- ✅ **Selo "Mais escolhido"** no Essential: fonte é declaração do Orlando (19/08).
- 🔴 **Lista do Scale cortada no print** — "PDV" é o último item legível. Pode faltar item.
- ⚠️ **`plan-limits.ts` do `vertex-saas` diverge**: diz `scale.maxUsers: 10` e
  `starter.maxAutomations: 3` contra os 15 e 10 da LP. O Orlando confirmou que o print está
  certo → a correção é no repo do Gui, não aqui.

## 5b. Procedência das respostas do FAQ

As 7 respostas do FAQ vieram de **entrevista com o Orlando em 19/08** — pergunta a pergunta.
A ideia é dele; a edição é minha. Registrado item a item em `FONTES-FAQ.md`, com o que ele
disse, o que foi publicado e o que eu retirei (superlativos sem prova, o "qualquer" absoluto,
a API não oficial e os nomes dos concorrentes).

Sem esse registro a revisão marcava tudo como "claim sem lastro" — e estava certa em marcar,
porque não havia como saber que o dono da empresa era a fonte.

## 6. Revisões independentes

Três revisões adversariais em contexto fresco, uma por rodada. Todos os gaps reais foram
corrigidos — inclusive dois que eu mesmo tinha criado:

- a guarda `.js .reveal` venceu por especificidade o escape de `prefers-reduced-motion`,
  fazendo quem pede menos movimento receber justamente a transição que aquele bloco desliga;
- órfãos de CSS (`.stk`, `@keyframes roll`, `wordFade`) deixados pela remoção do H1 rotativo.

Também foram corrigidas quatro contradições internas de copy que a revisão pegou (nota fiscal
vendida como base, 5 canais contra os 2 do Start, formato da demo, política de coexistência).

## 7. Incidente registrado

Ao instalar a trava do `gen-lp.mjs`, a inserção falhou por escape e o gerador foi executado no
teste — **apagou a reforma inteira**. Recuperado a partir do commit e reaplicado por completo.
A trava hoje funciona (testada: `exit 1`, hash dos arquivos idêntico depois da tentativa).

## 8. 🔴 O que depende do Orlando

1. **Deploy** — parado esperando o "pode subir". Produção roda a `main` de 06/08.
2. **Lista do Scale** cortada no print de preço.
3. **`plan-limits.ts`** desatualizado no SaaS (repo do Gui).
4. **Prova social real** — a esteira dos 15 depoimentos foi restaurada a pedido dele; eles
   continuam fictícios. Não há cliente citável.
5. **Claim "respondido em 40s"** no card da inbox — sem fonte; sobreviveu porque o bloco das
   provas vivas foi preservado na íntegra.
6. **Histórico de conversas pela API oficial** — a resposta 4 do FAQ afirma que o histórico
   entra junto e que a conexão é oficial. A revisão levantou que a Cloud API oficial
   normalmente não traz histórico. **Confirmar com o Guilherme** antes de publicar: é a única
   afirmação do FAQ cuja mecânica não dá para verificar no código deste repo.
7. **Posicionamento:** Opinion Box (jun/2025, N=1.126) mede que **59% dos brasileiros não
   gostam de resposta automática no WhatsApp**, e a página abre com "Atendimento automático é
   só o começo". O Control dele vende exatamente isso e funciona — os dois fatos coexistem e
   a decisão é dele.
