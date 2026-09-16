"use client";

/**
 * MODO ZÉ: a câmera atravessa a palavra e cai no mundo do Zé.
 *
 * Mora logo depois do "Cinco módulos, conectados no que você já usa" (Bento5),
 * na mesma folha Carvão. Por baixo é o GlyphPortal (components/ui), com quatro
 * decisões nossas por cima:
 *
 * 1. A palavra é laranja com violeta: dentro das letras corre o gradiente que o
 *    ZeAI4 usava antes do VOS UNO (founder 15/09). A rampa deita e anda com o
 *    scroll, então o M nasce violeta e o "É." termina laranja.
 * 2. O mergulho vai DIRETO pro violeta (founder 15/09: "não precisa entrar na
 *    página do gradiente do VOS"): enquanto a câmera entra, a noite violeta cobre
 *    a rampa, e a tela cheia já é a mesma noite do filme. O gradiente mora numa
 *    variável só (--mz-noite), usada aqui e no palco do filme, pra não ter emenda.
 * 3. Na abertura fica só a frase "Quando tudo precisa acontecer, ative o", maior,
 *    e ela se ESCREVE palavra por palavra enquanto desce com o scroll, desde o fim
 *    do "Atenda. Venda. Automatize. Cresça." do Bento5 (--mz-e, de 0 a 1). O sub e
 *    o botão saíram a pedido do founder.
 * 4. O portal só monta depois do Inter Tight 700 carregar. O componente congela
 *    a face na montagem e, se ela ainda estiver pendente, fica parado de
 *    propósito. Com teto de 1,6s, a pior hipótese é a palavra estática.
 * 5. O MERGULHO CUSTA UMA TELA (founder 15/09: "o scroll do Zé podia ser no máximo 3
 *    pra acabar, tá muito longo"). Era 2,2 de câmera mais 0,4 de margem, ou seja 1,4
 *    tela só pra entrar. Com scrollLength=1 a margem do componente zera sozinha
 *    ((1 - 1) × altura) e o filme encosta no fim do mergulho. Com as 2 telas do filme,
 *    a seção inteira acaba em 3.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";
import { ModoZeFilme } from "./ModoZeFilme";

const PALAVRA = "MODO ZÉ.";
/* A frase em palavras: a última, que chama a palavra grande, vai em ênfase.
   "ative o" é UMA peça (founder 15/09): no celular a frase quebra em duas
   linhas, e com o "o" solto ele caía sozinho na segunda . agora a quebra é
   "Quando tudo precisa acontecer," / "ative o", que é onde a frase respira. */
const FRASE = [
  { t: "Quando", forte: false },
  { t: "tudo", forte: false },
  { t: "precisa", forte: false },
  { t: "acontecer,", forte: false },
  { t: "ative o", forte: true },
];

