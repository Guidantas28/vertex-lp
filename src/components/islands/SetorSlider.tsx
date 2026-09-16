"use client";

/**
 * O palco dos setores: cinco capítulos que deslizam de lado, um empurrando o
 * outro. Cada capítulo tem o retrato do empresário daquele nicho ao fundo, a
 * promessa à esquerda e a cena REAL do produto à direita, com a conversa que
 * vira pedido, ordem de serviço ou agendamento.
 *
 * As abas de cima continuam sendo a navegação; clicar trava a rotação.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const DURACAO = 12_000;

/* ─────────────────────────── os cinco painéis ───────────────────────────
   Cada nicho vê um PEDAÇO diferente do VOS, e não a mesma conversa (founder
   15/09: "esse card tá muito igual essas conversas, queria focar na solução de
   forma diferente nesses cards já que oferecemos tanto pra cada um"). O varejo
   vê o estoque servindo todos os canais; serviços, a ordem de serviço andando;
   beleza, a agenda do dia; a oficina, o orçamento com as peças; o escritório,
   o prazo com os documentos que faltam.

   Só entra o que o produto FAZ: estoque único por canal, OS, agenda com
   lembrete, orçamento aprovado que vira OS e reserva peça, tarefa com prazo e
   contrato assinado. */

const Ok = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5 10 17.5 19 7.5" />
  </svg>
);

/** o rodapé verde de cada painel: o que o VOS fechou sozinho ali */
const Selo = ({ children }: { children: string }) => (
  <p className="stx-selo">
    <span className="stx-selo-ok" aria-hidden="true"><Ok /></span>
    {children}
  </p>
);

/** lista de etapas: feito (verde) ou esperando (anel vazio) */
const Passos = ({ itens }: { itens: [string, boolean][] }) => (
  <ul className="stx-passos">
    {itens.map(([txt, feito]) => (
      <li key={txt} className={feito ? "is-ok" : undefined}>
        <i aria-hidden="true">{feito && <Ok />}</i>
        {txt}
      </li>
    ))}
  </ul>
);

const ICONE = {
  site: <path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM3.7 12h16.6M12 3.5c2 2.3 3 5.2 3 8.5s-1 6.2-3 8.5c-2-2.3-3-5.2-3-8.5s1-6.2 3-8.5z" />,
  balcao: <path d="M4 9.5 5.6 4.6h12.8L20 9.5M4 9.5h16M4 9.5v9.9h16V9.5M9.4 19.4v-5.2h5.2v5.2" />,
  pasta: <path d="M4 7.2h5.4l1.6 2h9V19H4z" />,
};

function PainelVarejo() {
  return (
    <>
      <div className="stx-prod">
        <span className="stx-prod-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.6 8h11.2l-1.3 10.2a2 2 0 0 1-2 1.8H8.9a2 2 0 0 1-2-1.8z" />
            <path d="M16.8 10.4h1.6a2.4 2.4 0 0 1 0 4.8h-1.2M9 8V6.2A2.2 2.2 0 0 1 11.2 4h1.4" />
          </svg>
        </span>
        <span className="stx-prod-txt">
          <b>Cafeteira Oster</b>
          <em>Vermelha · 750 ml</em>
        </span>
        <strong>R$ 289,90</strong>
      </div>

      <div className="stx-barra">
        <i style={{ width: "36%" }} />
        <span>4 em estoque</span>
      </div>

      <ul className="stx-canais">
        <li>
          <img src="/assets/icons/whatsapp.svg" alt="" width={16} height={16} loading="lazy" />
          <b>WhatsApp</b>
          <span>2 hoje</span>
        </li>
        <li>
          <img src="/assets/icons/instagram.svg" alt="" width={16} height={16} loading="lazy" />
          <b>Instagram</b>
          <span>1 hoje</span>
        </li>
        <li>
          <i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{ICONE.site}</svg></i>
          <b>Loja online</b>
          <span>3 hoje</span>
        </li>
        <li>
          <i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{ICONE.balcao}</svg></i>
          <b>Balcão</b>
          <span>1 hoje</span>
        </li>
      </ul>

      <Selo>Vendeu no balcão, some do site na hora</Selo>
    </>
  );
}

