# Matriz de Challengers

Masters em `D:\VIDEO-FACTORY\output\vos\challengers\` · gerador em
`D:\VIDEO-FACTORY\jobs\vos\challengers\gerar-challengers.mjs` · manifesto em
`_manifesto.json`. **Nenhum arquivo do Control foi tocado.**

Cada conceito saiu em **9:16 (1080×1920)** e **4:5 (1440×1800)** — dimensões conferidas
uma a uma com `sharp`: 16/16 corretas.

| # | Arquivo (sem sufixo de formato) | Big Idea | Lead type | Headline | CTA | Prova visual | O que mudou vs Control |
|---|---|---|---|---|---|---|---|
| 01 | `vos-01-bridge-mechanism` | A — bridge | Solução | Atendimento automático **é só o começo.** | Ver como funciona | card de módulos | headline avança a promessa; DNA visual intacto |
| 02 | `vos-02-bridge-control-family` | A — bridge | Solução | idem | Saiba mais | card de módulos | só a headline muda; CTA do Control preservado |
| 03 | `vos-03-memoria-kinetic` | B — memória | Problema | Se alguém precisa lembrar do próximo passo, **o processo é essa pessoa.** | Ver como funciona | checklist com 1 item feito e 4 pendentes | novo ângulo: dependência de pessoa |
| 04 | `vos-04-memoria-diagnostico` | B — memória | Problema | Quantas dessas etapas dependem de alguém **lembrar?** | Fazer o diagnóstico | checklist | vira pergunta diagnóstica |
| 05 | `vos-05-espaco-flow` | C — fragmentação | Problema | O problema não é falta de ferramenta. **É o espaço entre elas.** | Ver como funciona | cadeia com os vãos nomeados | nomeia o inimigo |
| 06 | `vos-06-espaco-diagrama` | C — fragmentação | Problema | Suas ferramentas não conversam. **Você é o cabo.** | Agendar demonstração | cadeia | mesma ideia, corte mais duro |
| 07 | `vos-07-doze-abas` | 12 abas | Problema | Doze abas abertas para fechar **uma venda.** | Ver numa tela só | 12 chips de aba | storytelling de tela |
| 08 | `vos-08-jegue-ferrari` | VoC | — | — | — | — | 🔴 **BLOQUEADO** |
| 09 | `vos-09-control-dna-cta-forte` | A | Solução | headline **do Control, intacta** | Ver minha empresa no VOS | card de módulos | única variável: o CTA |

## 🔴 Bloqueio do #08 — quote real ausente

A spec manda o conceito "Jegue contra Ferrari" usar **apenas a quote real** do cliente. Essa
frase não existe em nenhuma fonte disponível: não está na pasta de referência de criativos,
nem nos documentos do projeto, nem na LP. Escrever uma versão plausível seria inventar
depoimento — o que a spec proíbe e o que já é o defeito que estamos corrigindo na LP.

**Para destravar:** o Orlando cola a frase exata e diz de quem é (nome + negócio), ou
autoriza usar sem atribuição.

## Conceitos pensados para movimento — o que ficou pendente

Os #01, #03, #05 e #07 foram desenhados como vídeo (mechanism, kinetic, motion flow, screen
storytelling). Entregues como **master estático** de cada um, que já é veiculável.

O que falta para virarem vídeo, e por que não saiu agora:
- O Remotion do `VIDEO-FACTORY/engine` está pronto, mas a `biblioteca/vos/` é **footage real
  do Orlando falando** (41 takes), não componentes de marca — não há peça de motion do VOS
  para reaproveitar. Cada vídeo exige composição nova.
- **Locução está bloqueada**: ElevenLabs é exclusivo do projeto UAU. Sem VO aprovada, ou o
  vídeo é mudo com legenda queimada (padrão do b-roll atual da LP), ou usa um take real da
  biblioteca — e aí a copy passa a ser a fala existente, não a Big Idea nova.

Decisão para o Orlando: vídeo mudo com legenda, ou take real do acervo?

## Três-second test (aplicado nos 16 masters)

Em 3 segundos fica claro que é VOS (logo + laranja no topo), que é para empresa (vocabulário
de operação: CRM, orçamento, financeiro, nota) e que o produto vai além de chatbot (o card de
módulos ou a cadeia). O contexto de WhatsApp aparece explícito nos #01, #02, #05, #06, #09.
Nos #03, #04 e #07 ele fica na sub — são conceitos de problema, e forçar WhatsApp na headline
mataria a Rule of One.
