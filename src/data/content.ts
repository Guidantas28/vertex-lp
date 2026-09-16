// Conteúdo da LP VOS (PT-BR), centralizado pra facilitar edição da copy.
// Direção: "Um sistema. Os módulos que você escolher." (Brand Manual v2, light-first)

export const SITE = {
  /* A CTA do site cai no ONBOARDING do produto (founder 15/09: "coloca o link
     de onboarding em todas as CTA"). É a porta única: a pessoa cria a conta e
     já entra nos passos, sem tela de cadastro no meio. `PUBLIC_SIGNUP_URL`
     segue mandando . é por ela que o dev aponta pra 3001. */
  signupUrl: import.meta.env.PUBLIC_SIGNUP_URL ?? "https://app.voshq.com/onboarding",
  appUrl: "app.voshq.com",
};

export const CTA = {
  /* "Teste grátis" (founder 15/09): o que a pessoa ganha no clique, não o que
     ela tem que fazer. Caixa de frase, como todo rótulo do VOS. */
  label: "Teste grátis",
};

export const NAV_LINKS = [
  { href: "/#top", label: "Conheça o VOS" },
  { href: "/#segmentos", label: "Soluções" },
  { href: "/#solucoes", label: "Funcionalidades" },
  { href: "/#economia", label: "Economia" },
  { href: "/precos", label: "Preços" },
];

// Acento único (VOS UNO, founder 30/07 e 27/08): cor por módulo morreu.
// As chaves ficam por compatibilidade e resolvem pro sinal; só o Zé é violeta.
export const MODULE_COLOR = {
  core: "#ED4B00",
  commerce: "#ED4B00",
  services: "#ED4B00",
  finance: "#ED4B00",
  ai: "#6D4AFF",
} as const;

export const HERO = {
  pill: "Monte seu sistema",
  titleA: "Um sistema.",
  titleB: "Os módulos que",
  titleAccent: "você escolher.",
  checklist: [
    { lead: "Economize.", rest: "Um Core poderoso já incluso, pague só pelo módulo que usar." },
    { lead: "Cresça no seu ritmo.", rest: "Ative Commerce, Services e Financeiro com um clique." },
    { lead: "Tudo conectado.", rest: "Do WhatsApp ao caixa, num só lugar, fácil de usar." },
  ],
  cta: CTA.label,
};

// Itens do "construtor" do hero, Core travado (sempre on), demais ativáveis.
// `shot` aponta pro screenshot real exibido na janela de produto.
export const BUILDER = [
  { id: "core", name: "Core", color: MODULE_COLOR.core, locked: true, shot: "/assets/product/core-dashboard.webp" },
  { id: "commerce", name: "Commerce", color: MODULE_COLOR.commerce, shot: "/assets/product/commerce-catalogo.webp" },
  { id: "services", name: "Services", color: MODULE_COLOR.services, shot: "/assets/product/services-ordens.webp" },
  { id: "financeiro", name: "Financeiro", color: MODULE_COLOR.finance, shot: "/assets/product/finance-visao.webp" },
  { id: "ia", name: "IA", color: MODULE_COLOR.ai, shot: "/assets/product/ai-copiloto.webp" },
];

export const CORE_CHIPS = ["Dashboard", "WhatsApp", "CRM", "Assinaturas", "Tarefas"];

// Fluxo de ponta a ponta da empresa (hero): Vendas → Automações → Administrativo → Operações → Financeiro
// `frame` aponta pra cena animada (motion CSS) em /public/hero-motion/<frame>.html
export const FLOW_STAGES = [
  { id: "comercial", label: "Comercial", color: "#ED4B00", icon: "funnel", frame: "crm", caption: "O lead cai no CRM, percorre o funil e vira venda, com contrato assinado na hora." },
  { id: "atendimento", label: "Atendimento", color: "#ED4B00", icon: "whats", frame: "whatsapp", caption: "A conversa vira cliente: tag, fase e proposta aceita sem sair do chat." },
  { id: "automacoes", label: "Automações", color: "#ED4B00", icon: "bolt", frame: "automacoes", caption: "Monte o fluxo com agente de IA e veja funcionando ao vivo, na hora." },
  { id: "operacao", label: "Operação", color: "#ED4B00", icon: "box", frame: "operacao", caption: "Serviços, produtos físicos e digitais: a entrega inteira num módulo só." },
  { id: "marketing", label: "Marketing", color: "#ED4B00", icon: "mega", frame: "marketing", caption: "Descreva em uma frase e a IA publica sua página de vendas, com métricas ao vivo." },
  { id: "financeiro", label: "Financeiro", color: "#ED4B00", icon: "wallet", frame: "dashboard", caption: "Dashboard completo: receita, custo, margem, fluxo de caixa e saúde do negócio." },
];

// Conceito modular, pilha de camadas
export const MODULAR = {
  eyebrow: "Como funciona",
  titleA: "Um Core para todos.",
  titleB: "Módulos quando crescer.",
  lead:
    "Toda empresa começa com o Core, o suficiente para vender e atender de verdade. Precisou de loja ou ordens de serviço? Ative um módulo. O Financeiro já vem junto.",
  layers: [
    { id: "core", name: "Core · Sales", color: MODULE_COLOR.core, sub: "Dashboard, WhatsApp, CRM, Assinaturas e Tarefas", tag: "Incluso" },
    { id: "commerce", name: "Commerce", color: MODULE_COLOR.commerce, sub: "Venda de produtos online + loja física", tag: "+ módulo" },
    { id: "services", name: "Services", color: MODULE_COLOR.services, sub: "Cotações, agenda e ordens de serviço", tag: "+ módulo" },
    { id: "finance", name: "Financeiro", color: MODULE_COLOR.finance, sub: "Caixa, contas, nota fiscal e fornecedores", tag: "Sempre junto" },
  ],
  rightEyebrow: "Tudo conectado",
  rightTitle: "Uma coisa puxa a outra, sozinha.",
  rightBody:
    "O lead caiu no WhatsApp, virou contato no CRM com e-mail e automação disparados. Fechou? Vira cliente, gera o pedido ou a ordem de serviço, e o valor entra no fluxo de caixa. Sem planilha, sem retrabalho, sem dez ferramentas.",
  rightChecks: [
    "Um cadastro de cliente para a empresa toda",
    "Cada venda e serviço cai direto no financeiro",
    "Fácil de usar no primeiro dia, sem treinamento",
  ],
};

// Fluxo conectado, 6 nós
export const FLOW = [
  { icon: "whats", name: "WhatsApp", sub: "O lead cai no chat", color: MODULE_COLOR.core },
  { icon: "crm", name: "CRM", sub: "Vira lead + e-mail automático", color: MODULE_COLOR.core },
  { icon: "bolt", name: "Automação", sub: "Follow-up no piloto automático", color: MODULE_COLOR.core },
  { icon: "user", name: "Cliente", sub: "Convertido com 1 clique", color: MODULE_COLOR.core },
  { icon: "commerce", name: "Pedido / OS", sub: "Commerce ou Services", color: MODULE_COLOR.commerce },
  { icon: "finance", name: "Caixa", sub: "Entra no financeiro", color: MODULE_COLOR.finance },
];

