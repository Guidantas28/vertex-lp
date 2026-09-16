"use client";

import { useState } from "react";
import { GetStartedButton } from "../ui/get-started-button";

/**
 * A página de preço: dois andares, na ordem em que a pessoa decide (founder
 * 15/09, com as páginas da Nuvemshop e da Shopify como referência).
 *
 * 1. CARDS curtos: preço do ciclo, o que se cobra de uma vez e os quatro
 *    destaques do plano. A lista inteira não mora mais aqui . lida três vezes,
 *    ela obrigava a comparar de cabeça.
 * 2. A TABELA: linha a linha, por grupo, com os grupos iguais nos três planos
 *    recolhidos e um plano por vez no celular.
 *
 * O andar "Ainda tem mais" (o PDV como complemento e os créditos do Zé) saiu
 * no mesmo dia: add-on fica pra mais pra frente (founder 15/09).
 *
 * Os números vêm de `PRICING` no content.ts e espelham o catálogo do produto
 * (documento "Limites por plano do VOS", v16 de 06/09/2026). O preço de cada
 * ciclo é CRAVADO, nunca calculado aqui: este arquivo só escolhe qual mostrar.
 */

export type Cycle = "mensal" | "trimestral" | "anual";

export type CycleSpec = { id: Cycle; label: string; off: number };

export type Plan = {
  id: string;
  name: string;
  /** Preço POR MÊS em cada ciclo, em reais. */
  prices: Record<Cycle, number>;
  desc: string;
  destaques: string[];
  cta: string;
  featured?: boolean;
  ribbon?: string;
};

export type Linha = { rotulo: string; nota?: string; valores: Array<string | boolean> };
export type Grupo = { id: string; titulo: string; icone: string; linhas: Linha[] };

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/** No mensal, o lembrete do cartão. Nos outros ciclos, NADA (founder 15/09):
    o "R$ 2.364 cobrados por ano" embaixo do preço com desconto tirava a força
    do número de cima . a pessoa chegava no valor cheio antes de entender a
    economia. Como o ciclo é pago adiantado, quem diz isso é o rodapé: "pagos
    antes do uso, no Pix, boleto à vista ou cartão parcelado". */
function cobranca(cycle: Cycle) {
  return cycle === "mensal" ? "No cartão, mês a mês" : null;
}

/** Os traços dos ícones dos grupos (24 × 24, contorno). */
const ICONES: Record<string, string> = {
  preco: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01",
  equipe: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.4 4.1a3.5 3.5 0 0 1 0 6.8",
  ia: "M12 3.5l1.9 5.2 5.2 1.9-5.2 1.9L12 17.7l-1.9-5.2-5.2-1.9 5.2-1.9ZM19 16l.8 2.2 2.2.8-2.2.8L19 22l-.8-2.2-2.2-.8 2.2-.8Z",
  vendas: "M6 3h12v18l-3-2-3 2-3-2-3 2ZM9 8h6M9 12h6",
  modulos: "M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h6v6h-6Z",
  extras: "M12 5v14M5 12h14",
};

