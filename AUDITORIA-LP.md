# Auditoria da Landing Page · VOS

> **Objeto:** `index.html` (landing de anúncio), servida em `localhost:3251`, não publicada.
> **Produto:** plataforma de comunicação que centraliza WhatsApp e Instagram, automatiza o atendimento e leva a conversa até venda, agenda, estoque e nota fiscal.
> **Público:** dono de pequena e média empresa brasileira que vende conversando (clínica, estética, oficina, loja, prestador de serviço).
> **Ação que a página precisa gerar:** agendar uma demonstração.
> **Biblioteca usada:** 11 obras + `FRAMEWORKS.md` (69 frameworks destilados).

---

## Frameworks que se aplicam a esta LP

1. **Language/Market Fit (Hacking Growth)** — a página é 100% mensagem; é o framework central.
2. **Pesquisa Must-Have, 40% (Hacking Growth)** — define se o gargalo é mensagem ou produto. Ainda não rodável: base pequena.
3. **ICE (Hacking Growth)** — prioriza as correções abaixo.
4. **Regra dos 50% (Traction)** — metade produto, metade tração. A página está inteira do lado do produto.
5. **Vanity vs. actionable (Lean Analytics)** — nada aqui é medido hoje, nem vaidade.
6. **Linha na areia / OMTM (Lean Analytics)** — não existe número-alvo definido antes de publicar.
7. **Aversão à perda, ancoragem, efeito halo, substituição de pergunta (Kahneman)** — os quatro estão ociosos na página.
8. **Poder estatístico e OEC (Kohavi, Tang & Xu)** — determinam que A/B aqui é inviável hoje.
9. **Árvore de Métricas** — o nó "conversão da página" está literalmente quebrado (CTA sem destino).

---

## 1. Clareza da proposta de valor · **6/10**

**O que sustenta a nota:** o sub entrega a cadeia inteira em uma frase e é o melhor ativo da página. A headline, porém, não fixa uma promessa.

**Certo hoje**
- O eyebrow "São 22h e o cliente chamou" é cena concreta, não abstração.
- O sub nomeia cinco etapas encadeadas: "vira orçamento, vira venda, baixa do estoque, avisa o cliente e ainda gera nota fiscal".

**Errado / faltando**
- A headline gira entre três palavras: `CONVERSAR` · `VENDER` · `GERENCIAR`. Em 8 segundos o visitante leva **uma** delas embora, e são três promessas diferentes. Quem cair no ciclo errado lê "Alguém precisa GERENCIAR" e não entende que o produto atende WhatsApp.
- O sub abre com o concorrente: *"A maioria das ferramentas para na conversa."* A primeira linha de texto corrido é gasta falando de quem não é você.

**Correção**
Fixar uma promessa na headline e usar a rotação como reforço, não como promessa. Abrir o sub pelo estado do leitor, não pelo mercado.

**Evidência** — Ellis & Brown, *Hacking Growth*: "o language/market fit, que consiste em apresentar as vantagens do produto com uma mensagem que cative o público-alvo". *Aplica-se porque* uma promessa que muda a cada 2,2s não é "uma mensagem", são três.

---

## 2. Language/Market Fit · **5/10**

**O que sustenta a nota:** metade da página fala como o dono fala; a outra metade fala como a empresa fala.

**Certo hoje**
- "São 22h e o cliente chamou", "sem cartão", "sem instalar nada", "de madrugada" são vocabulário de dono.

**Errado / faltando**
- *"Inteligência artificial que possui o conhecimento real da sua empresa"* — nenhum dono de clínica fala "possui conhecimento real". É jargão de fornecedor.
- Os três verbos da pincelada (`conversar/vender/gerenciar`) são a **espinha interna da marca VOS**, não a fala do cliente. Ele diz **responder, orçar, agendar**.
- O vocabulário nunca foi minerado: foi escrito por nós. Na varredura de mercado que rodamos, as palavras reais de quem compra esta categoria foram outras: "difícil de configurar", "o suporte não responde", "paguei sem conseguir usar".

**Correção**
Trocar os três verbos pelos do cliente. Quando houver base ativa, rodar a pesquisa must-have e escrever a copy com as respostas, não com nossa síntese.

**Evidência** — Ellis & Brown, *Hacking Growth*: "A expressão 'language/market fit' foi criada por James Currier para indicar se o texto usado para descrever e vender um produto faz sentido para os potenciais usuários". *Aplica-se porque* a régua não é se a frase é bonita, é se ela é a frase dele.

---

## 3. Estrutura de conversão · **2/10**

**O que sustenta a nota:** a página é bem construída e não pode converter ninguém.

**Certo hoje**
- Hierarquia visual limpa, CTA repetido em três pontos, barra fixa que some quando o CTA real aparece, linha de fricção logo abaixo do botão.

