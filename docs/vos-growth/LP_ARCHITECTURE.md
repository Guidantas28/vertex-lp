# Arquitetura da /lp — rodada 2 (reescrita)

A rodada 1 enxertou seções na página velha e falhou: o hero continuou vendendo "a maneira
mais fácil de … em um só lugar" enquanto a seção seguinte dizia "o problema não é falta de
ferramenta". Duas promessas na mesma página, e a segunda refutando a primeira.

Esta rodada refez a mensagem. A /lp continua **documento autônomo** (decisão do Orlando):
nada de componente da home importado.

## As 10 seções, como ficaram

| # | Seção | O que entrega | Reaproveita |
|---|---|---|---|
| 1 | Hero | H1 `Atendimento automático é só o começo.` · eyebrow `para empresas que vivem de WhatsApp` (DNA do Control) · lead com a ponte `do primeiro "oi" ao dinheiro no caixa` | selo Meta Business Partner + fileira de integrações |
| 2 | Problema | `O problema está entre uma etapa e outra.` + a corrente WhatsApp → CRM → Orçamento → Financeiro, com o **vão** como protagonista visual | — |
| 3 | Mechanism | `No VOS, uma ação puxa a próxima.` + faixa causal de 6 elos numerados, inteira também no celular | — |
| 4 | Product proof | `O VOS não junta apenas ferramentas. Ele conecta o que acontece entre elas.` + **3 telas reais** do produto | `public/assets/product/*.webp` |
| 5 | Provas vivas | os 3 motores animados (fluxo, inbox, caixa) | `#flow`, `#chatTrack`, `#caixa*` intactos |
| 6 | Do primeiro oi ao caixa | `Uma conversa. Um caminho inteiro.` — copy de continuidade, não lista de features | bloco de vídeo (`#player`, `#vid`) |
| 8 | Preços | value stack antes do número; 3 planos vindos do array `PLANOS` do frontmatter | — |
| 9 | Objeções | as 6 objeções centrais da spec | — |
| 10 | Fecho | `Uma ação puxa a próxima.` · `Veja como a sua empresa funcionaria no VOS.` | barra sticky |

## As correções que a auditoria independente cobrou

1. **Message match quebrava antes do render.** `<title>`, `meta description` e OG ainda
   vendiam a promessa antiga. Trocados.
2. **Section 4 era mockup fabricado.** A spec proíbe dashboard fictício — e existiam **12
   telas reais** exportadas do app em `public/assets/product/`. Agora são reais.
3. **Mecanismo era carrossel no mobile**, com o elemento que amarra os cards só acima de
   900px. A faixa causal agora aparece inteira em qualquer largura.
4. **Hierarquia invertida no problema:** o vão (o argumento) estava no menor e mais apagado
   tipo da seção; o nome da ferramenta (contexto) estava em branco forte. Invertido.
5. **Preço duplicado à mão.** Agora sai de `PLANOS` no frontmatter — fonte única, como a
   spec §8 exige.
6. **Seções presas na coluna de 540px.** Passam a usar o breakout
   `min(1060px, calc(100% - 48px))` a partir de 900px, o mesmo do `.feats-track`.
7. **Cinco CTAs laranja idênticos.** Os dos planos viraram secundários (contorno).
8. **Seções sem acabamento** — zero keyframes contra 8 no resto da página. Agora usam o
   motor `.reveal`, que existia no CSS e **nenhum elemento usava**.

## Uma decisão contra a spec, de propósito

A spec sugere testar o CTA `Ver minha empresa no VOS`. **Não foi usado.** Ele promete que a
pessoa sai da call com a empresa dela rodando no VOS, e a demonstração é um passeio pelos
módulos com dúvidas ao vivo. Seria a mesma sobrepromessa que a página já tinha na linha de
atrito e que foi corrigida. O CTA segue `Agendar demonstração`.

## Preço — fonte e lacuna

Valores e itens saem só do `PRECOS_VOS_ATUAL.png`.

✅ **Taxa de implantação (19/08):** decisão do Orlando é **não publicar** — é assunto da
call. Por isso o eyebrow é `quanto custa`, e não "sem surpresa na demonstração": a página
não promete transparência total de preço.

🔴 **Lacuna aberta:** a lista do Scale está **cortada** no print — "PDV" é o último item
legível. Pode haver item que a LP não está mostrando.

⚠️ **Divergência com o produto (registrada, não corrigida aqui):** `plan-limits.ts` do
`vertex-saas` diz `scale.maxUsers: 10` e `starter.maxAutomations: 3`; a LP vende 15 usuários
e 10 automações. O Orlando confirmou que o print está certo → quem muda é o código, no repo
do Gui.


## Selo "Mais escolhido" no Essential — procedência

O card de R$ 497 leva o selo **"Mais escolhido"** e a borda de destaque.

🔎 **Fonte: declaração do Orlando em 19/08/2026.** Ele escolheu explicitamente a opção de
selo de popularidade, ciente de que ela só seria aplicada se fosse verdade. Como dono do
dado de vendas do VOS, a palavra dele é a fonte — é o mesmo critério que a spec usa para
tratar o Control como vencedor ("a informação veio diretamente do dono do projeto").

**Por que isto está escrito aqui:** sem o registro, daqui a algumas semanas o selo vira
afirmação sem lastro aparente e alguém — inclusive eu, numa auditoria futura — vai
classificá-lo como fabricado. Foi exatamente o que aconteceu com os 15 depoimentos.

Se a popularidade mudar, o selo sai: ele é afirmação sobre comportamento de compra, não
decoração.