// Core features, 6 cards (com screenshot real recortado)
export const CORE_FEATURES = {
  eyebrow: "O Core · incluso em tudo",
  title: "Tudo para vender e atender",
  lead: "O ponto de partida que toda empresa recebe, pronto para usar no primeiro dia.",
  items: [
    { icon: "dash", name: "Dashboard", body: "A saúde do negócio em tempo real: receita, custos, margem e o que precisa de atenção hoje.", shot: "/assets/product/core-dashboard.webp" },
    { icon: "whats", name: "WhatsApp", body: "Atendimento com fluxos automáticos, filtros por tag e ações rápidas para gerar pedido ou orçamento.", shot: "/assets/product/core-whatsapp.webp" },
    { icon: "crm", name: "CRM", body: "Funil visual, contatos, atividades e conversão, do primeiro contato ao negócio fechado.", shot: "/assets/product/core-crm.webp" },
    { icon: "doc", name: "Assinaturas", body: "Envie contratos e propostas para assinatura digital e acompanhe cada etapa.", shot: "/assets/product/core-documentos.webp" },
    { icon: "task", name: "Tarefas", body: "Gestão da equipe como um funil simples: a fazer, em andamento, revisão e concluído.", shot: "/assets/product/core-tarefas.webp" },
    { icon: "finance", name: "Financeiro incluso", body: "Contas a pagar e receber, fluxo de caixa e nota fiscal já vêm com qualquer plano.", shot: "/assets/product/finance-visao.webp", highlight: true },
  ],
};

// Cards de módulo (cross-link pras páginas dedicadas)
export const MODULE_CARDS = {
  eyebrow: "Os módulos",
  title: "Escolha o que faz sentido",
  lead: "Vende produtos? Ative o Commerce. Presta serviços? Ative o Services. Quer os dois? CoreOne libera tudo.",
  items: [
    { id: "commerce", name: "Commerce", color: MODULE_COLOR.commerce, like: "Como a Shopify", body: "Venda de produtos online e na loja física. Catálogo, estoque e ordens em um só lugar.", price: "R$ 499/mês", href: "/commerce", shot: "/assets/product/commerce-catalogo.webp" },
    { id: "services", name: "Services", color: MODULE_COLOR.services, like: "Como o Jobber", body: "Cotações, agendamentos e ordens de serviço com equipes em campo. Do orçamento à execução.", price: "R$ 499/mês", href: "/services", shot: "/assets/product/services-ordens.webp" },
    { id: "financeiro", name: "Financeiro", color: MODULE_COLOR.finance, like: "Incluso em tudo", body: "Fluxo de caixa, contas a pagar e receber, nota fiscal e cadastro de fornecedores e equipe.", price: "Incluso", href: "/financeiro", shot: "/assets/product/finance-fluxo.webp" },
  ],
};

// Pra qualquer empresa
export const WHO_FOR = {
  eyebrow: "Para qualquer empresa",
  title: "Feito pra quem vende, atende e entrega",
  lead: "Comércio, serviços ou os dois juntos, o VOS se molda ao seu negócio, não o contrário.",
  items: [
    { icon: "commerce", name: "Comércio & varejo", body: "Lojas, distribuidoras e e-commerce que precisam de catálogo, estoque e pedidos conectados ao caixa." },
    { icon: "services", name: "Prestadores de serviço", body: "Assistências, instaladores, clínicas e agências com cotações, agenda e ordens de serviço em campo." },
    { icon: "user", name: "Negócios híbridos", body: "Quem vende produto e presta serviço junto, tudo num cadastro de cliente só, sem duplicar nada." },
  ],
};

// Bloco "solução por segmento" (tabs) + depoimento humanizado por segmento.
// NOTA: fotos/depoimentos ilustrativos, trocar por clientes reais antes de publicar.
export const SEGMENTS = {
  eyebrow: "Feito pro seu segmento",
  title: "Uma solução sob medida pra cada tipo de negócio",
  lead: "O VOS cuida da agenda, das vendas, das ordens de serviço e do financeiro do jeito que o seu negócio já trabalha.",
  cta: "Usar esta solução",
  items: [
    {
      id: "comercio",
      icon: "commerce",
      label: "Comércio & Varejo",
      color: "#ED4B00",
      title: "Venda mais rápido sem depender de processos manuais.",
      body: "O VOS conecta seus canais de venda com estoque, produtos, pagamentos e financeiro para transformar uma conversa em uma venda completa.",
      bullets: [
        "Cliente pergunta pelo produto no WhatsApp ou Instagram",
        "A IA consulta disponibilidade de estoque automaticamente",
        "Apresenta produtos, valores e informações para o cliente",
        "Cria o pedido de venda",
        "Atualiza estoque automaticamente",
        "Envia pagamento ou finaliza a venda",
        "Emite nota fiscal quando necessário",
        "Atualiza o financeiro da empresa",
      ],
      features: [
        { icon: "whats", label: "Atendimento no WhatsApp e Instagram" },
        { icon: "box", label: "Estoque consultado e atualizado na hora" },
        { icon: "commerce", label: "Pedido e pagamento na mesma conversa" },
        { icon: "finance", label: "NF-e e financeiro atualizados" },
      ],
      quote: { text: "Uma venda completa acontecendo a partir de uma conversa.", name: "Vanessa Lopes", biz: "Supermercado Bom Dia", photo: "/assets/people/social-17.webp", stars: 5 },
    },
    {
      id: "servicos",
      icon: "services",
      label: "Serviços & Assistência",
      color: "#ED4B00",
      title: "Transforme solicitações em serviços organizados.",
      body: "O VOS entende a necessidade do cliente, verifica disponibilidade e organiza todo o fluxo até a execução.",
      bullets: [
        "Cliente solicita um serviço pelo WhatsApp",
        "A IA entende a necessidade",
        "Consulta agenda e disponibilidade da equipe",
        "Sugere horários automaticamente",
        "Cria agendamento",
        "Envia confirmação para o cliente",
        "Cria tarefas para a equipe",
        "Acompanha execução e pagamento",
      ],
      features: [
        { icon: "whats", label: "Solicitação pelo WhatsApp" },
        { icon: "calendar", label: "Agenda e horários sugeridos" },
        { icon: "task", label: "Tarefas criadas para a equipe" },
        { icon: "finance", label: "Execução e pagamento acompanhados" },
      ],
      quote: { text: "Mais serviços fechados com menos troca de mensagens e trabalho manual.", name: "Marcos Vieira", biz: "Alfa Climatização", photo: "/assets/people/social-22.webp", stars: 5 },
    },
    {
      id: "saude",
      icon: "calendar",
      label: "Saúde & Beleza",
      color: "#ED4B00",
      title: "Mais agendamentos. Menos horários perdidos.",
      body: "O VOS automatiza o relacionamento com clientes desde o primeiro contato até o retorno.",
      bullets: [
        "Cliente pergunta sobre um procedimento",
        "IA responde dúvidas iniciais",
        "Consulta agenda disponível",
        "Oferece horários",
        "Realiza agendamento",
        "Envia lembretes automáticos",
        "Faz campanhas de retorno",
        "Mantém histórico completo do cliente",
      ],
      features: [
        { icon: "whats", label: "Dúvidas respondidas pela IA" },
        { icon: "calendar", label: "Agenda e horários oferecidos" },
        { icon: "crm", label: "Histórico completo do cliente" },
        { icon: "dash", label: "Lembretes e campanhas de retorno" },
      ],
      quote: { text: "Uma experiência personalizada que aumenta agendamentos e recorrência.", name: "Juliana Reis", biz: "Studio Bella", photo: "/assets/people/social-25.webp", stars: 5 },
    },
    {
      id: "auto",
      icon: "services",
      label: "Auto & Oficina",
      color: "#ED4B00",
      title: "Da conversa ao serviço aprovado.",
      body: "O VOS conecta atendimento, orçamento, agenda e operação da oficina.",
      bullets: [
        "Cliente solicita orçamento",
        "IA coleta informações do veículo",
        "Organiza pedido de serviço",
        "Consulta disponibilidade da oficina",
        "Agenda atendimento",
        "Envia orçamento para aprovação",
        "Atualiza cliente sobre andamento",
        "Controla pagamento e histórico",
      ],
      features: [
        { icon: "doc", label: "Orçamento e pedido de serviço" },
        { icon: "calendar", label: "Agenda da oficina" },
        { icon: "crm", label: "Andamento enviado ao cliente" },
        { icon: "finance", label: "Pagamento e histórico controlados" },
      ],
      quote: { text: "Mais controle, menos atrasos e clientes melhor atendidos.", name: "Tiago Moraes", biz: "Oficina Forte", photo: "/assets/people/social-16.webp", stars: 5 },
    },
    {
      id: "escritorio",
      icon: "doc",
      label: "Escritórios & Contábil",
      color: "#ED4B00",
      title: "Clientes atendidos. Processos organizados automaticamente.",
      body: "O VOS transforma conversas em processos organizados para sua equipe.",
      bullets: [
        "Cliente envia uma solicitação",
        "IA identifica o assunto",
        "Consulta informações do cliente",
        "Cria tarefas automaticamente",
        "Solicita documentos necessários",
        "Organiza prazos recorrentes",
        "Envia lembretes",
        "Mantém histórico completo",
      ],
      features: [
        { icon: "crm", label: "Assunto identificado pela IA" },
        { icon: "task", label: "Tarefas e prazos recorrentes" },
        { icon: "doc", label: "Documentos solicitados na hora" },
        { icon: "dash", label: "Histórico completo do cliente" },
      ],
      quote: { text: "Uma operação mais previsível e uma equipe mais produtiva.", name: "André Andrade", biz: "Andrade Contabilidade", photo: "/assets/people/social-15.webp", stars: 5 },
    },
  ],
};

