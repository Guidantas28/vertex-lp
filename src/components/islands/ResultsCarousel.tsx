"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type StatItem = { value: string; label: string };

type StoryCard = {
  kind: "story";
  brand: string;
  place: string;
  title: string;
  image: string;
};

type StatsCard = {
  kind: "stats";
  stats: StatItem[];
};

type Card = StatsCard | StoryCard;

const CARDS: Card[] = [
  {
    kind: "stats",
    stats: [
      { value: "3,2×", label: "mais conversão no WhatsApp com o VOS" },
      { value: "68%", label: "menos no-show em clínicas e agendas" },
      { value: "14h", label: "a menos de trabalho braçal por semana" },
    ],
  },
  {
    kind: "story",
    brand: "Mercado Bom Dia",
    place: "Curitiba, PR",
    title: "Venda, estoque e WhatsApp num fluxo só no VOS: fila andando e caixa fechando sozinho.",
    image: "/assets/people/ctx-commerce.webp",
  },
  {
    kind: "story",
    brand: "Clínica Aura",
    place: "São Paulo, SP",
    title: "Agendamentos sobem 54% com confirmação automática no WhatsApp.",
    image: "/assets/people/social-25.webp",
  },
  {
    kind: "story",
    brand: "Studio Bella",
    place: "Florianópolis, SC",
    title: "Horários vagos preenchidos sozinhos: lembrete e lista de espera no automático.",
    image: "/assets/people/social-12.webp",
  },
  {
    kind: "story",
    brand: "Oficina Forte",
    place: "Porto Alegre, RS",
    title: "Orçamento aprovado no chat vira OS e pagamento no VOS: zero planilha paralela.",
    image: "/assets/people/social-16.webp",
  },
  {
    kind: "story",
    brand: "Empório Sabor",
    place: "Campinas, SP",
    title: "Pedido pelo WhatsApp atualiza estoque e NF-e antes do delivery sair.",
    image: "/assets/people/social-14.webp",
  },
  {
    kind: "story",
    brand: "Andrade Contábil",
    place: "Brasília, DF",
    title: "Prazos e documentos no automático: cliente assina e o time só revisa.",
    image: "/assets/people/social-15.webp",
  },
  {
    kind: "story",
    brand: "Prime Elétrica",
    place: "Recife, PE",
    title: "Catálogo no WhatsApp com estoque real: +38% em pedidos B2B no mês.",
    image: "/assets/people/social-20.webp",
  },
  {
    kind: "story",
    brand: "Fit House",
    place: "Rio de Janeiro, RJ",
    title: "Renovação e inadimplência sob controle: cobrança no PIX, no tom da marca.",
    image: "/assets/people/social-21.webp",
  },
  {
    kind: "story",
    brand: "Pet Vida",
    place: "Goiânia, GO",
    title: "Banho, consulta e retorno lembrados no WhatsApp: agenda cheia sem ligar.",
    image: "/assets/people/social-23.webp",
  },
  {
    kind: "story",
    brand: "Casa & Lar",
    place: "Fortaleza, CE",
    title: "Lead do Instagram vira visita agendada: follow-up automático em 40 segundos.",
    image: "/assets/people/social-18.webp",
  },
];

