/**
 * Conteúdo das páginas de módulo (/commerce/, /services/, /financeiro/).
 *
 * Por que estas páginas existem: o rodapé linkava as três rotas em TODA página
 * do site e as três davam 404 — foi o "Not found (404)" do Search Console. Mas
 * criá-las não é só tapar buraco: a home é uma página só e não consegue rankear
 * ao mesmo tempo para "sistema PDV para loja", "ordem de serviço" e "fluxo de
 * caixa". Cada módulo vira a página que disputa o seu próprio conjunto de
 * termos, e o blog aponta pra elas.
 *
 * ⚠️ SEM PREÇO nestas páginas, de propósito. O repo tem dois modelos de preço
 * que se contradizem: MODULE_CARDS diz "R$ 499/mês" por módulo, e os PLANOS da
 * /lp dizem Start 297 / Essential 497 / Scale 797. Publicar um número aqui
 * seria escolher um dos dois no escuro — e preço errado em página indexada é
 * pior que preço ausente. Resolver a contradição antes de adicionar.
 *
 * Todo fato daqui sai de content.ts (MODULES/MODULE_CARDS/CORE_FEATURES) ou do
 * llms.txt. Nada foi inventado — em particular, nenhum número de cliente,
 * porcentagem de resultado ou depoimento.
 */

export interface Modulo {
  slug: string;
  nome: string;
  cor: string;
  /** <title> — 50-60 caracteres, termo principal na frente. */
  seoTitle: string;
  seoDescription: string;
  h1: string;
  /** Frase de abertura em negrito na página. */
  chamada: string;
  /**
   * Parágrafo "resposta direta": define o que é, em uma frase, sem rodeio.
   * É o trecho que os motores de resposta (AEO/GEO) e o featured snippet
   * do Google extraem — por isso vem antes de qualquer venda.
   */
  resposta: string;
  substitui: string;
  shot: { src: string; alt: string };
  recursos: { titulo: string; corpo: string }[];
  comoFunciona: { passo: string; corpo: string }[];
  paraQuem: string[];
  faq: { q: string; a: string }[];
  /** Slugs de posts do blog — vira bloco de links internos no fim da página. */
  posts: string[];
}