// 1 sistema vs várias ferramentas
export const VS_TOOLS = {
  eyebrow: "Antes & depois",
  title: "Um sistema no lugar de cinco",
  lead: "Pare de pagar (e remendar) ferramentas que não se falam.",
  before: {
    label: "Do jeito antigo",
    rows: [
      "CRM numa ferramenta, tarefas em outra",
      "WhatsApp preso no celular de uma pessoa",
      "Contrato em PDF que vai e volta por e-mail",
      "Planilha de caixa que ninguém atualiza",
      "Nota fiscal num sistema separado",
      "5 mensalidades, zero integração",
    ],
  },
  after: {
    label: "Com o VOS",
    rows: [
      "CRM, tarefas e atendimento no mesmo lugar",
      "Inbox de WhatsApp da equipe, com histórico",
      "Assinatura digital com validade jurídica",
      "Fluxo de caixa que se atualiza sozinho",
      "NF-e nativa, ligada a cada venda",
      "Uma assinatura, tudo conectado",
    ],
  },
};

// Confiança / Brasil
export const TRUST_BR = {
  eyebrow: "Feito no Brasil",
  title: "Robusto onde importa",
  items: [
    { icon: "doc", name: "Assinatura com validade jurídica", body: "MP 2.200-2 / ICP-Brasil: trilha de auditoria, OTP e hash SHA-256 no PDF final." },
    { icon: "finance", name: "NF-e e PIX nativos", body: "Emissão de nota fiscal e cobrança por PIX direto de dentro do sistema." },
    { icon: "bolt", name: "API, webhooks e automações", body: "Conecta com o que você já usa (n8n, Zapier) e automatiza gatilho → ação." },
    { icon: "check", name: "Em português, com suporte", body: "Pensado para o negócio brasileiro, sem tradução, sem gambiarra." },
  ],
};

