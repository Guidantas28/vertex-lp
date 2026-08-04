# VOS — Blueprint de Landing Page de Classe Mundial

> O Sistema Operacional da Sua Empresa. Tudo o que sua empresa precisa para vender, operar, atender clientes e crescer — em um único lugar.

Este documento é a fonte da verdade para designers, desenvolvedores e copywriters. Cada seção segue o mesmo template de 9 partes. A narrativa segue 16 passos psicológicos. O produto é apresentado como **transformação** (uma empresa organizada), nunca como uma lista de módulos.

## Princípios transversais

- **Posicionamento:** nunca vender módulos, sempre vender transformação. O cliente compra uma empresa organizada.
- **Tom:** vivo, humano, específico. Nada corporativo, nada de banco de imagem.
- **Referências visuais:** Apple + Stripe + Linear + Notion + HubSpot + Framer, com personalidade própria.
- **Ritmo de fundo:** um `MotionBg` claro, fixo e contínuo atrás de tudo (sensação de infinito). O escuro só aparece como pontuação proposital em **Dor**, **Segurança** e **CTA Final**.
- **Princípios de conversão usados:** Social Proof, Authority, Commitment & Consistency, Scarcity (com moderação), Loss Aversion, Future Pacing, Curiosity, Specificity, Visual Hierarchy, Storytelling.
- **Regra de UX:** toda seção termina criando curiosidade e empurrando o scroll pra próxima.
- **Motion:** elegante, nunca exagerado. Sempre com fallback `prefers-reduced-motion`.

### Template de cada seção (9 partes)

1. Objetivo psicológico
2. Estrutura visual + hierarquia
3. Copy sugerida (PT-BR, pronta)
4. Componentes de UI
5. Tipo de animação / microinteração
6. Prova social ideal
7. CTA recomendado
8. Razão estratégica
9. Princípio de conversão aplicado

---

# Parte A — Os 16 passos

## 1. Atenção — Hero

1. **Objetivo psicológico:** parar o scroll em 3 segundos e fazer o visitante entender, num golpe, que existe UM sistema pra empresa inteira.
2. **Estrutura/hierarquia:** eyebrow curta → H1 gigante → subheadline → CTA primário + nota de risco zero → faixa de prova social (avatares + número) → mockup gigante do produto com indicadores vivos. Fundo premium com orbs + grid em perspectiva.
3. **Copy sugerida:**
   - Eyebrow: `O sistema operacional da sua empresa`
   - H1: `Toda a sua empresa em um sistema só.`
   - Sub: `Do primeiro "oi" no WhatsApp ao dinheiro na conta. Prospect, CRM, atendimento, contratos, vendas, projetos e financeiro — conectados e funcionando sozinhos.`
   - CTA: `Começar grátis` · nota: `Grátis para testar. Sem cartão.`
   - Prova: `+8.000 negócios brasileiros já rodam no VOS`
4. **Componentes:** Nav fixa frosted; janela de produto (`prodwin`) com abas que trocam de cena (motion app via iframe); chips de notificação flutuantes (lead novo, PIX recebido); KPIs com count-up.
5. **Animação:** reveal escalonado; abas auto-avançam; mensagens/leads entrando; KPIs contando ao entrar na viewport; mockup com leve parallax.
6. **Prova social:** avatares reais + contador de empresas; selo "★★★★★".
7. **CTA:** `Começar grátis` (primário) + scroll cue.
8. **Razão estratégica:** define a categoria ("OS de empresa") e a promessa central antes de qualquer objeção.
9. **Princípio:** Specificity + Authority + Visual Hierarchy.

## 2. Dor

1. **Objetivo:** gerar tensão — reconhecer o caos de tocar a empresa em ferramentas soltas.
2. **Estrutura:** fundo escuro (vale do funil); H2 + lead; nuvem de "frustrações" flutuando; linha de fechamento que nomeia a perda.
3. **Copy:**
   - Eyebrow: `A real do dia a dia`
   - H2: `Tocar a empresa virou um quebra-cabeça de ferramentas que não conversam.`
   - Chips: "Cadê o pedido do WhatsApp?", "Esqueci de cobrar o cliente", "A planilha tá desatualizada", "Vendi sem ter no estoque", "A NF-e ficou pra depois", "Sete sistemas, nenhum conversa".
   - Fecho: `No fim do dia, o tempo que era pra crescer vira só apagar incêndio.`
