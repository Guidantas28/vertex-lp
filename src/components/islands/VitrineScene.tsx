"use client";

/**
 * VitrineScene: o filme do "você pede, o VOS faz", em 4 atos que dão a volta.
 *
 * 1. Você pede pro Zé, em português, no composer do produto.
 * 2. A foto vira ficha: o quadro corre sobre a imagem e sai um produto com nome e preço.
 * 3. Já está no ar: a ficha se multiplica nos canais (Loja, Catálogo, Instagram).
 * 4. A venda cai: as notificações empilham e o caixa sobe. Volta pro ato 1.
 *
 * Por que em HTML e não em vídeo: aqui a UI é REAL (texto nítido em qualquer tela,
 * sem peso de arquivo) e responde ao tamanho da tela. Gerador de vídeo por IA
 * embaralha texto de interface, então UI nunca é gerada.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const PEDIDO = "Zé, põe o tênis Runner 42 na loja por R$ 389";

type Ato = 0 | 1 | 2 | 3;

/**
 * Onde a ficha foi parar, com o RESULTADO de cada canal. Ícone real, número
 * concreto: a história sobe de disparo pra interesse e de interesse pra conversa.
 */
const CANAIS = [
  { nome: "E-mail", icone: "/assets/icons/email.svg", num: "2.140", res: "clientes avisados" },
  { nome: "WhatsApp", icone: "/assets/icons/whatsapp.svg", num: "7", res: "já perguntaram o preço" },
  { nome: "Instagram", icone: "/assets/icons/instagram.svg", num: "17", res: "reagiram ao story" },
];

/**
 * A nuvem de vendas: cada peça vendida vira um cartão com a cara de quem
 * comprou, espalhado numa ELIPSE. Quem está na frente aparece inteiro; quem
 * está no fundo entra menor, desfocado e mais apagado, o que dá profundidade.
 * `a` é o ângulo na elipse e `z` a distância (1 = na frente).
 */
type Venda = { nome: string; foto: string; valor: string; canal: string; a: number; z: number };

const VENDAS: Venda[] = [
  { nome: "Carla Mendes", foto: "/assets/people/social-19.webp", valor: "R$ 389,90", canal: "/assets/icons/whatsapp.svg", a: 210, z: 1 },
  { nome: "Alberto Nunes", foto: "/assets/people/social-11.webp", valor: "R$ 1.494,00", canal: "/assets/icons/instagram.svg", a: 330, z: 1 },
  { nome: "Patrícia Reis", foto: "/assets/people/social-12.webp", valor: "R$ 279,00", canal: "/assets/icons/whatsapp.svg", a: 90, z: 0.82 },
  { nome: "Tiago Moraes", foto: "/assets/people/social-16.webp", valor: "R$ 389,90", canal: "/assets/icons/email.svg", a: 30, z: 0.78 },
  { nome: "Aline Costa", foto: "/assets/people/social-21.webp", valor: "R$ 640,00", canal: "/assets/icons/whatsapp.svg", a: 270, z: 0.62 },
  { nome: "Diego Prado", foto: "/assets/people/social-20.webp", valor: "R$ 389,90", canal: "/assets/icons/instagram.svg", a: 150, z: 0.58 },
];

/** Peças ao fundo, sem nome: dão volume à nuvem sem roubar leitura. */
const FUNDO = [
  { a: 0, z: 0.4 }, { a: 60, z: 0.3 }, { a: 120, z: 0.36 },
  { a: 180, z: 0.28 }, { a: 240, z: 0.42 }, { a: 300, z: 0.32 },
  { a: 345, z: 0.24 }, { a: 195, z: 0.22 },
];

/** Posição na elipse: larga em x, achatada em y, afastando com a profundidade. */
function naElipse(a: number, z: number) {
  const rad = (a * Math.PI) / 180;
  // o que está no fundo abre mais; o da frente fica perto do centro
  const espalha = 1.18 - z * 0.26;
  return {
    x: Math.cos(rad) * 36 * espalha,
    y: Math.sin(rad) * 26 * espalha,
  };
}