// Preços: os números do documento "Limites por plano do VOS" (v16, 06/09/2026),
// os mesmos que o catálogo do produto pratica (`PLAN_CATALOG` em
// apps/api/src/billing/plan-limits.ts). O preço de cada ciclo é CRAVADO, não
// calculado: o -30% do anual no Start daria 207,90 e o número do anúncio é 197.
// Mudou preço ou cota lá, muda aqui no mesmo dia.
//
// A página tem dois andares, na leitura de quem compara (founder 15/09, com as
// páginas de preço da Nuvemshop e da Shopify como referência):
// 1. os CARDS dizem o preço e o que destaca cada plano, curtos;
// 2. a TABELA compara linha a linha, com o resto das cotas e dos pacotes.
// O "Ainda tem mais" com o PDV como complemento saiu no mesmo dia: add-on fica
// pra mais pra frente, e até lá o site não vende nenhum.
export const PRICING = {
  lead: "Todos os planos incluem o VOS completo para atender, vender e organizar sua operação. Você escolhe apenas a capacidade ideal para o momento do seu negócio.",
  cycles: [
    { id: "mensal", label: "Mensal", off: 0 },
    { id: "trimestral", label: "Trimestral", off: 10 },
    { id: "anual", label: "Anual", off: 30 },
  ],
  plans: [
    {
      id: "start",
      name: "Start",
      prices: { mensal: 297, trimestral: 267, anual: 197 },
      desc: "Para começar a centralizar a operação e automatizar os primeiros processos.",
      destaques: [
        "2 usuários e 2 canais de atendimento",
        "300 créditos de IA por mês",
        "50 notas fiscais por mês",
        "CRM, agenda, estoque, pedidos e OS",
      ],
      cta: "Começar com o Start",
      featured: false,
    },
    {
      id: "essential",
      name: "Essential",
      prices: { mensal: 497, trimestral: 447, anual: 347 },
      desc: "Para equipes que precisam conectar atendimento, vendas e operação.",
      destaques: [
        "5 usuários e 5 canais de atendimento",
        "1.500 créditos de IA por mês",
        "300 notas fiscais por mês",
        "Catálogo digital e relatórios",
      ],
      cta: "Assinar o Essential",
      featured: true,
      ribbon: "Mais escolhido",
    },
    {
      id: "scale",
      name: "Scale",
      prices: { mensal: 797, trimestral: 717, anual: 557 },
      desc: "Para operações com mais pessoas, canais e volume.",
      destaques: [
        "15 usuários e 20 canais de atendimento",
        "3.000 créditos de IA por mês",
        "600 notas fiscais por mês",
        "200 automações e 50.000 contatos",
      ],
      cta: "Assinar o Scale",
      featured: false,
    },
  ],
  // A tabela: um valor por plano, na ordem Start · Essential · Scale.
  // `true` é incluso, `false` é não incluso, texto é o que se lê na célula.
  comparar: {
    grupos: [
      {
        id: "preco",
        titulo: "Preço por mês",
        icone: "preco",
        linhas: [
          { rotulo: "No mensal", nota: "Só no cartão", valores: ["R$ 297", "R$ 497", "R$ 797"] },
          { rotulo: "No trimestral", nota: "Pix, boleto ou cartão em até 3x", valores: ["R$ 267", "R$ 447", "R$ 717"] },
          { rotulo: "No anual", nota: "Pix, boleto ou cartão em até 12x", valores: ["R$ 197", "R$ 347", "R$ 557"] },
        ],
      },
      {
        id: "equipe",
        titulo: "Equipe e atendimento",
        icone: "equipe",
        linhas: [
          { rotulo: "Usuários incluídos", valores: ["2", "5", "15"] },
          { rotulo: "Canais de atendimento", nota: "WhatsApp, Instagram, Messenger e e-mail", valores: ["2", "5", "20"] },
          { rotulo: "Números no Zé do WhatsApp", valores: ["1", "5", "15"] },
          { rotulo: "Contatos", valores: ["1.000", "10.000", "50.000"] },
        ],
      },
      {
        id: "ia",
        titulo: "IA e automação",
        icone: "ia",
        linhas: [
          { rotulo: "Créditos de IA por mês", valores: ["300", "1.500", "3.000"] },
          { rotulo: "Automações ativas", valores: ["10", "50", "200"] },
          { rotulo: "Mensagens automáticas por mês", valores: ["500", "5.000", "20.000"] },
          { rotulo: "E-mails enviados por mês", valores: ["500", "5.000", "10.000"] },
        ],
      },
      {
        id: "vendas",
        titulo: "Vendas, fiscal e documentos",
        icone: "vendas",
        linhas: [
          { rotulo: "Notas fiscais por mês", nota: "Nunca trava: o que passar vira pacote", valores: ["50", "300", "600"] },
          { rotulo: "Assinaturas digitais por mês", valores: ["10", "30", "200"] },
          { rotulo: "Créditos de Prospect por mês", valores: ["15", "100", "200"] },
          { rotulo: "Armazenamento", valores: ["5 GB", "25 GB", "50 GB"] },
        ],
      },
      {
        id: "modulos",
        titulo: "Módulos",
        icone: "modulos",
        linhas: [
          { rotulo: "Atendimento com todos os canais numa fila", valores: [true, true, true] },
          { rotulo: "CRM e funil de vendas", valores: [true, true, true] },
          { rotulo: "Agenda da equipe", valores: [true, true, true] },
          { rotulo: "Orçamentos e pedidos", valores: [true, true, true] },
          { rotulo: "Estoque", valores: [true, true, true] },
          { rotulo: "Ordens de serviço", valores: [true, true, true] },
          { rotulo: "Contas a pagar e a receber", valores: [true, true, true] },
          { rotulo: "Catálogo digital", valores: [false, true, true] },
          { rotulo: "Relatórios", valores: [false, true, true] },
        ],
      },
      {
        id: "extras",
        titulo: "Pacotes além da cota",
        icone: "extras",
        linhas: [
          { rotulo: "Usuário adicional", valores: ["R$ 39,90/mês", "R$ 39,90/mês", "R$ 39,90/mês"] },
          { rotulo: "Canal de atendimento adicional", valores: ["R$ 39/mês", "R$ 39/mês", "R$ 39/mês"] },
          { rotulo: "100 notas fiscais", valores: ["R$ 39", "R$ 39", "R$ 39"] },
          { rotulo: "1.000 créditos de IA", valores: ["R$ 49", "R$ 49", "R$ 49"] },
          { rotulo: "20 assinaturas digitais", valores: ["R$ 29", "R$ 29", "R$ 29"] },
          { rotulo: "1.000 mensagens automáticas", valores: ["R$ 19", "R$ 19", "R$ 19"] },
          { rotulo: "10 GB de armazenamento", valores: ["R$ 19/mês", "R$ 19/mês", "R$ 19/mês"] },
        ],
      },
    ],
  },
  footnote: "Valores em reais. Mensal só no cartão; trimestral e anual são pagos antes do uso, no Pix, boleto à vista ou cartão parcelado. Acima do Scale, pacotes ou contrato negociado. Cancele quando quiser, sem multa.",
};

export const FAQ = {
  eyebrow: "Dúvidas",
  title: "Perguntas frequentes",
  items: [
    { q: "O que muda entre Start, Essential e Scale?", a: "O sistema é o mesmo nos três: atendimento, CRM, vendas, operação e financeiro. O que muda é a cota do mês: usuários, canais de atendimento, notas fiscais, créditos de IA, automações e armazenamento. Passou da cota, compra pacote sem trocar de plano." },
    { q: "Funciona pro meu tipo de negócio?", a: "Se você vende produtos, presta serviços ou os dois, funciona. O VOS já vem completo pra organizar atendimento, vendas e o caixa num lugar só." },
    { q: "E se eu for só eu, sem equipe?", a: "Funciona igual. Muita gente começa sozinha no Start (2 usuários) pra organizar vendas e caixa, e sobe de plano conforme a equipe e o volume crescem." },
    { q: "Posso criar meus próprios agentes de IA?", a: "Pode, e sem programar. Você monta agentes pra tarefas específicas (cobrança, agendamento, pós-venda) partindo de fluxos pré-prontos: ativa com um clique, ajusta do seu jeito e ele passa a executar sozinho." },
    { q: "Quanto tempo leva pra migrar meus dados?", a: "O cadastro básico (clientes, produtos, catálogo) você mesmo importa em minutos. Pra migração assistida (histórico, contratos, estoque), o time do VOS te ajuda em até 48h, sem custo." },
    { q: "Meus dados são meus? Vocês vendem ou compartilham?", a: "São seus, sempre. Hospedados no Brasil, em conformidade com a LGPD. Não vendemos nem compartilhamos seus dados com terceiros." },
    { q: "A assinatura digital tem validade jurídica?", a: "Sim. A assinatura digital está em todos os planos e segue a MP 2.200-2 (ICP-Brasil), com verificação por OTP, trilha de auditoria e hash SHA-256 selado no PDF final." },
    { q: "Consigo emitir nota fiscal direto pela SEFAZ?", a: "Sim. A emissão de NF-e via SEFAZ está em todos os planos: 50 notas por mês no Start, 300 no Essential e 600 no Scale. A nota nunca trava: cada 100 notas acima da cota entram na fatura como um pacote de R$ 39." },
    { q: "Meu WhatsApp atual continua funcionando?", a: "A comunicação omnichannel é uma inbox compartilhada da equipe, conectada ao CRM. As conversas viram histórico e oportunidade, nada fica preso no celular de uma pessoa." },
    { q: "Tem fidelidade ou multa pra cancelar?", a: "Não. Cancele quando quiser, sem multa e sem burocracia." },
  ],
};