4. **Componentes:** chips flutuantes com ponto de alerta pulsando; `MotionBg` escuro com tom de tensão (vermelho).
5. **Animação:** float suave + jitter; pontos vermelhos piscando.
6. **Prova social:** nenhuma aqui (momento de espelho, não de prova).
7. **CTA:** nenhum explícito — só curiosidade ("e se desse pra resolver isso?").
8. **Razão estratégica:** Loss Aversion — antes de mostrar a solução, intensificar o custo de continuar como está.
9. **Princípio:** Loss Aversion + Storytelling (o "antes").

## 3. Identificação

1. **Objetivo:** o visitante se ver na página ("isso sou eu / é o meu negócio").
2. **Estrutura:** H2 curto + grade de personas/segmentos com 1 frase de dor específica cada; cada card "acende" ao passar o mouse.
3. **Copy:**
   - Eyebrow: `Talvez você se reconheça`
   - H2: `Não importa o que você vende. O caos é o mesmo.`
   - Personas: Comércio ("Estoque furado e venda perdida"), Serviços ("Orçamento que some no e-mail"), Saúde & Beleza ("Agenda com furo e no-show"), Auto & Oficina ("Peça, serviço e nota em três lugares"), Escritórios ("Time digitando a mesma coisa 3x"), B2B ("Lead caro que esfria sem follow-up").
4. **Componentes:** cards com ícone + foto humana de contexto (`ctx-*`); chip de dor.
5. **Animação:** reveal escalonado; hover acende a cor do segmento.
6. **Prova social:** fotos humanas reais (contexto), não stock.
7. **CTA:** `É o meu caso →` (rola pra Solução).
8. **Razão estratégica:** Commitment & Consistency — quem se identifica continua engajado.
9. **Princípio:** Identification + Specificity.

## 4. Solução

1. **Objetivo:** o alívio — revelar o VOS como o sistema operacional que conecta tudo.
2. **Estrutura:** vira a chave do escuro (Dor) pra luz; H2 grande + lead de future pacing + 3 "outcomes" (menos caos, mais tempo, mais vendas).
3. **Copy:**
   - Eyebrow: `E se fosse diferente?`
   - H2: `Imagina tudo isso funcionando sozinho — num só lugar.`
   - Lead: `Do primeiro "oi" no WhatsApp até o dinheiro na conta: uma venda já movimenta estoque, financeiro, nota fiscal e a sua equipe. Sem você lembrar de nada.`
   - Fecho: `É exatamente isso que o VOS faz.`
4. **Componentes:** 3 outcome-cards com ícone; glow superior suave.
5. **Animação:** reveal; cards com lift no hover.
6. **Prova social:** opcional — "+8.000 empresas já vivem assim".
7. **CTA:** `Ver como funciona →`.
8. **Razão estratégica:** Future Pacing — projeta o futuro desejado logo após a dor.
9. **Princípio:** Future Pacing + Contrast (antes→depois).

## 5. Benefícios

1. **Objetivo:** traduzir a solução em ganhos do dia a dia (benefícios, não funcionalidades).
2. **Estrutura:** H2 + grade de cards coloridos (gradiente, texto branco) + card destaque de IA copiloto.
3. **Copy:**
   - Eyebrow: `Como o VOS te ajuda`
   - H2: `Menos tempo no operacional. Mais tempo no que faz crescer.`
   - Cards: "Tudo num sistema só", "Cada ação movimenta tudo", "Decisões com dados reais", "Menos erro, menos retrabalho", "Cresce no seu ritmo".