export const MODULOS: Modulo[] = [
  {
    slug: "commerce",
    nome: "Commerce",
    cor: "#1F6FEB",
    seoTitle: "Sistema de vendas e estoque para loja física e online | VOS",
    seoDescription:
      "Catálogo, estoque em tempo real, pedidos e PDV integrados ao caixa e ao WhatsApp. O módulo Commerce do VOS conecta a loja online e a loja física num sistema só.",
    h1: "Um sistema de vendas que liga a loja física, a loja online e o estoque",
    chamada: "Venda qualquer produto, em qualquer canal, sem controlar estoque em planilha.",
    resposta:
      "O Commerce é o módulo de vendas de produtos do VOS. Ele reúne catálogo, controle de estoque, pedidos, checkout e PDV no mesmo sistema em que já estão o WhatsApp, o CRM e o financeiro da empresa — então uma venda no balcão e uma venda na loja online baixam do mesmo estoque e entram no mesmo caixa, sem ninguém digitar nada duas vezes.",
    substitui: "Shopify",
    shot: {
      src: "/assets/product/commerce-catalogo.webp",
      alt: "Tela de catálogo de produtos do módulo Commerce do VOS, com lista de itens, preço e saldo de estoque",
    },
    recursos: [
      {
        titulo: "Catálogo e loja virtual",
        corpo:
          "Cadastre o produto uma vez e ele aparece no catálogo digital, na loja online e no atendimento do WhatsApp. Sem manter três listas diferentes do mesmo item.",
      },
      {
        titulo: "Estoque em tempo real",
        corpo:
          "Cada pedido baixa o saldo na hora, venha ele do balcão, do WhatsApp ou da loja online. É o que impede a venda de um item que já acabou.",
      },
      {
        titulo: "Pedidos e checkout",
        corpo:
          "Do carrinho ao pedido pago, com PIX nativo. O pedido nasce ligado ao cliente que já existe no CRM, não a um cadastro solto.",
      },
      {
        titulo: "PDV para a loja física",
        corpo:
          "Frente de caixa para vender no balcão, com emissão de NFC-e. A venda presencial cai no mesmo relatório da venda online.",
      },
      {
        titulo: "Frete e integrações",
        corpo:
          "Cálculo de frete no fechamento do pedido e integrações para conectar o Commerce ao resto da operação.",
      },
      {
        titulo: "Nota fiscal junto",
        corpo:
          "NF-e e NFC-e são emitidas de dentro do próprio pedido, sem exportar planilha para um emissor separado.",
      },
    ],
    comoFunciona: [
      {
        passo: "O produto entra uma vez",
        corpo:
          "Você cadastra o item com preço, foto e saldo. Ele fica disponível no catálogo, na loja e no atendimento ao mesmo tempo.",
      },
      {
        passo: "A venda acontece em qualquer canal",
        corpo:
          "Balcão, WhatsApp ou loja online. O pedido é o mesmo objeto no sistema, então o histórico do cliente não fica partido por canal.",
      },
      {
        passo: "O estoque e o caixa se movem sozinhos",
        corpo:
          "O saldo baixa e o valor entra no fluxo de caixa do módulo Financeiro. É a etapa que normalmente vira digitação manual em outros sistemas.",
      },
    ],
    paraQuem: [
      "Lojas de varejo com balcão e vendas pelo WhatsApp",
      "Distribuidoras que precisam do estoque batendo com o caixa",
      "E-commerce que também vende presencialmente",
      "Quem hoje controla estoque em planilha e perde venda por ruptura",
    ],
    faq: [
      {
        q: "O Commerce funciona para loja física e loja online ao mesmo tempo?",
        a: "Sim, e é o ponto do módulo. O mesmo produto, o mesmo saldo de estoque e o mesmo cadastro de cliente valem para os dois. Uma venda no PDV e uma venda na loja online baixam do mesmo estoque e caem no mesmo fluxo de caixa.",
      },
      {
        q: "Dá para emitir nota fiscal pelo Commerce?",
        a: "Sim. NF-e e NFC-e são emitidas de dentro do pedido, sem exportar nada para um emissor separado. A emissão fiscal é nativa do VOS, não uma integração de terceiro.",
      },
      {
        q: "Preciso do módulo Commerce se só vendo pelo WhatsApp?",
        a: "Depende de você precisar controlar estoque. O atendimento e o CRM já vêm no Core. O Commerce entra quando você quer catálogo, saldo de estoque e pedido formal — e não só a conversa.",
      },
      {
        q: "O estoque atualiza sozinho?",
        a: "Sim. O saldo baixa no momento em que o pedido é confirmado, independentemente do canal em que a venda aconteceu. Não existe um passo de conferência manual entre a venda e o estoque.",
      },
    ],
    posts: ["nfe-nfce-diferenca", "erp-vs-sistema-modular", "crm-com-whatsapp-integrado"],
  },

  {
    slug: "services",
    nome: "Services",
    cor: "#0EA5E9",
    seoTitle: "Sistema de ordem de serviço e agenda para equipes em campo | VOS",
    seoDescription:
      "Orçamento, agendamento, ordem de serviço e equipe em campo num sistema só, ligado ao CRM e ao financeiro. O módulo Services do VOS vai do orçamento à execução.",
    h1: "Do orçamento à execução: ordem de serviço, agenda e equipe em campo",
    chamada: "Pare de perder orçamento no e-mail e serviço na agenda de papel.",
    resposta:
      "O Services é o módulo de prestação de serviços do VOS. Ele cobre o ciclo inteiro de um trabalho — orçamento, aprovação, agendamento, ordem de serviço, execução em campo e cobrança — dentro do mesmo sistema onde estão o WhatsApp, o CRM e o financeiro. O orçamento aprovado vira ordem de serviço e a ordem concluída vira lançamento no caixa, sem passar por planilha.",
    substitui: "Jobber",
    shot: {
      src: "/assets/product/services-ordens.webp",
      alt: "Tela de ordens de serviço do módulo Services do VOS, com lista de trabalhos, responsável e status de execução",
    },
    recursos: [
      {
        titulo: "Orçamentos e aprovação",
        corpo:
          "Monte a cotação, envie e acompanhe o status. O orçamento aprovado vira ordem de serviço sem redigitar cliente, item ou valor.",
      },
      {
        titulo: "Agenda e distribuição",
        corpo:
          "Agende o trabalho e distribua para o técnico certo. A agenda é a mesma do resto do sistema, então ninguém marca dois serviços no mesmo horário.",
      },
      {
        titulo: "Ordens de serviço",
        corpo:
          "Cada trabalho tem sua ordem, com responsável, etapas e status de execução. É o registro do que foi combinado e do que foi feito.",
      },
      {
        titulo: "Técnicos e checklists",
        corpo:
          "A equipe em campo segue o checklist do serviço, o que padroniza a execução e reduz retorno por trabalho incompleto.",
      },
      {
        titulo: "Fotos e relatórios",
        corpo:
          "Registro fotográfico e relatório do que foi executado ficam anexados à ordem — a prova do serviço fica junto do serviço.",
      },
      {
        titulo: "Cobrança no fim",
        corpo:
          "A ordem concluída gera a cobrança e o lançamento no financeiro, com PIX nativo e nota fiscal de serviço (NFS-e).",
      },
    ],
    comoFunciona: [
      {
        passo: "O pedido vira orçamento",
        corpo:
          "A conversa no WhatsApp ou o lead do CRM viram uma cotação, com o cliente que já está cadastrado.",
      },
      {
        passo: "O orçamento aprovado vira ordem",
        corpo:
          "Aprovou, o sistema abre a ordem de serviço, agenda e atribui o responsável. Nenhum dado é redigitado nessa passagem.",
      },
      {
        passo: "A execução vira dinheiro",
        corpo:
          "Concluída a ordem, sai a cobrança e o valor entra no fluxo de caixa. O ciclo fecha dentro do mesmo sistema.",
      },
    ],
    paraQuem: [
      "Assistências técnicas e instaladores com equipe em campo",
      "Clínicas e negócios de saúde e beleza com agenda cheia",
      "Agências e prestadores que vivem de orçamento aprovado",
      "Quem hoje controla serviço em caderno, grupo de WhatsApp ou planilha",
    ],
    faq: [
      {
        q: "O que é uma ordem de serviço no VOS?",
        a: "É o registro de um trabalho a ser executado: qual cliente, o que foi combinado, quem é o responsável, quando acontece e em que etapa está. Ela nasce de um orçamento aprovado e termina virando cobrança no financeiro.",
      },
      {
        q: "O orçamento aprovado vira ordem de serviço automaticamente?",
        a: "Sim. Essa passagem é o ponto do módulo: aprovado o orçamento, a ordem é aberta com o mesmo cliente, os mesmos itens e os mesmos valores, sem redigitação. É onde a maioria dos processos manuais perde informação.",
      },
      {
        q: "Serve para equipe que trabalha fora do escritório?",
        a: "Sim. A ordem tem responsável, checklist, registro fotográfico e relatório de execução, feitos para serem preenchidos no campo e ficarem anexados ao próprio trabalho.",
      },
      {
        q: "Dá para usar Services e Commerce juntos?",
        a: "Dá, e é comum. Quem vende produto e presta serviço usa os dois sobre o mesmo cadastro de cliente — não existe um cliente do Commerce e outro do Services.",
      },
    ],
    posts: [
      "funil-de-vendas-como-montar",
      "follow-up-automatico-whatsapp",
      "automacao-comercial-pequenas-empresas",
    ],
  },

  {
    slug: "financeiro",
    nome: "Financeiro",
    cor: "#C9810C",
    seoTitle: "Sistema financeiro com fluxo de caixa e nota fiscal | VOS",
    seoDescription:
      "Contas a pagar e receber, fluxo de caixa, DRE, conciliação, PIX e emissão de nota fiscal. O módulo Financeiro do VOS já vem incluso e recebe cada venda e serviço.",
    h1: "Fluxo de caixa, contas e nota fiscal ligados a cada venda da empresa",
    chamada: "Saiba exatamente quanto a empresa ganha, sem fechar planilha no fim do mês.",
    resposta:
      "O Financeiro é o módulo de controle de dinheiro do VOS e vem incluso em qualquer plano. Ele cobre contas a pagar e a receber, fluxo de caixa, DRE, conciliação, faturas, assinaturas recorrentes e emissão de nota fiscal. A diferença para um sistema financeiro avulso é a origem do lançamento: cada venda do Commerce e cada ordem do Services entram aqui sozinhas, em vez de serem digitadas depois.",
    substitui: "Xero",
    shot: {
      src: "/assets/product/finance-fluxo.webp",
      alt: "Tela de fluxo de caixa do módulo Financeiro do VOS, com entradas, saídas e saldo projetado",
    },
    recursos: [
      {
        titulo: "Contas a pagar e a receber",
        corpo:
          "O que entra e o que sai, com vencimento e responsável. Cadastro de fornecedores junto, no mesmo lugar.",
      },
      {
        titulo: "Fluxo de caixa e DRE",
        corpo:
          "Saldo hoje e projeção à frente, mais o demonstrativo de resultado. É a visão que responde se o mês fecha no azul antes de o mês acabar.",
      },
      {
        titulo: "Conciliação",
        corpo:
          "Bater o que o sistema diz que entrou com o que o banco diz que entrou, sem conferência linha a linha em planilha.",
      },
      {
        titulo: "Faturas e assinaturas",
        corpo:
          "Cobrança recorrente para quem vende por mensalidade, com a fatura ligada ao cliente do CRM.",
      },
      {
        titulo: "NF-e, NFC-e e NFS-e",
        corpo:
          "Emissão fiscal brasileira nativa, para produto e para serviço, feita de dentro da venda que gerou a nota.",
      },
      {
        titulo: "PIX nativo",
        corpo:
          "Cobrança por PIX sem intermediário externo, com a baixa caindo no próprio lançamento.",
      },
    ],
    comoFunciona: [
      {
        passo: "O lançamento nasce da operação",
        corpo:
          "A venda do Commerce e a ordem do Services entram como recebimento automaticamente. Ninguém redigita o valor.",
      },
      {
        passo: "A nota sai de dentro da venda",
        corpo:
          "NF-e, NFC-e ou NFS-e conforme o caso, emitidas do próprio pedido ou da própria ordem.",
      },
      {
        passo: "O caixa mostra o resultado",
        corpo:
          "Fluxo de caixa e DRE são consequência dos lançamentos, não uma planilha montada à parte no fim do mês.",
      },
    ],
    paraQuem: [
      "Empresas que hoje fecham o mês em planilha",
      "Quem emite nota fiscal e quer a emissão junto da venda",
      "Negócios com cobrança recorrente ou assinatura",
      "Quem não sabe a margem real por não ligar venda e custo",
    ],
    faq: [
      {
        q: "O módulo Financeiro é cobrado à parte?",
        a: "Não. O Financeiro vem incluso em qualquer plano do VOS — é o módulo que sempre acompanha, porque toda empresa precisa de contas a pagar, contas a receber e fluxo de caixa.",
      },
      {
        q: "O VOS emite nota fiscal?",
        a: "Sim, com emissão brasileira nativa: NF-e para produto, NFC-e para venda no consumidor final e NFS-e para serviço. A nota é emitida de dentro do pedido ou da ordem de serviço que a gerou.",
      },
      {
        q: "As vendas entram no financeiro sozinhas?",
        a: "Entram. Uma venda do Commerce e uma ordem concluída do Services viram lançamento sem digitação. É exatamente esse repasse manual que costuma atrasar o fechamento do mês.",
      },
      {
        q: "Dá para fazer cobrança recorrente?",
        a: "Dá. O módulo tem faturas e assinaturas para quem cobra por mensalidade, com a cobrança ligada ao cliente que já está no CRM.",
      },
    ],
    posts: ["nfe-nfce-diferenca", "erp-vs-sistema-modular", "automacao-comercial-pequenas-empresas"],
  },
];

export const MODULO_POR_SLUG = Object.fromEntries(MODULOS.map((m) => [m.slug, m]));