**Errado / faltando**
- **A seção `#agendar` não existe no documento.** Os quatro links (`href="#agendar"`) apontam para um id ausente. Clicar não faz nada. A conversão não está baixa: ela é estruturalmente impossível.
- Não há formulário, e o CSS de formulário está no arquivo há semanas sem markup correspondente.
- Não há via de baixa fricção. Pedimos "agendar demonstração" a um público que vive no WhatsApp e não oferecemos WhatsApp.

**Correção**
Criar `#agendar` com dois campos (nome + WhatsApp), botão, e um "Chamar no WhatsApp" ao lado como segunda via.

**Evidência** — Weinberg & Mares, *Traction*: "gaste 50 por cento do seu tempo no produto e 50 por cento na traction". *Aplica-se porque* a página está com 100% do esforço no produto (quatro mockups vivos, vídeo, animação) e 0% no caminho que gera o cliente.

---

## 4. Prova e credibilidade · **2/10**

**Certo hoje**
- Selo Meta Business Partner e sete integrações oficiais no hero.
- Os quatro cards **demonstram** em vez de afirmar, e o vídeo é o fundador falando com o rosto na câmera.

**Errado / faltando**
- Zero cliente citado, zero número de uso, zero depoimento real. O bloco de depoimentos está em rascunho declarado ("Nome do cliente · Negócio · Cidade") e se marca sozinho como tal.
- **Nenhuma reversão de risco.** A objeção nº 1 desta categoria, levantada na varredura de mercado, é "comprei e não consegui usar". A página não responde isso em lugar nenhum.

**Correção**
Três depoimentos reais acima do CTA final. Enquanto não houver, substituir por reversão de risco explícita: quem configura, em quanto tempo, e o que acontece se não rodar.

**Evidência** — Kahneman, *Rápido e Devagar*: "Perdas assomam como maiores do que ganhos." *Aplica-se porque* o comprador não está pesando o ganho da automação, está pesando a perda de pagar e não conseguir usar. Garantia neutraliza exatamente esse termo.

---

## 5. Gatilhos comportamentais e vieses · **4/10**

**Certo hoje**
- A cena das 22h ativa julgamento rápido sem exigir raciocínio.
- A linha de fricção ("15 minutos, sem cartão e sem instalar nada") reduz esforço percebido.

**Errado / faltando**
- **Ancoragem: ausente.** Com a saída do bloco de preço, não existe nenhum número na página. Não há âncora para o custo da demo, do plano, nem do problema.
- **Aversão à perda: ausente.** Toda a copy é de ganho ("vai atender melhor", "roda sozinho"). Em nenhum momento a página diz o que o dono **perde hoje** deixando conversa dormir.
- **Substituição de pergunta: desperdiçada.** O bloco imediatamente anterior ao CTA final é o de depoimentos em rascunho. O último estímulo antes do botão é um placeholder.

**Correção**
Uma linha de enquadramento de perda no hero ou logo antes do CTA. Prova real imediatamente antes do botão, nunca depois.

**Evidência** — Kahneman, *Rápido e Devagar*: "Ele acontece quando as pessoas consideram um valor particular para uma quantidade desconhecida antes de estimar essa quantidade" (efeito de ancoragem). *Aplica-se porque* sem nenhum número na página, o visitante ancora no preço que ele imaginar — geralmente o do concorrente que ele já viu.

---

## 6. Mensuração · **0/10**

**O que sustenta a nota:** a página não tem uma única linha de instrumentação.

**Errado / faltando**
- Sem GA4, sem pixel do Meta, sem CAPI, sem tag manager. O único `<script>` do arquivo é o das animações e do carrossel.
- Nenhum evento: não se sabe quem rolou até o vídeo, quem deu play, quem clicou em qual dos três CTAs, quem chegou ao fim.
- Sem instrumentação, **nenhuma das outras seis dimensões desta auditoria pode ser validada** — inclusive as notas que eu dei, que são julgamento contra literatura, não contra dado.

**Correção**
Antes de publicar: pixel + CAPI, e eventos nomeados para `view_hero`, `scroll_50`, `video_play`, `video_50`, `cta_click` (com o id de qual CTA) e `lead_submit`.

**Evidência** — Croll & Yoskovitz, *Lean Analytics*: "As métricas de vaidade podem fazer você se sentir bem, mas não mudam como você age." *Aplica-se ao contrário e é pior:* aqui não existe nem métrica de vaidade. Não há como agir diferente porque não há sinal nenhum.

---

## 7. Prontidão para experimentação · **0/10**

**O que sustenta a nota:** não há tráfego, não há conversão, não há ferramenta.

