# Procedência das respostas do FAQ

**Fonte de todas as sete: entrevista com o Orlando Favaretto em 19/08/2026**, nesta sessão de
trabalho. Ele respondeu pergunta a pergunta; a ideia central é dele. O que eu fiz foi
edição — português, fluidez e o passe do Big Black Book —, sem acrescentar fato que ele não
tenha dito.

Este documento existe porque a 3ª revisão adversarial marcou essas respostas como "claim
comercial sem lastro". Sem o registro, ela estava certa em marcar: não havia como um revisor
saber que o dono da empresa era a fonte. É o mesmo critério que a própria spec usa para
tratar o Control como vencedor — *"a informação veio diretamente do dono do projeto"*.

---

## O que ele disse, e o que foi publicado

| # | Pergunta | O que o Orlando afirmou | O que foi publicado |
|---|---|---|---|
| 1 | Já tenho outro sistema | "o VOS é totalmente compatível com qualquer data, conseguimos trazer todos os seus dados… todos os nossos clientes sem exceção fizemos isso… é totalmente modular, pode desligar os módulos que não usar e também utilizar com outros sistemas" | "traz os seus dados" (tirei o **"qualquer"**, que é absoluto) + modular + convivência |
| 2 | Vou precisar parar a operação | "quem faz a implementação é o próprio time do VOS… entregamos o sistema completo com a sua data e toda a sua operação já funcionando" · prazo: **"pedimos até 7 dias mas entregamos antes na maioria das vezes"** | idêntico, com o prazo |
| 3 | Equipe não acostumada | "criamos um grupo de suporte com todos os nossos clientes… em menos de 5 minutos já vai ter alguém para te socorrer… o sistema é bem fácil de entender" | grupo + **"em menos de 5 minutos"** (ele escolheu o número literal depois de eu alertar que vira compromisso público) · troquei "é fácil de entender" por "quem usa WhatsApp usa o VOS" — autoelogio vira demonstração |
| 4 | WhatsApp que já usamos | "o número que você usa é conectado, não precisa de número novo · o histórico de conversas é preservado e entra no VOS com seus contatos e conversas · o celular continua funcionando normalmente" · e: "integração de API não oficial e de API oficial, somos parceiros do Meta/WhatsApp" | as três primeiras + **só a API oficial**. Deixei a não oficial de fora: ela viola os termos do WhatsApp e levanta um medo que a pergunta não tinha |
| 5 | Empresa pequena | "foi pensado para todo tipo de público… quem leva vantagem são as pequenas e médias… um sistema completo por um preço bem abaixo do mercado" · sustenta a comparação com **GoHighLevel, ManyChat, Kommo, Helena e Unichat** | mantida a comparação ("por um valor bem abaixo do que ela paga") · **sem citar os concorrentes** — a spec manda não atacar concorrente específico; o inimigo é a fragmentação |
| 6 | Todos os módulos de uma vez | primeiro disse "não é cobrado por módulo, você tem todos independente do plano" · confrontado com a tabela, **confirmou a opção B**: os módulos operacionais vêm em qualquer plano, mas catálogo digital, nota fiscal, relatórios e PDV são mesmo exclusivos dos planos de cima | escrita para bater com a tabela: "não paga por módulo" + o que muda é tamanho e alguns recursos |
| 7 | O que a IA faz | 1ª resposta: "a IA mais robusta do mercado, totalmente humanizada, infinitas possibilidades" · 2ª, concreta: "chega mensagem do tráfego → responde em menos de 5 min → qualifica → envia orçamento → fecha a venda → link de pagamento → nota fiscal" · e para em: **"desconto fora da tabela, reclamação, pedido que não está no catálogo"** | **a cadeia concreta + a fronteira**. Os três superlativos da 1ª resposta saíram: comparação sem prova, abstração e adjetivo não verificável — os três o CUB Review corta |

---

## O que eu retirei, e por quê

| Retirado | Motivo |
|---|---|
| "compatível com qualquer data" | "qualquer" é absoluto; um caso esquisito vira promessa quebrada |
| "a IA mais robusta do mercado" | comparação sem prova ao lado |
| "infinitas possibilidades" | abstração — não responde o que a IA faz |
| "totalmente humanizada" | adjetivo não verificável |
| "API não oficial" | viola os termos do WhatsApp; levanta medo que a pergunta não tinha |
| nomes dos concorrentes | a spec proíbe atacar concorrente específico |
| "o sistema é fácil de entender" | autoelogio; virou demonstração |

---

## 🔴 Aberto — precisa de confirmação técnica

**Resposta 4 — histórico de conversas pela API oficial.** A resposta publicada afirma, juntas,
duas coisas: que o histórico de conversas entra no VOS **e** que a conexão é pela API oficial
da Meta. A 3ª revisão levantou que migrar um número para a Cloud API oficial normalmente
**não** traz o histórico — ele fica no aparelho/app de origem.

O Orlando afirmou que traz. Duas leituras possíveis:
- se o histórico vem no caminho **oficial**, a frase está certa e é um diferencial forte;
- se vem só no caminho **não oficial**, a frase precisa separar as duas coisas.

**Confirmar com o Guilherme antes de publicar.** É a única afirmação do FAQ cuja mecânica eu
não consigo verificar no código deste repo — a conexão de canal é do lado do SaaS.
