# Arquitetura da /lp

> Estado de **19/08/2026, 22h** — depois da remoção da CADEIA (commit `0447816`). Este documento
> já descreveu uma página que não existia duas vezes; ambas as vezes porque o código andou e ele
> não. Se a página mudar de novo, esta é a primeira coisa a atualizar.

A rodada 1 enxertou seções na página velha e falhou: o hero continuou vendendo "a maneira mais
fácil de … em um só lugar" enquanto a seção seguinte dizia "o problema não é falta de
ferramenta". Duas promessas na mesma página, e a segunda refutando a primeira.

A rodada 2 refez a mensagem. A /lp continua **documento autônomo** (decisão do Orlando): nada de
componente da home importado.

Em **19/08, no fim do dia**, o Orlando mandou remover o bloco de problema, a faixa do mecanismo e
as três provas vivas. A área ficou vazia de propósito. **Mais tarde, no mesmo dia, ele mandou
remover também a CADEIA** ("Fluxo Contínuo VOS") — sobrou só a copy do cabeçalho dela. Este
documento registra o que a página tem hoje e o que essa segunda remoção reabriu.

## As 10 seções da spec × o que a página tem hoje

| # | Seção da spec | Estado | Onde |
|---|---|---|---|
| 1 | Hero / message match com o Control | ✅ | H1 `Atendimento automático é só o começo.` · eyebrow `para empresas que vivem de WhatsApp` (DNA do Control) · CTA `Agendar demonstração` |
| 2 | Problema / Core Complex | 🔴 **reaberta** | não tem dono desde a remoção da CADEIA — ver "O que a remoção da CADEIA reabriu" |
| 3 | Mechanism | 🔴 **reaberta** | resta a copy do `band-head-2`: `Sua empresa continua andando sem depender de alguém lembrar do próximo passo.` Afirmação, não demonstração |
| 4 | Product proof | ⚠️ uma tela, não três | `hero-tela` com `/assets/hero/dashboard.webp` — tela real do produto, não mockup |
| 5 | IA | ⤳ vive no FAQ | resposta 6, `O que a IA faz, na prática?` |
| 6 | Do primeiro oi ao caixa | ⚠️ **só o vídeo** | o bloco de vídeo "Conheça o VOS" (`#vid`, `/lp/broll.mp4`) sobreviveu; a narrativa em etapas, não |
| 7 | Proof / clientes | 🔴 **em dívida com a spec** | 15 depoimentos **fictícios**, `ehRascunho = false` |
| 8 | Preços | ✅ | value stack antes do número; 3 planos vindos do array `PLANOS` do frontmatter |
| 9 | Objeções | ✅ | 7 itens, cobrindo as 6 objeções centrais da spec |
| 10 | Fecho | ✅ | `uma ação puxa a próxima` · `Agora veja isso acontecendo na sua empresa.` |

Fora da grade da spec, mas na página: barra fixa e **botão flutuante de WhatsApp** com balão
dispensável (`Prefere sem formulário? Chama no WhatsApp.`). Desde o `0447816` o botão leva o
**rosto do Orlando** — avatar de 34px (32 no mobile) com selo de WhatsApp de 16px — no lugar do
glifo verde. O ponto de status `.zap-on` saiu junto: com o selo verde virava um segundo ponto
verde ao lado do primeiro.

## O que a remoção da CADEIA reabriu

A spec permite ajustar a ordem das seções **"somente com justificativa baseada no audit"**. Até o
commit `d3ce2f2` este documento carregava essa justificativa: a CADEIA cobria S2, S3 e S6, e
estava escrito aqui por quê. **O commit `0447816` removeu a CADEIA a pedido do Orlando.** A
justificativa perdeu o objeto — e as três seções voltaram a ficar sem dono.

Este trecho não inventa uma justificativa nova para o vazio. Ele registra o estado, para que a
próxima auditoria (inclusive uma minha) não descubra isso do zero.

**S2 (Problema) ficou sem dono.** O estado "Do jeito manual" era o problema mostrado — nove etapas
travando, cada uma com o selo do que está esperando alguém, e o relógio parando em 42 h no único
elo com fonte pública. Nada na página faz esse trabalho hoje. O bloco de problema próprio já tinha
saído na remoção anterior, justamente porque a CADEIA o repetia.

**S3 (Mechanism) fica sustentada só pela copy.** Sobrou o `band-head-2`: eyebrow `fluxo contínuo
VOS`, o h2 `Sua empresa continua andando sem depender de alguém lembrar do próximo passo.` e um
parágrafo. Isso **afirma** o mecanismo; a spec pede que os cards *"pareçam uma única história
causal"*, ou seja, que ele seja **visto**. É a distância entre o que a página diz e o que ela
mostra.

**S6 (Do primeiro oi ao caixa) fica só com o vídeo.** As três fases — entrada, venda, fechamento —
eram a tese da CADEIA. O bloco "Conheça o VOS" sobreviveu e continua narrando o percurso em vídeo,
mas a continuidade em etapas na própria página acabou.