**Errado / faltando**
- A página nunca foi publicada. O repositório está vazio no GitHub e não há domínio apontado.
- Conversões por mês hoje: **zero**, e não por desempenho — por ausência de destino no CTA.
- Rodar A/B agora produziria vencedores inventados.

**Correção**
Ordem obrigatória: instrumentar → publicar → gerar volume → só então testar. Até haver volume, usar métodos qualitativos (teste de 5 segundos, 5 usuários navegando com você olhando), que não exigem poder estatístico.

**Evidência** — Kohavi, Tang & Xu, *Trustworthy Online Controlled Experiments*: "O poder estatístico é a probabilidade de detectar uma diferença significativa entre as variantes quando realmente existe uma." *Aplica-se porque* com zero conversões o poder é zero: qualquer diferença observada seria ruído.

---

## NOTA GERAL: **3,2 / 10**

### Pesos e por quê

| Dimensão | Nota | Peso | Contribuição |
|---|---|---|---|
| Estrutura de conversão | 2 | **25%** | 0,50 |
| Clareza da proposta | 6 | **20%** | 1,20 |
| Language/Market Fit | 5 | **15%** | 0,75 |
| Prova e credibilidade | 2 | **15%** | 0,30 |
| Gatilhos comportamentais | 4 | **10%** | 0,40 |
| Mensuração | 0 | **10%** | 0,00 |
| Prontidão p/ experimentação | 0 | **5%** | 0,00 |
| **Total** | | **100%** | **3,15 → 3,2** |

**Justificativa dos pesos:** o trabalho desta página é **uma ação única** (agendar). Por isso Estrutura pesa mais que tudo: é o único bloco que, sozinho, zera o resultado independente da qualidade do resto. Clareza vem em segundo porque é o que decide se a pessoa continua na página. Mensuração e Experimentação recebem peso baixo **nesta fase** não por serem menos importantes, mas porque são pré-condições de aprendizado futuro, não de conversão no lançamento; num segundo ciclo, esses pesos sobem.

**Leitura honesta da nota:** a página está visualmente acima da média do mercado e **estruturalmente quebrada**. Sem o `#agendar`, a conversão real hoje é 0% e nenhuma das notas de copy importa.

---

## Top 5 correções priorizadas por ICE

| # | Correção | I | C | F | **ICE** |
|---|---|---|---|---|---|
| 1 | Criar a seção `#agendar` (nome + WhatsApp + botão) e um "Chamar no WhatsApp" como segunda via | 10 | 10 | 7 | **9,0** |
| 2 | Instrumentar antes de publicar: pixel + CAPI + os 6 eventos nomeados | 8 | 10 | 8 | **8,7** |
| 3 | Fixar uma promessa na headline e trocar os verbos por responder/orçar/agendar | 7 | 6 | 9 | **7,3** |
| 4 | Reversão de risco explícita ("configuramos com você na call") perto de cada CTA | 8 | 7 | 5 | **6,7** |
| 5 | Três depoimentos reais imediatamente acima do CTA final | 7 | 8 | 4 | **6,3** |

Confiança de #3 é 6 (não 9) porque é hipótese de copy sem VoC próprio. Facilidade de #4 é 5 e de #5 é 4 porque dependem de decisão de negócio e de cliente existente, não de código.

**Evidência do método** — Ellis & Brown, *Hacking Growth*: "Embora usemos o sistema ICE, a comunidade de growth hacking já" [propôs variantes]. Impacto, Confiança e Facilidade de 0 a 10, nota = média simples.

---

## 3 hipóteses de teste A/B

> **Nenhuma pode rodar hoje.** Ficam como backlog para depois de instrumentar e publicar. Régua: enquanto houver menos de ~100 conversões/mês, não rode A/B — decida por método qualitativo.

**T1 · CTA de valor vs. CTA de ação**
- **O que muda:** "Agendar demonstração" → "Ver funcionando no meu negócio".
- **Hipótese:** um rótulo que declara o que a pessoa **recebe**, em primeira pessoa, reduz a fricção percebida do compromisso, então mais visitantes iniciam o agendamento.
- **Métrica que decide (OEC):** agendamentos concluídos ÷ visitantes. **Não** clique no botão — clique sobe fácil e engana.
- **Guardrail:** taxa de comparecimento na call (um CTA leve demais pode trazer curioso).

**T2 · WhatsApp como segunda via**
- **O que muda:** adicionar "Chamar no WhatsApp" ao lado do formulário (só o B tem).
- **Hipótese:** o público já domina o WhatsApp e não domina formulário de agendamento; oferecer o canal nativo dele aumenta o total de leads sem canibalizar o formulário.
- **Métrica que decide:** leads totais (formulário + WhatsApp) ÷ visitantes.
- **Guardrail:** qualidade do lead (show-rate e taxa de fechamento por origem).