function PainelServicos() {
  return (
    <>
      <div className="stx-doc">
        <p>OS #231</p>
        <div>
          <b>Limpeza e recarga de gás</b>
          <strong>R$ 380,00</strong>
        </div>
        <span>Marcos Vieira · ar-condicionado 12.000 BTUs</span>
      </div>

      <Passos
        itens={[
          ["Orçamento aprovado pelo cliente", true],
          ["Gás e filtro reservados no estoque", true],
          ["Execução quinta, 14h · equipe do Caio", false],
        ]}
      />

      <Selo>Cliente avisado a cada etapa</Selo>
    </>
  );
}

function PainelBeleza() {
  const dia = [
    { h: "09:00", txt: "Corte · Ana Paula", estado: "Confirmado", tipo: "ok" as const },
    { h: "10:00", txt: "Escova · Marina Reis", estado: "Novo", tipo: "novo" as const },
    { h: "11:30", txt: "Horário livre", estado: "Zé ofereceu", tipo: "livre" as const },
    { h: "14:00", txt: "Coloração · Júlia", estado: "Confirmado", tipo: "ok" as const },
  ];
  return (
    <>
      <p className="stx-dia">Hoje · 4 de 6 horários ocupados</p>
      <ul className="stx-agenda">
        {dia.map((x) => (
          <li key={x.h} className={`is-${x.tipo}`}>
            <b>{x.h}</b>
            <span>{x.txt}</span>
            <em>{x.estado}</em>
          </li>
        ))}
      </ul>
      <Selo>Lembrete 1 h antes em todos</Selo>
    </>
  );
}

function PainelOficina() {
  return (
    <>
      <div className="stx-doc">
        <p>Orçamento #882</p>
        <div>
          <b>Revisão + troca de bateria</b>
          <strong>R$ 740,00</strong>
        </div>
        <span>Civic 2019 · placa ABC-1D23</span>
        <ul className="stx-itens">
          <li>
            <span>Bateria 60 Ah</span>
            <span>R$ 420,00</span>
          </li>
          <li>
            <span>Revisão completa</span>
            <span>R$ 320,00</span>
          </li>
        </ul>
      </div>

      <Passos
        itens={[
          ["Aprovado pelo cliente no WhatsApp", true],
          ["OS aberta · peça reservada", true],
        ]}
      />
    </>
  );
}

function PainelEscritorio() {
  return (
    <>
      <div className="stx-doc">
        <p>Tarefa #114</p>
        <div>
          <b>Balanço de setembro</b>
          <strong>05/10</strong>
        </div>
        <span>Responsável Ana · cliente Ferragens Sul</span>
      </div>

      <div className="stx-barra">
        <i style={{ width: "60%" }} />
        <span>3 de 5 documentos</span>
      </div>

      <Passos
        itens={[
          ["Extratos recebidos", true],
          ["Notas de serviço pendentes", false],
        ]}
      />

      <Selo>Contrato do cliente assinado no VOS</Selo>
    </>
  );
}

const PAINEIS = {
  comercio: PainelVarejo,
  servicos: PainelServicos,
  saude: PainelBeleza,
  auto: PainelOficina,
  escritorio: PainelEscritorio,
};

type Setor = {
  id: keyof typeof PAINEIS;
  aba: string;
  rotulo: string;
  foto: string;
  titulo: string;
  corpo: string;
  negocio: { nome: string; logo: string };
  /** o que está aberto na tela daquele nicho: cada um vê um pedaço do VOS */
  modulo: string;
  prova: { texto: string; nome: string; negocio: string; foto: string };
};

