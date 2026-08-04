"use client";

/**
 * ProspectCineScene — motion cinematográfico 5 atos (sem “caixa” opaca):
 * 1) Digita nicho/cidade
 * 2) Varre a internet
 * 3) Tabela enche
 * 4) Seleciona em massa
 * 5) Drawer rico (CNPJ, redes, equipe…)
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Act = 0 | 1 | 2 | 3 | 4;

const ACT_MS = [2800, 2600, 2800, 2200, 3600] as const;

const ROWS = [
  { nome: "Clínica OdontoVita", cat: "Dentista", cid: "São Paulo", tel: "(11) 98765-4321", mail: "contato@odontovita.com" },
  { nome: "Dental Smile", cat: "Odontologia", cid: "Campinas", tel: "(19) 98812-0099", mail: "ola@dentalsmile.com.br" },
  { nome: "Ortho Center", cat: "Ortodontia", cid: "Santos", tel: "(13) 99100-2211", mail: "time@orthocenter.com" },
  { nome: "Sorrisos & Cia", cat: "Clínica", cid: "Guarulhos", tel: "(11) 97654-1100", mail: "oi@sorrisos.com" },
  { nome: "Implante Prime", cat: "Implantes", cid: "Osasco", tel: "(11) 95550-7788", mail: "agenda@implanteprime.com" },
];

function TypeLine({ text, active }: { text: string; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [active, text]);
  return (
    <span>
      {text.slice(0, n)}
      {active && n < text.length ? <i className="psp-caret" /> : null}
    </span>
  );
}

export default function ProspectCineScene() {
  const reduce = useReducedMotion();
  const [act, setAct] = useState<Act>(0);
  const [visibleRows, setVisibleRows] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) {
      setAct(4);
      setVisibleRows(ROWS.length);
      setCount(100);
      return;
    }
    let cancelled = false;
    let t: number;
    const run = (a: Act) => {
      if (cancelled) return;
      setAct(a);
      if (a === 2) {
        setVisibleRows(0);
        setCount(0);
        let r = 0;
        const rowId = window.setInterval(() => {
          r += 1;
          setVisibleRows(Math.min(r, ROWS.length));
          setCount(Math.min(12 + r * 18, 100));
          if (r >= ROWS.length) window.clearInterval(rowId);
        }, 220);
      }
      if (a === 3) setCount(100);
      t = window.setTimeout(() => run(((a + 1) % 5) as Act), ACT_MS[a]);
    };
    run(0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [reduce]);

  return (
    <div className="psp-cine" aria-hidden="true">
      <AnimatePresence mode="wait">
        {act === 0 && (
          <motion.div
            key="a0"
            className="psp-cine__shot"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="psp-cine__chip">Buscar leads</div>
            <div className="psp-cine__form">
              <label>
                <span>Palavra-chave</span>
                <div className="psp-cine__field is-focus">
                  <TypeLine text="Dentistas" active={act === 0} />
                </div>
              </label>
              <label>
                <span>Cidade</span>
                <div className="psp-cine__field">São Paulo, SP</div>
              </label>
              <label>
                <span>Indústria</span>
                <div className="psp-cine__field">Saúde · Odontologia</div>
              </label>
              <motion.div
                className="psp-cine__btn"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                Varrer internet
              </motion.div>
            </div>
          </motion.div>
        )}

        {act === 1 && (
          <motion.div
            key="a1"
            className="psp-cine__shot psp-cine__scan"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <div className="psp-cine__radar" />
            <div className="psp-cine__scan-copy">
              <strong>Varrendo a internet…</strong>
              <span>Google · Maps · diretórios · redes</span>
            </div>
            <div className="psp-cine__bar">
              <motion.i
                initial={{ width: "8%" }}
                animate={{ width: "92%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
            </div>
            <ul className="psp-cine__pings">
              {["Maps", "CNPJ", "WhatsApp", "Instagram", "E-mail"].map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.28 }}
                >
                  {p} ✓
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {(act === 2 || act === 3) && (
          <motion.div
            key="a23"
            className="psp-cine__shot"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="psp-cine__banner">
              Busca concluída · <b>{count}</b> empresa(s) encontradas
            </div>
            <div className="psp-cine__stats">
              <div><b>{count}</b><em>encontradas</em></div>
              <div><b>{Math.min(count, 100)}</b><em>enriquecidas</em></div>
              <div><b>{act === 3 ? 100 : 0}</b><em>no CRM</em></div>
            </div>
            <div className="psp-cine__table">
              <header>
                <span />
                <span>Empresa</span>
                <span>Cidade</span>
                <span>Contato</span>
              </header>
              {ROWS.slice(0, visibleRows).map((r, i) => (
                <motion.div
                  key={r.nome}
                  className="psp-cine__row"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <i className={act === 3 ? "is-on" : undefined} />
                  <strong>{r.nome}</strong>
                  <span>{r.cid}</span>
                  <span>{r.tel}</span>
                </motion.div>
              ))}
            </div>
            {act === 3 && (
              <motion.div
                className="psp-cine__toast"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                100 selecionadas · adicionando ao CRM…
              </motion.div>
            )}
          </motion.div>
        )}

        {act === 4 && (
          <motion.div
            key="a4"
            className="psp-cine__shot psp-cine__drawer-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="psp-cine__table psp-cine__table--dim">
              <header>
                <span />
                <span>Empresa</span>
                <span>Cidade</span>
                <span>Contato</span>
              </header>
              {ROWS.slice(0, 3).map((r) => (
                <div key={r.nome} className="psp-cine__row">
                  <i className="is-on" />
                  <strong>{r.nome}</strong>
                  <span>{r.cid}</span>
                  <span>{r.tel}</span>
                </div>
              ))}
            </div>
            <motion.aside
              className="psp-cine__drawer"
              initial={{ x: "108%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <div className="psp-cine__drawer-top">
                <b>PP</b>
                <div>
                  <strong>Padaria Pão Quente</strong>
                  <em>4.6 ★ · 328 avaliações · NOVO</em>
                </div>
              </div>
              <div className="psp-cine__links">
                <span>WhatsApp</span>
                <span>Site</span>
                <span>Instagram</span>
                <span>Maps</span>
              </div>
              <dl>
                <div><dt>CNPJ</dt><dd>12.345.678/0001-90</dd></div>
                <div><dt>Sócio</dt><dd>Marcos Oliveira</dd></div>
                <div><dt>Telefone</dt><dd>(11) 3456-7890</dd></div>
                <div><dt>E-mail</dt><dd>contato@paoquente.com</dd></div>
                <div><dt>Instagram</dt><dd>@paoquente.sp</dd></div>
                <div><dt>Endereço</dt><dd>Rua das Flores, 128 — SP</dd></div>
              </dl>
              <div className="psp-cine__drawer-cta">Pipeline</div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .psp-cine {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          overflow: hidden;
        }
        .psp-cine__shot {
          width: 100%;
          height: 100%;
          min-height: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
        }
        .psp-cine__chip {
          display: inline-flex;
          margin-bottom: 10px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.28);
        }
        .psp-cine__form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          justify-content: center;
        }
        .psp-cine__form label span {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 650;
          color: rgba(255,255,255,0.7);
        }
        .psp-cine__field {
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          min-height: 52px;
        }
        .psp-cine__field.is-focus {
          border-color: rgba(255,255,255,0.55);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.12);
        }
        .psp-caret {
          display: inline-block;
          width: 1.5px;
          height: 1em;
          margin-left: 2px;
          background: #fff;
          vertical-align: -2px;
          animation: psp-blink 0.9s step-end infinite;
        }
        @keyframes psp-blink { 50% { opacity: 0; } }
        .psp-cine__btn {
          margin-top: 4px;
          align-self: flex-start;
          padding: 11px 16px;
          border-radius: 999px;
          background: #fff;
          color: #14131C;
          font-size: 13.5px;
          font-weight: 750;
        }

        .psp-cine__scan { text-align: center; padding: 8px 0; }
        .psp-cine__radar {
          width: min(180px, 42%); height: min(180px, 42%);
          aspect-ratio: 1;
          margin: 0 auto 18px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 50% 50%, rgba(125,255,179,0.35), transparent 42%),
            repeating-conic-gradient(from 0deg, rgba(255,255,255,0.18) 0deg 8deg, transparent 8deg 24deg);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: 0 0 40px rgba(125,255,179,0.25);
          animation: psp-spin 2.4s linear infinite;
        }
        @keyframes psp-spin { to { transform: rotate(360deg); } }
        .psp-cine__scan-copy strong {
          display: block;
          font-size: 18px;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .psp-cine__scan-copy span {
          display: block;
          margin-top: 4px;
          font-size: 12.5px;
          color: rgba(255,240,232,0.78);
        }
        .psp-cine__bar {
          margin: 16px auto 12px;
          width: min(100%, 280px);
          height: 6px;
          border-radius: 99px;
          background: rgba(255,255,255,0.14);
          overflow: hidden;
        }
        .psp-cine__bar i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #7DFFB3, #FFBE5A, #fff);
        }
        .psp-cine__pings {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
        }
        .psp-cine__pings li {
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: #7DFFB3;
          background: rgba(125,255,179,0.12);
          border: 1px solid rgba(125,255,179,0.3);
        }

        .psp-cine__banner {
          margin-bottom: 10px;
          padding: 9px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #0b3d2e;
          background: rgba(125, 255, 179, 0.88);
        }
        .psp-cine__banner b { font-weight: 800; }
        .psp-cine__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        .psp-cine__stats div {
          padding: 9px 10px;
          border-radius: 12px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(8px);
        }
        .psp-cine__stats b {
          display: block;
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .psp-cine__stats em {
          display: block;
          margin-top: 1px;
          font-style: normal;
          font-size: 10.5px;
          color: rgba(255,255,255,0.7);
        }
        .psp-cine__table {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-radius: 14px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }
        .psp-cine__table--dim { opacity: 0.45; filter: saturate(0.7); }
        .psp-cine__table header,
        .psp-cine__row {
          display: grid;
          grid-template-columns: 16px 1.3fr 0.8fr 1.1fr;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
          font-size: 12px;
        }
        .psp-cine__table header {
          color: rgba(255,255,255,0.55);
          font-weight: 650;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .psp-cine__row {
          color: rgba(255,255,255,0.88);
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .psp-cine__row strong {
          font-size: 11.5px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .psp-cine__row span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: rgba(255,255,255,0.72);
        }
        .psp-cine__row i {
          width: 12px; height: 12px;
          border-radius: 4px;
          border: 1.5px solid rgba(255,255,255,0.45);
          display: block;
        }
        .psp-cine__row i.is-on {
          background: #2E6BFF;
          border-color: #2E6BFF;
          box-shadow: inset 0 0 0 2px rgba(255,255,255,0.25);
        }
        .psp-cine__toast {
          margin-top: 10px;
          padding: 9px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          background: rgba(20,19,28,0.45);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
        }

        .psp-cine__drawer-wrap { min-height: 100%; flex: 1; }
        .psp-cine__drawer {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: min(74%, 290px);
          padding: 14px 14px 12px;
          border-radius: 18px 0 0 18px;
          background: rgba(12, 10, 20, 0.55);
          border: 1px solid rgba(255,255,255,0.22);
          border-right: 0;
          backdrop-filter: blur(16px);
          box-shadow: -18px 0 40px -20px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .psp-cine__drawer-top {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .psp-cine__drawer-top > b {
          width: 36px; height: 36px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #ED4B00, #C9810C);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
        }
        .psp-cine__drawer-top strong {
          display: block;
          font-size: 13px;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .psp-cine__drawer-top em {
          display: block;
          margin-top: 2px;
          font-style: normal;
          font-size: 10.5px;
          color: rgba(255,255,255,0.7);
        }
        .psp-cine__links {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .psp-cine__links span {
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .psp-cine__drawer dl {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .psp-cine__drawer dl div {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 6px;
          font-size: 11px;
        }
        .psp-cine__drawer dt {
          color: rgba(255,255,255,0.5);
          font-weight: 600;
        }
        .psp-cine__drawer dd {
          margin: 0;
          color: #fff;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .psp-cine__drawer-cta {
          align-self: stretch;
          text-align: center;
          padding: 10px;
          border-radius: 12px;
          background: #fff;
          color: #14131C;
          font-size: 12.5px;
          font-weight: 750;
        }

        @media (prefers-reduced-motion: reduce) {
          .psp-cine__radar { animation: none; }
          .psp-caret { animation: none; }
        }
      `}</style>
    </div>
  );
}
