"use client";

/**
 * A CENA DA VOZ — "alguém fala, de onde estiver, e o trabalho aparece pronto".
 *
 * É UM MOVIMENTO SÓ, sem corte. A cena antiga (VitrineScene) troca painéis, e
 * troca de painel é slideshow. Aqui o olho segue UM objeto que atravessa a tela
 * da esquerda pra direita mudando de forma no caminho: a onda de áudio sai do
 * celular de uma pessoa, passa pelo Zé, e do outro lado já é ficha.
 *
 * A onda é a protagonista porque resolve três coisas de uma vez: lê como "alguém
 * acabou de falar" sem legenda nenhuma, fica bonita em carvão e brasa, e é a
 * única forma que PODE virar outra coisa na frente de quem olha. Som virando
 * estrutura é literalmente o que o produto faz.
 *
 * SEM FUNDO: nada de painel atrás. As peças pousam direto no escuro da seção.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Porta = "whatsapp" | "slack" | "vos";

type Passada = {
  porta: Porta;
  quem: string;
  papel: string;
  foto: string;
  fala: string;
  duracao: string;
  ficha: { rotulo: string; titulo: string; meta: string; valor: string };
  registro: string;
};

/* Três pessoas, três lugares, três portas . e o mesmo tipo de desfecho. */
const PASSADAS: Passada[] = [
  {
    porta: "whatsapp",
    quem: "Cliente",
    papel: "no WhatsApp",
    foto: "/assets/people/social-17.webp",
    fala: "Oi! Tem horário quinta de manhã?",
    duracao: "0:06",
    ficha: { rotulo: "Agendamento", titulo: "Escova · quinta, 10h", meta: "com a Marina · 1 hora", valor: "R$ 90,00" },
    registro: "agendou e confirmou com a cliente",
  },
  {
    porta: "slack",
    quem: "Juliana",
    papel: "no canal do time",
    foto: "/assets/people/social-25.webp",
    fala: "Zé, manda o catálogo pra quem visitou ontem",
    duracao: "0:04",
    ficha: { rotulo: "Catálogo enviado", titulo: "18 clientes de ontem", meta: "link único por pessoa", valor: "18 envios" },
    registro: "montou a lista e disparou o catálogo",
  },
  {
    porta: "vos",
    quem: "Marcos",
    papel: "dentro do VOS",
    foto: "/assets/people/social-22.webp",
    fala: "Abre um pedido pra Dona Marta, dois tênis 42",
    duracao: "0:05",
    ficha: { rotulo: "Pedido #1934", titulo: "Tênis Runner 42 · 2 un", meta: "Marta Ribeiro · em aberto", valor: "R$ 779,80" },
    registro: "abriu o pedido em aberto",
  },
];

/* Altura de cada barra da onda, em % . a mesma forma pras três passadas, porque
   é um desenho de voz, não um dado. Ímpar de propósito: onda simétrica parece
   gráfico. */
const ONDA = [26, 52, 38, 74, 96, 62, 88, 44, 70, 34, 58, 82, 48, 66, 30, 54, 40, 24];

const MARCAS: Record<Porta, { nome: string; svg: React.ReactNode }> = {
  whatsapp: {
    nome: "WhatsApp",
    svg: <img src="/assets/icons/whatsapp.svg" alt="" width={15} height={15} loading="lazy" />,
  },
  slack: {
    nome: "Slack",
    svg: (
      /* o cata-vento do Slack: quatro barras arredondadas, duas na horizontal e
         duas na vertical, cada par de uma cor da marca deles */
      <svg viewBox="0 0 24 24" width={15} height={15} aria-hidden="true">
        <path fill="#E01E5A" d="M5.1 15.2a2.1 2.1 0 1 1-2.1-2.1h2.1zM6.2 15.2a2.1 2.1 0 0 1 4.2 0v5.3a2.1 2.1 0 0 1-4.2 0z" />
        <path fill="#36C5F0" d="M8.3 5.1a2.1 2.1 0 1 1 2.1-2.1v2.1zM8.3 6.2a2.1 2.1 0 0 1 0 4.2H3a2.1 2.1 0 0 1 0-4.2z" />
        <path fill="#2EB67D" d="M18.9 8.3a2.1 2.1 0 1 1 2.1 2.1h-2.1zM17.8 8.3a2.1 2.1 0 0 1-4.2 0V3a2.1 2.1 0 0 1 4.2 0z" />
        <path fill="#ECB22E" d="M15.7 18.9a2.1 2.1 0 1 1-2.1 2.1v-2.1zM15.7 17.8a2.1 2.1 0 0 1 0-4.2H21a2.1 2.1 0 0 1 0 4.2z" />
      </svg>
    ),
  },
  vos: {
    nome: "VOS",
    svg: <img src="/assets/brand/vos-simbolo.png" alt="" width={15} height={15} loading="lazy" />,
  },
};

