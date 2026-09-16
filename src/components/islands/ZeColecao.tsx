"use client";

/**
 * A CENA DO ZÉ MONTANDO UMA COLEÇÃO.
 *
 * Estrutura copiada do Sidekick da Shopify (gravação do founder, 15/09), lida
 * quadro a quadro: fotos de catálogo flutuando em profundidades diferentes
 * sobre um palco violeta, um composer branco no meio, e o pedido virando
 * primeiro uma janela de resposta e depois a loja renderizada.
 *
 * O VIOLETA é sancionado aqui e só aqui: `--m-ai` é a cor do Zé no produto, a
 * única cor própria que sobrou depois do acento único (founder 31/08). Esta é
 * a cena DELE. Nas outras seções o palco continua Carvão.
 *
 * As fotos são nossas, geradas no mesmo estúdio umas das outras . uniformidade
 * é o que faz a grade final ler como COLEÇÃO e não como colagem.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const PEDIDO = "Zé, monta uma coleção com o que mais vende";

type Peca = { foto: string; nome: string; preco: string };

const PECAS: Peca[] = [
  { foto: "/assets/vitrine/peca-1.jpg", nome: "Tricô Terracota", preco: "R$ 189,00" },
  { foto: "/assets/vitrine/peca-2.jpg", nome: "Tricô Areia", preco: "R$ 189,00" },
  { foto: "/assets/vitrine/peca-3.jpg", nome: "Tricô Oliva", preco: "R$ 199,00" },
  { foto: "/assets/vitrine/peca-4.jpg", nome: "Camisa Camel", preco: "R$ 229,00" },
];
/* as duas de trás: só entram desfocadas, pra dar profundidade ao palco */
const FUNDO = ["/assets/vitrine/peca-5.jpg", "/assets/vitrine/peca-6.jpg"];

/* Onde cada peça flutua no ato 1, em % do palco. Alturas e escalas diferentes
   de propósito: fileira alinhada não tem profundidade. */
const SOLTAS = [
  { x: 4, y: 12, z: 0.82, b: 3 },
  { x: 26, y: 44, z: 1, b: 0 },
  { x: 62, y: 6, z: 0.9, b: 1.5 },
  { x: 80, y: 40, z: 0.74, b: 4 },
];

export default function ZeColecao() {
  const palco = useRef<HTMLDivElement>(null);
  const naTela = useInView(palco, { amount: 0.35 });
  const reduce = useReducedMotion();

  /* 0 digitando · 1 as peças focam e enfileiram · 2 a resposta preenche · 3 vira loja */
  const [ato, setAto] = useState(0);
  const [digitado, setDigitado] = useState(reduce ? PEDIDO : "");

  /* o pedido sendo datilografado, letra por letra */
  useEffect(() => {
    if (!naTela || reduce || ato !== 0) return;
    setDigitado("");
    let n = 0;
    const iv = window.setInterval(() => {
      n += 1;
      setDigitado(PEDIDO.slice(0, n));
      if (n >= PEDIDO.length) window.clearInterval(iv);
    }, 42);
    return () => window.clearInterval(iv);
  }, [naTela, reduce, ato]);

  useEffect(() => {
    if (!naTela || reduce) return;
    const espera = [PEDIDO.length * 42 + 1400, 1700, 3400, 3200];
    const t = window.setTimeout(() => setAto((a) => (a + 1) % 4), espera[ato]);
    return () => window.clearTimeout(t);
  }, [naTela, reduce, ato]);

  const enfileirou = ato >= 1;
  const naLoja = ato === 3;

  return (
    <div className="zc" ref={palco} aria-hidden="true">
      <span className="zc-luz" />

      {/* ── as duas do fundo: só profundidade ── */}
      {!naLoja &&
        FUNDO.map((f, k) => (
          <span key={f} className={`zc-longe zc-longe--${k + 1}`}>
            <img src={f} alt="" loading="lazy" />
          </span>
        ))}

      {/* ── as quatro peças: soltas no ato 0, enfileiradas depois ── */}
      <div className={`zc-pecas${enfileirou ? " is-fila" : ""}${naLoja ? " is-loja" : ""}`}>
        {PECAS.map((p, k) => (
          <motion.span
            key={p.foto}
            className="zc-peca"
            layout
            style={
              enfileirou
                ? undefined
                : { left: `${SOLTAS[k].x}%`, top: `${SOLTAS[k].y}%`, filter: `blur(${SOLTAS[k].b}px)` }
            }
            initial={false}
            animate={{ scale: enfileirou ? 1 : SOLTAS[k].z, opacity: 1 }}
            transition={{ duration: 0.72, ease: EASE, delay: enfileirou ? k * 0.06 : 0 }}
          >
            <img src={p.foto} alt="" loading="lazy" />
            {naLoja && (
              <motion.span
                className="zc-etiqueta"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: EASE, delay: 0.2 + k * 0.05 }}
              >
                <b>{p.nome}</b>
                <em>{p.preco}</em>
              </motion.span>
            )}
          </motion.span>
        ))}
      </div>

      {/* ── o composer: sozinho no ato 0, dentro da janela depois ── */}
      <AnimatePresence>
        {ato === 0 && (
          <motion.div
            className="zc-composer"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <img className="zc-ze" src="/mascote/ze-roxo-nogog.png" alt="" loading="lazy" />
            <p>
              {digitado}
              {digitado.length < PEDIDO.length && <i className="zc-cursor" />}
            </p>
            <span className="zc-enviar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── a janela de resposta ── */}
      <AnimatePresence>
        {(ato === 1 || ato === 2) && (
          <motion.div
            className="zc-janela"
            initial={reduce ? false : { opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="zc-jan-topo">
              <span>Coleção mais vendidos</span>
              <i /><i /><i />
            </div>

            <div className="zc-jan-corpo">
              <p className="zc-eco">{PEDIDO}</p>

              {ato === 2 && (
                <>
                  <motion.p className="zc-diz" {...sobe(0)}>
                    Aqui está o que mais saiu nos últimos 30 dias:
                  </motion.p>
                  {/* o que ele consultou. "Consultar o sistema" é um poder de
                      verdade do catálogo de agentes, então dá pra mostrar. */}
                  <motion.p className="zc-consulta" {...sobe(0.1)}>
                    <span>Pedidos · 30 dias · agrupado por produto · ordenado por quantidade</span>
                    <b>{"</>"}</b>
                  </motion.p>
                  {PECAS.slice(0, 2).map((p, k) => (
                    <motion.p key={p.nome} className="zc-linha" {...sobe(0.2 + k * 0.08)}>
                      <img src={p.foto} alt="" loading="lazy" />
                      <span>{p.nome}</span>
                      <b>{p.preco}</b>
                    </motion.p>
                  ))}
                  <motion.p className="zc-mais" {...sobe(0.38)}>+2 itens</motion.p>
                </>
              )}
            </div>

            {ato === 2 && (
              <motion.div className="zc-jan-pe" {...sobe(0.48)}>
                <img className="zc-ze" src="/mascote/ze-roxo-nogog.png" alt="" loading="lazy" />
                <p>Publicar essa coleção na loja</p>
                <span className="zc-enviar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── o cabeçalho da loja, no último ato ── */}
      <AnimatePresence>
        {naLoja && (
          <motion.div
            className="zc-loja-topo"
            initial={reduce ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="zc-loja-chip">No ar</span>
            <b>Mais vendidos</b>
            <em>A coleção com as peças que os seus clientes mais levam.</em>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** entrada padrão das linhas da resposta */
function sobe(atraso: number) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: EASE, delay: atraso },
  };
}