const SETORES: Setor[] = [
  {
    id: "comercio",
    aba: "Comércio & Varejo",
    rotulo: "Comércio & varejo",
    foto: "/assets/setores/comercio.jpg",
    titulo: "Venda mais rápido sem depender de processos manuais.",
    corpo: "O VOS conecta seus canais de venda com estoque, produtos, pagamentos e financeiro para transformar uma conversa em uma venda completa.",
    negocio: { nome: "Mercado Bom Dia", logo: "/assets/logos/mercado-bom-dia.png" },
    modulo: "Estoque e canais de venda",
    prova: { texto: "Uma venda completa acontecendo a partir de uma conversa.", nome: "Vanessa Lopes", negocio: "Supermercado Bom Dia", foto: "/assets/people/social-17.webp" },
  },
  {
    id: "servicos",
    aba: "Serviços & Assistência",
    rotulo: "Serviços & assistência",
    foto: "/assets/setores/servicos.jpg",
    titulo: "Transforme solicitações em serviços organizados.",
    corpo: "O VOS entende a necessidade do cliente, verifica a disponibilidade da equipe e organiza todo o fluxo até a execução.",
    negocio: { nome: "Prime Elétrica", logo: "/assets/logos/prime-eletrica.png" },
    modulo: "Ordens de serviço",
    prova: { texto: "Mais serviços fechados com menos troca de mensagens.", nome: "Marcos Vieira", negocio: "Alfa Climatização", foto: "/assets/people/social-22.webp" },
  },
  {
    id: "saude",
    aba: "Saúde & Beleza",
    rotulo: "Saúde & beleza",
    foto: "/assets/setores/saude.jpg",
    titulo: "Mais agendamentos. Menos horários perdidos.",
    corpo: "O VOS responde a dúvida, oferece o horário livre e confirma sozinho, com lembrete pro cliente não faltar.",
    negocio: { nome: "Studio Bella", logo: "/assets/logos/studio-bella.png" },
    modulo: "Agenda do dia",
    prova: { texto: "As faltas caíram demais com a confirmação automática.", nome: "Juliana Reis", negocio: "Studio Bella", foto: "/assets/people/social-25.webp" },
  },
  {
    id: "auto",
    aba: "Auto & Oficina",
    rotulo: "Auto & oficina",
    foto: "/assets/setores/auto.jpg",
    titulo: "Da conversa ao serviço aprovado.",
    corpo: "O VOS conecta atendimento, orçamento, agenda e a operação da oficina, e o cliente acompanha cada etapa.",
    negocio: { nome: "Oficina Forte", logo: "/assets/logos/oficina-forte.png" },
    modulo: "Orçamento do serviço",
    prova: { texto: "Mais controle, menos atrasos e clientes melhor atendidos.", nome: "Tiago Moraes", negocio: "Oficina Forte", foto: "/assets/people/social-16.webp" },
  },
  {
    id: "escritorio",
    aba: "Escritórios & Contábil",
    rotulo: "Escritórios & contábil",
    foto: "/assets/setores/escritorio.jpg",
    titulo: "Clientes atendidos. Processos organizados automaticamente.",
    corpo: "O VOS identifica o assunto, abre a tarefa com prazo e pede os documentos que faltam, sem ninguém digitar duas vezes.",
    negocio: { nome: "Andrade Contábil", logo: "/assets/logos/andrade-contabil.png" },
    modulo: "Tarefas e prazos",
    prova: { texto: "Uma operação mais previsível e uma equipe mais produtiva.", nome: "André Andrade", negocio: "Andrade Contabilidade", foto: "/assets/people/social-15.webp" },
  },
];