export default function VitrineScene() {
  const palco = useRef<HTMLDivElement>(null);
  const naTela = useInView(palco, { amount: 0.4 });
  const reduce = useReducedMotion();

  const [ato, setAto] = useState<Ato>(0);
  const [digitado, setDigitado] = useState("");
  const [enviado, setEnviado] = useState(false);

  // ── Ato 1: a frase é digitada letra a letra ──
  useEffect(() => {
    if (!naTela || ato !== 0) return;
    if (reduce) {
      setDigitado(PEDIDO);
      setEnviado(true);
      return;
    }
    setDigitado("");
    setEnviado(false);
    let i = 0;
    const iv = window.setInterval(() => {
      i += 1;
      setDigitado(PEDIDO.slice(0, i));
      if (i >= PEDIDO.length) {
        window.clearInterval(iv);
        window.setTimeout(() => setEnviado(true), 420);
      }
    }, 34);
    return () => window.clearInterval(iv);
  }, [naTela, ato, reduce]);

  // ── A roda dos atos ──
  useEffect(() => {
    if (!naTela || reduce) return;
    const espera: Record<Ato, number> = { 0: PEDIDO.length * 34 + 1500, 1: 2600, 2: 2800, 3: 3600 };
    const t = window.setTimeout(() => setAto((a) => ((a + 1) % 4) as Ato), espera[ato]);
    return () => window.clearTimeout(t);
  }, [naTela, ato, reduce]);

  return (
    <div className="vtr" ref={palco}>
      <div className="vtr-palco">
        <div className="vtr-glow" aria-hidden="true" />

        <AnimatePresence mode="wait">
          {/* ───────────── ATO 1 · você pede ───────────── */}
          {ato === 0 && (
            <motion.div
              key="ato1"
              className="vtr-ato vtr-ato--pedido"
              initial={{ opacity: 0, scale: 0.86, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className={`vtr-composer${enviado ? " is-sent" : ""}`}>
                <img className="vtr-ze" src="/assets/ze/ze-heroi-sm.webp" alt="" width={30} height={30} />
                <p>
                  {digitado}
                  {!enviado && <i className="vtr-caret" />}
                </p>
                <span className="vtr-send" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </span>
              </div>
              <p className="vtr-hint">Sem formulário, sem cadastro, sem planilha</p>
            </motion.div>
          )}

          {/* ───────────── ATO 2 · a foto vira ficha ───────────── */}
          {ato === 1 && (
            <motion.div
              key="ato2"
              className="vtr-ato"
              initial={{ opacity: 0, scale: 0.86, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="vtr-ficha">
                <div className="vtr-ficha-foto">
                  <img src="/assets/produto/tenis-runner-42.jpg" alt="" loading="lazy" />
                  <span className="vtr-scan" aria-hidden="true" />
                  <span className="vtr-mira" aria-hidden="true" />
                </div>
                <motion.div
                  className="vtr-ficha-dados"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.55 }}
                >
                  <b>Tênis Runner 42</b>
                  <span className="vtr-preco">R$ 389,90</span>
                  <div className="vtr-ficha-chips">
                    <em className="zx-chip">SKU RUN-42</em>
                    <em className="zx-chip zx-chip--ok">No ar</em>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ───────────── ATO 3 · já está no ar ───────────── */}
          {ato === 2 && (
            <motion.div
              key="ato3"
              className="vtr-ato vtr-ato--canais"
              initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {CANAIS.map((c, i) => (
                <motion.div
                  key={c.nome}
                  className="vtr-canal"
                  initial={{ opacity: 0, y: 26, rotate: i === 1 ? 0 : i === 0 ? -2.5 : 2.5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: i * 0.22 }}
                >
                  <span className="vtr-canal-peca">
                    <img
                      className="vtr-canal-foto"
                      src="/assets/produto/tenis-runner-42.jpg"
                      alt=""
                      loading="lazy"
                      style={{ objectPosition: ["50% 62%", "42% 50%", "58% 46%"][i] }}
                    />
                    <img className="vtr-canal-ico" src={c.icone} alt={c.nome} width={26} height={26} loading="lazy" />
                  </span>
                  <motion.span
                    className="vtr-canal-res"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.42, ease: EASE, delay: 0.7 + i * 0.22 }}
                  >
                    <b>{c.num}</b>
                    <em>{c.res}</em>
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ───────────── ATO 4 · a nuvem de vendas ───────────── */}
          {ato === 3 && (
            <motion.div
              key="ato4"
              className="vtr-ato vtr-ato--nuvem"
              initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.12, filter: "blur(12px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {FUNDO.map((f, i) => {
                const { x, y } = naElipse(f.a, f.z);
                return (
                  <span
                    key={`f-${i}`}
                    className="vtr-ponto"
                    style={{ left: `calc(50% + ${x}%)`, top: `calc(50% + ${y}%)`, zIndex: Math.round(f.z * 10) }}
                  >
                    <motion.span
                      className="vtr-peca-fundo"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 0.22 + f.z * 0.5, scale: 0.4 + f.z * 0.7 }}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.05 }}
                    >
                      <img src="/assets/produto/tenis-runner-42.jpg" alt="" loading="lazy" />
                    </motion.span>
                  </span>
                );
              })}

              {VENDAS.map((v, i) => {
                const { x, y } = naElipse(v.a, v.z);
                return (
                  <span
                    key={v.nome}
                    className="vtr-ponto"
                    style={{
                      left: `calc(50% + ${x}%)`,
                      top: `calc(50% + ${y}%)`,
                      zIndex: 20 + Math.round(v.z * 10),
                      filter: v.z < 0.8 ? `blur(${((0.8 - v.z) * 6).toFixed(1)}px)` : undefined,
                    }}
                  >
                  <motion.div
                    className="vtr-venda"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 0.42 + v.z * 0.58, scale: 0.52 + v.z * 0.48 }}
                    transition={{ duration: 0.55, ease: EASE, delay: 0.25 + i * 0.13 }}
                  >
                    <span className="vtr-venda-check" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5 10 17.5 19 7.5" />
                      </svg>
                    </span>
                    <img className="vtr-venda-foto" src={v.foto} alt="" loading="lazy" />
                    <div className="vtr-venda-pe">
                      <b>{v.nome}</b>
                      <span>
                        <img src={v.canal} alt="" width={12} height={12} loading="lazy" />
                        {v.valor}
                      </span>
                    </div>
                  </motion.div>
                  </span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
