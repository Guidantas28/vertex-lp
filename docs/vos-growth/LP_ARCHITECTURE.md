# Arquitetura da /lp

> Estado de **20/08/2026, 03h** — depois de a CENA virar **uma peça só** (commit `c6206d6`), com a
> trilha de módulos no topo, o roteiro do próprio VOS e **sem botão de pausar**. Este documento já
> descreveu uma página que não existia três vezes; sempre porque o código andou e ele não. Se a
> página mudar de novo, esta é a primeira coisa a atualizar.

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
| 2 | Problema / Core Complex | 🔴 **em aberto** | a CENA mostra a solução, não o problema. Ninguém nomeia a dor antes dela |
| 3 | Mechanism | ✅ **demonstrado** | a CENA: 14 mensagens do "oi" à nota fiscal, e o painel dos 7 módulos acendendo na ordem dos eventos. O mecanismo é **visto**, não afirmado |
| 4 | Product proof | ⚠️ uma tela, não três | `hero-tela` com `/assets/hero/dashboard.webp` — tela real do produto, não mockup |
| 5 | IA | ⤳ vive no FAQ | resposta 6, `O que a IA faz, na prática?` |
| 6 | Do primeiro oi ao caixa | ✅ **literalmente** | é o roteiro da CENA, do primeiro "oi" à NF-e — mais o bloco de vídeo "Conheça o VOS" |
| 7 | Proof / clientes | ⚠️ **sem prova de cliente** | a esteira dos 15 depoimentos fictícios **saiu** (`3da2a6f`). A página deixou de contrariar a spec de frente; o que ficou no lugar é prova **demonstrativa**, não prova de cliente |
| 8 | Preços | ✅ | value stack antes do número; 3 planos vindos do array `PLANOS` do frontmatter |
| 9 | Objeções | ✅ | 7 itens, cobrindo as 6 objeções centrais da spec |
| 10 | Fecho | ✅ | `uma ação puxa a próxima` · `Agora veja isso acontecendo na sua empresa.` |

Fora da grade da spec, mas na página: barra fixa e **botão flutuante de WhatsApp** com balão
dispensável (`Prefere sem formulário? Chama no WhatsApp.`). Desde o `0447816` o botão leva o
**rosto do Orlando** — avatar de 34px (32 no mobile) com selo de WhatsApp de 16px — no lugar do
glifo verde. O ponto de status `.zap-on` saiu junto: com o selo verde virava um segundo ponto
verde ao lado do primeiro.

## A CENA, e o que ela fechou

A CADEIA saiu em 19/08 e levou junto as seções **S2, S3 e S6**, que ela cobria.
Em 20/08 entrou a **CENA** (`e045dfa`) — e este trecho registra o que ela fecha, o que ela não
fecha, e por quê. É o mesmo lugar onde antes morava a justificativa da CADEIA: quando o objeto
muda, o registro muda com ele, senão vira arqueologia.

**O que a CENA é.** Um vídeo de 30,4 s, embutido na seção, em **uma peça só** (972×1458). No topo,
uma trilha com os 7 módulos; embaixo, o aparelho com a tela em largura cheia e uma conversa
completa — 14 mensagens, do primeiro "oi" até a nota fiscal, passando por orçamento em PDF, link de
pagamento e confirmação. Cada etapa acende o módulo correspondente. Fonte em
`D:\VIDEO-FACTORY` (`VosLpCena`, commits `f545473` e `8698380`).

O corte deitado que existia até 20/08 **morreu por geometria**, não por gosto: nele o aparelho já
ocupava 1072 dos 1200 px de altura, então o painel lateral de 760 px não dava espaço à tela — só
aumentava o vazio dos lados. Com o quadro estreito, uma peça serve os dois destinos, e a tela da
conversa dobra de largura.

**Quem vende na cena é o próprio VOS.** A fala do plano sai da tabela de preços desta mesma página
(o array `PLANOS`): Scale = 15 usuários, 20 canais. O valor do link é R$ 797,00, que é o preço do
Scale. Nada de "implantação inclusa", que não existe em plano nenhum — e "entrega" virou "call de
ativação", porque software não é entregue.