export default function VozCena() {
  const palco = useRef<HTMLDivElement>(null);
  const naTela = useInView(palco, { amount: 0.35 });
  const reduce = useReducedMotion();

  const [i, setI] = useState(0);
  /* 0 fala · 1 a onda viaja · 2 vira ficha · 3 o registro acende */
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!naTela || reduce) return;
    const passos = [1700, 1800, 2100, 2600];
    const t = window.setTimeout(() => {
      setBeat((b) => {
        if (b < 3) return b + 1;
        setI((n) => (n + 1) % PASSADAS.length);
        return 0;
      });
    }, passos[beat]);
    return () => window.clearTimeout(t);
  }, [naTela, reduce, beat, i]);

  const p = PASSADAS[i];
  const marca = MARCAS[p.porta];
  /* a onda saiu do celular a partir do beat 1, e some quando vira ficha */
  const viajando = beat >= 1;
  const virou = beat >= 2;

  return (
    <div className="vz" ref={palco} aria-hidden="true">
      {/* a poça de luz: é ela que dá chão pras peças sem precisar de painel */}
      <span className="vz-poca" />

      <div className="vz-trilho">
        {/* ── ESQUERDA: quem falou ─────────────────────────────── */}
        <div className="vz-origem">
          <AnimatePresence mode="wait">
            <motion.div
              key={`o${i}`}
              className="vz-pessoa"
              initial={reduce ? false : { opacity: 0, x: -18 }}
              animate={{ opacity: virou ? 0.35 : 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <img className="vz-foto" src={p.foto} alt="" loading="lazy" />
              <span className="vz-quem">
                <b>{p.quem}</b>
                <em>
                  {marca.svg}
                  {p.papel}
                </em>
              </span>
            </motion.div>
          </AnimatePresence>

          {/* o recado de voz: a bolha que todo mundo reconhece */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`b${i}`}
              className="vz-bolha"
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: virou ? 0.3 : 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.48, ease: EASE, delay: 0.14 }}
            >
              <span className="vz-play">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
              <span className={`vz-onda vz-onda--bolha${viajando ? " is-ouvida" : ""}`}>
                {ONDA.map((h, k) => (
                  <i key={k} style={{ height: `${h}%` }} />
                ))}
              </span>
              <span className="vz-dur">{p.duracao}</span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`f${i}`}
              className="vz-fala"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: virou ? 0.22 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
            >
              “{p.fala}”
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── MEIO: o Zé. A onda atravessa ele e sai como estrutura ── */}
        <div className="vz-meio">
          <span className={`vz-ze${viajando && !virou ? " is-passando" : ""}`}>
            <img src="/mascote/ze-roxo-nogog.png" alt="" loading="lazy" />
          </span>

          {/* A ONDA VIAJANDO. Ela é o objeto único que o olho segue: sai da
              bolha, cruza o Zé e, do outro lado, as cristas endurecem e viram
              as linhas da ficha. */}
          <AnimatePresence>
            {viajando && !virou && (
              <span className="vz-voo">
                <motion.span
                  className="vz-onda vz-onda--voo"
                  initial={reduce ? false : { opacity: 0, x: -150, scaleX: 0.72 }}
                  animate={{ opacity: 1, x: 0, scaleX: 1 }}
                  exit={{ opacity: 0, x: 140, scaleX: 1.3 }}
                  transition={{ duration: 0.95, ease: EASE }}
                >
                  {ONDA.map((h, k) => (
                    <motion.i
                      key={k}
                      /* ela pulsa como voz durante a travessia e só ENDURECE no
                         fim, na hora de virar linha de ficha. Achatar desde o
                         começo entregava o fim antes da hora. */
                      initial={{ height: `${h}%` }}
                      animate={{ height: [`${h}%`, `${Math.min(100, h * 1.25)}%`, `${h}%`, "26%"] }}
                      transition={{ duration: 1.7, ease: EASE, times: [0, 0.3, 0.68, 1], delay: k * 0.014 }}
                    />
                  ))}
                </motion.span>
              </span>
            )}
          </AnimatePresence>
        </div>

        {/* ── DIREITA: o que saiu pronto ───────────────────────── */}
        <div className="vz-saida">
          <AnimatePresence mode="wait">
            {virou && (
              <motion.div
                key={`c${i}`}
                className="vz-ficha"
                initial={reduce ? false : { opacity: 0, x: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.52, ease: EASE }}
              >
                <span className="vz-ficha-rot">{p.ficha.rotulo}</span>
                <b>{p.ficha.titulo}</b>
                <em>{p.ficha.meta}</em>
                <strong>{p.ficha.valor}</strong>
              </motion.div>
            )}
          </AnimatePresence>

          {/* O registro. É o detalhe que separa a cena de toda demo de IA que
              existe: todo mundo mostra a IA agindo, quase ninguém mostra o
              botão de desfazer. */}
          <AnimatePresence mode="wait">
            {beat >= 3 && (
              <motion.div
                key={`r${i}`}
                className="vz-registro"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.42, ease: EASE }}
              >
                <span className="vz-reg-ok">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5 10 17.5 19 7.5" />
                  </svg>
                </span>
                <span className="vz-reg-txt">
                  O Zé {p.registro}
                </span>
                <span className="vz-reg-desfaz">desfazer</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