**T3 · Enquadramento de perda vs. ganho no sub**
- **O que muda:** sub atual (ganho) vs. sub em perda, do tipo "toda conversa que dorme sem resposta é um cliente comprando de outro amanhã".
- **Hipótese:** perda pesa mais que ganho equivalente, então o quadro de perda aumenta a motivação de agir agora.
- **Métrica que decide:** agendamentos ÷ visitantes.
- **Guardrail:** taxa de rejeição e scroll até o vídeo (quadro de perda mal calibrado afasta).
- **Evidência** — Kahneman, *Rápido e Devagar*: "Perdas assomam como maiores do que ganhos."

---

## Verificação

**1. Citações usadas: 9, de 6 obras diferentes** (mínimo exigido: 4).

| # | Obra | Autor | Trecho citado | Localização verificada |
|---|---|---|---|---|
| 1 | Hacking Growth | Ellis & Brown | "o language/market fit, que consiste em apresentar as vantagens do produto com uma mensagem que cative o público-alvo" | linha 799 |
| 2 | Hacking Growth | Ellis & Brown | "A expressão 'language/market fit' foi criada por James Currier…" | linha 802 |
| 3 | Hacking Growth | Ellis & Brown | "Embora usemos o sistema ICE…" | linha 715 |
| 4 | Traction | Weinberg & Mares | "gaste 50 por cento do seu tempo no produto e 50 por cento na traction" | linha 344 |
| 5 | Rápido e Devagar | Kahneman | "Perdas assomam como maiores do que ganhos." | linhas 1947 e 2062 |
| 6 | Rápido e Devagar | Kahneman | efeito de ancoragem: "quando as pessoas consideram um valor particular para uma quantidade desconhecida antes de estimar essa quantidade" | linha 846 |
| 7 | Lean Analytics | Croll & Yoskovitz | "As métricas de vaidade podem fazer você se sentir bem, mas não mudam como você age." | linha 391 |
| 8 | A-B Testing | Kohavi, Tang & Xu | "O poder estatístico é a probabilidade de detectar uma diferença significativa entre as variantes quando realmente existe uma" | linha 1172 |
| 9 | Storytelling com Dados | Knaflic | "temos de 3 a 8 segundos com nosso público, durante os quais ele decide se vai continuar a ver o que colocamos" | linha 759 |

Cada uma foi localizada por busca no texto integral antes de entrar aqui.

**Nota de processo:** a citação 9 quase saiu por erro meu. Na primeira busca eu truncei a linha em 280 caracteres e a frase estava depois do corte, então concluí que não existia. A conferência final, feita com contagem em vez de leitura truncada, mostrou que existe. Fica o registro de que a checagem pegou um falso negativo meu, não do texto.

A citação 9 reforça a **Dimensão 1**: a régua de 3 a 8 segundos é exatamente a janela em que a headline rotativa entrega uma promessa diferente a cada visitante.

**2. Números citados e origem**
- **40%** da pesquisa must-have → Hacking Growth, linha 375 (verificado).
- **50/50** da regra de tração → Traction, linha 344 (verificado).
- **~100 conversões/mês** como piso para A/B → régua do pipeline de CRO da sua própria biblioteca de skills, não das 11 obras. Marcado como tal.
- **Zero tráfego, zero conversão, zero instrumentação** → fatos do seu projeto, verificados no `index.html` e no estado do repositório.
- Nenhum outro número foi usado. Não há benchmark de conversão de mercado nesta auditoria porque não encontrei um nas obras que se aplicasse a este modelo.

**3. As 7 dimensões** têm nota, o que sustenta, o que está certo, o que falta com o trecho específico da página, correção acionável e evidência com autor e obra. ✔

**4. Marcações de inferência**
- Os **pesos** da nota geral são meus. [inferência minha, não está nos livros]
- A recomendação de **WhatsApp como segunda via** vem da varredura de mercado que fizemos e do comportamento do público brasileiro. [inferência minha, não está nos livros]
- A ordem "instrumentar → publicar → volume → testar" é dedução direta do capítulo de poder estatístico, mas a formulação é minha. [inferência minha, não está nos livros]

---

## O que preciso de você para fechar a auditoria

Três lacunas que não dá para supor:

1. **Verba e meta de tráfego do lançamento.** Sem isso não dá para dizer quando haverá volume para A/B, nem para traçar a linha na areia da OMTM.
2. **Você banca uma garantia?** A correção #4 é a que ataca a objeção nº 1 da categoria, mas é decisão de negócio, não de página.
3. **Existe algum cliente ativo hoje, mesmo que um?** Um depoimento real vale mais que os nove do rascunho, e destrava a correção #5.