// Vitrine viva de clientes (marquee). NOTA: cenários ilustrativos, trocar por
// membros reais + fotos reais antes de publicar (sem prova social fabricada).
export const SOCIAL = {
  eyebrow: "Quem já montou seu sistema",
  title: "Empresas que escolheram simplificar",
  lead: "Empresas que administram tudo em um único sistema.",
  people: [
    { img: "/assets/people/social-16.webp", name: "Tiago Moraes", biz: "Oficina Forte", city: "Belo Horizonte, MG", badge: "+R$ 32k/mês", tone: "finance", rating: 4.8, text: "Fechei o mês com +R$ 32 mil organizando peça, serviço e nota num lugar só. Antes eram três sistemas e uma planilha." },
    { img: "/assets/people/social-17.webp", name: "Vanessa Lopes", biz: "Supermercado Bom Dia", city: "Curitiba, PR", badge: "Estoque em dia", tone: "commerce", rating: 4.7, text: "Parei de perder venda por falta de controle. O estoque bate com o caixa todo dia, sem conferência no domingo." },
    { img: "/assets/people/social-18.webp", name: "Fernando Reis", biz: "Engefort Engenharia", city: "São Paulo, SP", badge: "Obra no prazo", tone: "services", rating: 4.6, text: "Orçamento vira OS, a equipe vê no celular e o cliente acompanha. Obra atrasada por falta de informação acabou." },
    { img: "/assets/people/social-19.webp", name: "Carla Mendes", biz: "Café Aroma", city: "Porto Alegre, RS", badge: "Caixa no azul", tone: "finance", rating: 4.5, text: "O fluxo de caixa atualiza sozinho a cada venda. Sei exatamente quanto entra e sai antes de fechar o dia." },
    { img: "/assets/people/social-20.webp", name: "Diego Prado", biz: "Prime Elétrica", city: "Recife, PE", badge: "+40% em vendas", tone: "commerce", rating: 4.8, text: "Migrei num fim de semana. Segunda já estava vendendo dentro do VOS e o time não precisou de treinamento longo." },
    { img: "/assets/people/social-12.webp", name: "Patrícia Nunes", biz: "Ello Calçados", city: "Fortaleza, CE", badge: "+38% em vendas", tone: "commerce", rating: 4.7, text: "Catálogo no WhatsApp, pedido automático e estoque baixando sozinho. Vende mais sem contratar ninguém." },
    { img: "/assets/people/social-21.webp", name: "Aline Costa", biz: "Adega Premium", city: "Rio de Janeiro, RJ", badge: "Pedidos em dia", tone: "commerce", rating: 4.6, text: "Pedido, PIX e notificação pro estoque, tudo no automático. O cliente compra de madrugada e eu acordo com tudo organizado." },
    { img: "/assets/people/social-11.webp", name: "Eduardo Pires", biz: "Construla Obras", city: "Brasília, DF", badge: "Orçamento no prazo", tone: "services", rating: 4.8, text: "Orçamento aceito vira OS na hora. Cliente assina digital e a obra já entra na agenda da equipe." },
    { img: "/assets/people/social-22.webp", name: "Marcos Vieira", biz: "Alfa Climatização", city: "Campinas, SP", badge: "Resposta na hora", tone: "services", rating: 4.7, text: "A equipe sai pra rua com tudo no celular. Resposta na hora e nada se perde no caminho entre visita e escritório." },
    { img: "/assets/people/social-14.webp", name: "Sandra Moraes", biz: "Empório Sabor", city: "Salvador, BA", badge: "NF-e em segundos", tone: "finance", rating: 4.5, text: "NF-e sai junto com a venda. Fim de mês sem correria com contador por nota que faltou emitir." },
    { img: "/assets/people/social-23.webp", name: "Letícia Ramos", biz: "Agro Campo Verde", city: "Goiânia, GO", badge: "Menos retrabalho", tone: "services", rating: 4.6, text: "Proposta, contrato e cobrança no mesmo fluxo. Parei de digitar os mesmos dados em três lugares diferentes." },
    { img: "/assets/people/social-13.webp", name: "Renato Alves", biz: "Auto Peças Brasil", city: "Manaus, AM", badge: "Sem ruptura", tone: "commerce", rating: 4.8, text: "Alerta de estoque baixo antes de faltar peça. Cliente não vai embora porque o sistema avisou a tempo." },
    { img: "/assets/people/social-24.webp", name: "Rodrigo Santos", biz: "Alta Fitness", city: "Florianópolis, SC", badge: "Agenda lotada", tone: "services", rating: 4.7, text: "Confirmação automática no WhatsApp reduziu faltas. A agenda enche e o time sabe quem vem antes de abrir a academia." },
    { img: "/assets/people/social-25.webp", name: "Juliana Reis", biz: "Studio Bella", city: "Belém, PA", badge: "−60% no-show", tone: "services", rating: 4.8, text: "As faltas caíram demais com a confirmação automática. A agenda vive lotada e o salão não fica com horário vazio." },
    { img: "/assets/people/social-15.webp", name: "André Andrade", biz: "Andrade Contabilidade", city: "São Paulo, SP", badge: "Tudo num lugar só", tone: "core", rating: 4.6, text: "Tudo num lugar só. O time parou de digitar a mesma coisa em três sistemas e os clientes sentem a diferença." },
  ],
};

export const CTA_BAND = {
  title: "Pronto pra organizar sua empresa?",
  body: "Em minutos você já está vendendo, atendendo e organizando tudo no VOS.",
  primary: CTA.label,
  secondary: "Falar com vendas",
};

