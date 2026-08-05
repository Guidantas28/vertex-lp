import { useEffect, useState, type CSSProperties } from "react";

type Node = { id: string; label: string; sub: string; tone: "start" | "msg" | "wait" | "action" | "done" };
type Step = { nodeId: string; log: string };
type Flow = {
  id: string;
  label: string;
  color: string;
  nodes: Node[];
  steps: Step[];
};

const FLOWS: Flow[] = [
  {
    id: "cobranca",
    label: "Cobrança",
    color: "#ED4B00",
    nodes: [
      { id: "n1", label: "Início", sub: "Fatura vencida", tone: "start" },
      { id: "n2", label: "Espera", sub: "2 dias", tone: "wait" },
      { id: "n3", label: "Mensagem", sub: "WhatsApp + link PIX", tone: "msg" },
      { id: "n4", label: "Pago", sub: "Atualiza financeiro", tone: "done" },
    ],
    steps: [
      { nodeId: "n1", log: "Gatilho · fatura #8821 venceu há 2 dias" },
      { nodeId: "n2", log: "Aguardando janela de cobrança…" },
      { nodeId: "n3", log: "Enviou WhatsApp pra Carla Mendes com link PIX" },
      { nodeId: "n4", log: "PIX R$ 890 confirmado · financeiro atualizado ✓" },
    ],
  },
  {
    id: "suporte",
    label: "Suporte",
    color: "#2E6BFF",
    nodes: [
      { id: "n1", label: "Início", sub: "Nova mensagem", tone: "start" },
      { id: "n2", label: "IA", sub: "Classifica assunto", tone: "action" },
      { id: "n3", label: "Mensagem", sub: "Resposta automática", tone: "msg" },
      { id: "n4", label: "Humano", sub: "Se precisar, escala", tone: "done" },
    ],
    steps: [
      { nodeId: "n1", log: "Gatilho · cliente perguntou sobre prazo de entrega" },
      { nodeId: "n2", log: "IA classificou: suporte · logística" },
      { nodeId: "n3", log: "Respondeu com status do pedido #4812" },
      { nodeId: "n4", log: "Cliente ok · ticket fechado sem humano ✓" },
    ],
  },
  {
    id: "carrinho",
    label: "Carrinho",
    color: "#8B76FF",
    nodes: [
      { id: "n1", label: "Início", sub: "Carrinho abandonado", tone: "start" },
      { id: "n2", label: "Espera", sub: "1 hora", tone: "wait" },
      { id: "n3", label: "Mensagem", sub: "Cupom 10% OFF", tone: "msg" },
      { id: "n4", label: "Venda", sub: "Pedido fechado", tone: "done" },
    ],
    steps: [
      { nodeId: "n1", log: "Gatilho · Sofia deixou o carrinho às 20:41" },
      { nodeId: "n2", log: "Esperou 1h sem checkout…" },
      { nodeId: "n3", log: "Enviou cupom SOFIA10 no WhatsApp" },
      { nodeId: "n4", log: "Pedido #4820 pago · R$ 289,90 ✓" },
    ],
  },
];

const STEP_MS = 1600;
const HOLD_MS = 2200;

const TONE_ICON: Record<Node["tone"], string> = {
  start: "▶",
  wait: "◷",
  msg: "💬",
  action: "✦",
  done: "✓",
};