4. **Componentes:** `.cardc` (gradiente por cor de tema); card IA com mini-chat.
5. **Animação:** hover-lift; chat com mensagens escalonadas + typing.
6. **Prova social:** sutil — parede de provas ao fundo (opcional).
7. **CTA:** implícito (continua descendo).
8. **Razão estratégica:** benefícios elevam o desejo antes de detalhar módulos.
9. **Princípio:** Visual Hierarchy + Specificity.

## 6. Como funciona

1. **Objetivo:** explicar o mecanismo de forma simples e crível.
2. **Estrutura:** intro de 3 passos (Centralize → Automatize → Cresça) + visual do "ecossistema" (tudo cai dentro do VOS).
3. **Copy:**
   - Eyebrow: `O ecossistema`
   - H2: `Tudo cai dentro do VOS.`
   - 3 passos: `1. Centralize` (clientes, conversas, vendas), `2. Automatize` (o operacional roda sozinho), `3. Cresça` (decida com dados).
4. **Componentes:** ilustração viva (chips de módulo caindo no núcleo) + 3 step-cards.
5. **Animação:** módulos caindo no core com ripple; linhas conectando.
6. **Prova social:** —
7. **CTA:** `Ver em ação →` (leva à Demonstração).
8. **Razão estratégica:** reduz a complexidade percebida ("parece difícil de migrar").
9. **Princípio:** Clarity + Authority.

## 7. Demonstração

1. **Objetivo:** ver é crer — mostrar o produto funcionando de verdade.
2. **Estrutura:** scroll-storytelling com cenas reais (motion app) + viewer de features do Core + vídeo de 1 minuto.
3. **Copy:**
   - Eyebrow: `Veja em ação`
   - H2: `O VOS em 1 minuto.`
   - Lead: `Do lead no WhatsApp à nota emitida — sem trocar de aba.`
4. **Componentes:** `SolutionsScroll` (sticky), `CoreViewer` (screenshots reais), player de vídeo (`vos-video.mp4`).
5. **Animação:** sticky scroll; crossfade de telas; cenas animadas; play com ripple.
6. **Prova social:** screenshots reais do produto.
7. **CTA:** `Assistir agora` / `Testar grátis`.
8. **Razão estratégica:** prova de produto antes do preço.
9. **Princípio:** Show, don't tell + Authority.

## 8. Módulos (9) + AI Copilot

1. **Objetivo:** mostrar a amplitude (substitui muitos sistemas) sem cansar — cada módulo como mini-landing.
2. **Estrutura:** explorador interativo — lista vertical dos 9 módulos à esquerda; à direita mockup/cena + tagline + benefícios + "substitui X" + CTA. Encerrar com o spotlight do **AI Copilot**.
3. **Copy:** ver Parte B (um bloco por módulo).
4. **Componentes:** módulo-explorer (island), janela de produto, badges "substitui", chips de benefício.
5. **Animação:** troca suave de cena ao selecionar; barra de progresso no item ativo; entrada dos benefícios.
6. **Prova social:** mockups reais + 1 micro-depoimento por módulo (futuro).
7. **CTA por módulo:** `Ativar [Módulo]` / `Ver [Módulo]`.
8. **Razão estratégica:** percepção de valor altíssimo ("cada módulo já é um produto").
9. **Princípio:** Specificity + Anchoring (valor empilhado).

## 9. Integrações / Substitui

1. **Objetivo:** matar a objeção "já uso outras ferramentas" e empilhar valor (substitui tudo).
2. **Estrutura:** mapa de substituição (ferramenta conhecida → módulo VOS), culminando em "Tudo isso → VOS"; faixa de conectores (API, Webhooks, n8n, Zapier).
3. **Copy:**
   - Eyebrow: `Um no lugar de muitos`
   - H2: `Tudo o que você já paga, num sistema só.`
   - Mapa: Apollo → Prospect · HubSpot → CRM · WhatsApp Business → WhatsApp · DocuSign → Contracts · Jobber → Services · Shopify → Commerce · ClickUp → Projects · Xero → Finance · **Tudo isso → VOS**.
   - Conectores: `E conecta com o que você quiser: API, webhooks, n8n e Zapier.`