// ─────────────────────────────────────────────────────────────────────────────
// Modelo dos 9 módulos (fonte da verdade do conteúdo). Cada módulo é uma
// mini-landing: tagline, descrição, benefícios, "substitui", mockup e cena.
// `scene` aponta pra cena animada do motion app (?only=<scene>); `mock` é o
// fallback estático (screenshot real). Prospect ainda não tem cena dedicada.
// ─────────────────────────────────────────────────────────────────────────────
export const MODULES = {
  eyebrow: "9 módulos, 1 sistema",
  title: "Cada módulo já seria um produto. Juntos, são a sua empresa.",
  lead: "Ative só o que precisa. Tudo nasce conectado: o que acontece num módulo movimenta os outros, sozinho.",
  items: [
    {
      id: "prospect", name: "Prospect", icon: "user", color: "#ED4B00",
      tagline: "Nunca mais procure clientes.",
      desc: "Encontra empresas reais automaticamente, pelo Google, diretórios e outras fontes, manda pro CRM e você já começa a vender.",
      benefits: ["Busca inteligente", "Leads qualificados", "Importação automática", "Enriquecimento de dados", "Distribuição pra vendedores"],
      replaces: "Apollo", cta: "Encher minha pipeline",
      scene: null, mock: "/assets/product/core-crm-funil.webp",
    },
    {
      id: "crm", name: "CRM", icon: "crm", color: "#ED4B00",
      tagline: "Nunca perca uma oportunidade.",
      desc: "Todo lead, cliente e negociação organizados num lugar só, do primeiro contato ao negócio fechado.",
      benefits: ["Pipeline visual", "Follow-ups", "Atividades e agenda", "E-mails e chamadas", "Histórico completo"],
      replaces: "HubSpot", cta: "Organizar minhas vendas",
      scene: "crm", mock: "/assets/product/core-crm.webp",
    },
    {
      id: "whatsapp", name: "WhatsApp", icon: "whats", color: "#ED4B00",
      tagline: "Transforme conversas em vendas.",
      desc: "WhatsApp da equipe conectado ao CRM, com IA respondendo e cada conversa virando oportunidade.",
      benefits: ["Múltiplos atendentes", "Fluxos automáticos", "IA respondendo clientes", "Templates e campanhas", "Etiquetas e chat interno"],
      replaces: "WhatsApp Business", cta: "Vender pelo WhatsApp",
      scene: "whatsapp", mock: "/assets/product/core-whatsapp.webp",
    },
    {
      id: "contracts", name: "Contracts", icon: "doc", color: "#ED4B00",
      tagline: "Feche negócios em minutos.",
      desc: "Envie contratos digitais e receba assinaturas com validade jurídica, com status em tempo real.",
      benefits: ["Assinatura eletrônica", "Templates prontos", "Automação de envio", "Histórico e trilha", "Status em tempo real"],
      replaces: "DocuSign", cta: "Assinar mais rápido",
      scene: "documentos", mock: "/assets/product/core-documentos.webp",
    },
    {
      id: "services", name: "Services", icon: "services", color: "#ED4B00",
      tagline: "Controle toda a sua operação.",
      desc: "Inspirado no Jobber, integrado ao resto da empresa: do orçamento à execução em campo.",
      benefits: ["Quotes e jobs", "Agenda e dispatch", "Técnicos e checklists", "Fotos e relatórios", "Pagamentos"],
      replaces: "Jobber", cta: "Gerenciar serviços",
      scene: "os", mock: "/assets/product/services-ordens.webp",
    },
    {
      id: "commerce", name: "Commerce", icon: "commerce", color: "#ED4B00",
      tagline: "Venda qualquer produto.",
      desc: "Seu e-commerce e a loja física totalmente integrados ao estoque e ao caixa.",
      benefits: ["Loja virtual", "Estoque em tempo real", "Checkout e pedidos", "Frete", "Integrações"],
      replaces: "Shopify", cta: "Montar minha loja",
      scene: "pedidos", mock: "/assets/product/commerce-catalogo.webp",
    },
    {
      id: "projects", name: "Projects", icon: "task", color: "#ED4B00",
      tagline: "Sua equipe sempre alinhada.",
      desc: "Tudo que hoje fica espalhado em Trello, Asana e ClickUp, num lugar só e ligado ao trabalho real.",
      benefits: ["Kanban e Gantt", "Sprints", "Subtarefas", "Comentários", "Aprovações"],
      replaces: "ClickUp", cta: "Alinhar meu time",
      scene: "tasks", mock: "/assets/product/core-tarefas.webp",
    },
    {
      id: "finance", name: "Finance", icon: "finance", color: "#ED4B00",
      tagline: "Saiba exatamente quanto sua empresa ganha.",
      desc: "Controle financeiro completo: o dinheiro entra e sai conectado a cada venda e serviço.",
      benefits: ["Contas a pagar e receber", "Fluxo de caixa e DRE", "Conciliação", "Faturas e assinaturas", "NF-e e PIX nativos"],
      replaces: "Xero", cta: "Controlar meu caixa",
      scene: "notas", mock: "/assets/product/finance-visao.webp",
    },
    {
      id: "ai", name: "AI Copilot", icon: "ai", color: "#6D4AFF",
      tagline: "Seu funcionário mais inteligente.",
      desc: "Não é um chatbot. É um funcionário virtual integrado em toda a empresa, que trabalha por você.",
      benefits: ["Responde clientes", "Cria propostas", "Cobra pagamentos", "Organiza tarefas", "Analisa indicadores"],
      replaces: "Trabalho manual", cta: "Conhecer o copiloto",
      scene: null, mock: "/assets/product/ai-copiloto.webp",
    },
  ],
};

// 3. Identificação, espelho "isso é você?"
export const IDENTIFY = {
  eyebrow: "Talvez você se reconheça",
  title: "Veja como o VOS funciona na prática.",
  lead: "Em apenas 1 minuto você vai entender por que milhares de empresas trocaram dezenas de sistemas por um só.",
  personas: [
    { icon: "commerce", color: "#ED4B00", label: "Comércio & varejo", pain: "Estoque furado e venda perdida", photo: "/assets/people/ctx-commerce.webp" },
    { icon: "services", color: "#ED4B00", label: "Serviços & assistência", pain: "Orçamento que some no e-mail", photo: "/assets/people/ctx-services.webp" },
    { icon: "calendar", color: "#ED4B00", label: "Saúde & beleza", pain: "Agenda com furo e no-show", photo: "/assets/people/ctx-core.webp" },
    { icon: "finance", color: "#ED4B00", label: "Escritórios & contábil", pain: "Time digitando a mesma coisa 3x", photo: "/assets/people/ctx-finance.webp" },
    { icon: "ai", color: "#ED4B00", label: "Negócios B2B", pain: "Lead caro que esfria sem follow-up", photo: "/assets/people/ctx-ai.webp" },
  ],
};

// 6. Como funciona, 3 passos
export const HOW_IT_WORKS = {
  eyebrow: "Como funciona",
  title: "Simples assim, do dia um.",
  steps: [
    { n: "01", icon: "crm", color: "#ED4B00", photo: "/assets/people/social-17.webp", title: "Centralize", body: "Clientes, conversas e vendas num cadastro só. Pare de copiar dado de um lugar pro outro." },
    { n: "02", icon: "bolt", color: "#ED4B00", photo: "/assets/people/social-19.webp", title: "Automatize", body: "Uma venda já movimenta estoque, financeiro e tarefas. O operacional roda sozinho." },
    { n: "03", icon: "dash", color: "#ED4B00", photo: "/assets/people/social-24.webp", title: "Cresça", body: "Decida com dados ao vivo e ative módulos novos quando o negócio pedir." },
  ],
};

// 9. Integrações / Substitui, mapa "de → para"
export const INTEGRATIONS = {
  eyebrow: "Um no lugar de muitos",
  title: "Tudo o que você já paga, num sistema só.",
  lead: "Cada ferramenta cara e solta vira um módulo do VOS, conectado com o resto da empresa.",
  map: [
    { from: "Apollo", to: "Prospect", color: "#ED4B00" },
    { from: "HubSpot", to: "CRM", color: "#ED4B00" },
    { from: "WhatsApp Business", to: "WhatsApp", color: "#ED4B00" },
    { from: "DocuSign", to: "Contracts", color: "#ED4B00" },
    { from: "Jobber", to: "Services", color: "#ED4B00" },
    { from: "Shopify", to: "Commerce", color: "#ED4B00" },
    { from: "ClickUp", to: "Projects", color: "#ED4B00" },
    { from: "Xero", to: "Finance", color: "#ED4B00" },
  ],
  connectors: ["API aberta", "Webhooks", "n8n", "Zapier"],
  footnote: "E conecta com o que você quiser. Da prospecção ao caixa, num fluxo só.",
};