export default function FlowLive() {
  const [flowIdx, setFlowIdx] = useState(0);
  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);

  const flow = FLOWS[flowIdx];

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setStep(flow.steps.length - 1);
      setLogs(flow.steps.map((s) => s.log));
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const run = async () => {
      setStep(-1);
      setLogs([]);
      for (let i = 0; i < flow.steps.length; i++) {
        if (cancelled) return;
        await new Promise<void>((r) => {
          timer = window.setTimeout(r, STEP_MS);
        });
        if (cancelled) return;
        setStep(i);
        setLogs((prev) => [...prev, flow.steps[i].log].slice(-5));
      }
      if (cancelled) return;
      await new Promise<void>((r) => {
        timer = window.setTimeout(r, HOLD_MS);
      });
      if (cancelled) return;
      // Troca pro próximo fluxo sozinho; clique nas tabs ainda escolhe na hora
      setFlowIdx((i) => (i + 1) % FLOWS.length);
    };

    run();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [flowIdx, flow.steps]);

  const pickFlow = (i: number) => {
    setFlowIdx(i);
    setStep(-1);
    setLogs([]);
  };

  const activeNodeId = step >= 0 ? flow.steps[step].nodeId : null;

  return (
    <div className="flive">
      <div className="flive__tabs" role="tablist" aria-label="Fluxos prontos">
        {FLOWS.map((f, i) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={i === flowIdx}
            className={`flive__tab${i === flowIdx ? " is-on" : ""}`}
            style={{ "--fc": f.color } as CSSProperties}
            onClick={() => pickFlow(i)}
          >
            <i />
            {f.label}
          </button>
        ))}
      </div>

      <div className="flive__stage" style={{ "--fc": flow.color } as CSSProperties}>
        <div className="flive__canvas" role="list" aria-label={`Fluxo ${flow.label}`}>
          {flow.nodes.map((n, i) => {
            const done = step >= 0 && flow.steps.findIndex((s) => s.nodeId === n.id) <= step;
            const on = n.id === activeNodeId;
            return (
              <div key={n.id} className="flive__node-wrap" role="listitem">
                {i > 0 && (
                  <svg className={`flive__wire${done ? " is-on" : ""}`} viewBox="0 0 40 12" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 6 C 12 6, 28 6, 40 6" fill="none" strokeWidth="1.6" strokeDasharray="3 3" />
                  </svg>
                )}
                <div
                  className={`flive__node flive__node--${n.tone}${on ? " is-on" : ""}${done && !on ? " is-done" : ""}`}
                  aria-current={on ? "step" : undefined}
                >
                  <span className="flive__node-ic" aria-hidden="true">{TONE_ICON[n.tone]}</span>
                  <div>
                    <strong>{n.label}</strong>
                    <em>{n.sub}</em>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flive__log">
          <p className="flive__log-head">
            <i className="flive__pulse" />
            Executando · {flow.label}
          </p>
          <ul>
            {logs.length === 0 && <li className="is-muted">Iniciando fluxo…</li>}
            {logs.map((l, i) => (
              <li key={`${i}-${l}`} className={i === logs.length - 1 ? "is-fresh" : ""}>
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .flive { margin-top: 20px; display: flex; flex-direction: column; gap: 14px; }
        .flive__tabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .flive__tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.03);
          color: rgba(242,240,250,.62);
          font-family: Inter, system-ui, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
          cursor: pointer; transition: .2s ease;
        }
        .flive__tab i { width: 6px; height: 6px; border-radius: 99px; background: currentColor; opacity: .45; }
        .flive__tab.is-on {
          border-color: color-mix(in srgb, var(--fc) 55%, transparent);
          background: color-mix(in srgb, var(--fc) 16%, transparent);
          color: #fff;
          box-shadow: 0 10px 28px -14px var(--fc);
        }
        .flive__tab.is-on i { background: var(--fc); opacity: 1; box-shadow: 0 0 0 3px color-mix(in srgb, var(--fc) 28%, transparent); }

        .flive__stage {
          display: grid;
          gap: 14px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.1);
          background:
            radial-gradient(rgba(255,255,255,.055) 1px, transparent 1.4px),
            radial-gradient(55% 48% at 12% 0%, color-mix(in srgb, var(--fc) 18%, transparent), transparent 62%),
            radial-gradient(60% 50% at 92% 100%, color-mix(in srgb, var(--fc) 16%, transparent), transparent 70%),
            rgba(0,0,0,.28);
          background-size: 18px 18px, auto, auto, auto;
          padding: 16px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(255,255,255,.03) inset, 0 28px 60px -36px rgba(0,0,0,.7);
        }
        @media (min-width: 900px) {
          .flive__stage { grid-template-columns: 1.55fr .85fr; align-items: stretch; padding: 20px 22px; min-height: 280px; }
        }

        .flive__canvas {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0;
          min-height: 140px;
          content-visibility: auto;
        }
        .flive__node-wrap { display: flex; align-items: center; }
        .flive__wire {
          width: 36px; height: 14px; flex: none;
          stroke: rgba(255,255,255,.18);
          transition: stroke .35s ease, filter .35s ease;
        }
        .flive__wire.is-on { stroke: var(--fc); filter: drop-shadow(0 0 4px var(--fc)); }
        .flive__node {
          display: flex; align-items: flex-start; gap: 9px;
          min-width: 132px; max-width: 168px;
          padding: 12px 13px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          backdrop-filter: blur(6px);
          transition: border-color .35s ease, background .35s ease, box-shadow .35s ease, transform .35s ease;
        }
        .flive__node strong {
          display: block; font-size: 12.5px; font-weight: 700; color: #fff; letter-spacing: -.01em;
        }
        .flive__node em {
          display: block; margin-top: 2px; font-style: normal;
          font-size: 10.5px; color: rgba(242,240,250,.5); line-height: 1.3;
        }
        .flive__node-ic {
          flex: none; width: 22px; height: 22px; border-radius: 7px;
          display: grid; place-items: center;
          font-size: 10px; color: #fff;
          background: rgba(255,255,255,.08);
        }
        .flive__node--start .flive__node-ic { background: #1EB258; }
        .flive__node--msg .flive__node-ic { background: #2E6BFF; }
        .flive__node--wait .flive__node-ic { background: #C9810C; }
        .flive__node--action .flive__node-ic { background: #8B76FF; }
        .flive__node--done .flive__node-ic { background: #1EB258; }
        .flive__node.is-on {
          border-color: color-mix(in srgb, var(--fc) 70%, transparent);
          background: color-mix(in srgb, var(--fc) 16%, transparent);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--fc) 40%, transparent), 0 18px 40px -16px var(--fc);
          transform: translateY(-3px);
        }
        .flive__node.is-done { border-color: color-mix(in srgb, var(--fc) 35%, transparent); }

        .flive__log {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.1);
          background: linear-gradient(180deg, rgba(255,255,255,.04), transparent 50%), rgba(0,0,0,.28);
          padding: 14px 13px 12px;
          min-height: 168px;
          display: flex; flex-direction: column;
          box-shadow: 0 0 0 1px rgba(255,255,255,.02) inset;
        }
        .flive__log-head {
          display: flex; align-items: center; gap: 7px; margin: 0 0 8px;
          font-family: Inter, system-ui, sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
          color: color-mix(in srgb, var(--fc) 70%, #fff);
        }
        .flive__pulse {
          width: 7px; height: 7px; border-radius: 99px; background: var(--fc);
          box-shadow: 0 0 0 0 color-mix(in srgb, var(--fc) 45%, transparent);
          animation: flive-ping 1.8s ease-out infinite;
        }
        @keyframes flive-ping {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--fc) 45%, transparent); }
          70%, 100% { box-shadow: 0 0 0 7px transparent; }
        }
        .flive__log ul {
          list-style: none; margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 6px;
          flex: 1;
        }
        .flive__log li {
          font-size: 12px; line-height: 1.4; color: rgba(242,240,250,.72);
          padding: 6px 8px; border-radius: 8px;
          background: rgba(255,255,255,.03);
          border: 1px solid transparent;
          animation: flive-in .35s ease both;
        }
        .flive__log li.is-fresh {
          color: #fff;
          border-color: color-mix(in srgb, var(--fc) 35%, transparent);
          background: color-mix(in srgb, var(--fc) 12%, transparent);
        }
        .flive__log li.is-muted { color: rgba(242,240,250,.4); background: transparent; }
        @keyframes flive-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }

        @media (max-width: 560px) {
          .flive__node { min-width: 104px; max-width: 130px; padding: 8px 9px; }
          .flive__wire { width: 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .flive__pulse, .flive__log li { animation: none; }
          .flive__node { transition: none; }
        }
      `}</style>
    </div>
  );
}
