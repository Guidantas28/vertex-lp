"use client";

import { useState } from "react";
import ZeDelegaScene from "./ZeDelegaScene";
import ProspectCineScene from "./ProspectCineScene";
import TeamPreviewSwitch, { type TeamSolutionItem } from "./TeamPreviewSwitch";
import { GetStartedButton } from "../ui/get-started-button";

type Mode = "delega" | "prospecta" | "times";

type Props = {
  signupUrl: string;
  teamTitle: string;
  teamLead: string;
  teamCta: string;
  teamItems: TeamSolutionItem[];
  avatars?: { src?: string; initials?: string }[];
};

const MODES: { id: Mode; label: string }[] = [
  { id: "delega", label: "Você Delega" },
  { id: "prospecta", label: "Ele Prospecta" },
  { id: "times", label: "Por Time" },
];

const PROSPECT_STEPS = [
  { n: "1", t: "Varre a internet", d: "Google, Maps e diretórios no nicho que você escolher" },
  { n: "2", t: "Enche o CRM", d: "Empresas reais com telefone, e-mail e responsável" },
  { n: "3", t: "Dispara e agenda", d: "Mensagem em massa agora ou no horário que você marcar" },
];

export default function VosInsideToggle({
  signupUrl,
  teamTitle,
  teamLead,
  teamCta,
  teamItems,
}: Props) {
  const [mode, setMode] = useState<Mode>("delega");

  return (
    <div className="vos-in">
      <div className="vos-in__switch">
        <p className="vos-in__switch-hand" aria-hidden="true">
          Soluções
          <svg className="vos-in__switch-line" viewBox="0 0 120 10" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 7c24-4 72-5 116-2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </p>
        <div className="vos-in__toggle" role="tablist" aria-label="Soluções">
          <span className="vos-in__toggle-glow" aria-hidden="true" data-mode={mode} />
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? "is-on" : undefined}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="vos-in__stage">
        <div
          className="vos-in__panel"
          role="tabpanel"
          hidden={mode !== "delega"}
          aria-hidden={mode !== "delega"}
        >
          <div className="vos-in__delega">
            <div className="vos-in__copy">
              <p className="vos-in__hand" aria-hidden="true">
                Dentro do VOS
                <svg className="vos-in__hand-line" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 8c40-6 120-7 194-3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </p>
              <h2>Você delega. A IA faz o trabalho.</h2>
              <p className="vos-in__sub">
                Sua inteligência, guardada. Mais esperto a cada mensagem.
              </p>
              <div className="vos-in__flow">
                <span><i>1</i> Você pede</span>
                <em aria-hidden="true">→</em>
                <span><i>2</i> Ele executa</span>
                <em aria-hidden="true">→</em>
                <span><i>3</i> Lembra depois</span>
              </div>
              <div className="vos-in__cta">
                <GetStartedButton variant="white" label="Começar agora" />
              </div>
            </div>
            <div className="vos-in__viz">
              <ZeDelegaScene />
            </div>
          </div>
        </div>

        <div
          className="vos-in__panel"
          role="tabpanel"
          hidden={mode !== "prospecta"}
          aria-hidden={mode !== "prospecta"}
        >
          <div className="vos-in__delega vos-in__delega--prospect">
            <div className="vos-in__copy">
              <p className="vos-in__hand" aria-hidden="true">
                Prospect
                <svg className="vos-in__hand-line" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 8c40-6 120-7 194-3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </p>
              <h2>Ele prospecta. Você só fecha.</h2>
              <p className="vos-in__sub">
                Varre a internet, acha clientes em massa, joga no CRM e dispara mensagem pra todos —
                agora ou agendado, rodando no automático.
              </p>
              <div className="vos-in__flow vos-in__flow--stack">
                {PROSPECT_STEPS.map((s) => (
                  <span key={s.n} title={s.d}>
                    <i>{s.n}</i> {s.t}
                  </span>
                ))}
              </div>
              <div className="vos-in__cta">
                <GetStartedButton variant="white" label="Encher minha pipeline" />
              </div>
            </div>
            <div className="vos-in__viz vos-in__viz--prospect">
              <ProspectCineScene />
            </div>
          </div>
        </div>

        <div
          className="vos-in__panel vos-in__panel--times"
          role="tabpanel"
          hidden={mode !== "times"}
          aria-hidden={mode !== "times"}
        >
          <div className="vos-in__times">
            <TeamPreviewSwitch
              title={teamTitle}
              lead={teamLead}
              cta={teamCta}
              signupUrl={signupUrl}
              items={teamItems}
            />
          </div>
        </div>
      </div>

      <style>{`
        .vos-in {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .vos-in__switch {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          flex: 0 0 auto;
          margin: 0 0 clamp(14px, 2vw, 22px);
        }
        .vos-in__switch-hand {
          position: relative;
          display: inline-block;
          margin: 0 0 2px 6px;
          font-family: "Caveat", cursive;
          font-weight: 700;
          font-size: clamp(22px, 2.6vw, 30px);
          line-height: 0.9;
          color: #FFFFFF;
          transform: rotate(-3deg);
        }
        .vos-in__switch-line {
          position: absolute;
          left: -2%;
          bottom: -0.28em;
          width: 104%;
          height: 0.38em;
          color: rgba(255, 255, 255, 0.75);
          overflow: visible;
        }

        .vos-in__toggle {
          position: relative;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 4px;
          margin: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(10px);
          box-shadow:
            0 10px 28px -18px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }
        .vos-in__toggle-glow {
          position: absolute;
          top: 4px; bottom: 4px;
          left: 4px;
          width: calc((100% - 8px) / 3);
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 8px 20px -10px rgba(20, 19, 28, 0.55);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 0;
        }
        .vos-in__toggle-glow[data-mode="prospecta"] { transform: translateX(100%); }
        .vos-in__toggle-glow[data-mode="times"] { transform: translateX(200%); }
        .vos-in__toggle button {
          position: relative;
          z-index: 1;
          appearance: none;
          border: 0;
          background: transparent;
          cursor: pointer;
          padding: 9px 14px;
          min-width: 0;
          flex: 1 1 0;
          border-radius: 999px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 650;
          color: rgba(255, 255, 255, 0.78);
          transition: color 0.25s ease;
          white-space: nowrap;
        }
        .vos-in__toggle button.is-on { color: #1A202C; }
        .vos-in__toggle button:hover:not(.is-on) { color: #fff; }

        .vos-in__stage {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          overflow: hidden;
        }
        .vos-in__panel {
          position: absolute;
          inset: 0;
          min-height: 0;
          overflow: hidden;
        }
        .vos-in__panel[hidden] { display: none; }

        .vos-in__delega {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(16px, 2.5vw, 36px);
          align-items: stretch;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .vos-in__delega--prospect {
          align-items: stretch;
          min-height: 0;
          grid-template-columns: 0.95fr 1.05fr;
        }
        .vos-in__copy {
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .vos-in__delega--prospect .vos-in__copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .vos-in__hand {
          position: relative;
          display: inline-block;
          width: fit-content;
          max-width: max-content;
          align-self: flex-start;
          margin: 0 0 8px;
          font-family: "Caveat", cursive;
          font-weight: 700;
          font-size: clamp(28px, 3.6vw, 44px);
          line-height: 0.95;
          color: #FFBE5A;
          transform: rotate(-3.5deg);
        }
        .vos-in__hand-line {
          position: absolute;
          left: 0;
          bottom: -0.22em;
          width: 100%;
          height: 0.36em;
          color: color-mix(in srgb, #FFBE5A 80%, transparent);
          overflow: visible;
          pointer-events: none;
        }
        .vos-in__copy h2 {
          margin: 10px 0 0;
          font-family: var(--zx-display, "Plus Jakarta Sans", system-ui, sans-serif);
          font-size: var(--zx-fs-title, clamp(32px, 3.8vw, 44px));
          line-height: var(--zx-lh-title, 1.1);
          letter-spacing: var(--zx-ls-title, -0.02em);
          font-weight: var(--zx-fw-title, 700);
          color: #fff;
          text-wrap: balance;
        }
        .vos-in__sub {
          margin: 14px 0 0;
          max-width: 440px;
          font-family: var(--zx-body, Inter, system-ui, sans-serif);
          font-size: var(--zx-fs-body, 16px);
          line-height: var(--zx-lh-body, 22px);
          font-weight: var(--zx-fw-body, 400);
          color: rgba(255, 240, 232, 0.88);
          text-wrap: balance;
        }
        .vos-in__flow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          flex-wrap: wrap;
        }
        .vos-in__flow--stack { gap: 8px; }
        .vos-in__flow span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px 5px 5px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.13);
          border: 1px solid rgba(255, 255, 255, 0.26);
          backdrop-filter: blur(4px);
          font-size: 12px;
          font-weight: 650;
          line-height: 1;
          color: #fff;
          white-space: nowrap;
        }
        .vos-in__flow span i {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 18px;
          width: 18px;
          height: 18px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-sizing: border-box;
          font-style: normal;
          font-family: var(--zx-body, Inter, system-ui, sans-serif);
          font-size: 10px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0;
          color: #fff;
          /* óptica: dígitos costumam sentar alto no círculo */
          padding-top: 1px;
        }
        .vos-in__flow em {
          font-style: normal;
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }
        .vos-in__cta {
          align-self: flex-start;
          width: fit-content;
          margin-top: 18px;
          flex: 0 0 auto;
        }
        .vos-in__viz {
          position: relative;
          height: 100%;
          min-height: 0;
          display: flex;
          align-items: stretch;
          justify-content: center;
          min-width: 0;
          overflow: hidden;
          align-self: stretch;
        }

        .vos-in__viz--prospect {
          align-items: stretch;
          justify-content: stretch;
          min-height: 0;
          height: 100%;
          align-self: stretch;
          overflow: hidden;
        }

        .vos-in__times {
          --foreground: #ffffff;
          --muted-foreground: rgba(255, 240, 232, 0.82);
          --background: transparent;
          --border: rgba(255, 255, 255, 0.22);
          --muted: rgba(255, 255, 255, 0.12);
          --primary: #ffffff;
          --vos-phone-h: min(360px, 72cqh);
          color: #fff;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .vos-in__times .vos-team-switch {
          padding-top: 0;
          padding-bottom: 0;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .vos-in__times .vos-team-switch > div {
          height: 100%;
          min-height: 0;
        }
        .vos-in__times .vos-team-switch .max-w-7xl {
          height: 100%;
          min-height: 0;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          justify-content: center;
        }
        .vos-in__times .vos-team-switch .max-w-7xl > div {
          height: 100%;
          min-height: 0;
          gap: 16px !important;
          align-items: center;
        }
        .vos-in__times .vos-team-switch h2 {
          font-size: clamp(26px, 3.2vw, 40px) !important;
          margin-bottom: 10px !important;
          line-height: 1.05 !important;
        }
        .vos-in__times .vos-team-switch p {
          font-size: 14px !important;
        }
        .vos-in__times .vos-team-switch [role="tablist"] {
          gap: 8px;
          padding: 6px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(8px);
        }
        .vos-in__times .vos-team-switch [role="tab"] {
          padding: 10px 16px;
          border-radius: 999px;
          min-width: 128px;
        }
        .vos-in__times .vos-team-switch [role="tab"][aria-selected="true"] {
          background: #fff !important;
          color: #1A202C !important;
        }
        .vos-in__times .vos-team-switch [role="tab"]:not([aria-selected="true"]) {
          color: rgba(255, 255, 255, 0.55) !important;
        }
        .vos-in__times :is(h2, h3, p, span, a, button) { color: inherit; }
        .vos-in__times [class*="text-foreground"] { color: #fff !important; }
        .vos-in__times [class*="text-muted-foreground"] { color: rgba(255, 240, 232, 0.82) !important; }
        .vos-in__times [class*="bg-muted"] {
          background: rgba(255, 255, 255, 0.14) !important;
        }
        .vos-in__times [class*="border-border"],
        .vos-in__times [class*="ring-foreground"] {
          border-color: rgba(255, 255, 255, 0.22) !important;
          --tw-ring-color: rgba(255, 255, 255, 0.18) !important;
        }
        .vos-in__times a[class*="bg-foreground"],
        .vos-in__times button[class*="bg-foreground"] {
          background: #fff !important;
          color: #14131C !important;
        }
        .vos-in__times a[class*="border"] {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #fff !important;
        }

        @media (max-width: 900px) {
          .vos-in__delega {
            grid-template-columns: 1fr;
            grid-template-rows: auto minmax(0, 1fr);
            align-items: stretch;
            min-height: 0;
            gap: 10px;
          }
          .vos-in__copy { justify-content: flex-start; overflow: hidden; }
          .vos-in__copy h2 { font-size: clamp(24px, 6vw, 32px); }
          .vos-in__sub { margin-top: 8px; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .vos-in__flow { margin-top: 10px; }
          .vos-in__cta { margin-top: 12px; }
          .vos-in__viz {
            height: auto;
            min-height: 0;
            margin-top: 0;
            align-self: stretch;
            overflow: hidden;
          }
          .vos-in__delega--prospect { min-height: 0; grid-template-columns: 1fr; }
          .vos-in__viz--prospect { height: auto; min-height: 0; }
          .vos-in__times { --vos-phone-h: min(300px, 48cqh); }
          .vos-in__toggle { width: 100%; max-width: 100%; }
          .vos-in__toggle button { padding: 9px 10px; font-size: 12px; }
        }
        @media (max-width: 560px) {
          .vos-in__toggle button { font-size: 11.5px; padding: 8px 8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vos-in__toggle-glow { transition: none; }
        }
      `}</style>
    </div>
  );
}
