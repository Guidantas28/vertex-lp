# Relatório final — VOS Big Black Book

18–19/08/2026 · base `bd2818b` · atualizado em **19/08, 22h**, depois da remoção da CADEIA
(`0447816`) · a reforma **está** em produção desde as 17h50, no `f39f844`; o `d3ce2f2` e o
`0447816` são **locais** — não foram empurrados nem publicados

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
| ~~Seção do fluxo~~ (6 verificações) | ⚰️ **encerradas por remoção** no `0447816` — mediam a CADEIA, que saiu da página. Ficam como histórico; não são mais régua. *(Divergiam entre si, aliás: 12 etapas aqui, 9 no `LP_ARCHITECTURE`.)* |
| Corte do CSS morto da CADEIA | ✅ `baseline.json` idêntico antes × depois; altura idêntica ao pixel (4820 CSS px desktop / 5327 mobile); hero e modal 1–2 com **0,0000%** |

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

---

# Fecho — 19/08, noite (o estado real, depois de tudo)

O relatório acima foi escrito às 12h05. Depois dele aconteceram três coisas que mudam o placar, e
elas ficam registradas aqui para o relatório não continuar descrevendo uma página que não existe.

## 1 · A página foi ao ar

`www.voshq.com/lp` roda o commit **`f39f844`**, deploy `vertex-landing-9kjf7d699`, publicado às
17h50 com autorização explícita do Orlando. O item 1 do "o que depende do Orlando" está fechado.

Subiu junto o que estava no branch e nunca esteve no ar: roteamento da cadência, `vos-agendado`
no contato, campo Instagram, bottom sheet mobile e dedupe por telefone.

## 2 · Três blocos saíram a pedido dele

No fim do dia o Orlando mandou remover **o bloco de problema, a faixa do mecanismo e as três
provas vivas**. A área ficou vazia de propósito, marcada em comentário no `lp.astro`.

Na hora, isso não deixou a spec em aberto: as seções 2, 3 e 6 passaram a ser cumpridas pela CADEIA
("Fluxo Contínuo VOS"), com justificativa escrita seção por seção no `LP_ARCHITECTURE.md`.

⚠️ **Isso durou algumas horas.** Ainda em 19/08 ele mandou remover a CADEIA também (commit
`0447816`) — sobrou só a copy do cabeçalho. Com ela fora, **S2, S3 e S6 voltaram a ficar sem
dono**, e a justificativa que as cobria perdeu o objeto. O registro atualizado está no
`LP_ARCHITECTURE.md`, em "O que a remoção da CADEIA reabriu". A spec permite ajustar a ordem com
justificativa baseada no audit — o que ela não permite é o desvio **sem registro**.

## 3 · A limpeza que veio atrás

A remoção tirou o markup e deixou o motor: ~250 linhas de JavaScript procurando 9 ids que não
existiam mais, e a família inteira de CSS que os estilizava. Removidos no `d3ce2f2` — 256 linhas
no `lp.astro` e 129 cortes no `lp.css`, com a esteira de depoimentos preservada (ela estava
aninhada dentro do bloco morto). Verificação em `VERIFICATION.md`, "Rodada 3".

**A remoção da CADEIA repetiu o padrão, em escala menor.** Dessa vez o motor (JS) saiu junto com o
markup, mas **36 linhas de CSS ficaram** no fim do `lp.css`: `.fluxo`, `.fluxo.reveal`, o `@media`
de 900px e as `@keyframes cn-braco-ciclo` / `cn-tela-ciclo`, órfãs desde que as 7 linhas que as
chamavam saíram. Limpas no `0447816`. Verificação em `VERIFICATION.md`, "Rodada 4".

## O placar do Big Black Book, hoje

- **§5 (10 seções):** 6 ✅ (S1, **S3**, **S6**, S8, S9, S10) · 2 fora da grade, com justificativa
  (S4, S5) · S7 ⚠️ sem prova de cliente, mas **sem prova fabricada** · **1 em aberto: S2
  (Problema)**. A CENA (`e045dfa`) fechou S3 e S6 por demonstração; a saída da esteira (`3da2a6f`)
  encerrou a dívida frontal da S7. Detalhe seção por seção no `LP_ARCHITECTURE.md`.