4. **Componentes:** linhas "de→para" animadas; hub central VOS; logos/chips de ferramentas.
5. **Animação:** energia fluindo das ferramentas pro núcleo; contagem "de 8 assinaturas → 1".
6. **Prova social:** logos reconhecíveis (representativos).
7. **CTA:** `Substituir minhas ferramentas →`.
8. **Razão estratégica:** Anchoring + Loss Aversion (você já paga por tudo isso, espalhado).
9. **Princípio:** Anchoring + Authority.

## 10. Casos de uso

1. **Objetivo:** o visitante encontra o cenário exato dele.
2. **Estrutura:** tabs por segmento; cada tab = pitch + benefícios + features + depoimento humanizado (foto + estrelas).
3. **Copy:** segmentos Comércio, Serviços, Saúde & Beleza, Auto & Oficina, Escritórios (ver `SEGMENTS`).
4. **Componentes:** tabs (island), painel temático por cor, figura de depoimento.
5. **Animação:** transição de painel; entrada de bullets.
6. **Prova social:** depoimento real por segmento (★★★★★).
7. **CTA:** `Usar esta solução`.
8. **Razão estratégica:** relevância personalizada aumenta conversão.
9. **Princípio:** Identification + Social Proof.

## 11. Comparação

1. **Objetivo:** facilitar a decisão racional (custo e dor evitada).
2. **Estrutura:** "antes & depois" (checklist) + calculadora de stack (pague por um, não por sete) com totais animados.
3. **Copy:**
   - Eyebrow: `Faça as contas`
   - H2: `Pague por um, não por sete.`
   - Antes/Depois (ver `VS_TOOLS`).
4. **Componentes:** duas colunas (antigo/VOS), contadores de economia.
5. **Animação:** count-up de R$ economizados ao entrar na viewport.
6. **Prova social:** preços médios de mercado citados.
7. **CTA:** `Quanto eu economizo →` / `Ver preços`.
8. **Razão estratégica:** justificativa racional logo antes do preço.
9. **Princípio:** Anchoring + Loss Aversion + Specificity.

## 12. Provas

1. **Objetivo:** construir confiança com várias camadas.
2. **Estrutura:** faixa de números (count-up) → grade de depoimentos humanos (+ vídeo) → marquee de clientes → faixa humana (foto grande).
3. **Copy:**
   - Números: `+8.000 empresas`, `+30M de mensagens`, `R$ 2,4 bi movimentados`, `★★★★★ 4,9/5`.
   - Eyebrow depoimentos: `Quem já vive isso`
4. **Componentes:** Stats band; cards de depoimento (foto, nome, negócio, estrelas); player de vídeo-depoimento; marquee; faixa humana.
5. **Animação:** números contando; cards revelando; marquee infinito.
6. **Prova social:** ESTE é o bloco — depoimentos, números, logos, cases.
7. **CTA:** `Ver planos →`.
8. **Razão estratégica:** confiança imediatamente antes de preço.
9. **Princípio:** Social Proof + Authority + Specificity.

## 13. Segurança

1. **Objetivo:** remover medo (dados, validade jurídica, conformidade).
2. **Estrutura:** fundo escuro sóbrio; cards de segurança + selos.
3. **Copy:**
   - Eyebrow: `Segurança & conformidade`
   - H2: `Seus dados seguros. Suas assinaturas válidas.`
   - Cards: LGPD, ICP-Brasil (MP 2.200-2, OTP, trilha de auditoria, hash SHA-256), Hospedagem no Brasil, Backups e criptografia, NF-e/PIX nativos.
4. **Componentes:** cards com ícone (escudo, cadeado, doc), selos/badges.
5. **Animação:** reveal discreto; escudo com leve brilho.
6. **Prova social:** selos de conformidade; menção a infraestrutura.
7. **CTA:** `Ver planos →`.
8. **Razão estratégica:** elimina objeção crítica B2B antes do preço.
9. **Princípio:** Authority + Risk Reduction.

## 14. Preço + Garantia