export default function ModoZe() {
  const raiz = useRef<HTMLDivElement>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let aberto = true;
    const libera = () => {
      if (!aberto) return;
      aberto = false;
      setPronto(true);
    };
    const teto = window.setTimeout(libera, 1600);
    document.fonts.load('700 100px "Inter Tight"', PALAVRA).then(libera, libera);
    return () => {
      aberto = false;
      window.clearTimeout(teto);
    };
  }, []);

  // A entrada: 0 quando o topo da seção aparece embaixo da tela, 1 quando o portal gruda.
  // É ela que escreve e desce a frase, sem estado React.
  useEffect(() => {
    const el = raiz.current;
    if (!el || !pronto) return;
    let raf = 0;
    const mede = () => {
      raf = 0;
      const topo = el.getBoundingClientRect().top;
      const e = Math.min(1, Math.max(0, (window.innerHeight - topo) / window.innerHeight));
      el.style.setProperty("--mz-e", e.toFixed(4));
    };
    const pede = () => {
      if (!raf) raf = requestAnimationFrame(mede);
    };
    window.addEventListener("scroll", pede, { passive: true });
    window.addEventListener("resize", pede);
    mede();
    return () => {
      window.removeEventListener("scroll", pede);
      window.removeEventListener("resize", pede);
      cancelAnimationFrame(raf);
    };
  }, [pronto]);

  // Uma variável CSS por quadro, sem estado React: é o que faz o gradiente andar.
  const progresso = useCallback((p: number) => {
    raiz.current?.style.setProperty("--mz-p", p.toFixed(4));
  }, []);

  return (
    <div className="mz" ref={raiz}>
      {/* CSS por dangerouslySetInnerHTML, não como filho do <style>: como filho,
          o React escapa as aspas no servidor, a string não bate com a do
          cliente, e a hidratação da ilha cai inteira. */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {pronto ? (
        <GlyphPortal
          word={PALAVRA}
          focusChar="É"
          interactive={false}
          fontFamily={'"Inter Tight", sans-serif'}
          fontWeight={700}
          scrollLength={1}
          style={{
            "--gp-paper": "var(--zx-dark-deep)",
            "--gp-ink": "var(--zx-on-dark)",
            "--gp-field": "#1A0F3D",
            "--gp-foreground": "#FFFFFF",
          }}
          onProgress={progresso}
          background={<div className="mz-campo" />}
          front={
            <p className="mz-sobre" aria-label="Quando tudo precisa acontecer, ative o">
              {FRASE.map((w, i) => (
                <span
                  key={w.t}
                  className={w.forte ? "mz-w mz-w--forte" : "mz-w"}
                  style={{ "--i": i } as React.CSSProperties}
                  aria-hidden="true"
                >
                  {w.t}
                </span>
              ))}
            </p>
          }
        >
          {/* Dentro da palavra mora o filme: o time do Zé em três passos, com o Zé no poste. */}
          <ModoZeFilme />
        </GlyphPortal>
      ) : (
        // Reserva a tela enquanto a face carrega: sem ela a página pula quando o portal monta.
        <div className="mz-reserva" aria-hidden="true" />
      )}
    </div>
  );
}