🔴 **A CENA não tem controle de pausar, e isso reprova em WCAG 2.2.2 nível A.** A página tinha
acabado de passar a cumprir esse critério, quando a esteira de depoimentos saiu. Movimento que
começa sozinho, passa de 5 s e divide a tela com texto exige um mecanismo de pausar; sem o botão
não existe mecanismo. Foi oferecida a saída que dava o mesmo visual sem o custo — botão invisível,
voltando no hover e no Tab — e ele escolheu tirar de vez, para a peça ler como GIF. **É escolha do
dono, com o custo na mesa**, e está escrita também no `lp.astro` e no `lp.css`. A única atenuação
que sobra é o `prefers-reduced-motion`, que não dispara o autoplay.

**S3 (Mechanism) — fechada, e por demonstração.** A spec pede que os cards *"pareçam uma única
história causal"*. A CENA não *parece*: ela **é** a história, em ordem, com causa e efeito visíveis
lado a lado. A base classifica isso como prova **Demonstrative**, um dos quatro tipos que Ford
lista, e registra a hierarquia: *"demonstrar > mostrar terceiro > afirmar — o criativo que demonstra
vence o que afirma, porque o espectador não precisa acreditar; ele vê"*.

**S6 (Do primeiro oi ao caixa) — fechada literalmente.** O nome da seção é o roteiro da peça. Mais
o bloco de vídeo "Conheça o VOS", que já existia.

**S7 (Proof) — parou de contrariar a spec.** Os 15 depoimentos fictícios saíram (`3da2a6f`). A
página **não tem mais prova fabricada** — que era a única coisa que ela fazia contra a spec de
frente. O que não tem é prova de **cliente**: a CENA prova o mecanismo, não que alguém comprou.
Isso não se resolve com redação; resolve com cliente real citável. Continua na mesa dele.

**S2 (Problema) — continua aberta, e é a única.** A CENA mostra a solução funcionando; ela não
nomeia a dor de quem ainda não tem o VOS. O bloco de problema saiu na remoção de 19/08 e nada
ocupou o lugar. É a decisão pendente: escrever de novo o problema antes da CENA, ou assumir que a
página entra pela solução — o que é uma escolha legítima para público de consciência alta, mas
precisa estar escrita, e não acontecer por omissão.

**S4 (Product proof) fica com uma tela real, não três.** A spec proíbe dashboard fictício; não
exige quantidade. A tela que ficou é exportada do app. É economia de prova, e é escolha — não
esquecimento. *(Independe da CENA; segue valendo.)*

**S5 (IA) vive na resposta 6 do FAQ.** A própria spec manda que *"a IA não deve carregar a Big
Idea principal"* e que ela entre como mecanismo/proof. A resposta do FAQ cobre as quatro perguntas
que a spec exige. Seção própria daria à IA um peso que a spec justamente nega.
*(Independe da CENA; segue valendo.)*

### O placar hoje

| situação | seções |
|---|---|
| ✅ cumpridas | S1, **S3**, **S6**, S8, S9, S10 |
| ⤳ cumpridas fora da grade, com justificativa | S4 (uma tela), S5 (no FAQ) |
| ⚠️ sem prova de cliente, mas sem prova fabricada | S7 |
| 🔴 **em aberto** | **S2 (Problema)** — a única |

Para comparar com o que este documento dizia há três horas: era `4 ✅ · 2 fora da grade · 3
reabertas · 1 em dívida de frente`. A CENA fechou duas das três reabertas e a remoção da esteira
tirou a dívida frontal.

### A copy da seção, e por que ela mudou junto

A CENA não entrou embaixo da copy antiga. A anterior — *"Sua empresa continua andando sem depender
de alguém lembrar do próximo passo"* — falhava em três testes: não tinha promessa falsificável
(não existe resultado que prove que "continua andando" não aconteceu), não tinha mecanismo, e
reprovava no teste **título × CTA**, porque contava uma ideia diferente da que a peça mostra. Duas
ideias na mesma seção não somam; o leitor escolhe a mais fraca.

A copy de hoje diz o que a CENA mostra, com os mesmos substantivos:

> **o que ele vê / o que você vê**
> Do lado dele, é só uma conversa no WhatsApp. **Do seu, saiu orçamento, pedido e nota fiscal.**

⚠️ **Uma trava de redação que não se mexe:** a copy diz **"saiu"**, nunca **"saiu sozinho"**. A
claim do criativo vencedor é *"tudo na mesma tela"* — e essa é verdadeira independentemente de qual
botão do produto é automático e qual precisa de alguém. Trocar por "sem ninguém encostar" mudaria
a natureza do que está sendo afirmado.

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
