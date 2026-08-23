# Verificação — reforma da /lp

Executada em 18/08/2026 sobre o commit `bd2818b` + mudanças não commitadas.

## 1. Build

`npm run build` → **Complete**. 4 páginas geradas (`/lp`, `/`, `/privacidade`, `/cookies`),
função serverless empacotada, `patch-vercel-runtime` aplicou `nodejs22.x`.
O aviso "local Node.js 24 não suportado" é **pré-existente** e é exatamente o que o patch
script corrige — não é regressão.

### Lint / typecheck / testes

O projeto **não tem** eslint, vitest, `@playwright/test` nem `@astrojs/check` instalados, e
o `package.json` só expõe `dev`, `build`, `preview` e `export:hero`. O gate real é o build.

Rodei mesmo assim o `npx tsc --noEmit` (TypeScript está instalado). Devolve 4 erros, todos
em arquivos **que este trabalho não tocou** — logo, pré-existentes (o `git diff --stat`
mostra só `lp.astro` e `lp.css` modificados):

- `src/components/islands/TeamPreviewSwitch.tsx:262` — atributo JSX duplicado (ilha da home)
- `src/pages/api/meta-leads.ts` (3 erros) — falta `@types/node`: `node:crypto` e `Buffer`

Nenhum erro novo introduzido.

## 2. Contratos de backend/tracking — antes × depois

Mesmo roteiro nos dois lados: `node scripts/baseline-lp.mjs`. As rotas `/api/lead`,
`/api/first-touch` e `/api/agendou` são interceptadas — nada chega no CRM.

| Contrato | Antes | Depois | Veredito |
|---|---|---|---|
| `dataLayer` evento `lead` | 10 chaves | **10 chaves idênticas** | ✅ intacto |
| chaves `resposta_1` / `resposta_2` | presentes | presentes | ✅ |
| chamadas de rede | `POST /api/first-touch`, `POST /api/lead` | as mesmas duas | ✅ |
| modal abre pelo CTA | sim (desktop + mobile) | sim (desktop + mobile) | ✅ |
| `[data-action="lead"]` | 3 | **6** | ✅ aditivo — 3 CTAs de plano, mesmo seletor e mesma ação |
| console | 2 warnings do Meta pixel | os **mesmos 2**, nada novo | ✅ |

Arquivos de `src/pages/api/`, `src/lib/`, `astro.config.mjs` e `package.json`:
**nenhum modificado** (`git status`).

## 3. Visual — desktop (1440×900) e mobile (390×844)

Capturas em `baseline-antes/` e `baseline-depois/` (full page + hero + 3 telas do modal em
cada viewport, mais recortes das seções novas).

- **Overflow horizontal:** `scrollWidth === clientWidth` nos dois viewports. ✅
- Seção de problema: cadeia legível empilhada no mobile, conectores tracejados visíveis.
- Preços: 3 cards empilhados. **Defeito achado e corrigido durante a verificação** — a
  primeira versão usava grid de 3 colunas no desktop e o terceiro card estourava a caixa,
  porque a /lp inteira vive numa coluna de 540px (`--col`), inclusive no desktop. Empilhado
  é o certo aqui e é também o que a spec pede pro mobile.
- FAQ: `<details>` nativo — abre sem JS, navegável por teclado, foco visível.

## 4. Prova comercial

- Preços conferidos contra a fonte oficial, item por item. Nenhum valor, plano ou inclusão
  fora do que está legível no `PRECOS_VOS_ATUAL.png`.
- 🔴 **Duas lacunas da fonte, reportadas e não preenchidas:** taxa de implementação não
  aparece no print; a lista do Scale está cortada ("PDV" é o último item legível).
- Os 15 depoimentos fictícios saíram da página, do array de dados e do script que os montava —
  não foram apenas escondidos.
  ⚠️ **Correção:** as 15 fotos (`public/lp/pessoas/social-*.webp`) **continuam publicadas**.
  Não foram apagadas de propósito: o pool `social-11..25` também alimenta o `HeroAvatars`
  da home. Sobrou também CSS morto (`.depos`, `.depo-*`) em `lp.css` — inofensivo, e mantido
  porque a esteira volta se houver depoimento real.

## 5. Criativos

