"use client";

/**
 * As cenas que moram por cima da foto de cada canal.
 *
 * Só os canais que ganham prova em UI têm cena; os outros ficam na foto pura.
 * Tudo aqui é HTML de verdade, nunca tela gerada: gerador embaralha texto de
 * interface, e num cartão pequeno isso salta.
 *
 * O "efeito UP" é a assinatura do bloco: cada peça sobe do pé com um atraso
 * próprio quando o cartão entra na tela, e a cena do catálogo repete o ciclo.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Sobe do pé: a entrada padrão de toda peça deste bloco. */
const sobe = (atraso: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: EASE, delay: atraso },
});

/* ═══════════════════ WhatsApp · a IA respondendo ═══════════════════ */

/* A conversa vai do "tem?" até o código de rastreio. Seis falas, não quatro:
   a tela do celular é alta e quatro balões deixavam metade do cartão vazio. */
const CONVERSA = [
  { de: "cliente", txt: "Oi! Ainda tem o vestido bege no M?" },
  { de: "ze", txt: "Tenho 2 no M. Quer que eu reserve?" },
  { de: "cliente", txt: "Quero!" },
  { de: "ze", txt: "Reservado ✓ mandei o link de pagamento" },
  { de: "cliente", txt: "Paguei agora" },
  { de: "ze", txt: "Recebido. Sai hoje, o código chega no fim do dia" },
];

/* Quem manda é a JANELA da conversa, não o cartão (founder 15/09: "iniciar no
   scroll pro usuário não perder nada"). Com metade do cartão na tela ela já
   rodava enquanto a pessoa ainda lia o título, e chegava na terceira fala.
   Agora: começa com a janela quase inteira à vista, PAUSA se ela sai da tela e
   continua de onde parou quando volta. Terminada, fica inteira (não recomeça). */
const PRIMEIRA_FALA_MS = 500;
const ENTRE_FALAS_MS = 1100;