**S4 (Product proof) fica com uma tela real, não três.** A spec proíbe dashboard fictício; não
exige quantidade. A tela que ficou é exportada do app. É economia de prova, e é escolha — não
esquecimento. *(Independe da CADEIA; segue valendo.)*

**S5 (IA) vive na resposta 6 do FAQ.** A própria spec manda que *"a IA não deve carregar a Big
Idea principal"* e que ela entre como mecanismo/proof. A resposta do FAQ cobre as quatro perguntas
que a spec exige: que contexto ela conhece, em que tarefas ajuda, qual a consequência operacional
e onde ela sai de cena. Seção própria daria à IA um peso que a spec justamente nega.
*(Independe da CADEIA; segue valendo.)*

**S7 (Proof) continua em dívida.** Os 15 depoimentos fictícios (`ehRascunho = false`) são o único
ponto em que a página contraria a spec **de frente** (`Nenhum depoimento fictício`), e isso não se
resolve com justificativa — resolve com prova real ou com a remoção da esteira. Decisão do
Orlando, ainda não tomada.

### O placar hoje

| situação | seções |
|---|---|
| ✅ cumpridas | S1, S8, S9, S10 |
| ⤳ cumpridas fora da grade, com justificativa | S4 (uma tela), S5 (no FAQ) |
| 🔴 **reabertas pela remoção da CADEIA** | **S2, S3, S6** |
| 🔴 em dívida de frente com a spec | S7 (depoimentos fictícios) |

**Decisão pendente do Orlando:** o que ocupa o lugar da CADEIA — se é para reconstruir alguma
forma de mostrar o mecanismo, ou se S2/S3/S6 ficam abertas de propósito e este documento passa a
registrar isso como escolha, e não como buraco.

## As correções que a auditoria independente cobrou (rodada 2)

1. **Message match quebrava antes do render.** `<title>`, `meta description` e OG ainda vendiam a
   promessa antiga. Trocados.
2. **Section 4 era mockup fabricado.** Existiam telas reais exportadas do app em
   `public/assets/product/`. Passou a usar real.
3. **Mecanismo era carrossel no mobile.** A faixa causal passou a aparecer inteira em qualquer
   largura. *(Esse bloco saiu depois, na remoção de 19/08.)*
4. **Hierarquia invertida no problema:** o vão (o argumento) estava no menor e mais apagado tipo
   da seção. Invertido. *(Idem — saiu na remoção.)*
5. **Preço duplicado à mão.** Agora sai de `PLANOS` no frontmatter — fonte única, como a spec §8
   exige.
6. **Seções presas na coluna de 540px.** Passam a usar o breakout `min(1060px, calc(100% - 48px))`
   a partir de 900px.
7. **Cinco CTAs laranja idênticos.** Os dos planos viraram secundários (contorno).
8. **Seções sem acabamento.** Passam a usar o motor `.reveal`, que existia no CSS e nenhum
   elemento usava.

## Uma decisão contra a spec, de propósito

A spec sugere testar o CTA `Ver minha empresa no VOS`. **Não foi usado.** Ele promete que a pessoa
sai da call com a empresa dela rodando no VOS, e a demonstração é um passeio pelos módulos com
dúvidas ao vivo. Seria a mesma sobrepromessa que a página já tinha e que foi corrigida. O CTA
segue `Agendar demonstração`.

## Preço — fonte e lacuna

Valores e itens saem só do `PRECOS_VOS_ATUAL.png`.

✅ **Taxa de implantação (19/08):** decisão do Orlando é **não publicar** — é assunto da call. Por
isso o eyebrow é `quanto custa`, e não "sem surpresa na demonstração": a página não promete
transparência total de preço.

🔴 **Lacuna aberta:** a lista do Scale está **cortada** no print — "PDV" é o último item legível.
Pode haver item que a LP não está mostrando.

⚠️ **Divergência com o produto (registrada, não corrigida aqui):** `plan-limits.ts` do
`vertex-saas` diz `scale.maxUsers: 10` e `starter.maxAutomations: 3`; a LP vende 15 usuários e 10
automações. O Orlando confirmou que o print está certo → quem muda é o código, no repo do Gui.

## Selo "Mais escolhido" no Essential — procedência

O card de R$ 497 leva o selo **"Mais escolhido"** e a borda de destaque.

🔎 **Fonte: declaração do Orlando em 19/08/2026.** Ele escolheu explicitamente a opção de selo de
popularidade, ciente de que ela só seria aplicada se fosse verdade. Como dono do dado de vendas do
VOS, a palavra dele é a fonte — é o mesmo critério que a spec usa para tratar o Control como
vencedor ("a informação veio diretamente do dono do projeto").

**Por que isto está escrito aqui:** sem o registro, daqui a algumas semanas o selo vira afirmação
sem lastro aparente e alguém — inclusive eu, numa auditoria futura — vai classificá-lo como
fabricado. Foi exatamente o que aconteceu com os 15 depoimentos.

Se a popularidade mudar, o selo sai: ele é afirmação sobre comportamento de compra, não decoração.