// 7b. Prospect, prospecção inteligente (seção dedicada)
export const PROSPECT_SHOWCASE = {
  eyebrow: "Prospecção inteligente",
  title: "A ferramenta de prospecção mais completa do Brasil.",
  lead: "Escolha a cidade e o nicho. A IA encontra empresas reais, enriquece telefone, e-mail, site e responsável, e joga tudo no CRM em tempo real, pronto pra vender.",
  steps: [
    { n: "1", t: "Você define cidade e nicho" },
    { n: "2", t: "A IA busca e enriquece empresas" },
    { n: "3", t: "Leads caem no CRM, distribuídos pro time" },
  ],
  features: [
    { icon: "commerce", t: "Google Maps e diretórios públicos" },
    { icon: "ai", t: "Enriquecimento automático de dados" },
    { icon: "crm", t: "Importação direta pro CRM" },
    { icon: "user", t: "Distribuição entre vendedores" },
    { icon: "check", t: "Sem planilha manual" },
    { icon: "clock", t: "Histórico de buscas" },
    { icon: "doc", t: "Importação CSV" },
    { icon: "card", t: "Tokens e controle de uso" },
  ],
  cta: "Encher minha pipeline",
  footnote: "Empresas reais, dados completos, pipeline cheia, sem sair do VOS.",
};

// 8 (final). AI Copilot, funcionário digital
export const AI_COPILOT = {
  eyebrow: "Funcionário digital",
  title: "Seu funcionário mais inteligente trabalha 24/7.",
  lead: "Não é um chatbot. É uma IA integrada em toda a empresa, que executa de verdade, não só responde.",
  tasks: [
    { icon: "whats", t: "Responde clientes no WhatsApp" },
    { icon: "doc", t: "Cria e envia propostas" },
    { icon: "finance", t: "Cobra pagamentos pendentes" },
    { icon: "task", t: "Organiza tarefas da equipe" },
    { icon: "calendar", t: "Organiza a agenda" },
    { icon: "dash", t: "Analisa indicadores" },
    { icon: "ai", t: "Sugere as próximas decisões" },
    { icon: "bolt", t: "Executa automações" },
    { icon: "crm", t: "Resume reuniões e conversas" },
    { icon: "box", t: "Encontra qualquer documento" },
  ],
  chat: [
    { who: "in", text: "O que precisa da minha atenção hoje?" },
    { who: "bot", text: "3 leads quentes no CRM, 2 pedidos pra separar e R$ 12k pra receber essa semana. Por onde começamos?" },
    { who: "in", text: "Como foram as vendas dessa semana?" },
    { who: "bot", text: "Subiram 18%. Já preparei o relatório e avisei a equipe. Quer que eu cobre os 3 clientes em atraso?" },
    { who: "in", text: "Pode cobrar e emitir as NF-e pendentes." },
  ],
  cta: "Conhecer o copiloto",
};

// 12. Provas, números vivos
// Fatos reais do produto (nada de métrica de cliente inventada, ver auditoria).
export const STATS = {
  eyebrow: "O que você recebe",
  items: [
    { value: 22, prefix: "", suffix: "", label: "módulos num sistema só" },
    { value: 5, prefix: "", suffix: "", label: "áreas conectadas de ponta a ponta" },
    { value: 100, prefix: "", suffix: "%", label: "em português, com suporte humano" },
    { value: 30, prefix: "", suffix: " min", label: "pra começar a usar" },
  ],
};

// 12. Provas, depoimentos humanos
export const TESTIMONIALS = {
  eyebrow: "Quem já vive isso",
  title: "Histórias reais de quem organizou a empresa.",
  lead: "Pessoas de verdade, resultados de verdade.",
  items: [
    { text: "Parei de perder venda por falta de controle. O estoque bate com o caixa todo dia.", name: "Vanessa Lopes", biz: "Supermercado Bom Dia", city: "Curitiba, PR", photo: "/assets/people/social-17.webp", stars: 5, metric: "Estoque em dia" },
    { text: "A equipe sai pra rua com tudo no celular. Resposta na hora e nada se perde no caminho.", name: "Marcos Vieira", biz: "Alfa Climatização", city: "Campinas, SP", photo: "/assets/people/social-22.webp", stars: 5, metric: "Resposta na hora" },
    { text: "As faltas caíram demais com a confirmação automática. A agenda vive lotada.", name: "Juliana Reis", biz: "Studio Bella", city: "Belém, PA", photo: "/assets/people/social-25.webp", stars: 5, metric: "−60% no-show" },
    { text: "Fechei o mês com +R$ 32 mil organizando peça, serviço e nota num lugar só.", name: "Tiago Moraes", biz: "Oficina Forte", city: "Belo Horizonte, MG", photo: "/assets/people/social-16.webp", stars: 5, metric: "+R$ 32k/mês" },
    { text: "Tudo num lugar só. O time parou de digitar a mesma coisa em três sistemas.", name: "André Andrade", biz: "Andrade Contabilidade", city: "São Paulo, SP", photo: "/assets/people/social-15.webp", stars: 5, metric: "Menos retrabalho" },
    { text: "Migrei num fim de semana. Segunda já estava vendendo dentro do VOS.", name: "Diego Prado", biz: "Prime Elétrica", city: "Recife, PE", photo: "/assets/people/social-20.webp", stars: 5, metric: "+40% em vendas" },
  ],
  note: "Depoimentos ilustrativos, substituir por clientes reais antes de publicar.",
};