1. **Objetivo:** apresentar preço com âncora clara e risco zero.
2. **Estrutura:** 3 planos (destaque no do meio) + bloco de garantia (reversão de risco) logo abaixo.
3. **Copy:**
   - Eyebrow: `Preços` · H2: `Simples e modular.`
   - Planos: Solo R$199, Equipe R$499 (Mais popular), Completo R$699.
   - Garantia: 7 dias grátis, sem cartão, cancele quando quiser, migração assistida, suporte humano PT-BR, LGPD.
4. **Componentes:** cards de plano; selo de garantia (escudo girando) + grade de garantias.
5. **Animação:** plano destacado elevado; selo girando.
6. **Prova social:** "+8.000 empresas confiam"; "sem fidelidade".
7. **CTA:** `Começar grátis` em cada plano.
8. **Razão estratégica:** preço só depois de valor + prova + segurança; garantia reduz fricção final.
9. **Princípio:** Anchoring + Commitment + Risk Reversal.

## 15. FAQ

1. **Objetivo:** responder as últimas objeções.
2. **Estrutura:** acordeão de perguntas frequentes (ampliar p/ os 9 módulos, migração, suporte, segurança).
3. **Copy:** ver `FAQ` (ampliar: "Funciona pro meu segmento?", "Quanto tempo pra migrar?", "Preciso de todos os módulos?", "É seguro?", "Tem fidelidade?").
4. **Componentes:** `<details>` nativo com ícone girando.
5. **Animação:** expand/collapse suave; "+" → "x".
6. **Prova social:** —
7. **CTA:** `Ainda com dúvida? Fale com a gente`.
8. **Razão estratégica:** remove as últimas barreiras antes do CTA final.
9. **Princípio:** Objection Handling.

## 16. CTA Final

1. **Objetivo:** converter quem chegou até aqui.
2. **Estrutura:** faixa escura com glow; headline emocional + 2 CTAs (criar conta / falar com vendas).
3. **Copy:**
   - H2: `Pronto para ter a empresa inteira num lugar só?`
   - Body: `Comece hoje, sem cartão. Em minutos você já está vendendo, atendendo e organizando tudo no VOS.`
   - CTAs: `Começar agora` · `Falar com vendas`.
4. **Componentes:** card slate com glow; botões.
5. **Animação:** glow pulsante leve; botão magnético.
6. **Prova social:** repetir "+8.000 empresas · ★★★★★ · sem cartão".
7. **CTA:** `Começar agora`.
8. **Razão estratégica:** fecho emocional + reforço de risco zero.
9. **Princípio:** Commitment + Urgency (moderada).

---

# Parte B — Os 9 módulos (mini-landings)

Template curto por módulo: tagline · descrição · benefícios · substitui · ativo visual · CTA.

## 1. Prospect — `Nunca mais procure clientes.`
- **Descrição:** encontra empresas reais automaticamente (Google, diretórios e outras fontes), envia pro CRM e você já começa a vender.
- **Benefícios:** Busca inteligente · Leads qualificados · Importação automática · Enriquecimento de dados · Distribuição pra vendedores.
- **Substitui:** Apollo / Listas frias.
- **Visual:** GAP de asset — interim com `core-crm-funil`/`operacoes-funnel`; ideal: cena de motion "leads entrando".
- **CTA:** `Encher minha pipeline →`.

## 2. CRM — `Nunca perca uma oportunidade.`
- **Descrição:** todo lead, cliente e negociação organizados num lugar só.
- **Benefícios:** Pipeline · Follow-ups · Atividades · Agenda · E-mails · Chamadas · Histórico completo.
- **Substitui:** HubSpot / Pipedrive.
- **Visual:** cena `crm` + `core-crm`/`core-crm-funil`.
- **CTA:** `Organizar minhas vendas →`.

## 3. WhatsApp — `Transforme conversas em vendas.`
- **Descrição:** WhatsApp conectado ao CRM, com IA respondendo.
- **Benefícios:** Múltiplos atendentes · Fluxos automáticos · IA respondendo · Templates · Campanhas · Etiquetas · Chat interno.
- **Substitui:** WhatsApp Business / chatbots avulsos.
- **Visual:** cena `whatsapp` + `core-whatsapp`.
- **CTA:** `Vender pelo WhatsApp →`.