export default function ResultsCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-rcard]");
    const step = (card?.offsetWidth ?? 300) + 16;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="rscar">
      <div className="rscar__bar">
        <h2 className="rscar__title">Resultados de negócios como o seu</h2>
        <div className="rscar__nav">
          <button
            type="button"
            className="rscar__arrow"
            aria-label="Anterior"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="rscar__arrow"
            aria-label="Próximo"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="rscar__track" ref={scroller} role="list">
        {CARDS.map((card, i) =>
          card.kind === "stats" ? (
            <article key={`stats-${i}`} className="rscar__card rscar__card--stats" data-rcard role="listitem">
              {card.stats.map((s) => (
                <div key={s.label} className="rscar__stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </article>
          ) : (
            <article
              key={card.brand}
              className="rscar__card rscar__card--story"
              data-rcard
              role="listitem"
            >
              <img src={card.image} alt="" loading="lazy" decoding="async" />
              <div className="rscar__shade" />
              <div className="rscar__brand">
                <b>{card.brand}</b>
                <em>{card.place}</em>
              </div>
              <p className="rscar__story">{card.title}</p>
            </article>
          ),
        )}
      </div>

      <style>{`
        .rscar { width: 100%; }
        .rscar__bar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
          padding-inline: clamp(16px, 4vw, 32px);
          max-width: 1200px;
          margin-inline: auto;
        }
        .rscar__title {
          margin: 0;
          max-width: 18ch;
          font-family: var(--zx-display, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: var(--zx-fs-title, clamp(32px, 3.8vw, 44px));
          font-weight: var(--zx-fw-title, 700);
          letter-spacing: var(--zx-ls-title, -0.02em);
          line-height: var(--zx-lh-title, 1.1);
          color: var(--zx-ink, #1A202C);
          text-wrap: balance;
        }
        .rscar__nav { display: flex; gap: 8px; flex: none; }
        .rscar__arrow {
          width: 40px; height: 40px;
          border-radius: 99px;
          border: 1.5px solid rgba(20,19,28,.14);
          background: #fff;
          color: var(--zx-ink, #14131C);
          display: grid; place-items: center;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(20,19,28,.04);
          transition: .2s ease;
        }
        .rscar__arrow:hover:not(:disabled) {
          border-color: rgba(20,19,28,.28);
          box-shadow: 0 8px 20px -12px rgba(20,19,28,.35);
        }
        .rscar__arrow:disabled { opacity: .35; cursor: default; }

        .rscar__track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-padding-inline: clamp(16px, 4vw, max(32px, calc((100vw - 1200px) / 2 + 32px)));
          padding-inline: clamp(16px, 4vw, max(32px, calc((100vw - 1200px) / 2 + 32px)));
          padding-bottom: 8px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .rscar__track::-webkit-scrollbar { display: none; }

        .rscar__card {
          flex: 0 0 min(300px, 78vw);
          width: min(300px, 78vw);
          height: 380px;
          border-radius: 22px;
          scroll-snap-align: start;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(20,19,28,.08);
          box-shadow: 0 18px 40px -28px rgba(20,19,28,.35);
        }

        .rscar__card--stats {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 24px;
          background:
            linear-gradient(165deg, #fff 0%, #F7F6F4 100%);
        }
        .rscar__stat strong {
          display: block;
          font-family: var(--zx-display, Geist, system-ui, sans-serif);
          font-size: clamp(36px, 5vw, 44px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--zx-ink, #14131C);
        }
        .rscar__stat span {
          display: block;
          margin-top: 6px;
          font-size: 14px;
          line-height: 1.35;
          color: var(--zx-ink2, #4E4A5C);
          max-width: 18ch;
        }

        .rscar__card--story img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rscar__shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(10,8,16,.2) 0%, transparent 36%),
            linear-gradient(180deg, transparent 40%, rgba(10,8,16,.9) 100%);
        }
        .rscar__brand {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 1;
          width: fit-content;
          max-width: min(85%, 220px);
          padding: 8px 11px;
          border-radius: 12px;
          background: rgba(10, 8, 16, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 10px 24px -16px rgba(0, 0, 0, 0.55);
        }
        .rscar__brand b {
          display: block;
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -.02em;
          line-height: 1.15;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.45);
        }
        .rscar__brand em {
          display: block;
          margin-top: 3px;
          font-style: normal;
          font-size: 12px;
          font-weight: 550;
          color: rgba(255, 255, 255, 0.82);
          letter-spacing: 0.01em;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
        }
        .rscar__story {
          position: absolute;
          left: 16px; right: 16px; bottom: 18px;
          z-index: 1;
          margin: 0;
          font-size: 16px;
          font-weight: 650;
          line-height: 1.3;
          letter-spacing: -.015em;
          color: #fff;
          text-wrap: balance;
        }

        @media (min-width: 900px) {
          .rscar__card {
            flex-basis: 320px;
            width: 320px;
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