// Soluções por time (estilo ClickUp Agents): tabs + painel claro.
export const TEAM_SOLUTIONS = {
  title: "Soluções de IA pra cada time",
  lead: "Seus fluxos principais, com IA no comando do VOS.",
  cta: "Explorar solução",
  seeAll: "Ver todos",
  items: [
    {
      id: "vendas",
      label: "Vendas",
      color: "#ED4B00",
      title: "Fecha no prazo,",
      titleFade: "toda vez.",
      body: "Do primeiro WhatsApp ao PIX confirmado: funil, proposta e cobrança no mesmo lugar.",
      replaces: ["CRM avulso", "Planilha", "Bloco de pedido", "Zap pessoal"],
      bullets: [
        "Qualifica lead e sobe no estágio certo",
        "Monta proposta e manda pro cliente",
        "Cobra e atualiza o financeiro sozinho",
      ],
      agents: [
        { color: "#ED4B00", label: "Zé responde lead e abre oportunidade" },
        { color: "#ED4B00", label: "Zé envia proposta com link de pagamento" },
        { color: "#ED4B00", label: "Zé confirma PIX e atualiza o caixa" },
        { color: "#ED4B00", label: "Zé agenda follow-up se o lead esfriar" },
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      color: "#ED4B00",
      title: "Campanha que vira",
      titleFade: "conversa e venda.",
      body: "Captura, nutre e devolve lead quente pro time comercial, sem planilha de funil.",
      replaces: ["Ads soltos", "Landing avulsa", "Lista no Excel", "E-mail marketing"],
      bullets: [
        "Captura lead de anúncio e Instagram",
        "Nutre com sequência automática",
        "Entrega pro CRM já quente",
      ],
      agents: [
        { color: "#ED4B00", label: "Zé captura lead do anúncio" },
        { color: "#ED4B00", label: "Zé envia sequência de nutrição" },
        { color: "#ED4B00", label: "Zé marca lead como quente no CRM" },
        { color: "#ED4B00", label: "Zé avisa o vendedor na hora" },
      ],
    },
    {
      id: "atendimento",
      label: "Atendimento",
      color: "#ED4B00",
      title: "Inbox única,",
      titleFade: "resposta na hora.",
      body: "WhatsApp, Instagram e Messenger numa fila só, histórico do cliente sempre junto.",
      replaces: ["ZapWeb", "Inbox do Instagram", "Planilha de tickets", "Grupo da equipe"],
      bullets: [
        "Centraliza canais numa inbox",
        "Histórico completo do cliente",
        "Escala pro humano no momento certo",
      ],
      agents: [
        { color: "#ED4B00", label: "Zé responde dúvida frequente" },
        { color: "#ED4B00", label: "Zé busca pedido e status" },
        { color: "#ED4B00", label: "Zé escala pra um humano" },
        { color: "#ED4B00", label: "Zé registra tudo no CRM" },
      ],
    },
    {
      id: "orcamento",
      label: "Orçamento",
      color: "#ED4B00",
      title: "Proposta pronta,",
      titleFade: "aprovada no chat.",
      body: "Monta orçamento, manda pro cliente e transforma em pedido ou OS sem retrabalho.",
      replaces: ["PDF no Word", "Planilha de preço", "Zap com anexo", "Follow-up manual"],
      bullets: [
        "Gera proposta com itens e valores",
        "Envia no WhatsApp com link",
        "Aprovação vira pedido ou OS",
      ],
      agents: [
        { color: "#ED4B00", label: "Zé monta o orçamento" },
        { color: "#ED4B00", label: "Zé envia pro cliente" },
        { color: "#ED4B00", label: "Zé registra a aprovação" },
        { color: "#ED4B00", label: "Zé gera pedido ou OS" },
      ],
    },
    {
      id: "operacao",
      label: "Operação",
      color: "#ED4B00",
      title: "Pedido, estoque e OS",
      titleFade: "no mesmo fluxo.",
      body: "Do orçamento à entrega: estoque, agenda e ordem de serviço sem retrabalho.",
      replaces: ["Agenda de papel", "Comanda", "Estoque no Excel", "Grupo de WhatsApp"],
      bullets: [
        "Agenda e OS criadas na conversa",
        "Estoque consultado e baixado",
        "Cliente atualizado no andamento",
      ],
      agents: [
        { color: "#ED4B00", label: "Zé cria OS a partir do orçamento" },
        { color: "#ED4B00", label: "Zé checa peças e estoque" },
        { color: "#ED4B00", label: "Zé agenda a equipe" },
        { color: "#ED4B00", label: "Zé avisa o cliente do status" },
      ],
    },
    {
      id: "financeiro",
      label: "Financeiro",
      color: "#ED4B00",
      title: "Caixa em dia,",
      titleFade: "sem planilha.",
      body: "Cobrança, conciliação PIX e NF-e ligadas a cada venda, visão em tempo real.",
      replaces: ["Excel de caixa", "App do banco", "Emissor avulso", "Boleto manual"],
      bullets: [
        "Cobra vencidos no WhatsApp",
        "Concilia PIX automaticamente",
        "Emite NF-e na venda",
      ],
      agents: [
        { color: "#ED4B00", label: "Zé cobra fatura vencida" },
        { color: "#ED4B00", label: "Zé confirma PIX no caixa" },
        { color: "#ED4B00", label: "Zé emite NF-e da venda" },
        { color: "#ED4B00", label: "Zé alerta saldo baixo" },
      ],
    },
    {
      id: "lideranca",
      label: "Liderança",
      color: "#ED4B00",
      title: "Visão da empresa,",
      titleFade: "sem perseguir relatório.",
      body: "Receita, margem e gargalos numa tela: o que precisa de atenção hoje.",
      replaces: ["Dashboard improvisado", "Relatório semanal", "Print de planilha", "Reunião de status"],
      bullets: [
        "Painel de receita e margem",
        "Alertas do que travou",
        "Time e metas no mesmo lugar",
      ],
      agents: [
        { color: "#ED4B00", label: "Zé resume o dia em 3 bullets" },
        { color: "#ED4B00", label: "Zé aponta funil travado" },
        { color: "#ED4B00", label: "Zé mostra meta vs realizado" },
        { color: "#ED4B00", label: "Zé destaca clientes em risco" },
      ],
    },
  ],
};

// 13. Segurança & conformidade
export const SECURITY = {
  eyebrow: "Segurança & conformidade",
  title: "Seus dados seguros. Suas assinaturas válidas.",
  lead: "Infraestrutura no Brasil, conformidade de verdade e a tranquilidade de operar sem medo.",
  items: [
    { icon: "lock", title: "LGPD por padrão", body: "Tratamento de dados em conformidade com a LGPD, com controle total sobre suas informações." },
    { icon: "doc", title: "Assinatura com validade jurídica", body: "MP 2.200-2 / ICP-Brasil: OTP, trilha de auditoria e hash SHA-256 selado no PDF final." },
    { icon: "shield", title: "Hospedado no Brasil", body: "Servidores no país, criptografia em trânsito e em repouso, backups automáticos." },
    { icon: "finance", title: "NF-e e PIX nativos", body: "Emissão fiscal e cobrança por PIX direto do sistema, ligadas a cada venda." },
  ],
};

export const FOOTER = {
  blurb: "O sistema operacional modular para qualquer empresa. Do WhatsApp ao financeiro, em um só lugar.",
  cols: [
    { title: "Produto", links: [
      { label: "Visão geral", href: "/" },
      { label: "Commerce", href: "/commerce" },
      { label: "Services", href: "/services" },
      { label: "Financeiro", href: "/financeiro" },
    ] },
    { title: "Empresa", links: [
      { label: "Sobre", href: "#" },
      { label: "Carreiras", href: "#" },
      { label: "Contato", href: "#" },
      { label: "Blog", href: "#" },
    ] },
    { title: "Recursos", links: [
      { label: "Central de ajuda", href: "#" },
      { label: "Preços", href: "/precos" },
      { label: "Status", href: "#" },
      { label: "API", href: "#" },
    ] },
  ],
  legal: "© 2026 VOS · Feito no Brasil 🇧🇷",
  company: "VERTEX GROWTH GESTAO EMPRESARIAL LTDA",
  cnpj: "67.779.810/0001-69",
};