function Icone({ nome }: { nome: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONES[nome] ?? ICONES.extras} />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A célula da tabela: incluso vira o selo verde, não incluso o traço cinza. */
function Valor({ v }: { v: string | boolean }) {
  if (v === true) {
    return (
      <span className="zx-pi__sim" role="img" aria-label="Incluso">
        <Check />
      </span>
    );
  }
  if (v === false) {
    return (
      <span className="zx-pi__nao" role="img" aria-label="Não incluso">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return <>{v}</>;
}

type Props = {
  cycles: CycleSpec[];
  plans: Plan[];
  comparar: { grupos: Grupo[] };
  footnote?: string;
};

export default function PricingInteractive({ cycles, plans, comparar, footnote }: Props) {
  /* Abre no anual: é o melhor número, e a pessoa deve ver primeiro em vez de
     descobrir depois que existia desconto. O caixa do produto abre igual. */
  const [cycle, setCycle] = useState<Cycle>("anual");
  /* Abertos os grupos em que os planos DIFEREM; os dois em que os três são
     iguais (módulos e pacotes) começam fechados pra tabela não virar parede.
     É o que resta do "Só as diferenças", que saiu (founder 15/09): a tabela
     mostra tudo, e o que é igual nos três já nasce recolhido. */
  const [fechados, setFechados] = useState<Record<string, boolean>>({ modulos: true, extras: true });
  /* No celular a tabela mostra UM plano por vez, e começa no mais escolhido. */
  const [planoCel, setPlanoCel] = useState(plans.find((p) => p.featured)?.id ?? plans[0]?.id ?? "");

  const grupos = comparar.grupos.filter((g) => g.linhas.length > 0);

  return (
    <div className="zx-pi" data-plano={planoCel}>
      <div className="zx-pi__cycle" role="tablist" aria-label="Ciclo de cobrança">
        <span className="zx-pi__cycle-glow" data-cycle={cycle} aria-hidden="true" />
        {cycles.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cycle === c.id}
            className={cycle === c.id ? "is-on" : undefined}
            onClick={() => setCycle(c.id)}
          >
            {c.label}
            {c.off > 0 && <em>-{c.off}%</em>}
          </button>
        ))}
      </div>
      {/* A linha de apoio embaixo do ciclo ("Preço por mês no anual, pago no
          Pix...") SAIU (founder 15/09): o rodapé da tabela já diz como se paga
          cada ciclo, e aqui ela só empurrava os cards pra baixo. */}

      {/* 1 · os cards */}
      <div className="zx-pi__grid">
        {plans.map((p) => (
          <article key={p.id} className={["zx-pi__card", p.featured ? "is-featured" : ""].filter(Boolean).join(" ")}>
            <header className="zx-pi__card-cab">
              <h3>{p.name}</h3>
              {p.ribbon && <span className="zx-pi__selo">{p.ribbon}</span>}
            </header>
            <p className="zx-pi__desc">{p.desc}</p>

            <p className="zx-pi__value">
              {/* O riscado é o MENSAL do mesmo plano: é dele que o desconto do
                  ciclo sai, e é o número que a pessoa compara. */}
              {cycle !== "mensal" && <s>{formatBRL(p.prices.mensal)}</s>}
              <strong>{formatBRL(p.prices[cycle])}</strong>
              <span>/mês</span>
            </p>
            {cobranca(cycle) && <p className="zx-pi__cobranca">{cobranca(cycle)}</p>}

            <div className="zx-pi__cta">
              <GetStartedButton label={p.cta} variant={p.featured ? "dark" : "soft"} />
            </div>

            <div className="zx-pi__destaque">
              <p>Destaque</p>
              <ul>
                {p.destaques.map((d) => (
                  <li key={d}>
                    <Check />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      {/* 2 · a tabela */}
      <section className="zx-pi__comp" aria-labelledby="zx-pi-comp">
        <h3 id="zx-pi-comp" className="zx-pi__secao">Compare os planos</h3>

        <div className="zx-pi__pilula zx-pi__escolha" role="group" aria-label="Plano mostrado na tabela">
          {plans.map((p) => (
            <button key={p.id} type="button" aria-pressed={planoCel === p.id} onClick={() => setPlanoCel(p.id)}>
              {p.name}
            </button>
          ))}
        </div>

        <table className="zx-pi__tabela">
          <thead>
            <tr>
              <th scope="col" className="zx-pi__rot">
                <span className="zx-pi__sr">Recurso</span>
              </th>
              {plans.map((p) => (
                <th key={p.id} scope="col" data-col={p.id} className={p.featured ? "is-featured" : undefined}>
                  <b>{p.name}</b>
                  <span>
                    {formatBRL(p.prices[cycle])}
                    <em>/mês</em>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {grupos.map((g) => {
            const fechado = !!fechados[g.id];
            return (
              <tbody key={g.id}>
                <tr className="zx-pi__grupo">
                  <th scope="colgroup" colSpan={plans.length + 1}>
                    <button
                      type="button"
                      aria-expanded={!fechado}
                      onClick={() => setFechados((f) => ({ ...f, [g.id]: !fechado }))}
                    >
                      <Icone nome={g.icone} />
                      <span>{g.titulo}</span>
                      <svg className="zx-pi__seta" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </th>
                </tr>
                {!fechado &&
                  g.linhas.map((l) => (
                    <tr key={l.rotulo}>
                      <th scope="row" className="zx-pi__rot">
                        {l.rotulo}
                        {l.nota && <small>{l.nota}</small>}
                      </th>
                      {l.valores.map((v, i) => (
                        <td key={plans[i]?.id ?? i} data-col={plans[i]?.id}>
                          <Valor v={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            );
          })}
        </table>
      </section>

      {footnote && <p className="zx-pi__foot">{footnote}</p>}

      {/* CSS por dangerouslySetInnerHTML, não como filho do <style>: como filho,
          o React quebra a string em nós de texto e a remontagem no cliente não
          bate com a do servidor, e a hidratação da página cai inteira. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .zx-pi { width: 100%; }
        .zx-pi__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

        /* ── o ciclo ── */
        .zx-pi__cycle {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 4px;
          margin-top: 22px;
          border-radius: 10px;
          background: var(--zx-panel, #fff);
          border: 1px solid var(--zx-line, #E4DFD6);
        }
        .zx-pi__cycle-glow {
          position: absolute;
          top: 4px; bottom: 4px; left: 4px;
          width: calc((100% - 8px) / 3);
          border-radius: 7px;
          background: var(--zx-ink, #171717);
          transition: transform .3s cubic-bezier(.22,1,.36,1);
          z-index: 0;
        }
        .zx-pi__cycle-glow[data-cycle="trimestral"] { transform: translateX(100%); }
        .zx-pi__cycle-glow[data-cycle="anual"] { transform: translateX(200%); }
        .zx-pi__cycle button {
          position: relative;
          z-index: 1;
          appearance: none;
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 9px 16px;
          min-width: 118px;
          border-radius: 7px;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          color: var(--zx-ink2, #4A4A4A);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .zx-pi__cycle button.is-on { color: #fff; }
        .zx-pi__cycle button em {
          font-style: normal;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(237,75,0,.12);
          color: var(--zx-lar-on-light, #B83800);
        }
        .zx-pi__cycle button.is-on em { background: rgba(255,255,255,.16); color: #FF9A66; }

        /* ── 1 · os cards ── */
        .zx-pi__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
          align-items: stretch;
        }
        .zx-pi__card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 26px 24px 24px;
          border-radius: 16px;
          background: var(--zx-panel, #fff);
          border: 1px solid var(--zx-line, #E4DFD6);
          box-shadow: 0 1px 2px rgba(23,23,23,.04), 0 12px 32px rgba(23,23,23,.06);
        }
        /* Destaque = régua de acento no topo + fio na tinta. Laranja é sinal, não massa. */
        .zx-pi__card.is-featured {
          border-color: var(--zx-ink, #171717);
          box-shadow: inset 0 3px 0 var(--zx-lar, #ED4B00), 0 24px 60px -32px rgba(23,23,23,.35);
        }
        .zx-pi__card-cab { display: flex; align-items: center; gap: 10px; min-height: 26px; }
        .zx-pi__card h3 {
          margin: 0;
          font-family: var(--zx-body, Inter, system-ui, sans-serif);
          font-size: 19px;
          font-weight: 600;
          letter-spacing: -0.015em;
          color: var(--zx-ink, #171717);
        }
        .zx-pi__selo {
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--zx-ink, #171717);
          color: #fff;
          font-size: 11.5px;
          font-weight: 600;
          white-space: nowrap;
        }
        .zx-pi__desc {
          margin: 6px 0 0;
          min-height: 38px;
          font-size: var(--zx-fs-meta, 13px);
          line-height: var(--zx-lh-meta, 1.45);
          color: var(--zx-ink3, #6B6B6B);
        }
        .zx-pi__value { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; margin: 18px 0 0; }
        .zx-pi__value strong {
          font-size: clamp(30px, 2.9vw, 36px);
          font-weight: 600;
          letter-spacing: -.03em;
          font-variant-numeric: tabular-nums;
          color: var(--zx-ink, #171717);
        }
        .zx-pi__value span { font-size: 13px; color: var(--zx-ink3, #6B6B6B); }
        .zx-pi__value s { font-size: 13px; font-weight: 600; color: var(--zx-ink3, #6B6B6B); }
        .zx-pi__cobranca {
          margin: 4px 0 0;
          font-size: 12.5px;
          font-variant-numeric: tabular-nums;
          color: var(--zx-ink2, #4A4A4A);
        }
        .zx-pi__cta { margin-top: 18px; display: flex; width: 100%; }
        .zx-pi__cta > button, .zx-pi__cta > a { width: 100%; justify-content: center; }
        .zx-pi__destaque {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--zx-line, #E4DFD6);
        }
        .zx-pi__destaque > p { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: var(--zx-ink, #171717); }
        .zx-pi__destaque ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 9px; }
        .zx-pi__destaque li { display: flex; gap: 9px; font-size: 13px; line-height: 1.45; color: var(--zx-ink, #171717); }
        .zx-pi__destaque svg {
          width: 18px; height: 18px;
          padding: 3px;
          border-radius: 50%;
          margin-top: 0;
          background: var(--zx-ink, #171717);
          color: #fff;
          flex: 0 0 auto;
        }

        .zx-pi__secao {
          margin: 0;
          font-family: var(--zx-body, Inter, system-ui, sans-serif);
          font-size: clamp(20px, 1.9vw, 24px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--zx-ink, #171717);
        }

        /* ── 2 · a tabela ── */
        .zx-pi__comp { margin-top: clamp(56px, 8vh, 88px); }
        .zx-pi__pilula {
          display: inline-flex;
          padding: 4px;
          gap: 2px;
          border-radius: 999px;
          background: var(--zx-pick, #F4F4F4);
          border: 1px solid var(--zx-line, #E4DFD6);
        }
        .zx-pi__pilula button {
          appearance: none;
          border: 0;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 999px;
          background: transparent;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          color: var(--zx-ink2, #4A4A4A);
          transition: background-color .2s, color .2s;
        }
        .zx-pi__pilula button[aria-pressed="true"] { background: var(--zx-ink, #171717); color: #fff; }
        .zx-pi__escolha { display: none; }

        .zx-pi__tabela {
          width: 100%;
          margin-top: 20px;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
        }
        .zx-pi__tabela thead th {
          position: sticky;
          top: calc(var(--zx-nav-h, 68px) + 12px);
          z-index: 2;
          padding: 14px 12px;
          background: var(--zx-paper, #FAFAFA);
          border-bottom: 1px solid var(--zx-line-2, rgba(23,23,23,.18));
          text-align: left;
          vertical-align: bottom;
        }
        .zx-pi__tabela thead th.zx-pi__rot { width: 34%; }
        .zx-pi__tabela thead th b { display: block; font-size: 16px; font-weight: 600; color: var(--zx-ink, #171717); }
        .zx-pi__tabela thead th span {
          display: block;
          margin-top: 2px;
          font-size: 13px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: var(--zx-ink2, #4A4A4A);
        }
        .zx-pi__tabela thead th em { font-style: normal; font-weight: 400; color: var(--zx-ink3, #6B6B6B); }
        .zx-pi__tabela thead th.is-featured b::after {
          content: "";
          display: inline-block;
          width: 6px; height: 6px;
          margin-left: 7px;
          border-radius: 50%;
          vertical-align: middle;
          background: var(--zx-lar, #ED4B00);
        }

        .zx-pi__grupo th { padding: 0; }
        .zx-pi__grupo button {
          appearance: none;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 12px 12px;
          border: 0;
          border-bottom: 1px solid var(--zx-line, #E4DFD6);
          background: transparent;
          cursor: pointer;
          font: inherit;
          font-size: 15px;
          font-weight: 600;
          text-align: left;
          color: var(--zx-ink, #171717);
        }
        .zx-pi__grupo button > svg:first-child { color: var(--zx-ink2, #4A4A4A); }
        .zx-pi__seta { margin-left: auto; color: var(--zx-ink3, #6B6B6B); transition: transform .3s cubic-bezier(.22,1,.36,1); }
        .zx-pi__grupo button[aria-expanded="false"] .zx-pi__seta { transform: rotate(-90deg); }

        .zx-pi__tabela tbody tr:not(.zx-pi__grupo) th,
        .zx-pi__tabela tbody tr:not(.zx-pi__grupo) td {
          padding: 13px 12px;
          border-bottom: 1px solid var(--zx-line, #E4DFD6);
          font-size: 13.5px;
          line-height: 1.4;
          text-align: left;
          vertical-align: middle;
          color: var(--zx-ink, #171717);
        }
        .zx-pi__tabela tbody th { font-weight: 400; }
        .zx-pi__tabela tbody th small { display: block; margin-top: 2px; font-size: 12px; color: var(--zx-ink3, #6B6B6B); }
        .zx-pi__tabela tbody td { font-variant-numeric: tabular-nums; white-space: nowrap; }
        .zx-pi__sim, .zx-pi__nao { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; }
        .zx-pi__sim { background: var(--zx-ok, #15935A); color: #fff; }
        .zx-pi__sim svg { width: 13px; height: 13px; }
        .zx-pi__nao { color: var(--zx-ink3, #6B6B6B); }
        .zx-pi__nao svg { width: 14px; height: 14px; }

        .zx-pi__foot { margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: var(--zx-ink3, #6B6B6B); }

        @media (max-width: 900px) {
          .zx-pi__grid { grid-template-columns: minmax(0, 1fr); }
          .zx-pi__desc { min-height: 0; }
        }
        /* Celular: UM plano por vez na tabela, escolhido na pílula logo acima. */
        @media (max-width: 760px) {
          .zx-pi__escolha { display: flex; width: 100%; margin-top: 16px; }
          .zx-pi__escolha button { flex: 1; }
          /* Largura AUTOMÁTICA aqui: a linha do grupo ocupa as quatro colunas
             (colSpan), e com a largura fixa as três escondidas seguiam
             reservando lugar . a tabela terminava em 70% da tela e o valor
             quebrava em duas linhas. */
          .zx-pi__tabela { table-layout: auto; }
          .zx-pi__tabela thead th.zx-pi__rot { width: 62%; }
          .zx-pi[data-plano] .zx-pi__tabela [data-col] { display: none; }
          .zx-pi[data-plano="start"] .zx-pi__tabela [data-col="start"],
          .zx-pi[data-plano="essential"] .zx-pi__tabela [data-col="essential"],
          .zx-pi[data-plano="scale"] .zx-pi__tabela [data-col="scale"] { display: table-cell; }
        }
        @media (max-width: 620px) {
          .zx-pi__cycle { width: 100%; }
          .zx-pi__cycle button { flex: 1; min-width: 0; padding: 9px 8px; font-size: 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .zx-pi__cycle-glow, .zx-pi__seta, .zx-pi__pilula button { transition: none; }
        }
      ` }} />
    </div>
  );
}
