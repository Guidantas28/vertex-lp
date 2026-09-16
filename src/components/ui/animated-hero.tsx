"use client";

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PORTA } from "@/components/ui/get-started-button";

const titles = ["conversa", "automatiza", "vende", "gerencia"] as const;

/* A curva única do VOS UNO, na duração de cena. Vale pra troca da palavra E
   pra largura do bloco: se as duas não andarem juntas, o "por você" chega ao
   lugar novo antes da palavra. */
const ROT = { duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const;

const integrations = [
  { name: "WhatsApp", src: "/assets/integrations/whatsapp.svg", color: "#25D366" },
  { name: "Instagram", src: "/assets/integrations/instagram.png", color: "#E1306C" },
  { name: "Messenger", src: "/assets/integrations/messenger.svg", color: "#0084FF" },
  { name: "Meta", src: "/assets/integrations/meta.png", color: "#0668E1" },
  { name: "TikTok", src: "/assets/icons/tiktok.svg", color: "#111111" },
  { name: "Telegram", src: "/assets/icons/telegram.svg", color: "#2AABEE" },
  { name: "Claude", src: "/assets/integrations/claude.svg", color: "#D97757" },
];

type HeroProps = {
  /** `film` = herói sobre vídeo de tela cheia: tinta branca, alinhado à esquerda, ancorado embaixo (VOS UNO: primário branco sobre Carvão). */
  film?: boolean;
};

/* O chip leva ao MODO ZÉ. A seção dele não tem âncora (é uma ilha que mora no
   index), então o clique rola até a raiz dela; sem JS, o link cai nos módulos,
   que ficam logo antes. */
function irProZe(e: MouseEvent<HTMLAnchorElement>) {
  const alvo = document.querySelector(".mz");
  if (!alvo) return;
  e.preventDefault();
  alvo.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Hero({ film = false }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const timeoutId = window.setTimeout(() => {
      setTitleNumber((current) => (current + 1) % titles.length);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [hydrated, titleNumber]);

  return (
    <section
      id="top"
      className={film ? "relative w-full" : "relative w-full overflow-hidden bg-transparent"}
      aria-labelledby="hero-title"
    >
      <div
        className={
          film
            ? "relative mx-auto flex w-full max-w-[1200px] flex-col items-start justify-center gap-[clamp(14px,2.4vh,28px)] px-5 text-left sm:px-8"
            : "relative mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 px-5 py-20 text-center sm:px-8 md:py-28 lg:min-h-[720px] lg:py-36"
        }
      >
        {/* O chip segue o badge que o founder mandou do 21st.dev (15/09):
            pílula escura com anel fino, o clarão que acende no topo no hover e
            o fio de luz embaixo . VIOLETA no lugar do verde do original, que é
            a cor do Zé. A setinha se desenha sozinha. O desenho mora no
            HeroFilm4.astro. */}
        {film ? (
          <a className="zx-hero-pill zx-ze-chip" href="#modulos" onClick={irProZe}>
            <span className="zx-ze-chip-festa" aria-hidden="true">🎉</span>
            <span className="zx-ze-chip-tag">IA</span>
            <span className="zx-ze-chip-div" aria-hidden="true" />
            <span className="zx-ze-chip-txt">Conheça o Zé, a IA que trabalha com você</span>
            <svg className="zx-ze-chip-seta" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path d="M10.75 8.75 14.25 12l-3.5 3.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ) : (
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="gap-3 rounded-full border border-line bg-white px-4 text-ink shadow-[0_8px_30px_rgba(23,23,23,0.06)] hover:bg-pick"
          >
            <a href="#modulos" onClick={irProZe}>
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                Novo
              </span>
              Conheça o Zé, a IA que trabalha com você
              <MoveRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        )}

        <div className={film ? "flex w-full max-w-4xl flex-col items-start gap-[clamp(12px,2vh,20px)]" : "flex w-full max-w-5xl flex-col items-center gap-6"}>
          <h1
            id="hero-title"
            className={
              film
                /* O PISO é o tamanho do celular (founder 15/09: "aumenta o
                   headline um pouco, pelo menos 3px" e depois "aumenta em 4px"):
                   36 → 40 → 44px. Acima dele quem manda é a tela, e o teto de
                   84px não mudou. */
                ? "w-full text-balance font-display text-[clamp(2.75rem,min(6vw,9.5vh),5.25rem)] font-light leading-[1.02] tracking-[-0.03em] text-white"
                : "w-full text-balance font-display text-[clamp(2.75rem,6.4vw,5.75rem)] font-light leading-[1.02] tracking-[-0.03em] text-ink"
            }
          >
            <span className="block">A plataforma que</span>
            {/* A palavra que gira é PESO + a rampa do MODO ZÉ dentro das letras
                (founder 15/09): o bloco laranja atrás dela saiu, ela ficou em 700
                contra o fino da linha e agora leva o violeta→laranja do mergulho
                (`.zx-hero-palavra`, no zx.css). A caixa ainda aperta e alarga com
                a palavra, e o "por você" desliza junto, em branco. */}
            <span
              className={`mt-2 flex flex-wrap items-baseline gap-x-[0.24em] ${film ? "justify-start" : "justify-center"}`}
              aria-hidden="true"
            >
              <motion.span
                layout
                transition={ROT}
                className="relative inline-flex h-[1.16em] items-baseline overflow-hidden align-baseline"
              >
                {/* medidor invisível: é ele que dá à caixa a largura da palavra
                    do momento. Sem isso ela teria a largura da linha inteira,
                    porque as palavras animadas são todas absolutas. */}
                <span className="invisible font-bold">{titles[titleNumber]}</span>
                {titles.map((title, index) => (
                  <motion.span
                    key={title}
                    className="zx-hero-palavra absolute left-0 top-0 font-bold leading-[1.16]"
                    initial={false}
                    transition={ROT}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? "-120%" : "120%", opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </motion.span>
              <motion.span layout transition={ROT} className="font-light">
                por você
              </motion.span>
            </span>
            <span className="sr-only">
              conversa, automatiza, vende e gerencia por você.
            </span>
          </h1>

          <p className={`max-w-2xl text-balance leading-relaxed tracking-[-0.015em] ${film ? "text-[clamp(1rem,2.3vh,1.25rem)] text-white/75" : "text-lg text-ink-2 md:text-xl"}`}>
            CRM, atendimento, catálogo, estoque, agenda e notas fiscais em um só lugar.
          </p>
        </div>

        <div className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row ${film ? "justify-start" : "justify-center"}`}>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={
              film
                ? "h-12 gap-3 rounded-[10px] border-white/40 bg-transparent px-6 text-base text-white hover:border-white hover:bg-white/10 hover:text-white"
                : "h-12 gap-3 rounded-[10px] border-line-2 bg-white px-6 text-base text-ink hover:border-ink hover:bg-pick hover:text-ink"
            }
          >
            <a href="#features">
              Ver como funciona
              <MoveRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>

          {/* A porta do onboarding, como todo botão de ação do site (founder
              15/09). Era a modal de lead, que pedia os dados aqui pra mandar
              pra lá depois. */}
          <Button
            asChild
            size="lg"
            variant="hero"
            className={
              film
                ? "h-12 gap-3 rounded-[10px] bg-white px-6 text-base text-[#101214] hover:bg-[#ECECEC]"
                : "h-12 gap-3 rounded-[10px] px-6 text-base"
            }
          >
            <a href={PORTA}>
              Teste grátis
              <MoveRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>

        <div
          className={
            film
              ? "zx-hero-integrations mt-1 flex w-full max-w-2xl flex-col items-start gap-4 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:gap-6"
              : "mt-2 flex w-full max-w-2xl flex-col items-center justify-center gap-4 border-t border-line pt-5 sm:flex-row sm:gap-6"
          }
        >
          <span className={`font-mono text-[11px] font-medium uppercase tracking-[0.08em] ${film ? "text-white/60" : "text-ink-3"}`}>
            Integrações oficiais
          </span>

          <ul
            className="vos-integrations-list flex items-center"
            aria-label="Integrações oficiais do VOS"
          >
            {integrations.map((integration, index) => (
              <li
                key={integration.name}
                className="vos-integration-item relative"
                style={{ zIndex: integrations.length - index, "--c": integration.color } as CSSProperties}
              >
                <img
                  src={integration.src}
                  alt={integration.name}
                  width={40}
                  height={40}
                  loading="eager"
                  className="h-10 w-10 rounded-[10px] border-[1.5px] bg-white p-1.5 object-contain shadow-[0_8px_20px_-12px_rgba(23,23,23,0.35)]"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { Hero };