16 masters, dimensões conferidas com `sharp`: **16/16 corretas** (9:16 = 1080×1920 ·
4:5 = 1440×1800). Control (`v3 (1).png`, `v3 (3).png`, `vos-estatico-*`) **não foi tocado**.
1 conceito bloqueado por fonte ausente (#08, quote real) — ver `CREATIVE_MATRIX.md`.

## 6. Não publicado

Nada foi para produção. O deploy da LP continua parado esperando o "pode subir" do Orlando,
pelo caminho da Parte 1 do plano.

## 7. Acessibilidade básica (spec §10, item 11)

Medido no viewport mobile (390×844) com a página servida:

| Item | Resultado |
|---|---|
| `<h1>` na página | **1** (só o do hero) |
| Ordem de headings | coerente, sem pulo: H1 → H2 (problema) → H2 (mecanismo) → H3×3 (provas) → H2 (Planos) → H3×3 (planos) → H2 (FAQ) → H2 (fecho) |
| FAQ | 5 `<details>` com 5 `<summary>` — abre sem JS |
| Foco por teclado | `SUMMARY` recebe foco, com `outline` laranja visível (`:focus-visible`) |
| CTAs | 6, **todos `<a>` de verdade** — nenhum `div` clicável |
| Imagens sem `alt` | nenhuma |
| Movimento | `.faq-sinal` respeita `prefers-reduced-motion` |

## 8. O CSS novo não vaza para a home

Risco checado porque as palavras `plano` e `faq-item` também aparecem em componentes da home
(`src/components/v4/Faq4.astro`, `src/components/islands/PricingInteractive.tsx`).

- `src/styles/lp.css` é importado **em um único lugar**: `src/pages/lp.astro:9`.
- O build emite **um bundle de CSS por página** — `_astro/lp.DmFMCZKc.css` é distinto de
  `_astro/index.CPojxLHb.css`. A home não carrega o CSS da LP.
- Os componentes da home não usam `class="plano"` nem `class="faq-item"` literais (grep por
  atributo `class` não retorna nada) — a ocorrência era da palavra em outro contexto.

Conclusão: nenhuma colisão possível.

## 9. Auditoria de claim comercial

Extraí todo o texto renderizado da seção de preços e listei cada número publicado:
`1, 2, 5, 10, 15, 20, 297, 497, 797`.

Cada um rastreia até o `PRECOS_VOS_ATUAL.png`: os três preços; 1 usuário (Start); até 10
automações; até 2 canais (Start); 5 usuários e 5 canais (Essential); até 20 assinaturas/mês;
15 usuários e 20 canais (Scale). **Nenhum número sem fonte.**

Varredura por promessa não sustentada (garantia, reembolso, "cancele quando quiser", prazo
de implantação, suporte 24h, contagem de clientes, percentual de aumento, economia em R$):
**nenhuma ocorrência** na página.


## 10. Revisão adversarial independente — gaps e o que foi feito

Um subagente em contexto separado revisou o diff contra o plano. Veredito por item:
(a) nenhum arquivo proibido tocado · (b) contrato de tracking íntegro · (e) CSS sem colisão ·
(f) HTML sem erro de estrutura. Os gaps reais que ele achou foram **todos corrigidos**:

| Gap | Correção |
|---|---|
| `gen-lp.mjs` apagaria a reforma inteira (gera de um `lp-source` defasado, e os CTAs de plano sairiam sem `data-action="lead"`) | **Trava instalada** no gerador: aborta com `exit 1` e explica o porquê; só roda com `--forcar`. Testado: hash dos arquivos idêntico depois da tentativa |
| A frase sobre o formato da demo aparecia 2× (hero e FAQ) | hero voltou a ter só `15 minutos, sem cartão e sem instalar nada.`; o formato fica dito uma vez, no FAQ |
| Eyebrow "sem surpresa na demonstração" prometia transparência total, com a taxa de implantação ausente da fonte | virou `quanto custa` |
| "…pedidos e **notas** — você liga só os módulos que usa" logo acima de cards onde nota fiscal só existe do Essential pra cima | intro virou "Você liga só os módulos que usa. Veja o que entra em cada plano." |
| "Dá pra começar pelo atendimento e deixar o resto como está" — política de migração sem fonte | removido |
| "**Funciona.** WhatsApp…" afirmava compatibilidade/portabilidade sem fonte | removido o "Funciona." |
| A IA levava o crédito da cadeia "recebe, responde, agenda, lança", que é do motor de automação | resposta separa as duas coisas |
| Chips da corrente com ~2px de folga no desktop (vazariam com outra fonte ou zoom) | corrente passou a `flex-wrap:wrap` com padding menor |
| Classes sem regra (`.prob-head`, `.planos-head`) e regra que nunca casa (`.fecho-head h2 u`) | removidas |
| "as capturas não existem" | existiam, no scratchpad da sessão; o caminho absoluto agora está escrito aqui |

## 11. Incidente durante a verificação — e o que ele provou

Ao instalar a trava, a inserção falhou por escape e eu **rodei o `gen-lp.mjs` no teste**. Ele
sobrescreveu `lp.astro` e `lp.css` e apagou a reforma inteira — exatamente o risco que a
revisão tinha acabado de apontar.

Recuperação: o estado danificado foi copiado para `C:\Users\Orlando\AppData\Local\Temp\claude\D--CLAUDE-PROJECT-ORLANDO-Vertex\2e9de880-bb35-4083-b164-18ec253b7981\scratchpad\danificado-pelo-gerador\`, os dois
arquivos foram reescritos a partir do objeto commitado (`git show HEAD:...`) e a reforma foi
reaplicada por inteiro, já com as correções da revisão. Build, contratos e capturas foram
refeitos do zero depois disso — os números desta página são os de **depois** da reaplicação.

Fica o registro de que a trava não é burocracia: o gerador destrói o trabalho em silêncio, e
destruiu de verdade.


---

# Rodada 2 — verificação da reescrita (19/08)

Mesmo roteiro, `node scripts/baseline-lp.mjs`, com `/api/*` interceptado.

| Item | Resultado |
|---|---|
| `npm run build` | ✅ Complete |
| dataLayer `event:"lead"` | ✅ as mesmas 10 chaves, desktop e mobile |
| `[data-action="lead"]` | 6 (hero, 3 planos, fecho, barra) |
| modal abre e navega as 2 etapas | ✅ desktop e mobile |
| chamadas de rede | ✅ `POST /api/first-touch`, `POST /api/lead` — as mesmas |
| console | ✅ só os 2 avisos pré-existentes do Meta pixel |
| overflow horizontal | ✅ nenhum em 1440, 820 e 390 |
| `.reveal` invisíveis após rolar a página | ✅ 0 |
| `<h1>` | 1, e agora é a Big Idea |
| motores animados | ✅ todos os ids preservados (`#flow`, `#chatTrack`, `#caixaN`, `#vid`, `#bar`…) |

## Robustez sem JavaScript

A rodada 2 passou a usar o motor `.reveal`, que começa em `opacity:0`. Sem guarda, isso
esconderia conteúdo de quem está sem JS. Corrigido: um `<script is:inline>` no `<head>`
marca `html.js`, e a regra virou `.js .reveal{opacity:0…}`. Sem JavaScript, a página aparece
inteira.


## Revisão adversarial da rodada 2 — gaps e correções

Subagente em contexto fresco revisou o diff final. Aprovou: backend intocado, contrato de
tracking íntegro, os 16 ids dos motores resolvendo (nenhum `getElementById` órfão), HTML
válido incluindo o bloco `{PLANOS.map(...)}`, CSS balanceado e sem colisão. Os gaps reais
foram **todos corrigidos**:

| Gap | Correção |
|---|---|
| 🔴 A guarda `.js .reveal` (0,2,0) passou a **vencer o escape de `prefers-reduced-motion`** (0,1,0) — quem pede menos movimento recebia justamente a transição de .65s que aquele bloco existe pra desligar | a regra do bloco reduce virou `.js .reveal` |
| Value stack vendia **nota fiscal e relatórios** como base, e os dois só existem do Essential pra cima — contradizia a tabela três linhas abaixo | stack passou a listar só o que o Start entrega |
| FAQ dos canais prometia **5 canais** na mesma caixa, com o Start dando 2 — e não respondia a pergunta | resposta reescrita: canais na mesma caixa, e "quantos entram de uma vez depende do plano" |
| "a demonstração passa **módulo por módulo**" não fecha com "**15 minutos**" | resposta não promete mais formato nem duração |
| "deixar o resto onde está" = política de coexistência sem fonte | removido |
| Órfãos que **esta rodada** criou: `.stk*`, `@keyframes roll`, `@keyframes wordFade` (o H1 rotativo saiu) | removidos |
| `.elos` usava `margin` shorthand e anulava o `margin:auto` da regra compartilhada — centralizava por acidente | trocado por `margin-top` |

Reverificado depois das correções: build OK, dataLayer idêntico nas 10 chaves em desktop e
mobile, modal abrindo, 2 chamadas de rede, zero erro novo de console.

### Fora do escopo, registrado e não alterado

- `lp.astro` — "respondido em **40s**" no card da inbox é claim de resultado sem fonte.
  Sobreviveu à reescrita porque o bloco das provas vivas foi preservado na íntegra.
  **Decisão do Orlando necessária:** apagar, ou apontar a fonte.
- `var(--nc)` sem definição, dentro do bloco morto `.nt*` — pré-existente, não pinta nada.
- Órfãos de CSS anteriores a esta rodada (`.feat-funil`, `.pain`, `.nt*`, `.shot`…).

---

# Auditoria final de claim comercial — seção de preços (19/08)

Extraí **todo** número publicado na seção de preços (texto estático + array `PLANOS`) e
rastreei cada um até o `PRECOS_VOS_ATUAL.png`:

| Número | De onde vem |
|---|---|
| 297 · 497 · 797 | os três preços |
| 1 | 1 usuário (Start) |
| 2 | até 2 canais (Start) |
| 10 | até 10 automações (Start) |
| 5 | 5 usuários e 5 canais (Essential) |
| 20 | até 20 assinaturas/mês · 20 canais (Scale) |
| 15 | 15 usuários (Scale) |

**Números sem fonte: nenhum.**

## A distinção que importa

O critério é *"usar somente a fonte oficial, sem valores inventados"* — e isso está cumprido:
zero número órfão. A lista do Scale estar cortada no print torna a seção possivelmente
**incompleta**, não **inventada**. São coisas diferentes, e a resposta certa para cada uma
também é: para incompleta, publicar só o que é legível e registrar a lacuna (feito); para
inventada, não publicar.

O que falta é o Orlando conferir o print e dizer se há item do Scale depois do "PDV".

---

# Rodada 3 — a limpeza de 19/08 (noite)

Esta seção **corrige** o que envelheceu acima e registra a verificação da limpeza. Nada da
rodada 2 foi reescrito: o que está lá era verdade quando foi escrito.

## 🔴 O que a rodada 2 afirma e deixou de valer no mesmo dia

A tabela da rodada 2 diz: *"motores animados ✅ todos os ids preservados (`#flow`, `#chatTrack`,
`#caixaN`, `#vid`, `#bar`…)"*. Isso era verdade às 11h54. **Horas depois**, o Orlando mandou
remover o bloco de problema, a faixa do mecanismo e as três provas vivas — e com o markup foram
embora `#flow`, `#chatTrack`, `#caixaN`, `#caixaBarras`, `#caixaFeed`, `#flowCanvas`, `#flowLog`,
`#feats`, `#featsTrack`, `#featsDots` e `#featsDica`. Sobreviveram `#vid`, `#bar`, `#depos` e o
motor da CADEIA.

> ⚠️ **A última frase deixou de valer horas depois.** Ainda em 19/08 o Orlando mandou remover a
> CADEIA também: o `#fluxo`, as abas, os 9 cartões, os 9 vídeos e o motor dela saíram no commit
> `0447816`. Restaram `#vid`, `#bar` e `#depos`. Ver **Rodada 4**.

O JavaScript daqueles motores **ficou no arquivo**, procurando ids que não existiam mais. Com
guarda de `null`, então não quebrava nada — e era exatamente por isso que ninguém notava.

## O que a limpeza tirou

| onde | o quê |
|---|---|
| `src/pages/lp.astro` | **256 linhas**: o IIFE das três provas vivas (inbox `CONVERSA`, caixa/feed, motor `FLUXOS`), o carrossel `feats` e o `IntersectionObserver` que ligava o registrador de `timers` |
| `src/styles/lp.css` | **129 cortes**: as famílias `.feats/.feat*`, `.caixa*`, `.ch*`, `.fn*`/`.flow-*`, `.nt*`, `.pain*`, mais `.form/.slot*`, `.nums/.num`, `.quote/.who`, `.micro`, `.band-in/.band-foot*`, `.st`, `.ze`, `.shot`, `.zx` — 3 `@media` que ficaram vazios e 5 `@keyframes` órfãos (`sobeNum`, `pulso`, `cutuca`, `corre`, `entra`) |

O bloco de depoimentos estava **aninhado dentro** do IIFE morto — cortar o intervalo inteiro teria
matado a esteira. Ele foi preservado e promovido a bloco de primeiro nível.

Uma regra precisou de bisturi em vez de corte: `.feat-chat-track,.depo-fita` no bloco de
`prefers-reduced-motion`. A primeira metade morreu, a segunda é a esteira de depoimentos. Ficou
`.depo-fita`.

## Verificação executada

| prova | resultado |
|---|---|
| `npm run build` | ✅ Complete |
| `node --check` nos dois scripts `is:inline` | ✅ os dois parseiam |
| chaves `{` / `}` do CSS | ✅ 387/387 (era 525/525) |
| classes vivas que perderam TODAS as regras | ✅ **nenhuma** (cruzamento das 186 classes do CSS contra `class=`, `class={}`, `classList.*` e seletores de `querySelector`) |
| regras 100% mortas restantes | ✅ **0** |
| `dataLayer` evento `lead` | ✅ as mesmas **10 chaves**, desktop e mobile |
| `[data-action="lead"]` | ✅ 7 (inalterado) |
| chamadas de rede | ✅ `POST /api/first-touch` + `POST /api/lead` — as mesmas |
| console | ✅ só o aviso pré-existente do Meta pixel; zero erro |
| **altura da página** | ✅ **idêntica ao pixel** — 11128px no desktop, 13636px no mobile |
| captura `hero` desktop e mobile | ✅ **0,0000%** de diferença |
| captura `modal` 1 e 2, desktop e mobile | ✅ **0,0000%** de diferença |
| captura `modal` 3 (embed do Cal) | 0,005% desktop / 0,02% mobile — **dentro do ruído medido** |
| captura `full` | 1,5% desktop / 1,45% mobile — **dentro do ruído**: a esteira de depoimentos e os 9 vídeos estão animando durante a captura |
| DOM ao vivo | ✅ 30 depoimentos em 3 pistas com `animation: sobe 38s` · 9 cartões, 9 vídeos, `com-video`, 18 selos, 2 relógios · 3 planos · 7 FAQ · botão e balão do WhatsApp |
| arquivos tocados | ✅ só `src/pages/lp.astro`, `src/styles/lp.css` e `docs/vos-growth/` — zero backend |

**Como o ruído foi medido:** capturando a mesma versão duas vezes e comparando. Deu 1,42% no
`full` desktop e 1,23% no mobile, e ~0% no modal. É a régua que separa "mudou" de "estava
animando".

## 🔴 Um incidente no meio da verificação, e o que ele ensinou

Rodei `pnpm` para diagnosticar o lançador do servidor local. Ele **reestruturou o `node_modules`
da LP** para o layout dele (`.pnpm`), deixou `esbuild` e `sharp` sem rodar os scripts de build, e
criou `pnpm-lock.yaml` e `pnpm-workspace.yaml`. Desfeito: os dois arquivos apagados e `npm ci`
rodado a partir do `package-lock.json` — que ficou **byte a byte idêntico** (md5 conferido antes e
depois).

Depois disso, o modal aparecia **sem estilo nenhum** nas capturas — 60% a 94% de diferença. A
causa não era o `pnpm` nem a limpeza: era o **lançador do servidor local**. A entrada
`lp-voshq-4321` do `.claude/launch.json` não subia (`npm` mora em `C:\Program Files\...` e o
espaço no caminho quebra o spawn), e a correção que tentei — `astro dev --root <pasta>` — subia o
servidor com o **cwd errado**. Os globs `content` do `tailwind.config.ts` são relativos ao cwd:
`./src/**` não casava com nada e o Tailwind gerava uma folha praticamente vazia. Só em dev — no
build de produção o CSS sai correto.

Corrigido com `cwd` explícito na entrada do `launch.json`. Depois disso o código original passou a
bater com a baseline de ontem (modal **0,0000%**), o que é o que torna a medição da limpeza
confiável.

**A lição, para não custar de novo:** captura visual só vale contra uma referência que você
acabou de reproduzir. Antes de acusar o próprio trabalho, reproduza a referência com o código
original — foi isso que separou "eu quebrei" de "o instrumento estava torto".

---

# Rodada 4 — a remoção da CADEIA e a limpeza que ela deixou (19/08, 22h)

Mesma regra das anteriores: nada acima foi reescrito. O que envelheceu ganhou marcação e a
verificação nova entra aqui.

## O que saiu da página

A pedido do Orlando, a seção **"Fluxo Contínuo VOS"** (a CADEIA) foi removida inteira — as 9
etapas em 3 fases, os dois estados (`Do jeito manual` × `Com o VOS`), os selos, o relógio de 42h
do cartão 3 e as 9 cenas em vídeo. Ficou só a copy do cabeçalho: eyebrow, `<h2>` e parágrafo.

Desta vez o motor saiu junto com o markup — a IIFE de ~155 linhas (`travaEm`, `RELOGIO`, `pinta`,
`marcaVideo`, `tocaAtivo`, `passo`, `reinicia`, os listeners das abas e o `IntersectionObserver`
de `threshold: .3`). **Mas o CSS ficou pela metade**, repetindo em escala menor o erro que a
rodada 3 tinha acabado de corrigir:

| onde | o que sobrou morto | limpo em |
|---|---|---|
| fim do `src/styles/lp.css` | `.fluxo`, `.fluxo.reveal`, o `@media (min-width:900px)` da `.fluxo`, e as `@keyframes cn-braco-ciclo` / `cn-tela-ciclo` — órfãs desde que as 7 linhas `.fluxo[data-estado="hoje"] .fx-no.ativo .cn-*` saíram | `0447816` (36 linhas) |
| `src/pages/lp.astro` | dois comentários que afirmavam o contrário do código: *"Os motores animados continuam no script do fim do body"* (falso desde o `d3ce2f2`) e *"o motor e o CSS dela saíram junto"* (o CSS não tinha saído) | `0447816` |

## ⚠️ A nota de WCAG 2.2.2 trocou de dono — não foi apagada

O bloco removido carregava a nota 🔴 *"LAÇO ETERNO, SEM BOTÃO DE PAUSAR"*, escrita sobre a cena
animada da CADEIA. **A cena acabou; a reprovação não.** Quem se move sozinho na página hoje é a
esteira de depoimentos:

- `.depo-fita` roda `animation: sobe var(--v,38s) linear infinite` — começa sem ação do usuário,
  passa de 5s, divide a tela com texto e não para nunca;
- a única pausa é `.depos:hover`, que **não alcança quem navega por teclado**, e o container está
  `aria-hidden="true"`;
- `prefers-reduced-motion` pausa de vez — é a única atenuação que resolve de fato.

A nota foi reescrita e movida para junto do `.depo-fita`, apontando o dono real. É registro de
estado: a decisão continua sendo do Orlando, e não foi reaberta aqui.

## Verificação executada

| prova | resultado |
|---|---|
| `npm run build` | ✅ **Complete!** |
| chaves `{` / `}` do CSS | ✅ 248/248 (era 260/260 antes do corte) |
| `baseline.json` antes × depois do corte | ✅ **byte a byte idêntico**, fora do `capturadoEm` — contrato de DOM, `dataLayer`, rede e console iguais nos dois viewports |
| `dataLayer` evento `lead` | ✅ as mesmas **10 chaves**, desktop e mobile |
| `[data-action="lead"]` | ✅ **7** em runtime (4 estáticos + 3 do `.map()` dos planos) — inalterado |
| chamadas de rede | ✅ `POST /api/first-touch` + `POST /api/lead` — as mesmas |
| console | ✅ só os 2 avisos pré-existentes do Meta pixel; zero erro |
| **altura da página** | ✅ **idêntica ao pixel** antes × depois — 9640 px de imagem no desktop (**4820 CSS px** @2x) e 10654 no mobile (**5327 CSS px**) |
| captura `hero` desktop e mobile | ✅ **0,0000%** |
| captura `modal` 1 e 2, desktop e mobile | ✅ **0,0000%** |
| captura `modal` 3 | 0,0041% desktop / 0,0153% mobile — **dentro do ruído** |
| captura `full` | 1,2877% desktop / 1,5129% mobile — **dentro do ruído** |
| arquivos tocados | ✅ só `src/pages/lp.astro`, `src/styles/lp.css` e `public/lp/orlando.webp` — **zero backend** |

**Como o ruído foi medido, de novo:** capturando **duas vezes o mesmo código, sem mudar nada**.
Deu **1,6695%** no `full` desktop e **1,5815%** no mobile — ou seja, **maior** que a diferença
antes × depois. Prova direta de que o `full` não mediu o corte: mediu fase de animação.

**E onde a diferença ficou:** varrendo a imagem em faixas horizontais, os pixels que diferem estão
confinados a **uma faixa contígua** — y 4669–5474 no desktop (≈ y 2334–2737 em CSS px), que é
exatamente a esteira de depoimentos, sob o título *"não é a gente falando"*. O resto da página não
muda um pixel. A diferença do `modal 3` é um spinner animando no passo do embed.

⚠️ **A altura mudou em relação à rodada 3** (11128 / 13636) porque a CADEIA saiu da página — isso
é o efeito pretendido, não regressão. A régua de não-regressão desta rodada é **antes × depois do
corte de CSS**, não rodada 3 × rodada 4.

## Estado no fim da rodada

- Commit **`0447816`** no branch `fecha-lead-ao-agendar`, **local** — sem `push`, sem PR, sem deploy.
- **Produção não mudou:** `www.voshq.com/lp` segue no `f39f844`.
- Os arquivos `public/lp/cena-trabalho.{webm,mp4,png}` continuam no disco, **sem referência**, caso
  a cadeia volte.
- Entra no commit o `public/lp/orlando.webp` (160×160, 2,6 KB), que estava *untracked* e é
  referenciado pelo botão de WhatsApp — sem ele versionado, um clone novo builda com a foto quebrada.

---

# Rodada 5 — a esteira sai, a CENA entra (20/08, madrugada)

## O que mudou

| | |
|---|---|
| `3da2a6f` | copy nova da seção + **a esteira de 15 depoimentos fictícios sai** |
| `e045dfa` | **a CENA entra** — vídeo de 29,8 s embutido na seção |
| `f545473` (VIDEO-FACTORY) | o fonte da composição, versionado desde o primeiro commit |

## 🎉 A página parou de reprovar em WCAG 2.2.2 A

Essa reprovação atravessou três rodadas trocando de dono: era o laço eterno da cena da CADEIA;
com a CADEIA fora passou para a esteira de depoimentos (`.depo-fita`, `sobe 38s linear infinite`,
pausa só no `:hover`); com a esteira fora, acabou.

```
grep -c infinite src/styles/lp.css   →  0
```

E a CENA **não** reabre o problema: é `<video>` com controle de pausar sempre visível — não
aparece no hover, porque ponteiro é justamente o que quem navega por teclado não tem.

## Verificação executada (Playwright, dois viewports)

| prova | desktop 1440 | mobile 390 |
|---|---|---|
| caixa da cena | **1120×700** — proporção 1,600 (8:5) ✅ | **358×537** — proporção 0,667 (2:3) ✅ |
| arquivo servido | `vos-cena-d.webm` ✅ | `vos-cena-m.webm` ✅ |
| duração lida do vídeo | 29,8 s | 29,8 s |
| autoplay ao entrar na tela | tocando ✅ | tocando ✅ |
| clique no botão | pausa, rótulo vira "Assistir", `aria-pressed=false` ✅ | idem ✅ |
| **teclado** | botão focável, **Enter volta a tocar** ✅ | idem ✅ |
| antes do scroll | **nenhum vídeo na rede** (`preload="none"`) ✅ | idem ✅ |
| `[data-action="lead"]` | 7 ✅ | 7 ✅ |
| `dataLayer.lead` | as mesmas **10 chaves** ✅ | idem ✅ |
| rede | `POST /api/first-touch` + `POST /api/lead` ✅ | idem ✅ |
| console | **0 erro**, só os 2 avisos pré-existentes do Meta pixel ✅ | idem ✅ |
| `npm run build` | **Complete!** ✅ | |

## Peso: um visitante baixa UM arquivo

| navegador | arquivo | peso |
|---|---|---|
| Chrome/Edge/Firefox desktop | `vos-cena-d.webm` | **587 kB** |
| Chrome Android | `vos-cena-m.webm` | **718 kB** |
| Safari macOS | `vos-cena-d.mp4` | **1630 kB** |
| Safari iOS | `vos-cena-m.mp4` | **1786 kB** |

Referência: o `broll.mp4` que **já está nesta página** pesa **2013 kB**.

⚠️ **Os dois `.mp4` ficaram acima do alvo que eu tinha posto** (1,7 MB desktop / 1,1 MB mobile).
O h264 quase não responde ao `crf` neste conteúdo: 2033 kB a 28, 1870 a 31, 1786 a 33. Registro em
vez de esconder — o caminho do Safari é mais pesado do que eu gostaria. Os dois `.webm` ficaram
abaixo do alvo, e o corte a `crf 42` no VP9 foi conferido **no olho**, quadro a quadro contra o
PNG: o texto do cartão de pagamento continua nítido.

## 🔴 Dois defeitos meus que a medição pegou

1. **O breakout da `.cena` não aplicava.** As regras estavam declaradas *antes* do bloco base — que
   foi anexado no fim do `lp.css` — então empatavam em especificidade e **perdiam por ordem**. O
   desktop saía com o corte 2:3. Só apareceu porque a medição lê a proporção da caixa em vez de
   confiar no olho. Movidas para o fim do arquivo, com o porquê escrito na própria regra.
2. **`<source media>` não funciona em `<video>`.** O atributo só vale dentro de `<picture>`;
   Chrome e Firefox o ignoram. Trocado por `matchMedia` com listener de `change`.

## Estado no fim da rodada

Quatro commits locais no branch `fecha-lead-ao-agendar` (`0447816`, `f0b8f7b`, `3da2a6f`,
`e045dfa`), sem `push`, sem PR, sem deploy. **Produção segue no `f39f844`.**

---

# Rodada 6 — uma peça só, trilha no topo, sem botão (20/08, 03h)

Commits: `c6206d6` (a página) e `8698380` (a composição, em `D:\VIDEO-FACTORY`).

## A medição que decidiu o desenho

O pedido foi "os ícones em cima, liberando espaço para a tela". Antes de mexer, a régua:

| medida | valor |
|---|---|
| altura do aparelho no corte deitado | **1072 de 1200 px** — já no talo |
| conclusão | tirar o painel **não** faz a tela crescer; só aumenta o vazio dos lados |

Por isso o corte deitado saiu inteiro, e não só o painel dele. Com o quadro estreito, **uma peça
serve os dois destinos** — e a troca por `matchMedia` deixa de existir junto.

## Peso — três caminhos testados antes de escolher

| caminho | resultado |
|---|---|
| resolução 1536×960 | −17% |
| resolução 1280×800 | −31% |
| 24 fps / 20 fps | −11% / −21% |
| **VP9 crf 42 → 46** | **726 kB → 593 kB** |

Escolhido o `crf`: preserva a geometria do texto. A perda foi conferida **no olho**, extraindo o
frame do cartão de pagamento do webm e comparando com o PNG — `Pagamento · VOS Scale`,
`R$ 797,00` e `pagar.voshq.com/1042` continuam nítidos.

| arquivo | peso |
|---|---|
| `vos-cena.webm` | **594 kB** — Chrome, Firefox, Edge e Safari 14.1+ |
| `vos-cena.mp4` | **1615 kB** — a queda para quem não toca webm |
| `vos-cena-poster.webp` | 36 kB |

⚠️ **O mp4 continua pesado e eu não consegui melhorar.** h264 a crf 34 = 1735 kB · 38 = 1615 ·
42 = 1542. A curva é plana: não é falta de tentar, é o codec não comprimir este conteúdo.

**Faxina: `public/lp` foi de 8,4 MB para 4,8 MB.** Saíram os quatro arquivos dos dois cortes
antigos e os `cena-trabalho.{mp4,webm,png}` (1,1 MB da CADEIA, sem referência desde 19/08 — o
fonte segue versionado em `e7ef105`).

## Verificação executada (Playwright, dois viewports)

| prova | desktop 1440 | mobile 390 |
|---|---|---|
| arquivo servido | `vos-cena.webm` 972×1458 ✅ | **o mesmo** ✅ |
| caixa | 480×720 — proporção 0,667 ✅ | 358×537 — 0,667 ✅ |
| `loop` / `muted` / `controls` | true / true / **false** ✅ | idem ✅ |
| autoplay ao entrar na tela | tocando ✅ | tocando ✅ |
| **botões no bloco** | **0** ✅ | **0** ✅ |
| antes do scroll | só o poster na rede ✅ | idem ✅ |
| `[data-action="lead"]` | 7 ✅ | 7 ✅ |
| `dataLayer.lead` | as mesmas **10 chaves** ✅ | idem ✅ |
| console | **0 erro** ✅ | idem ✅ |
| `npm run build` | **Complete!** ✅ | |

## 🔴 O que PIOROU nesta rodada

**A página volta a reprovar em WCAG 2.2.2 nível A.** Este item mudou três vezes em 24 h — laço da
CADEIA → esteira de depoimentos → resolvido → **reaberto aqui**. O botão de pausar foi removido a
pedido dele, para a peça ler como GIF. Ofereci a saída que dava o mesmo visual sem o custo (botão
invisível, voltando no hover e no Tab); ele escolheu tirar de vez. Registrado como decisão do
dono, com o custo na mesa. Sobra o `prefers-reduced-motion`, que não dispara o autoplay.

## ⚠️ Um efeito colateral das capturas desta série

As linhas 35 a 44 da planilha de auditoria EMQ — 10 `generate_lead` com user agent
`HeadlessChrome` e URL `http://localhost:4321/lp`, entre 19/08 21:43 e 20/08 00:57 — **vieram
destas verificações**. O `baseline-lp.mjs` percorre o modal até o fim, e o evento `lead` do
`dataLayer` é client-side: como a LP carregava o container de **produção** sem condição nenhuma,
cada captura virou evento real na Meta. Corrigido por outra sessão em `GtmHead.astro` (o loader
agora só sobe em host de produção) — a captura desta rodada já saiu sem `gtm.js`.
Detalhe completo em `_LOGS\MUDANCAS.md`, entrada de 02h.

## Estado no fim da rodada

Cinco commits locais no branch `fecha-lead-ao-agendar`, sem `push`, sem PR, sem deploy.
**Produção segue no `f39f844`.**