## 4. Contracts — `Feche negócios em minutos.`
- **Descrição:** contratos digitais com assinatura legalmente válida.
- **Benefícios:** Assinatura eletrônica · Templates · Automação · Histórico · Status em tempo real.
- **Substitui:** DocuSign / Clicksign.
- **Visual:** cena `documentos` + `core-documentos`.
- **CTA:** `Assinar mais rápido →`.

## 5. Services — `Controle toda a sua operação.`
- **Descrição:** inspirado no Jobber, integrado ao resto.
- **Benefícios:** Quotes · Jobs · Schedule · Dispatch · Técnicos · Checklists · Fotos · Relatórios · Pagamentos.
- **Substitui:** Jobber.
- **Visual:** cena `os` + `services-*`.
- **CTA:** `Gerenciar serviços →`.

## 6. Commerce — `Venda qualquer produto.`
- **Descrição:** e-commerce + loja física totalmente integrados.
- **Benefícios:** Loja virtual · Estoque · Checkout · Pedidos · Frete · Integrações.
- **Substitui:** Shopify.
- **Visual:** cenas `catalogo/pedidos/pdv` + `commerce-*`.
- **CTA:** `Montar minha loja →`.

## 7. Projects — `Sua equipe sempre alinhada.`
- **Descrição:** o que hoje fica espalhado em Trello/Asana/ClickUp.
- **Benefícios:** Kanban · Gantt · Sprint · Subtarefas · Comentários · Aprovações.
- **Substitui:** ClickUp / Trello / Asana.
- **Visual:** cena `tasks` + `core-tarefas`.
- **CTA:** `Alinhar meu time →`.

## 8. Finance — `Saiba exatamente quanto sua empresa ganha.`
- **Descrição:** controle financeiro completo.
- **Benefícios:** Contas a pagar/receber · Fluxo de caixa · DRE · Conciliação · Faturas · Assinaturas.
- **Substitui:** Xero / Conta Azul.
- **Visual:** cena `notas` + `finance-*`.
- **CTA:** `Controlar meu caixa →`.

## 9. AI Copilot — `Seu funcionário mais inteligente.`
- **Descrição:** não é chatbot, é um funcionário virtual integrado à empresa toda.
- **Faz:** responde clientes · cria propostas · cobra pagamentos · organiza tarefas · resume reuniões · analisa indicadores · sugere decisões · cria automações · responde WhatsApp · acha documentos.
- **Substitui:** trabalho manual repetitivo.
- **Visual:** `ai-copiloto` + grade de tarefas + chat mock.
- **CTA:** `Conhecer o copiloto →`.

---

# Parte C — Sistema de design e implementação

- **Tokens:** `src/styles/global.css` (`--bg`, `--ink*`, `--accent`, `--line`, `--m-*`, `.reveal`, `[data-count]`, `.btn-primary`).
- **Cores de módulo (9):** prospect, crm, whatsapp, contracts, services, commerce, projects, finance, ai — paleta coesa em `MODULE_COLOR`.
- **Dados:** centralizar em `src/data/content.ts` (`MODULES`, copy das seções novas). `PRICING` mantido (modo híbrido).
- **Fundo:** `MotionBg` fixo claro contínuo; escuro só em Dor/Segurança/CTA.
- **Humanização:** `assets/people/social-*`, `ctx-*`, `hero.webp`, `video/vos-video.mp4`. Trocar depoimentos/números ilustrativos por reais antes de publicar.
- **Acessibilidade/performance:** `prefers-reduced-motion`, lazy em imagens, iframes de cena com `loading`.

## Gaps conhecidos
1. **Prospect** não tem mockup/cena — criar visual dedicado (motion "leads entrando").
2. **Depoimentos e números** são ilustrativos — substituir por dados reais (sem prova social fabricada).
3. **Copy de preços** ainda cita Core/Commerce/Services — reconciliar com os 9 módulos numa etapa posterior (modo híbrido).