export default function SetorSlider() {
  const palco = useRef<HTMLDivElement>(null);
  const naTela = useInView(palco, { amount: 0.35 });
  const reduce = useReducedMotion();

  const N = SETORES.length;
  // O trilho tem três cópias da lista e a gente anda sempre pelo bloco do meio:
  // assim sempre existe capítulo antes e depois, e o carrossel não tem ponta.
  const [pos, setPos] = useState(N);
  const [anima, setAnima] = useState(true);
  const i = ((pos % N) + N) % N;
  const [travado, setTravado] = useState(false);
  const [decorrido, setDecorrido] = useState(0);
  const janela = useRef<HTMLDivElement>(null);
  const [passo, setPasso] = useState(0);
  const [recuo, setRecuo] = useState(0);

  // o passo é a largura de um capítulo mais o vão: medido, nunca chutado
  useEffect(() => {
    const el = janela.current;
    if (!el) return;
    const medir = () => {
      const slide = el.querySelector<HTMLElement>(".stx-slide");
      const trilho = el.querySelector<HTMLElement>(".stx-trilho");
      if (!slide || !trilho) return;
      const vao = parseFloat(getComputedStyle(trilho).columnGap || "0") || 0;
      // offsetWidth, NUNCA getBoundingClientRect: o capítulo fora da vez está
      // reduzido pela escala, e o retângulo devolveria a largura já encolhida.
      // Com isso o trilho perdia alguns px por capítulo e ia desalinhando.
      setPasso(slide.offsetWidth + vao);
      // empurra o trilho um tico pra direita: sobra a PONTA do capítulo anterior
      // à esquerda e uma fatia maior do próximo à direita.
      setRecuo(trilho.offsetWidth * 0.06);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // a roda dos capítulos
  useEffect(() => {
    if (!naTela || travado || reduce) return;
    setDecorrido(0);
    const tique = 120;
    const iv = window.setInterval(() => {
      setDecorrido((d) => {
        const prox = d + tique;
        if (prox >= DURACAO) {
          setPos((p) => p + 1);
          return 0;
        }
        return prox;
      });
    }, tique);
    return () => window.clearInterval(iv);
  }, [naTela, travado, reduce, pos]);

  // ao acabar o deslize, volta pro bloco do meio sem animar: o pulo é invisível
  const aoFimDoDeslize = () => {
    if (pos >= 2 * N || pos < N) {
      setAnima(false);
      setPos((p) => (p >= 2 * N ? p - N : p + N));
    }
  };
  useEffect(() => {
    if (anima) return;
    const r = requestAnimationFrame(() => setAnima(true));
    return () => cancelAnimationFrame(r);
  }, [anima]);

  // a aba leva pelo caminho mais curto, pra frente ou pra trás
  const escolher = (n: number) => {
    let d = ((n - i) % N + N) % N;
    if (d > N / 2) d -= N;
    setPos((p) => p + d);
    setTravado(true);
    setDecorrido(0);
  };

  const TRILHO = [...SETORES, ...SETORES, ...SETORES];

  return (
    <div className="stx" ref={palco}>
      {/* as abas continuam sendo a navegação */}
      <div className="stx-abas" role="tablist" aria-label="Segmentos">
        {SETORES.map((x, n) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={n === i}
            className={n === i ? "is-on" : undefined}
            onClick={() => escolher(n)}
          >
            {x.aba}
            {n === i && !travado && !reduce && (
              <i style={{ "--p": `${(decorrido / DURACAO) * 100}%` } as CSSProperties} />
            )}
          </button>
        ))}

        {/* Depois dos nichos, na letra do palco: o VOS não para nesses cinco. */}
        <span className="stx-mais">
          e muito mais
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h13M12 5.5 18.5 12 12 18.5" />
          </svg>
        </span>
      </div>

      <div className="stx-palco" ref={janela}>
        <motion.div
          className="stx-trilho"
          animate={{ x: -pos * passo + recuo }}
          transition={anima && !reduce ? { duration: 0.7, ease: EASE } : { duration: 0 }}
          onAnimationComplete={aoFimDoDeslize}
        >
          {TRILHO.map((s, n) => {
            const ativo = n === pos;
            return (
              <article
                key={`${s.id}-${n}`}
                className={`stx-slide${ativo ? " is-on" : ""}`}
                aria-hidden={!ativo}
              >
                <img className="stx-foto" src={s.foto} alt="" loading="lazy" decoding="async" />
                <span className="stx-veu" aria-hidden="true" />

                <div className="stx-copy">
                  <p className="stx-rotulo">{s.rotulo}</p>
                  <h3>{s.titulo}</h3>
                  <p className="stx-corpo">{s.corpo}</p>
                </div>

                {/* a tela do VOS daquele nicho: cada um mostra o que resolve ali */}
                <div className="stx-cena" aria-hidden="true">
                  <div className="stx-painel">
                    <header className="stx-painel-topo">
                      <img className="stx-painel-logo" src={s.negocio.logo} alt="" width={26} height={26} loading="lazy" />
                      <span>
                        <b>{s.negocio.nome}</b>
                        <em>{s.modulo}</em>
                      </span>
                    </header>

                    <div className="stx-painel-corpo">{PAINEIS[s.id]()}</div>
                  </div>
                </div>

                <footer className="stx-prova">
                  <img src={s.prova.foto} alt="" width={30} height={30} loading="lazy" decoding="async" />
                  <blockquote>{s.prova.texto}</blockquote>
                  <cite>
                    <b>{s.prova.nome}</b> · {s.prova.negocio}
                  </cite>
                </footer>
              </article>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