const CSS = `
  .mz {
    /* A NOITE VIOLETA do Modo Zé: fundo inteiro do mergulho e do filme, uma definição só.
       Um tom MAIS FUNDO desde 15/09 (founder: "queria um violeta um pouco mais
       escuro"): o violeta continua sendo a cor do Zé, mas agora é noite de
       verdade . e é sobre esse escuro que o céu do palco (as estrelas e o arco
       do horizonte, no ModoZeFilme) tem contraste pra existir. */
    --mz-noite:
      radial-gradient(70% 60% at 12% 0%, rgba(124, 77, 255, 0.27), transparent 66%),
      radial-gradient(60% 50% at 96% 100%, rgba(237, 75, 0, 0.14), transparent 62%),
      radial-gradient(50% 45% at 72% 24%, rgba(168, 153, 255, 0.08), transparent 70%),
      linear-gradient(160deg, #1C1046 0%, #130A30 38%, #0B0620 70%, #05030D 100%);
    position: relative;
    background: var(--zx-dark-deep);
  }
  .mz-reserva { min-height: 100svh; }

  /* O campo é o que aparece DENTRO das letras e vira o fundo inteiro no mergulho.
     Por baixo, a rampa laranja com violeta (o gradiente de antes do UNO no ZeAI4, com o
     ângulo deitado pra a palavra pegar a rampa inteira). Por cima, a noite violeta, que
     entra enquanto a câmera mergulha: quando as letras enchem a tela ela já cobriu tudo. */
  .mz-campo {
    --mz-ang: 115deg;
    position: absolute;
    inset: 0;
    background:
      radial-gradient(80% 60% at 88% 92%, rgba(255, 180, 110, 0.55), transparent 60%),
      radial-gradient(70% 55% at 10% 8%, rgba(91, 40, 170, 0.85), transparent 62%),
      linear-gradient(var(--mz-ang), #52309F 0%, #8A3374 30%, #C2452F 58%, #ED4B00 82%, #FF8A3D 100%);
    background-size:
      100% 100%,
      100% 100%,
      calc(125% + var(--mz-p, 0) * 75%) calc(125% + var(--mz-p, 0) * 75%);
    background-position:
      center,
      center,
      calc(50% - var(--mz-p, 0) * 50%) calc(50% - var(--mz-p, 0) * 50%);
    transform: scale(var(--gp-field-scale, 1));
  }
  .mz-campo::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--mz-noite);
    opacity: clamp(0, calc((var(--mz-p, 0) - 0.08) / 0.3), 1);
  }
  @media (max-width: 760px) {
    .mz-campo { --mz-ang: 96deg; }
  }

  /* ── o quadro de abertura: só a frase, e ela se escreve descendo ───────── */
  .mz-sobre {
    /* cinco peças agora: "ative o" virou uma só */
    --n: 5;
    position: absolute;
    left: 24px;
    right: 24px;
    /* O VÃO até a palavra (founder 15/09: "mais afastado da frase, mais no meio
       entre eles"): eram 14 a 32px, que no celular colavam a frase na palavra. */
    bottom: calc(100% - var(--gp-word-top, 35%) + clamp(30px, 5.4vh, 56px));
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0 0.26em;
    text-align: center;
    font-family: var(--zx-display);
    font-size: clamp(24px, 3.2vw, 48px);
    font-weight: var(--zx-fw-display);
    line-height: 1.12;
    letter-spacing: -0.025em;
    color: #fff;
    /* desce com o scroll até pousar em cima da palavra */
    transform: translate3d(0, calc((1 - var(--mz-e, 1)) * -16vh), 0);
  }
  /* A frase COMEÇA MAIS EM CIMA no celular (founder 15/09: "coloca a frase pra
     começar mais em cima quando acabar o board, aí vai descendo junto e
     acompanhando"): ela parte de 42vh acima do lugar dela, em vez de 16 . assim
     aparece logo que o bloco de cima termina e faz o caminho inteiro descendo
     com o dedo, até pousar sobre a palavra.

     A regra vem DEPOIS da base de propósito: as duas têm a mesma força, e a
     que fica por último é a que vale. */
  @media (max-width: 760px) {
    .mz-sobre { transform: translate3d(0, calc((1 - var(--mz-e, 1)) * -42vh), 0); }
  }

  /* cada palavra acende na sua vez: a frase termina de se escrever antes do portal grudar */
  .mz-w {
    opacity: calc(0.12 + 0.88 * clamp(0, (var(--mz-e, 1) * 1.35 - 0.12) * var(--n) - var(--i), 1));
    filter: blur(calc((1 - clamp(0, (var(--mz-e, 1) * 1.35 - 0.12) * var(--n) - var(--i), 1)) * 6px));
  }
  .mz-w--forte { font-weight: var(--zx-fw-emphasis); }
  /* O link cru do componente sai: a abertura é só a frase e a palavra. */
  .mz [data-gp-caption] { display: none; }

  /* ── o miolo, depois do mergulho: o filme ocupa tudo, de ponta a ponta ── */
  .mz [data-gp-content] {
    display: block;
    padding: 0;
    font-family: var(--zx-body);
    /* só aparece com o movimento DESLIGADO; ligado, o componente deixa transparente */
    background: var(--mz-noite);
  }
  /* O filme NASCE quando o violeta enche a tela (founder 15/09: "ele entra numa tela que já
     podia ser o mundo do Zé, mas dá duas telas"). O componente acende o miolo só a 78%;
     aqui ele acende no fim do mergulho, com a câmera já cheia de tinta (a 78% do curso),
     e termina de acender pouco antes de cobrir o palco: assim a emenda não pisca. */
  .mz section[data-gp-motion="on"] [data-gp-content] {
    margin-top: 0;
    opacity: clamp(0, calc((var(--mz-p, 0) - 0.8) / 0.14), 1);
  }
  /* A SOBRA DA ENTRADA no celular (founder 15/09: "quando entra no modo zé no
     mobile tem essa sobra aí"): entre o fim do mergulho e o palco do filme
     grudar no topo havia uma tela inteira de rolagem com o violeta vazio, que é
     o tempo que o filme levava pra subir. O filme passa a começar 40svh antes,
     por cima do fim do mergulho . e como ele só acende a 80% do curso (a regra
     acima), a sobreposição acontece quando a tela já é a mesma noite. */
  @media (max-width: 760px) {
    .mz section[data-gp-motion="on"] [data-gp-content] { margin-top: -40svh; }
  }
  @media (prefers-reduced-motion: reduce) {
    /* o componente pinta o miolo de cor chapada e dá respiro com !important; o filme cuida dos dois */
    .mz section [data-gp-content] { background: var(--mz-noite) !important; padding: 0 !important; }
    .mz-sobre { transform: none; }
    .mz-w { opacity: 1; filter: none; }
  }
`;