- **§10 (13 verificações):** **11 ✅ · 🔴 reprova em WCAG 2.2.2 A.** Este item mudou três vezes em
  24 h e vale contar a sequência inteira: a reprovação vinha do laço da cena da CADEIA; com a CADEIA
  fora passou para a esteira de depoimentos; com a esteira fora (`3da2a6f`) **acabou**, e este
  relatório chegou a registrar 12 ✅. Em `c6206d6` ela **voltou**, por decisão dele: o botão de
  pausar da CENA foi removido para a peça ler como GIF. Movimento que começa sozinho, passa de 5 s e
  divide a tela com texto exige um mecanismo de pausar — sem o botão não existe mecanismo nenhum.
  Foi oferecida a saída que dava o mesmo visual sem o custo (botão invisível, voltando no hover e no
  Tab); ele escolheu tirar de vez. **Não é descuido; é escolha do dono, com o custo na mesa.** A
  única atenuação que sobra é o `prefers-reduced-motion`, que não dispara o autoplay · o item 13
  ("não publicar") foi superado pela autorização dele
- **§13 (entregáveis):** documentação 6/6 ✅ · frontend ✅ · **criativos: entregue-e-revertido** —
  16 masters foram feitos e apagados a pedido dele, item encerrado, não pendente
- **§14 (critérios A–N):** A–J e N ✅ · K encerrado como acima · L e M ✅ **a partir desta revisão**
  (eram os dois itens que a remoção tinha deixado desatualizados)

## 🔴 O que continua dependendo do Orlando

1. ~~**Depoimentos fictícios**~~ ⚰️ **RESOLVIDO em 20/08** — a esteira saiu (`3da2a6f`) e no lugar
   entrou prova de mecanismo, que é justamente o que a spec lista **acima** de depoimento. Fica o
   que não se resolve com redação: **a página não tem prova de cliente**, porque não há cliente
   real citável. ⚠️ Os mesmos 15 depoimentos seguem em `src/data/content.ts` alimentando a
   **home** — outra superfície, mesma dívida.
1b. 🔴 **S2 (Problema) em aberto** — a CENA mostra a solução; ninguém nomeia a dor antes dela.
   Escrever o problema de volta, ou assumir por escrito que a página entra pela solução.
2. **Lista do Scale** cortada no print de preço — pode faltar item na LP.
3. **`plan-limits.ts`** desatualizado no SaaS (repo do Gui).
4. **FAQ resposta 4** — histórico de conversas pela API oficial: confirmar com o Guilherme.
5. **Claim "respondido em 40s"** no card da inbox — sem fonte. *(Saiu da página junto com as
   provas vivas na remoção de 19/08; volta a valer se o bloco voltar.)*
6. **Posicionamento** — Opinion Box (jun/2025, N=1.126) mede que 59% dos brasileiros não gostam de
   resposta automática no WhatsApp, e a página abre com "Atendimento automático é só o começo". O
   Control dele vende exatamente isso e funciona; os dois fatos coexistem e a decisão é dele.

## 🔴 Duas dívidas técnicas que não são da LP, mas mordem se ninguém olhar

- **O fonte da cena de vídeo não está versionado.** No git do `D:\VIDEO-FACTORY`,
  `LpCenaTrabalho.tsx` está *untracked* e `Root.tsx` modificado sem commit. ⚠️ **Mudou de
  natureza no `0447816`:** as cenas saíram da página, então o vídeo **não está mais em produção** e
  a dívida deixou de ser urgente — mas não deixou de existir: o código que gera uma peça já
  publicada segue existindo só numa árvore de trabalho. Os arquivos
  `public/lp/cena-trabalho.{webm,mp4,png}` continuam no disco da LP, sem referência, caso a cadeia
  volte.
- ~~**O espelho "Com o VOS" nunca foi começado.**~~ ⚰️ **Encerrado por remoção.** Não existe
  `LpCenaVos` e deixou de fazer sentido: a cena que ele espelharia saiu junto com a CADEIA.