function CenaWhatsApp() {
  const reduce = useReducedMotion();
  const tela = useRef<HTMLDivElement>(null);
  const vista = useInView(tela, { amount: 0.8 });
  const [n, setN] = useState(reduce ? CONVERSA.length : 0);

  useEffect(() => {
    if (!vista || reduce || n >= CONVERSA.length) return;
    const t = window.setTimeout(() => setN((k) => k + 1), n === 0 ? PRIMEIRA_FALA_MS : ENTRE_FALAS_MS);
    return () => window.clearTimeout(t);
  }, [vista, reduce, n]);

  return (
    <div className="cn-wa" aria-hidden="true" ref={tela}>
      <div className="cn-wa-topo">
        <img src="/assets/icons/whatsapp.svg" alt="" width={16} height={16} loading="lazy" />
        <b>Ateliê Rio</b>
        <em>on-line</em>
      </div>
      <div className="cn-wa-fio">
        {CONVERSA.slice(0, n).map((m, i) => (
          <motion.p key={i} className={`cn-wa-msg is-${m.de}`} {...sobe(0)}>
            {m.txt}
            {m.de === "ze" && <i className="cn-wa-selo">Zé</i>}
          </motion.p>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ Catálogo · da vitrine à venda ═══════════════════ */

/**
 * A loja aqui vende SERVIÇO, não peça. Os outros quatro cartões já são cheios
 * de produto, e metade da base do VOS cobra por hora de trabalho, não por caixa
 * no estoque: salão, oficina, clínica, escritório. O catálogo é onde isso
 * aparece.
 *
 * A anatomia é a da loja de verdade (apps/web .. storefront/catalog.tsx):
 * cabeçalho, categorias em pílula, card sem casca e preço no laranja da marca.
 */
const CATEGORIAS = [
  { nome: "Tudo", icone: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></> },
  { nome: "Cabelo", icone: <><circle cx="6" cy="18" r="2.6" /><circle cx="18" cy="18" r="2.6" /><path d="M7.9 16.1 19 4M16.1 16.1 5 4" /></> },
  { nome: "Unhas", icone: <path d="M12 3.4c3 4 5 6.7 5 9.1a5 5 0 0 1-10 0c0-2.4 2-5.1 5-9.1z" /> },
  { nome: "Sobrancelha", icone: <><path d="M2.6 12S6.1 5.6 12 5.6 21.4 12 21.4 12 17.9 18.4 12 18.4 2.6 12 2.6 12z" /><circle cx="12" cy="12" r="3" /></> },
];

const SERVICOS = [
  { nome: "Coloração completa", preco: "R$ 280,00", foto: "/assets/servico/coloracao.jpg" },
  { nome: "Corte + escova", preco: "R$ 120,00", foto: "/assets/servico/corte.jpg" },
  { nome: "Manicure", preco: "R$ 60,00", foto: "/assets/servico/manicure.jpg" },
  { nome: "Design de sobrancelha", preco: "R$ 45,00", foto: "/assets/servico/sobrancelha.jpg" },
];

/** O serviço que o cliente escolhe: o primeiro da vitrine. */
const ESCOLHIDO = SERVICOS[0];

const ATOS = [
  { id: "vitrine", rotulo: "O cliente abre o seu link" },
  { id: "produto", rotulo: "Escolhe o serviço" },
  { id: "whats", rotulo: "Pede pelo WhatsApp" },
  { id: "pedido", rotulo: "Pedido emitido" },
  { id: "venda", rotulo: "Venda feita" },
];

function CenaCatalogo({ ativa }: { ativa: boolean }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!ativa || reduce) return;
    const iv = window.setInterval(() => setI((n) => (n + 1) % ATOS.length), 1700);
    return () => window.clearInterval(iv);
  }, [ativa, reduce]);

  const ato = ATOS[i].id;
  /* Toda cena preenche a tela inteira: bloco pequeno no meio de uma caixa
     grande deixava o cartão com cara de vazio. */
  const cena = { ...sobe(0), exit: { opacity: 0, y: -14 } };

  return (
    <div className="cn-cat" aria-hidden="true">
      <div className="cn-cat-tela">
        <AnimatePresence mode="wait">
          {ato === "vitrine" && (
            <motion.div key="v" className="cn-loja" {...cena}>
              <div className="cn-loja-topo">
                {/* marca de cliente de verdade. O carrossel de setores fica com
                    o Studio Bella: dois negócios em dois lugares convence mais
                    que o mesmo repetido. */}
                <img className="cn-loja-marca" src="/assets/logos/syntia-daniela.png" alt="" width={30} height={30} loading="lazy" />
                <b>Syntia Daniela</b>
                <svg className="cn-loja-ok" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2 14.6 4.5 18.2 4.1 19 7.6 22 9.6 20.6 12.9 22 16.2 19 18.2 18.2 21.7 14.6 21.3 12 23.8 9.4 21.3 5.8 21.7 5 18.2 2 16.2 3.4 12.9 2 9.6 5 7.6 5.8 4.1 9.4 4.5Z" />
                  <path d="m10.8 15.4-2.9-2.9 1.3-1.3 1.6 1.6 3.9-3.9 1.3 1.3z" fill="#0c0e10" />
                </svg>
                <i className="cn-loja-busca" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="m15.5 15.5 4 4" />
                  </svg>
                </i>
              </div>

              <div className="cn-loja-filtros">
                {CATEGORIAS.map((c, k) => (
                  <span key={c.nome} className={k === 0 ? "is-on" : undefined}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {c.icone}
                    </svg>
                    {c.nome}
                  </span>
                ))}
              </div>

              <div className="cn-loja-grade">
                {SERVICOS.map((sv, k) => (
                  <span key={sv.nome} className={`cn-peca${k === 0 ? " is-alvo" : ""}`}>
                    <img src={sv.foto} alt="" loading="lazy" />
                    <b>{sv.nome}</b>
                    <em>{sv.preco}</em>
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* A ficha do serviço, com os dois botões que a loja mostra de verdade:
              Comprar agora primeiro, porque é o caminho mais curto até o pedido. */}
          {ato === "produto" && (
            <motion.div key="p" className="cn-ficha" {...cena}>
              <img className="cn-ficha-foto" src={ESCOLHIDO.foto} alt="" loading="lazy" />
              <div className="cn-ficha-txt">
                <b>{ESCOLHIDO.nome}</b>
                <span>2h · com a Marina</span>
                <strong>{ESCOLHIDO.preco}</strong>
              </div>
              <div className="cn-buys">
                <i className="is-primario">Comprar agora</i>
                <i>Adicionar</i>
              </div>
            </motion.div>
          )}

          {ato === "whats" && (
            <motion.div key="w" className="cn-ficha" {...cena}>
              <img className="cn-ficha-foto" src={ESCOLHIDO.foto} alt="" loading="lazy" />
              <div className="cn-ficha-txt">
                <b>{ESCOLHIDO.nome}</b>
                <span>2h · com a Marina</span>
                <strong>{ESCOLHIDO.preco}</strong>
              </div>
              <motion.div
                className="cn-buys"
                initial={reduce ? false : { scale: 1 }}
                animate={reduce ? {} : { scale: [1, 0.96, 1] }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.42 }}
              >
                <i className="is-whats">
                  <img src="/assets/icons/whatsapp.svg" alt="" width={14} height={14} loading="lazy" />
                  Pedir pelo WhatsApp
                </i>
              </motion.div>
            </motion.div>
          )}

          {ato === "pedido" && (
            <motion.div key="e" className="cn-pedido" {...cena}>
              <div className="cn-pedido-topo">
                <span className="cn-cat-num">Pedido #1934</span>
                <i>Pago</i>
              </div>
              <div className="cn-pedido-item">
                <img src={ESCOLHIDO.foto} alt="" loading="lazy" />
                <span>
                  <b>{ESCOLHIDO.nome}</b>
                  <em>1 × {ESCOLHIDO.preco}</em>
                </span>
              </div>
              <dl className="cn-pedido-contas">
                <div><dt>Subtotal</dt><dd>R$ 280,00</dd></div>
                <div><dt>Taxa</dt><dd>R$ 0,00</dd></div>
                <div className="is-total"><dt>Total</dt><dd>R$ 280,00</dd></div>
              </dl>
              <p className="cn-pedido-pg">Cartão **** 0208 · aprovado</p>
            </motion.div>
          )}

          {ato === "venda" && (
            <motion.div key="f" className="cn-feita" {...cena}>
              <span className="cn-feita-selo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5 10 17.5 19 7.5" />
                </svg>
              </span>
              <b>Venda feita</b>
              <strong>R$ 280,00</strong>
              <ul>
                <li>Agenda da Marina reservada</li>
                <li>Caixa do dia atualizado</li>
                <li>Cliente avisado no WhatsApp</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="cn-cat-rotulo">{ATOS[i].rotulo}</p>
    </div>
  );
}

/* ═══════════════════ Redes · as notificações em volta ═══════════════════ */

/**
 * Ancoradas por LADO, nunca pelo centro: a pílula tem largura variável e,
 * centrada numa porcentagem, a mais larga estourava a borda e era cortada.
 * Só na metade de cima, porque embaixo mora o título do cartão.
 */
const PINGS = [
  { ico: "/assets/icons/instagram.svg", txt: "12 curtidas", lado: "esq", off: 9, topo: 6, d: 0 },
  { ico: "/assets/icons/whatsapp.svg", txt: "Quanto custa?", lado: "dir", off: 8, topo: 34, d: 1.1 },
  { ico: "/assets/icons/tiktok.svg", txt: "3 salvaram", lado: "esq", off: 15, topo: 62, d: 2.2 },
  { ico: "/assets/icons/messenger.svg", txt: "Tem no P?", lado: "dir", off: 17, topo: 86, d: 3.3 },
];

function CenaRedes({ ativa }: { ativa: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="cn-redes" aria-hidden="true">
      {PINGS.map((p, i) => (
        <motion.span
          key={i}
          className="cn-ping"
          style={p.lado === "esq" ? { left: `${p.off}%`, top: `${p.topo}%` } : { right: `${p.off}%`, top: `${p.topo}%` }}
          initial={{ opacity: 0, y: 10 }}
          animate={
            ativa
              ? reduce
                ? { opacity: 1, y: 0 }
                : { opacity: [0, 1, 1, 0], y: [10, 0, -3, -10] }
              : { opacity: 0 }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 5, ease: EASE, delay: p.d, repeat: Infinity, repeatDelay: 2.2, times: [0, 0.2, 0.78, 1] }
          }
        >
          <img src={p.ico} alt="" width={14} height={14} loading="lazy" />
          {p.txt}
        </motion.span>
      ))}
    </div>
  );
}

/* ═══════════════════ Loja virtual · a chuva de vendas ═══════════════════ */

/**
 * O aviso é do VOS, com a marca: é o que chega no celular do dono.
 * Oito valores e canais diferentes; a janela mostra três, então nenhum se
 * repete na tela.
 */
const VENDAS = [
  { v: "R$ 279,90", onde: "da sua loja online" },
  { v: "R$ 389,90", onde: "pelo WhatsApp" },
  { v: "R$ 129,00", onde: "no catálogo digital" },
  { v: "R$ 1.494,00", onde: "da sua loja online" },
  { v: "R$ 640,00", onde: "pelo Instagram" },
  { v: "R$ 89,90", onde: "no balcão da loja" },
  { v: "R$ 740,00", onde: "pelo WhatsApp" },
  { v: "R$ 218,00", onde: "da sua loja online" },
];

const NA_TELA = 3;

function CenaVendas({ ativa }: { ativa: boolean }) {
  const reduce = useReducedMotion();
  const [topo, setTopo] = useState(NA_TELA);

  useEffect(() => {
    if (!ativa || reduce) return;
    const iv = window.setInterval(() => setTopo((n) => n + 1), 2600);
    return () => window.clearInterval(iv);
  }, [ativa, reduce]);

  // a janela anda pela lista: a mais nova entra por cima e empurra as outras
  const visiveis = Array.from({ length: NA_TELA }, (_, k) => {
    const n = topo - k;
    return { chave: n, v: VENDAS[((n % VENDAS.length) + VENDAS.length) % VENDAS.length], nova: k === 0 };
  });

  return (
    <div className="cn-vendas" aria-hidden="true">
      <AnimatePresence initial={false} mode="popLayout">
        {visiveis.map(({ chave, v, nova }) => (
          <motion.div
            key={chave}
            layout
            className={`cn-aviso${nova ? " is-nova" : ""}`}
            initial={reduce ? false : { opacity: 0, y: -26, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.22, ease: EASE } }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <img className="cn-aviso-marca" src="/assets/brand/vos-simbolo-dark.png" alt="" width={28} height={28} loading="lazy" />
            <span>
              <b>Nova venda</b>
              <em>
                Você tem uma nova venda de <strong>{v.v}</strong> {v.onde}.
              </em>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ PDV · os valores subindo do terminal ═══════════════════ */

const PASSADAS = ["+R$ 89,90", "+R$ 45,00", "+R$ 219,00", "+R$ 129,90", "+R$ 64,00", "+R$ 310,00"];

function CenaPdv({ ativa }: { ativa: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className="cn-pdv" aria-hidden="true">
        <span className="cn-valor" style={{ left: "24%", bottom: "40%" }}>{PASSADAS[0]}</span>
      </div>
    );
  }
  return (
    <div className="cn-pdv" aria-hidden="true">
      {PASSADAS.map((p, i) => (
        <motion.span
          key={p}
          className="cn-valor"
          /* DUAS faixas alternadas e curso longo. Com 1,1s de intervalo e 3,2s
             de vida, três valores ficam no ar ao mesmo tempo: alternando a
             faixa, os dois vizinhos no tempo nunca dividem a mesma coluna, e o
             par que divide está a duas passadas de distância na vertical. Três
             faixas estreitas colavam um no outro no cartão do celular. */
          style={{ left: `${13 + (i % 2) * 27}%` }}
          initial={{ opacity: 0, y: 0 }}
          animate={ativa ? { opacity: [0, 1, 1, 0], y: [0, -56, -114, -170] } : { opacity: 0 }}
          transition={{
            duration: 3.2,
            ease: EASE,
            delay: i * 1.1,
            repeat: Infinity,
            repeatDelay: PASSADAS.length * 1.1 - 3.2,
            times: [0, 0.2, 0.7, 1],
          }}
        >
          {p}
        </motion.span>
      ))}
    </div>
  );
}

/* ═══════════════════ o despachante ═══════════════════ */

export default function CanalCena({ tipo }: { tipo: "whatsapp" | "catalogo" | "redes" | "vendas" | "pdv" }) {
  const alvo = useRef<HTMLDivElement>(null);
  const ativa = useInView(alvo, { amount: 0.5 });

  return (
    <div className="cn" ref={alvo}>
      {tipo === "whatsapp" && <CenaWhatsApp />}
      {tipo === "catalogo" && <CenaCatalogo ativa={ativa} />}
      {tipo === "redes" && <CenaRedes ativa={ativa} />}
      {tipo === "vendas" && <CenaVendas ativa={ativa} />}
      {tipo === "pdv" && <CenaPdv ativa={ativa} />}
    </div>
  );
}
