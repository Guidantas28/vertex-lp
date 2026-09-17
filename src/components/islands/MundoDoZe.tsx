"use client";

/**
 * O MUNDO DO ZÉ (v2, 17/09): o que aparece depois do mergulho na palavra.
 *
 * Refeito em cima do desenho do Claude Design ("Modo Ze.html", founder 17/09): cinco telas,
 * cada uma com texto de um lado e uma cena do outro, artefatos flutuando em volta das
 * janelas (com parallax leve) e o fecho. Só as telas que o founder mandou; o herói do
 * desenho ficou de fora e a cabeça da seção segue a nossa.
 *
 * - Executa: a janela do VOS (780×520, reduzida por escala quando não cabe) com a demo ao
 *   vivo: digita, envia, quatro passos que viram check e recolhem, resposta palavra por
 *   palavra e o card com a foto. Quatro situações revezam.
 * - Enquanto você dorme: o globo do desenho virou o MAPA PONTILHADO do Brasil com arcos
 *   (components/ui/world-map), a pedido do founder.
 * - Agentes: o retrato do time (placeholder até a imagem chegar) com o cartão da citação.
 * - Controle: a janela de Ajustes › Assistente (640×420) com teto, liberações e o registro.
 * - Fecho: "O escritório que nunca fecha." e o botão.
 *
 * Por trás: a aurora e, só nesta parte, as partículas que seguem o mouse
 * (components/ui/particle-canvas), numa camada grudada na janela.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { GetStartedButton } from "@/components/ui/get-started-button";
import AuroraBackground from "@/components/ui/aurora-background";
import WorldMap from "@/components/ui/world-map";
import ParticleCanvas from "@/components/ui/particle-canvas";

const ZE = "/agentes/ze.webp";
const TEO = "/agentes/operacoes.webp";
const FOTOS = "/mundo-do-ze";

/* ── ícones de traço, no tamanho do lugar ── */
const svg = (path: ReactNode, extra: Record<string, unknown> = {}) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...extra}>{path}</svg>
);
const I = {
  check: (w = 13) => svg(<path d="M5 12.5l4.5 4.5L19 7.5" />, { width: w, height: w, strokeWidth: 2.6 }),
  clock: (w = 15) => svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, { width: w, height: w }),
  lista: svg(<path d="M4 6h16M4 12h16M4 18h10" />, { width: 15, height: 15 }),
  seta: (w = 10) => svg(<path d="M5 12h14M13 6l6 6-6 6" />, { width: w, height: w, strokeWidth: 2.6 }),
  desfazer: svg(<><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 010 12h-3" /></>, { width: 13, height: 13 }),
  chevron: svg(<path d="M6 9l6 6 6-6" />, { width: 12, height: 12 }),
  arroba: svg(<><circle cx="12" cy="12" r="4" /><path d="M16 12v1.5a2.5 2.5 0 005 0V12a9 9 0 10-3.5 7.1" /></>),
  mais: svg(<path d="M12 5v14M5 12h14" />),
  enviar: svg(<path d="M12 19V5M6 11l6-6 6 6" />, { strokeWidth: 2.4 }),
  loja: svg(<><path d="M4 9l1.2-4h13.6L20 9" /><path d="M4 9h16v10a1 1 0 01-1 1H5a1 1 0 01-1-1z" /><path d="M9 20v-6h6v6" /></>, { width: 14, height: 14, strokeWidth: 1.9 }),
  lua: svg(<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />, { width: 22, height: 22, strokeWidth: 1.8 }),
  pessoa: <svg width="26" height="26" viewBox="0 0 24 24" fill="rgba(255,255,255,.6)" aria-hidden="true"><circle cx="12" cy="9.5" r="4" /><path d="M4 22a8 8 0 0116 0z" /></svg>,
  imagem: svg(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></>, { width: 26, height: 26, strokeWidth: 1.6 }),
};

/* ── o placeholder de imagem: até a foto chegar, o lugar fica marcado ── */
function Slot({ legenda }: { legenda: string }) {
  return (
    <div className="mdz-slot" data-slot={legenda}>
      <span className="mdz-slot-ico">{I.imagem}</span>
      <span>{legenda}</span>
    </div>
  );
}

/* ── escala de uma janela de tamanho fixo: reduz quando o palco é mais estreito que ela ── */
function useEscala(base: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mede = () => setS(Math.min(1, el.clientWidth / base));
    mede();
    const ro = new ResizeObserver(mede);
    ro.observe(el);
    return () => ro.disconnect();
  }, [base]);
  return { ref, s };
}

/* ══════════════════ a demo do Início: as quatro situações do desenho ══════════════════ */
const CHIP: Record<string, [string, string]> = { ok: ["#cdfed4", "#014b40"], warn: ["#ffebd5", "#412d00"], info: ["#eaf4ff", "#003a5a"], neutral: ["#ebebeb", "#171717"] };
type Sit = { msg: string; steps: [string, string][]; reply: string; esperaNoFim?: boolean; card: { num: string; kind: string; chip: string; tone: keyof typeof CHIP; thumb: string; line1: string; line2: string; value?: string; action?: string } };
const SITS: Sit[] = [
  { msg: "Abre um pedido pra Marina Costa com 2 camisetas básicas P e manda o link de pagamento no WhatsApp",
    steps: [["Procurando Marina Costa nos contatos", "Cliente encontrada"], ["Abrindo o pedido com 2× Camiseta básica P", "#000214 · R$ 178,00"], ["Gerando o link de pagamento", "Link criado"], ["Enviando no WhatsApp", "Enviado · 14:02"]],
    reply: "Feito. Abri o pedido e o link já foi pra Marina.",
    card: { num: "#000214", kind: "Pedido", chip: "Link enviado", tone: "ok", thumb: "camiseta", line1: "2× Camiseta básica P", line2: "Marina Costa", value: "R$ 178,00" } },
  { msg: "Manda um orçamento da cadeira gamer pro Rafael Lima, com a foto",
    steps: [["Procurando Rafael Lima nos contatos", "Cliente encontrado"], ["Montando o orçamento com 1× Cadeira gamer Apex", "COT-0042 · R$ 1.290,00"], ["Anexando a foto do produto", "1 foto"], ["Enviando no WhatsApp", "Enviado · 15:27"]],
    reply: "Pronto. O orçamento foi pro Rafael com a foto da cadeira.",
    card: { num: "COT-0042", kind: "Orçamento", chip: "Enviado", tone: "ok", thumb: "cadeira", line1: "1× Cadeira gamer Apex", line2: "Rafael Lima", value: "R$ 1.290,00" } },
  { msg: "Cadastra o Vestido Aurora na loja por R$ 249 com 12 em estoque",
    steps: [["Criando o produto Vestido Aurora", "Criado"], ["Definindo o preço", "R$ 249,00"], ["Ajustando o estoque", "12 unidades"], ["Publicando na loja", "Publicado"]],
    reply: "Feito. O Vestido Aurora já está na loja, com 12 em estoque.",
    card: { num: "SKU 0187", kind: "Produto", chip: "Publicado", tone: "ok", thumb: "vestido", line1: "Vestido Aurora", line2: "12 em estoque", value: "R$ 249,00" } },
  { msg: "Agenda a manutenção do ar-condicionado da Célia pra sexta às 9h e manda a ordem de serviço",
    steps: [["Procurando Célia Ramos nos contatos", "Cliente encontrada"], ["Abrindo a ordem de serviço", "OS-0088 · R$ 320,00"], ["Agendando pra sexta, 9h", "Agenda atualizada"], ["Enviando no WhatsApp", "Enviado · 10:05"]],
    reply: "Agendado. A OS foi pra Célia com o horário de sexta.",
    card: { num: "OS-0088", kind: "Ordem de serviço", chip: "Agendada", tone: "info", thumb: "ar", line1: "Manutenção de ar-condicionado", line2: "Célia Ramos · sexta, 9h", value: "R$ 320,00" } },
  { msg: "Libera o acesso do curso de confeitaria pra Juliana e manda o link por e-mail",
    steps: [["Procurando Juliana Alves nos contatos", "Cliente encontrada"], ["Liberando o acesso ao Curso de confeitaria", "Acesso liberado"], ["Gerando o link de acesso", "Link criado"], ["Enviando por e-mail", "Enviado · 11:40"]],
    reply: "Pronto. A Juliana já recebeu o acesso ao curso por e-mail.",
    card: { num: "CUR-0012", kind: "Produto digital", chip: "Acesso liberado", tone: "ok", thumb: "curso", line1: "Curso de confeitaria", line2: "Juliana Alves", value: "R$ 197,00" } },
  { msg: "Cadastra o e-book Guia de precificação por R$ 47 e coloca na loja com entrega automática",
    steps: [["Criando o produto digital", "Criado"], ["Anexando o arquivo PDF", "1 arquivo"], ["Definindo o preço", "R$ 47,00"], ["Publicando na loja", "Publicado"]],
    reply: "Feito. O e-book já está na loja, com entrega automática.",
    card: { num: "SKU 0203", kind: "Produto digital", chip: "Publicado", tone: "ok", thumb: "ebook", line1: "E-book Guia de precificação", line2: "Entrega automática", value: "R$ 47,00" } },
  { msg: "Manda uma mensagem pra quem não compra há 60 dias oferecendo o tênis Runner com o cupom VOLTA15",
    steps: [["Filtrando clientes sem compra há 60 dias", "36 contatos"], ["Escrevendo a mensagem com o cupom VOLTA15", "Pronta"], ["Montando o disparo", "Rascunho"], ["Aguardando a sua liberação", "Precisa de confirmação"]],
    reply: "Deixei o disparo pronto pra 36 contatos. Ele só sai quando você liberar.", esperaNoFim: true,
    card: { num: "DSP-0009", kind: "Disparo", chip: "Rascunho", tone: "warn", thumb: "tenis", line1: "Tênis Runner · cupom VOLTA15", line2: "36 contatos", action: "Liberar" } },
];
const RITMO = { porLetra: 30, envia: 260, pensa: 500, porPasso: 720, colapsa: 420, respira: 320, porPalavra: 70, card: 420, segura: 6000, apaga: 280 };
function marcasDe(S: Sit) {
  const envia = S.msg.length * RITMO.porLetra + RITMO.envia;
  const passos = envia + RITMO.pensa;
  const feito = (i: number) => passos + RITMO.porPasso * (i + 1);
  const colapsa = feito(S.steps.length - 1) + RITMO.colapsa;
  const resposta = colapsa + RITMO.respira;
  const nW = S.reply.split(" ").length;
  const card = resposta + RITMO.porPalavra * nW + RITMO.card;
  const fade = card + RITMO.segura;
  return { envia, passos, feito, colapsa, resposta, nW, card, fade, fim: fade + RITMO.apaga };
}
const MARCAS = SITS.map(marcasDe);
type Passo = { label: string; result: string; status: "running" | "done" | "wait" };
type EstadoD1 = { sit: number; typed: string; typing: boolean; sent: boolean; stepsVisible: boolean; steps: Passo[]; collapsed: boolean; responseVisible: boolean; words: number; cardVisible: boolean; fade: number };
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
function estadoD1(sit: number, t: number): EstadoD1 {
  const S = SITS[sit], M = MARCAS[sit];
  const sent = t >= M.envia;
  const steps: Passo[] = [];
  if (t >= M.passos) {
    for (let i = 0; i < S.steps.length; i++) {
      const comeca = i === 0 ? M.passos : M.feito(i - 1);
      if (t < comeca) break;
      const pronto = t >= M.feito(i);
      steps.push({ label: S.steps[i][0], result: pronto ? S.steps[i][1] : "", status: pronto ? (S.esperaNoFim && i === S.steps.length - 1 ? "wait" : "done") : "running" });
    }
  }
  return {
    sit,
    typed: sent ? "" : S.msg.slice(0, clamp(Math.floor(t / RITMO.porLetra), 0, S.msg.length)),
    typing: !sent,
    sent,
    stepsVisible: t >= M.passos,
    steps,
    collapsed: t >= M.colapsa,
    responseVisible: t >= M.resposta,
    words: clamp(Math.floor((t - M.resposta) / RITMO.porPalavra), 0, M.nW),
    cardVisible: t >= M.card,
    fade: t >= M.fade ? 0 : 1,
  };
}
const chaveD1 = (e: EstadoD1) => `${e.sit}|${e.typed.length}|${e.sent}|${e.steps.map((s) => s.status[0] + (s.result ? 1 : 0)).join("")}|${e.collapsed}|${e.responseVisible}|${e.words}|${e.cardVisible}|${e.fade}`;

function DemoExecuta({ aoMudar }: { aoMudar?: (sit: number) => void }) {
  const raiz = useRef<HTMLDivElement>(null);
  const [e, setE] = useState<EstadoD1>(() => estadoD1(0, 0));
  const avisa = useRef(aoMudar);
  avisa.current = aoMudar;
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setE(estadoD1(0, MARCAS[0].card + 1)); return; }
    let raf = 0, sit = 0, inicio = 0, t = 0, ultima = "";
    const quadro = (agora: number) => {
      t = agora - inicio;
      if (t >= MARCAS[sit].fim) { sit = (sit + 1) % SITS.length; inicio = agora; t = 0; avisa.current?.(sit); }
      const novo = estadoD1(sit, t);
      const k = chaveD1(novo);
      if (k !== ultima) { ultima = k; setE(novo); }
      raf = requestAnimationFrame(quadro);
    };
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { if (!raf) { inicio = performance.now() - t; raf = requestAnimationFrame(quadro); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const S = SITS[e.sit];
  const tone = CHIP[S.card.tone] ?? CHIP.neutral;
  const palavras = S.reply.split(" ");
  const rotulo = S.esperaNoFim ? "3 passos feitos · 1 aguarda liberação" : "4 passos feitos";
  return (
    <div className="mdz-d1" ref={raiz}>
      <div className="mdz-d1-cab"><img src={ZE} alt="" width={22} height={22} className="mdz-face22" /><b>Zé</b><span className="mdz-cinza">· pronto pra executar</span></div>
      <div className="mdz-d1-chat" style={{ opacity: e.fade }}>
        {e.sent ? <div className="mdz-d1-eu mdz-sobe" key={`m${e.sit}`}><div className="mdz-d1-balao-eu">{S.msg}</div><span className="mdz-d1-v">V</span></div> : null}
        {e.stepsVisible ? (
          <div className="mdz-d1-ze">
            <img src={ZE} alt="" width={24} height={24} className="mdz-face24" />
            <div className="mdz-d1-corpo">
              {!e.collapsed ? (
                <div className="mdz-d1-passos">
                  {e.steps.map((st) => (
                    <div className="mdz-d1-passo mdz-sobe" key={st.label}>
                      <span className={`mdz-d1-ico${st.status === "wait" ? " espera" : ""}`}>{st.status === "running" ? <i className="mdz-spin" /> : st.status === "done" ? I.check() : I.clock(13)}</span>
                      <span className="mdz-d1-rot">{st.label}{st.result ? <span className="mdz-cinza"> · {st.result}</span> : null}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mdz-d1-colapso mdz-sobe"><span className="mdz-d1-ico">{I.check()}</span><span>{rotulo}</span>{I.chevron}</div>
              )}
              {e.responseVisible ? (
                <div className="mdz-d1-resp mdz-sobe">{palavras.map((w, i) => <span key={i} style={{ opacity: i < e.words ? 1 : 0, transition: "opacity .16s" }}>{i < palavras.length - 1 ? w + " " : w}</span>)}</div>
              ) : null}
              {e.cardVisible ? (
                <div className="mdz-d1-card mdz-sobe">
                  <div className="mdz-d1-card-cab"><span className="mdz-mono">{S.card.num}</span><b>{S.card.kind}</b><span className="mdz-chip" style={{ background: tone[0], color: tone[1] }}>{S.card.tone === "ok" ? I.check(11) : S.card.tone === "warn" ? I.clock(11) : null}{S.card.chip}</span></div>
                  <div className="mdz-d1-card-corpo">
                    <img src={`${FOTOS}/${S.card.thumb}.webp`} alt="" width={44} height={44} className="mdz-d1-foto" loading="lazy" />
                    <div className="mdz-d1-card-linhas"><div className="mdz-d1-l1">{S.card.line1}</div><div className="mdz-d1-l2">{S.card.line2}</div></div>
                    {S.card.value ? <div className="mdz-d1-valor">{S.card.value}</div> : null}
                    {S.card.action ? <div className="mdz-d1-acao">{S.card.action}</div> : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mdz-d1-compositor">
        <div className="mdz-d1-texto">{!e.typing && !e.typed ? <span className="mdz-cinza2">Peça algo pro Zé</span> : null}{e.typed}{e.typing ? <i className="mdz-cursor" /> : null}</div>
        <div className="mdz-d1-barra"><span className="mdz-d1-btn">{I.arroba}</span><span className="mdz-d1-btn">{I.mais}</span><span className="mdz-d1-enviar" style={{ background: e.typed ? "#171717" : "#d8d8d8" }}>{I.enviar}</span></div>
      </div>
    </div>
  );
}

/* ══════════════════ as janelas ══════════════════ */
/* o que flutua em volta da janela do Início muda junto com a situação da demo */
const ARTEFATOS = [
  { foto: "camiseta", logo: "whatsapp", hora: "14:02", vidro: "Enviado no WhatsApp", rot: "Link de pagamento", num: "R$ 178,00", chip: "Aberto pela Marina", tom: "info" as const },
  { foto: "cadeira", logo: "whatsapp", hora: "15:27", vidro: "Enviado no WhatsApp", rot: "Orçamento", num: "R$ 1.290,00", chip: "Visto pelo Rafael", tom: "ok" as const },
  { foto: "vestido", logo: "loja", hora: "16:10", vidro: "Publicado na loja", rot: "Vestido Aurora", num: "R$ 249,00", chip: "12 em estoque", tom: "ok" as const },
  { foto: "ar", logo: "whatsapp", hora: "10:05", vidro: "Enviado no WhatsApp", rot: "Ordem de serviço", num: "R$ 320,00", chip: "Sexta, 9h", tom: "info" as const },
  { foto: "curso", logo: "email", hora: "11:40", vidro: "Enviado por e-mail", rot: "Curso de confeitaria", num: "R$ 197,00", chip: "Acesso liberado", tom: "ok" as const },
  { foto: "ebook", logo: "loja", hora: "12:20", vidro: "Publicado na loja", rot: "E-book", num: "R$ 47,00", chip: "Entrega automática", tom: "ok" as const },
  { foto: "tenis", logo: "whatsapp", hora: "16:44", vidro: "Rascunho pronto pra 36", rot: "Disparo", num: "36 contatos", chip: "Só sai quando liberar", tom: "warn" as const },
];
const LOGO_CANAL: Record<string, string> = { whatsapp: "/brand/channels/whatsapp.svg", instagram: "/brand/channels/instagram.svg", email: "/brand/channels/email.svg" };
function JanelaExecuta() {
  const { ref, s } = useEscala(780);
  const [sit, setSit] = useState(0);
  const A = ARTEFATOS[sit];
  const tom = CHIP[A.tom];
  return (
    <div className="mdz-janela-wrap" ref={ref} style={{ maxWidth: 780, height: Math.round(520 * s) }}>
      <div className="mdz-janela" style={{ width: 780, height: 520, transform: `scale(${s})` }}>
        {/* sem a lateral dos agentes (founder 17/09): como no Início do produto, o chat ocupa a janela inteira */}
        <DemoExecuta aoMudar={setSit} />
      </div>
      <div className="mdz-artes">
        <div className="mdz-arte mdz-wide" data-par="0.08" style={{ right: 0, top: "-16%" }}><div className="mdz-flutua" style={{ animationDuration: "10s", animationDelay: "-2s" }}><div className="mdz-foto-caixa" style={{ width: 140, height: 140, borderRadius: 18 }}><img key={A.foto} className="mdz-foto-img mdz-sobe" src={`${FOTOS}/${A.foto}.webp`} alt="" width={140} height={140} loading="lazy" /></div></div></div>
        <div className="mdz-arte mdz-wide" data-par="0.10" style={{ left: "-4%", bottom: "-7%" }}><div className="mdz-flutua" style={{ animationDuration: "9s", animationDelay: "-5s" }}><span className="mdz-vidro mdz-sobe" key={`v${sit}`}>{A.logo === "loja" ? <span className="mdz-vidro-ico">{I.loja}</span> : <img src={LOGO_CANAL[A.logo]} alt="" width={22} height={22} className="mdz-vidro-logo" />}<b>{A.hora}</b>{A.vidro}</span></div></div>
        <div className="mdz-arte mdz-wide" data-par="0.10" style={{ right: "-8%", bottom: "-6%" }}><div className="mdz-flutua" style={{ animationDuration: "11s", animationDelay: "-3s" }}><div className="mdz-cartao mdz-sobe" key={`c${sit}`} style={{ width: 200 }}><div className="mdz-cartao-rot">{A.rot}</div><div className="mdz-cartao-num">{A.num}</div><span className="mdz-chip" style={{ background: tom[0], color: tom[1], marginTop: 8 }}>{A.tom === "ok" ? I.check(10) : A.tom === "warn" ? I.clock(10) : I.seta()}{A.chip}</span></div></div></div>
      </div>
    </div>
  );
}

function JanelaControle() {
  const { ref, s } = useEscala(640);
  const linhas: { hora: string; quem: ReactNode; oque: ReactNode; fim: ReactNode; riscado?: boolean }[] = [
    { hora: "23:41", quem: <span className="mdz-disco20">D</span>, oque: <><b>Duda</b> marcou quinta, 16h30</>, fim: null },
    { hora: "14:02", quem: <img src={ZE} alt="" width={20} height={20} className="mdz-face20" />, oque: <><b>Zé</b> abriu o <span className="mdz-mono">#000214</span></>, fim: <span className="mdz-desfazer">{I.desfazer}Desfazer</span> },
    { hora: "11:20", quem: <span className="mdz-disco20">L</span>, oque: <><b>Leo</b> abriu a tarefa</>, fim: <span className="mdz-chip" style={{ background: "#ebebeb", color: "#171717" }}>Desfeito</span>, riscado: true },
    { hora: "09:05", quem: <span className="mdz-disco20">B</span>, oque: <><b>Bia</b> abriu o <span className="mdz-mono">#000209</span></>, fim: <span className="mdz-desfazer">{I.desfazer}Desfazer</span> },
  ];
  return (
    <div className="mdz-janela-wrap" ref={ref} style={{ maxWidth: 640, height: Math.round(420 * s) }}>
      <div className="mdz-janela mdz-janela--bloco" style={{ width: 640, height: 420, transform: `scale(${s})` }}>
        <div className="mdz-aj-cab"><span className="mdz-cinza">Ajustes</span><span className="mdz-cinza2">›</span><b>Assistente</b><span className="mdz-aj-quem"><span className="mdz-disco20">B</span>Teto da Bia</span></div>
        <div className="mdz-aj-corpo">
          <div className="mdz-aj-tres">
            <div className="mdz-aj-card"><div className="mdz-aj-rot">Valor por ação</div><div className="mdz-aj-num">R$ 500,00</div></div>
            <div className="mdz-aj-card"><div className="mdz-aj-rot">Mensagens por dia</div><div className="mdz-aj-num">200</div></div>
            <div className="mdz-aj-card mdz-aj-card--sw"><div className="mdz-aj-rot">Sempre pedem liberação</div><div className="mdz-aj-sw">Pagar conta<span className="mdz-sw" /></div><div className="mdz-aj-sw">Contrato<span className="mdz-sw" /></div></div>
          </div>
          <div className="mdz-aj-log">
            <div className="mdz-aj-log-cab"><b>O que o time fez hoje</b><span className="mdz-cinza" style={{ fontSize: 12 }}>4 ações</span></div>
            {linhas.map((l) => (
              <div className="mdz-aj-linha" key={l.hora}><span className="mdz-aj-hora">{l.hora}</span>{l.quem}<span className={`mdz-aj-oque${l.riscado ? " riscado" : ""}`}>{l.oque}</span>{l.fim}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="mdz-artes">
        <div className="mdz-arte mdz-wide" data-par="0.14" style={{ right: "2%", top: "-12%" }}><div className="mdz-flutua" style={{ animationDuration: "10s", animationDelay: "-2s" }}><span className="mdz-vidro"><span className="mdz-vidro-ico">{I.desfazer}</span><b>11:20</b>Desfeito em 1 clique</span></div></div>
        <div className="mdz-arte mdz-wide" data-par="0.2" style={{ left: "-5%", bottom: "-8%" }}><div className="mdz-flutua" style={{ animationDuration: "9s", animationDelay: "-6s" }}><div className="mdz-cartao" style={{ width: 210 }}><div className="mdz-cartao-linha"><span className="mdz-ck-on">{I.check(10)}</span><b>Confirma antes de cada ação</b></div><div className="mdz-cartao-sub">Nível de autonomia do Leo</div></div></div></div>
      </div>
    </div>
  );
}

/* ══════════════════ a cena das 24 horas: notificações chegando dos canais, o time resolvendo ══════════════════ */
const CANAL = {
  whatsapp: { nome: "WhatsApp", cor: "#25D366", icone: svg(<path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z" />, { width: 16, height: 16, strokeWidth: 1.9 }) },
  instagram: { nome: "Instagram", cor: "#E1306C", icone: svg(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" /></>, { width: 16, height: 16, strokeWidth: 1.9 }) },
  email: { nome: "E-mail", cor: "#7DB2FF", icone: svg(<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7.5l8.5 6 8.5-6" /></>, { width: 16, height: 16, strokeWidth: 1.9 }) },
} as const;
/* como uma notificação de sistema (founder 17/09): logo + título curto numa linha, a hora pequena à direita e,
   embaixo, o que o time fez */
type Evento = { hora: string; canal: keyof typeof CANAL; onde: { lat: number; lng: number }; titulo: string; feito: string; ancora: string; venda?: number };
const NOITE: Evento[] = [
  { hora: "23:41", canal: "whatsapp", onde: { lat: -23.55, lng: -46.63 }, titulo: "Novo agendamento", feito: "Duda marcou quinta, 16h30", ancora: "esq-cima", venda: 90 },
  { hora: "00:12", canal: "instagram", onde: { lat: -8.05, lng: -34.88 }, titulo: "Novo comentário", feito: "Bia respondeu com o link da loja", ancora: "esq-baixo" },
  { hora: "00:58", canal: "email", onde: { lat: -25.43, lng: -49.27 }, titulo: "Orçamento aprovado", feito: "Leo emitiu a cobrança", ancora: "esq-baixo", venda: 1290 },
  { hora: "01:30", canal: "whatsapp", onde: { lat: -3.12, lng: -60.02 }, titulo: "Nova venda", feito: "Zé abriu o #000221 e mandou o link", ancora: "dir-meio", venda: 267 },
  { hora: "02:47", canal: "instagram", onde: { lat: -19.92, lng: -43.94 }, titulo: "Novo comentário", feito: "Bia respondeu e guardou o contato", ancora: "esq-cima" },
  { hora: "04:05", canal: "whatsapp", onde: { lat: -30.03, lng: -51.23 }, titulo: "Remarcação", feito: "Duda remarcou pra sexta, 10h", ancora: "dir-cima" },
  { hora: "05:20", canal: "email", onde: { lat: -12.97, lng: -38.51 }, titulo: "Nota fiscal", feito: "Leo enviou a NF-e", ancora: "esq-cima" },
  { hora: "06:02", canal: "whatsapp", onde: { lat: -3.72, lng: -38.54 }, titulo: "Nova reserva", feito: "Bia reservou o tênis 41", ancora: "esq-baixo", venda: 349 },
];
const RITMO24 = { entre: 3600, fica: 6200, teto: 2 };
/* onde o Zé fica, em % do mapa: no céu, à direita, acima do Nordeste */
const ZE_CEU = { x: 86, y: 18 };
const ZE_TRONO = "/mascote/ze-trono.webp";
/* os olhos MEDIDOS na arte do trono (agents-chat.tsx do produto, grade sobre o rosto em 06/09): a pálpebra é
   laranja porque os olhos ficam dentro da máscara; ela desliza de cima dentro de uma janela elíptica */
const OLHOS_TRONO = [{ x: 37.9, y: 28.8, w: 5.6, h: 7.6 }, { x: 50.4, y: 28.7, w: 8.2, h: 8.6 }];
/* o painel fictício em cima do Zé: começa no acumulado do dia e cresce com as vendas da noite */
const PAINEL_BASE = 8240;
const brl = (n: number) => "R$ " + Math.round(n).toLocaleString("pt-BR");
function useContagem(alvo: number) {
  const [v, setV] = useState(alvo);
  const de = useRef(alvo);
  useEffect(() => {
    const inicio = de.current, delta = alvo - inicio;
    if (!delta) return;
    let raf = 0; const t0 = performance.now();
    const passo = (t: number) => { const k = Math.min(1, (t - t0) / 700); const e = 1 - Math.pow(1 - k, 3); setV(inicio + delta * e); if (k < 1) raf = requestAnimationFrame(passo); else de.current = alvo; };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);
  return v;
}
function Painel({ vendas }: { vendas: number }) {
  const v = useContagem(vendas), c = v * 0.38;
  return (
    <div className="mdz-painel" aria-hidden="true">
      <div className="mdz-painel-item"><span className="mdz-painel-rot">Vendas</span><span className="mdz-painel-val">{brl(v)}</span></div>
      <div className="mdz-painel-item"><span className="mdz-painel-rot">Custos</span><span className="mdz-painel-val">{brl(c)}</span></div>
      <div className="mdz-painel-item"><span className="mdz-painel-rot">Lucro</span><span className="mdz-painel-val mdz-painel-val--ok">{brl(v - c)}</span></div>
    </div>
  );
}

function Cena24h() {
  const raiz = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number }[]>([]);
  const [ativos, setAtivos] = useState<{ id: number; i: number }[]>([]);
  const [feitos, setFeitos] = useState(0);
  const [vendas, setVendas] = useState(PAINEL_BASE);
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAtivos([{ id: 1, i: 0 }, { id: 2, i: 2 }, { id: 3, i: 5 }]);
      setFeitos(3);
      return;
    }
    let prox = 0, id = 0, timer = 0, ligado = false;
    const saidas = new Set<number>();
    const tique = () => {
      const i = prox;
      prox = (prox + 1) % NOITE.length;
      const meu = ++id;
      setAtivos((a) => [...a.slice(-(RITMO24.teto - 1)), { id: meu, i }]);
      setFeitos(i === 0 ? 1 : (n) => n + 1);
      const v = NOITE[i].venda;
      // a primeira chegada da noite reinicia o acumulado (e já soma a venda dela, se tiver)
      if (i === 0) setVendas(PAINEL_BASE + (v ?? 0)); else if (v) setVendas((n) => n + v);
      const t = window.setTimeout(() => { setAtivos((a) => a.filter((x) => x.id !== meu)); saidas.delete(t); }, RITMO24.fica);
      saidas.add(t);
    };
    const liga = () => { if (ligado) return; ligado = true; tique(); timer = window.setInterval(tique, RITMO24.entre); };
    const desliga = () => { if (!ligado) return; ligado = false; window.clearInterval(timer); };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? liga() : desliga()), { threshold: 0.3 });
    io.observe(el);
    return () => { desliga(); io.disconnect(); saidas.forEach(window.clearTimeout); };
  }, []);

  return (
    <div className="mdz-mapa-palco" ref={raiz}>
      <div className="mdz-mapa-halo" />
      <div className="mdz-mapa">
        <WorldMap arcos={ARCOS} pontos={NOITE.map((n) => n.onde)} aoProjetar={setPos} />
        {/* os fios: de cada notificação até o Zé, que fica no céu do mapa */}
        <svg className="mdz-fios" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {ativos.map(({ id, i }) => { const p = pos[i]; return p ? <line key={id} className="mdz-fio" x1={ZE_CEU.x} y1={ZE_CEU.y + 12} x2={p.x} y2={p.y} pathLength={1} vectorEffect="non-scaling-stroke" /> : null; })}
        </svg>
        <div className="mdz-ze-ceu" style={{ left: `${ZE_CEU.x}%`, top: `${ZE_CEU.y}%` }}>
          <Painel vendas={vendas} />
          <div className="mdz-ze-corpo">
            {/* o anel a cada chegada mora num elemento próprio: remontar o corpo zerava a piscada */}
            <i className="mdz-anel" key={feitos} aria-hidden="true" />
            {/* o Diretor na cadeira dele (a pose do produto, `ze-trono`), olhando pro mapa, e piscando */}
            <img src={ZE_TRONO} alt="" width={320} height={320} className="mdz-ze-ceu-face" loading="lazy" />
            {OLHOS_TRONO.map((o, k) => <span key={k} className="mdz-olho" style={{ left: `${o.x - o.w / 2}%`, top: `${o.y - o.h / 2}%`, width: `${o.w}%`, height: `${o.h}%` }}><i className="mdz-palpebra" /></span>)}
          </div>
        </div>
        {ativos.map(({ id, i }) => {
          const n = NOITE[i], p = pos[i], c = CANAL[n.canal];
          if (!p) return null;
          return (
            <div className="mdz-noti" key={id} data-ancora={n.ancora} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <img src={LOGO_CANAL[n.canal]} alt={c.nome} width={22} height={22} className="mdz-noti-logo" />
              <div className="mdz-noti-corpo">
                <div className="mdz-noti-linha"><span className="mdz-noti-t">{n.titulo}</span><span className="mdz-noti-hora">{n.hora}</span></div>
                <div className="mdz-noti-sub">{n.feito}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── o retrato: a foto parada do empreendedor, com só o Zé vivo (loop de 10 s, vai-e-volta) ──
   O vídeo toca NA HORA em que a foto entra na tela (founder 17/09): um observador reinicia do
   zero e dá play ao entrar, e pausa ao sair. O `muted` vai escrito no HTML (o React não grava
   esse atributo no servidor, e sem ele o navegador segura o autoplay); se o play for recusado
   mesmo assim, tenta de novo no primeiro gesto da pessoa e quando a aba volta a ficar visível. */
function RetratoVivo() {
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = caixa.current;
    const v = el?.querySelector("video");
    if (!el || !v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dentro = false;
    const toca = () => {
      if (!dentro || document.hidden) return;
      v.muted = true;
      v.play().catch(() => {
        const denovo = () => { toca(); };
        window.addEventListener("pointerdown", denovo, { once: true, passive: true });
        window.addEventListener("touchstart", denovo, { once: true, passive: true });
        window.addEventListener("keydown", denovo, { once: true });
      });
    };
    const io = new IntersectionObserver(([en]) => {
      dentro = en.isIntersecting;
      if (dentro) { try { v.currentTime = 0; } catch {} toca(); }
      else v.pause();
    }, { threshold: 0.2 });
    io.observe(el);
    const visivel = () => { if (!document.hidden) toca(); };
    document.addEventListener("visibilitychange", visivel);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", visivel); v.pause(); };
  }, []);
  return (
    <div className="mdz-retrato" ref={caixa}>
      <img className="mdz-retrato-poster" src={`${FOTOS}/ze-empreendedor.jpg`} alt="Empreendedor selando uma caixa, com o Zé ao lado olhando o trabalho" width={960} height={960} loading="lazy" />
      <div
        className="mdz-retrato-video"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: `<video muted playsinline loop preload="auto" poster="${FOTOS}/ze-empreendedor.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"><source src="${FOTOS}/ze-empreendedor.webm" type="video/webm"><source src="${FOTOS}/ze-empreendedor.mp4" type="video/mp4"></video>`,
        }}
      />
    </div>
  );
}

/* ── os arcos do mapa: mensagens chegando de todo canto do país ── */
const ARCOS = [
  { de: { lat: -3.12, lng: -60.02 }, para: { lat: -23.55, lng: -46.63 } }, // Manaus → São Paulo
  { de: { lat: -8.05, lng: -34.88 }, para: { lat: -19.92, lng: -43.94 } }, // Recife → Belo Horizonte
  { de: { lat: -30.03, lng: -51.23 }, para: { lat: -15.79, lng: -47.88 } }, // Porto Alegre → Brasília
  { de: { lat: -3.72, lng: -38.54 }, para: { lat: -22.91, lng: -43.17 } }, // Fortaleza → Rio de Janeiro
  { de: { lat: -12.97, lng: -38.51 }, para: { lat: -25.43, lng: -49.27 } }, // Salvador → Curitiba
];

export function MundoDoZe() {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    // 1. cada tela acende uma vez ao entrar (o texto sobe 28px e aparece)
    const secs = Array.from(el.querySelectorAll<HTMLElement>("[data-mdz-sec]"));
    const io = new IntersectionObserver((es) => { for (const en of es) { if (!en.isIntersecting) continue; (en.target as HTMLElement).dataset.on = "1"; io.unobserve(en.target); } }, { threshold: 0.15 });
    secs.forEach((s) => io.observe(s));
    // 2. parallax leve nos artefatos, pelo centro da tela em que estão
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const artes = Array.from(el.querySelectorAll<HTMLElement>("[data-par]"));
    let raf = 0;
    const mede = () => {
      raf = 0;
      const vh = window.innerHeight;
      const cache = new Map<Element, DOMRect>();
      for (const a of artes) {
        const sec = a.closest("[data-mdz-sec]");
        if (!sec) continue;
        let r = cache.get(sec);
        if (!r) { r = sec.getBoundingClientRect(); cache.set(sec, r); }
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const c = r.top + r.height / 2 - vh / 2;
        const k = parseFloat(a.dataset.par || "0") || 0;
        a.style.transform = `translate3d(0, ${(-c * k).toFixed(1)}px, 0)`;
      }
    };
    const pede = () => { if (!raf) raf = requestAnimationFrame(mede); };
    if (!parado) { window.addEventListener("scroll", pede, { passive: true }); window.addEventListener("resize", pede); mede(); }
    return () => { io.disconnect(); window.removeEventListener("scroll", pede); window.removeEventListener("resize", pede); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="mdz" ref={raiz}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <AuroraBackground asLayer className="mdz-aurora" starCount={70} pulseDuration={12} ariaLabel="" />
      {/* as partículas do mouse, só nesta parte: uma camada grudada na janela enquanto a seção passa */}
      <div className="mdz-particulas" aria-hidden="true"><div className="mdz-particulas-fixa"><ParticleCanvas particulas={160} /></div></div>

      <header className="mdz-cabeca">
        <h2 className="mdz-titulo">Você pede. <em>O Zé faz.</em></h2>
        <p className="mdz-sub">O Zé é a IA do VOS: entende o que você pede em português e executa dentro do sistema. E ainda contrata um agente pra cada função do seu time, trabalhando 24 horas por dia.</p>
      </header>

      {/* 1 · Executa */}
      <section className="mdz-sec" data-mdz-sec>
        <div className="mdz-wrap">
          <div className="mdz-texto mdz-rev">
            <h2 className="mdz-h2 mdz-h2--duas">Digite o que precisa.<br />Ele executa.</h2>
            <div className="mdz-stats">
              <div className="mdz-stat"><div className="mdz-eyebrow2">{I.clock()}Sempre acordado</div><div className="mdz-num">24h</div></div>
              <div className="mdz-stat"><div className="mdz-eyebrow2">{I.lista}Passo a passo</div><div className="mdz-num">4 passos</div></div>
            </div>
            <p className="mdz-p mdz-p--barra">Abrir um pedido, marcar horário, mandar o link de pagamento. Você escreve como fala com alguém do time, e o Zé faz dentro do VOS, mostrando cada passo.</p>
            <div className="mdz-cta"><GetStartedButton label="Começar grátis" variant="white" /></div>
          </div>
          <div className="mdz-palco"><JanelaExecuta /></div>
        </div>
      </section>

      {/* 2 · Enquanto você dorme */}
      <section className="mdz-sec mdz-sec--mapa" data-mdz-sec>
        <div className="mdz-wrap mdz-wrap--inv">
          <div className="mdz-texto mdz-texto--inv mdz-rev">
            <h2 className="mdz-h2">Sua empresa não precisa esperar você acordar.</h2>
            <p className="mdz-p">No VOS, você cria em poucos cliques agentes especializados para cada função, treinados com o conhecimento do seu negócio.</p>
            {/* os números de prova (founder 17/09). O de horas é EXEMPLO até ele mandar o real. */}
            <div className="mdz-itens mdz-itens--prova">
              <div className="mdz-item"><div className="mdz-item-t">+10 mil agentes</div><div className="mdz-item-s">Já criados no VOS</div></div>
              <div className="mdz-item"><div className="mdz-item-t">+R$ 200 milhões</div><div className="mdz-item-s">Vendidos pelos agentes</div></div>
              <div className="mdz-item"><div className="mdz-item-t">+38 mil orçamentos</div><div className="mdz-item-s">Enviados pelo Zé</div></div>
              <div className="mdz-item"><div className="mdz-item-t">+120 mil horas</div><div className="mdz-item-s">Devolvidas ao dono, com o Zé atendendo</div></div>
            </div>
          </div>
          <div className="mdz-palco mdz-palco--inv"><Cena24h /></div>
        </div>
      </section>

      {/* 3 · Agentes */}
      <section className="mdz-sec" data-mdz-sec>
        <div className="mdz-wrap mdz-wrap--inv" style={{ gap: "48px 0" }}>
          <div className="mdz-texto mdz-texto--inv mdz-rev" style={{ paddingLeft: "clamp(0px, 4vw, 72px)" }}>
            <h2 className="mdz-h2">Um agente pra cada função.</h2>
            <p className="mdz-p">A Bia vende, a Duda atende, o Téo faz os orçamentos. Você cria cada um conversando com o Zé: nome, cara, cargo e só os poderes que você liberar.</p>
            <div className="mdz-itens">
              <div className="mdz-item"><div className="mdz-item-t">Bia · Vendas</div><div className="mdz-item-s">Vende no WhatsApp e no Instagram</div></div>
              <div className="mdz-item"><div className="mdz-item-t">Duda · Atendimento</div><div className="mdz-item-s">Atende e agenda a qualquer hora</div></div>
              <div className="mdz-item"><div className="mdz-item-t">Téo · Orçamentos<span className="mdz-novo">Novo</span></div><div className="mdz-item-s">Cuida dos orçamentos e manda contrato pra assinar</div></div>
              {/* o quarto não é um agente pronto, é a AÇÃO de criar: tracejado com o disco "+", como o "Criar cargo" do produto */}
              <div className="mdz-item mdz-item--criar"><span className="mdz-item-mais">{I.mais}</span><div><div className="mdz-item-t">Criar um agente</div><div className="mdz-item-s">Crie seu agente em 2 minutos</div></div></div>
            </div>
          </div>
          <div className="mdz-palco mdz-palco--inv">
            <div className="mdz-retrato-palco">
              <RetratoVivo />
              <div className="mdz-citacao" data-par="0.08">
                <div className="mdz-citacao-t">“Quero alguém pra cuidar dos orçamentos.”</div>
                <div className="mdz-citacao-ze"><img src={ZE} alt="" width={28} height={28} className="mdz-face28" /><div>Criei o Téo. Ele cuida de orçamentos, manda mensagem no WhatsApp e contrato pra assinar. Abrir pedido e mexer no financeiro ficam trancados até você liberar.</div></div>
                <div className="mdz-citacao-pe"><img className="mdz-citacao-face" src={TEO} alt="" width={36} height={36} /><b>Téo</b><span className="mdz-novo">Novo</span><span className="mdz-citacao-meta">Orçamentos · 3 de 5 poderes</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · Controle: SAIU DO AR em 17/09 (founder: "remove essa parte"). Fica aqui, não apagado, até o veredito.
            <section className="mdz-sec" data-mdz-sec>
        <div className="mdz-wrap" style={{ gap: "48px 0" }}>
          <div className="mdz-texto mdz-rev" style={{ paddingRight: "clamp(0px, 4vw, 72px)" }}>
            <h2 className="mdz-h2">Com teto, registro e desfazer.</h2>
            <p className="mdz-p">Você decide até onde cada agente vai sozinho: valor por ação, mensagens por dia, o que precisa de confirmação. Tudo fica registrado, e desfazer é um clique.</p>
          </div>
          <div className="mdz-palco"><JanelaControle /></div>
        </div>
      </section>

      */}
      {/* 5 · Fecho */}
      <section className="mdz-sec mdz-fecho" data-mdz-sec>
        <div className="mdz-fecho-miolo mdz-rev">
          <h2 className="mdz-fecho-t">O escritório que <span>nunca fecha.</span></h2>
          <p className="mdz-p mdz-p--centro">Enquanto você vive a sua vida, o time do Zé segue atendendo, vendendo e cobrando.</p>
          <div className="mdz-cta mdz-cta--centro"><GetStartedButton label="Começar grátis" variant="white" /></div>
        </div>
      </section>

    </div>
  );
}

const CSS = `
  .mdz {
    --ai: var(--zx-ai); --ai-ink: var(--zx-ai-ink); --ease: cubic-bezier(0.22, 1, 0.36, 1);
    --t2: rgba(255, 255, 255, 0.7); --t3: rgba(255, 255, 255, 0.5);
    position: relative; overflow-x: clip; color: #fff; font-family: var(--zx-body); -webkit-font-smoothing: antialiased; text-wrap: pretty; overflow-wrap: normal;
    /* começa na cor em que o mergulho termina (#05030D): sem faixa mais escura na emenda (founder 17/09) */
    background: linear-gradient(180deg, #05030D 0%, #0B0620 8%, #130A30 34%, #0B0620 70%, #05030D 100%);
  }
  .mdz-aurora { z-index: 0; }
  .mdz-particulas { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  .mdz-particulas-fixa { position: sticky; top: 0; height: 100vh; height: 100svh; opacity: 0.85; mix-blend-mode: screen; }
  .mdz > .mdz-cabeca, .mdz > .mdz-sec { position: relative; z-index: 1; }

  /* cabeça */
  .mdz-cabeca { padding: clamp(72px, 9vw, 136px) 24px clamp(24px, 3vw, 40px); text-align: center; }
  .mdz-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-family: var(--zx-mono); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ai-ink); }
  .mdz-eyebrow img { width: 28px; height: 28px; border-radius: 50%; }
  .mdz-titulo { margin: 22px 0 18px; font-family: var(--zx-display); font-weight: 300; font-size: clamp(44px, 5.2vw, 76px); line-height: 1.0; letter-spacing: -0.035em; color: #fff; text-wrap: balance; }
  .mdz-titulo em { font-style: normal; font-weight: 300; color: var(--ai-ink); }
  .mdz-sub { margin: 0 auto; max-width: 620px; font-size: clamp(17px, 1.3vw, 19px); line-height: 1.55; color: var(--t2); }

  /* telas */
  .mdz-sec { padding: clamp(48px, 6vw, 96px) 0 clamp(96px, 10vw, 160px); }
  /* o palco do mapa já sobra embaixo (a silhueta termina antes do quadrado): o bloco cede padding pra o vão
     até o próximo ficar igual ao dos blocos 1 e 2 (founder 17/09) */
  .mdz-sec--mapa { padding-bottom: clamp(24px, 3vw, 48px); }
  .mdz-wrap { max-width: 1280px; margin: 0 auto; padding: 0 clamp(24px, 4vw, 56px); display: flex; flex-wrap: wrap; align-items: center; gap: 40px 0; }
  .mdz-wrap--inv { flex-direction: row-reverse; }
  .mdz-texto { flex: 5 1 380px; min-width: 0; padding-right: clamp(0px, 3vw, 48px); }
  .mdz-texto--inv { padding-right: 0; padding-left: clamp(0px, 3vw, 48px); }
  .mdz-palco { flex: 7 1 520px; min-width: 0; position: relative; display: flex; justify-content: flex-end; }
  .mdz-palco--inv { justify-content: flex-start; }
  .mdz-rev { opacity: 0; transform: translateY(28px); transition: opacity 0.9s var(--ease), transform 0.9s var(--ease); }
  [data-on] .mdz-rev { opacity: 1; transform: none; }
  .mdz-h2 { margin: 0; font-family: var(--zx-display); font-weight: 300; font-size: clamp(36px, 3.6vw, 54px); line-height: 1.04; letter-spacing: -0.03em; color: #fff; text-wrap: balance; }
  /* duas linhas, uma frase em cada, sem quebrar no meio (founder 17/09) */
  .mdz-h2--duas { font-size: clamp(30px, 3vw, 44px); white-space: nowrap; text-wrap: initial; }
  .mdz-p { margin: 24px 0 0; max-width: 480px; font-size: clamp(17px, 1.3vw, 19px); line-height: 1.55; color: var(--t2); }
  .mdz-p--barra { margin: clamp(20px, 2vw, 28px) 0 0; padding-left: 20px; border-left: 1.5px solid var(--ai-ink); max-width: 520px; color: rgba(255, 255, 255, 0.75); line-height: 1.5; }
  .mdz-p--centro { margin-left: auto; margin-right: auto; max-width: 560px; }
  .mdz-cta { margin-top: 22px; }
  .mdz-cta--centro { margin-top: 36px; display: flex; justify-content: center; }
  .mdz-stats { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: 24px 28px; margin-top: clamp(20px, 2.2vw, 30px); }
  .mdz-stat { border-top: 1px solid rgba(255, 255, 255, 0.14); padding-top: 18px; }
  .mdz-eyebrow2 { display: flex; align-items: center; gap: 10px; font-family: var(--zx-mono); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ai-ink); }
  .mdz-num { margin-top: 14px; font-family: var(--zx-display); font-weight: 300; font-size: clamp(44px, 3.9vw, 64px); line-height: 0.95; letter-spacing: -0.04em; color: #fff; white-space: nowrap; }
  .mdz-itens { display: flex; flex-direction: column; gap: 26px; margin-top: clamp(36px, 4vw, 56px); }
  .mdz-item { border-left: 1.5px solid var(--ai-ink); padding-left: 22px; }
  .mdz-item-t { font-family: var(--zx-display); font-weight: 400; font-size: clamp(24px, 2vw, 30px); letter-spacing: -0.02em; line-height: 1.15; color: #fff; }
  .mdz-item-s { margin-top: 6px; font-size: 17px; line-height: 1.5; color: rgba(255, 255, 255, 0.62); }
  /* os números de prova, mais compactos (founder 17/09: "nada gigante e desproporcional"): a coluna fica mais
     baixa que o mapa e centraliza entre ele */
  .mdz-itens--prova { gap: 16px; margin-top: 28px; }
  .mdz-itens--prova .mdz-item { padding-left: 18px; }
  .mdz-itens--prova .mdz-item-t { font-size: clamp(20px, 1.7vw, 24px); }
  .mdz-itens--prova .mdz-item-s { margin-top: 3px; font-size: 14.5px; line-height: 1.4; }
  /* a AÇÃO de criar: régua tracejada, disco "+" e título no violeta do Zé (os de cima são agentes prontos) */
  .mdz-item--criar { display: flex; align-items: center; gap: 16px; border-left: 1.5px dashed rgba(168, 153, 255, 0.55); }
  .mdz-item--criar .mdz-item-t { color: var(--ai-ink); }
  .mdz-item-mais { width: 40px; height: 40px; flex: none; border-radius: 50%; border: 1.5px dashed rgba(168, 153, 255, 0.7); background: rgba(109, 74, 255, 0.12); color: var(--ai-ink); display: inline-flex; align-items: center; justify-content: center; }
  .mdz-item-mais svg { width: 18px; height: 18px; }

  /* janelas de tamanho fixo, reduzidas por escala */
  .mdz-janela-wrap { position: relative; width: 100%; }
  .mdz-janela { position: relative; transform-origin: top left; display: flex; overflow: hidden; background: #fff; color: #171717; border-radius: 14px; box-shadow: 0 60px 120px -40px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.06); font-size: 13px; line-height: 18px; letter-spacing: -0.005em; }
  .mdz-janela--bloco { display: block; }
  .mdz-mono { font-family: var(--zx-mono); font-size: 11.5px; color: #5f5f5f; }
  .mdz-cinza { color: #5f5f5f; }
  .mdz-cinza2 { color: #8f8f8f; }
  .mdz-face20, .mdz-face22, .mdz-face24, .mdz-face28 { display: block; border-radius: 50%; flex: none; }
  .mdz-disco20, .mdz-disco22 { border-radius: 50%; background: #EBEBEB; color: #171717; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; flex: none; }
  .mdz-disco20 { width: 20px; height: 20px; font-size: 9px; }
  .mdz-disco22 { width: 22px; height: 22px; font-size: 10px; }
  .mdz-chip { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 6px; font-size: 11.5px; font-weight: 500; line-height: 1; white-space: nowrap; }
  .mdz-lat { width: 196px; flex: none; background: #fdfdfd; border-right: 1px solid #ececec; padding: 14px 10px; display: flex; flex-direction: column; gap: 2px; }
  .mdz-lat-marca { display: flex; align-items: center; gap: 8px; padding: 2px 8px 12px; font-weight: 600; letter-spacing: -0.02em; }
  .mdz-lat-logo { display: block; height: 18px; width: auto; }
  .mdz-lat-rot { font-size: 11px; color: #8f8f8f; padding: 0 8px 6px; letter-spacing: 0.02em; }
  .mdz-lat-item { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 8px; border-radius: 8px; }
  .mdz-lat-item.pick { background: #f4f4f4; }
  .mdz-lat-item > div { min-width: 0; flex: 1; }
  .mdz-lat-nome { font-weight: 500; line-height: 14px; }
  .mdz-lat-cargo { font-size: 11px; color: #5f5f5f; line-height: 13px; }
  .mdz-ponto-ok { width: 6px; height: 6px; border-radius: 50%; background: #15935A; flex: none; }
  .mdz-lat-pe { margin-top: auto; font-size: 11px; color: #8f8f8f; padding: 0 8px; }

  /* a demo */
  .mdz-d1 { flex: 1; min-width: 0; position: relative; }
  .mdz-d1-cab { height: 44px; display: flex; align-items: center; gap: 8px; padding: 0 18px; border-bottom: 1px solid #ececec; }
  .mdz-d1-chat { position: absolute; left: 0; right: 0; top: 44px; bottom: 112px; overflow: hidden; padding: 18px; transition: opacity 0.25s; }
  .mdz-d1-eu { display: flex; justify-content: flex-end; align-items: flex-end; gap: 8px; }
  .mdz-d1-balao-eu { background: #171717; color: #fff; border-radius: 14px 14px 4px 14px; padding: 7px 11px; max-width: 380px; }
  .mdz-d1-v { width: 24px; height: 24px; border-radius: 50%; background: #171717; color: #fff; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; flex: none; }
  .mdz-d1-ze { display: flex; align-items: flex-start; gap: 8px; margin-top: 14px; }
  .mdz-d1-ze .mdz-face24 { margin-top: 1px; }
  .mdz-d1-corpo { min-width: 0; flex: 1; }
  .mdz-d1-passos { display: flex; flex-direction: column; gap: 2px; padding-top: 3px; }
  .mdz-d1-passo { display: flex; align-items: center; gap: 8px; height: 24px; }
  .mdz-d1-ico { width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center; flex: none; color: #014b40; }
  .mdz-d1-ico.espera { color: #412d00; }
  .mdz-d1-rot { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mdz-spin { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid rgba(109, 74, 255, 0.25); border-top-color: var(--ai); display: inline-block; box-sizing: border-box; animation: mdz-gira 0.8s linear infinite; }
  .mdz-d1-colapso { display: flex; align-items: center; gap: 8px; height: 24px; padding-top: 3px; color: #5f5f5f; }
  .mdz-d1-resp { display: inline-block; background: #F4F4F4; border-radius: 4px 14px 14px 14px; padding: 7px 11px; max-width: 380px; margin-top: 10px; white-space: pre-wrap; }
  .mdz-d1-card { margin-top: 10px; border: 1px solid #ececec; border-radius: 12px; padding: 10px 12px; max-width: 380px; box-shadow: 0 1px 2px rgba(23, 23, 23, 0.05); }
  .mdz-d1-card-cab { display: flex; align-items: center; gap: 8px; }
  .mdz-d1-card-cab .mdz-chip { margin-left: auto; }
  .mdz-d1-card-corpo { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
  .mdz-d1-foto { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex: none; background: #f4f4f4; }
  .mdz-d1-card-linhas { min-width: 0; flex: 1; }
  .mdz-d1-l1 { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mdz-d1-l2 { color: #5f5f5f; font-size: 12px; line-height: 16px; }
  .mdz-d1-valor { font-weight: 600; white-space: nowrap; }
  .mdz-d1-acao { height: 30px; padding: 0 12px; border: 1px solid #d8d8d8; border-radius: 8px; background: #fff; font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; white-space: nowrap; }
  .mdz-d1-compositor { position: absolute; left: 18px; right: 18px; bottom: 18px; height: 84px; border: 1px solid #ececec; border-radius: 12px; background: #fff; box-shadow: 0 1px 2px rgba(23, 23, 23, 0.05); }
  .mdz-d1-texto { padding: 10px 14px 0; height: 46px; overflow: hidden; color: #171717; white-space: pre-wrap; }
  .mdz-cursor { display: inline-block; width: 1.5px; height: 14px; background: #171717; vertical-align: -2px; margin-left: 1px; animation: mdz-pisca 1s steps(2) infinite; }
  .mdz-d1-barra { position: absolute; left: 10px; right: 10px; bottom: 8px; display: flex; align-items: center; gap: 2px; }
  .mdz-d1-btn { width: 26px; height: 26px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; color: #5f5f5f; }
  .mdz-d1-enviar { margin-left: auto; width: 28px; height: 28px; border-radius: 8px; color: #fff; display: inline-flex; align-items: center; justify-content: center; transition: background 0.2s; }
  .mdz-sobe { animation: mdz-sobe 0.35s var(--ease) both; }
  @keyframes mdz-sobe { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes mdz-gira { to { transform: rotate(360deg); } }
  @keyframes mdz-pisca { 50% { opacity: 0; } }

  /* artefatos em volta das janelas */
  .mdz-artes { position: absolute; inset: 0; pointer-events: none; }
  .mdz-arte { position: absolute; pointer-events: none; }
  .mdz-flutua { animation: mdz-flutua 10s ease-in-out infinite alternate; }
  @keyframes mdz-flutua { from { transform: translateY(-7px); } to { transform: translateY(9px); } }
  .mdz-foto-caixa { background: #fff; overflow: hidden; box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.9); }
  .mdz-foto-img { display: block; width: 100%; height: 100%; object-fit: cover; }
  /* o vidro tem que APARECER (founder 17/09): fundo escuro fechado, texto branco, fio e hora no violeta */
  /* mini notificação (founder 17/09: como as do mapa): logo oficial do canal, hora em mono, frase em caixa de frase */
  .mdz-vidro { display: inline-flex; align-items: center; gap: 9px; padding: 8px 14px 8px 9px; border-radius: 12px; background: rgba(12, 7, 34, 0.86); border: 1px solid rgba(168, 153, 255, 0.3); box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.07); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); font-size: 12.5px; font-weight: 500; color: #fff; white-space: nowrap; }
  .mdz-vidro b { font-family: var(--zx-mono); font-size: 11px; font-weight: 500; color: var(--ai-ink); letter-spacing: 0.02em; }
  .mdz-vidro-logo { width: 22px; height: 22px; display: block; flex: none; }
  .mdz-vidro-ico { width: 22px; height: 22px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; flex: none; background: rgba(168, 153, 255, 0.16); color: var(--ai-ink); }
  .mdz-ponto-luz { width: 6px; height: 6px; border-radius: 50%; background: var(--ai-ink); box-shadow: 0 0 12px var(--ai-ink); }
  .mdz-cartao { background: #fff; color: #171717; border-radius: 14px; box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.9); padding: 12px 14px; font-size: 12.5px; line-height: 17px; }
  .mdz-cartao-rot { font-size: 11px; color: #5f5f5f; }
  .mdz-cartao-num { margin-top: 4px; font-family: var(--zx-display); font-weight: 500; font-size: 24px; letter-spacing: -0.02em; line-height: 1.1; }
  .mdz-cartao-linha { display: flex; align-items: center; gap: 8px; }
  .mdz-cartao-linha b { font-weight: 500; }
  .mdz-cartao-sub { color: #5f5f5f; margin-top: 6px; padding-left: 24px; }
  .mdz-ck-on { width: 16px; height: 16px; border-radius: 4px; background: var(--zx-lar); color: #fff; display: inline-flex; align-items: center; justify-content: center; flex: none; }

  /* placeholder de imagem */
  .mdz-slot { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 12px; text-align: center; border-radius: inherit; background: #160C3A; border: 1.5px dashed rgba(168, 153, 255, 0.45); color: var(--ai-ink); font-size: 12px; line-height: 1.35; box-sizing: border-box; }
  .mdz-slot-ico { opacity: 0.8; }

  /* o mapa */
  .mdz-mapa-palco { position: relative; width: 100%; max-width: 720px; aspect-ratio: 1; margin-left: clamp(-40px, -3vw, 0px); }
  .mdz-mapa-halo { position: absolute; inset: 6%; border-radius: 50%; background: radial-gradient(circle at 40% 35%, rgba(109, 74, 255, 0.28) 0%, rgba(59, 42, 140, 0.16) 45%, rgba(10, 6, 32, 0) 72%); filter: blur(10px); }
  .mdz-mapa { position: absolute; left: 4%; right: 4%; top: 50%; transform: translateY(-50%); }
  /* as notificações da noite (founder 17/09: "algo mais suave, que desaparece no ar"): um brinde leve com
     a logo oficial do canal, uma linha do que aconteceu e outra do que o time fez; sobe devagar e some */
  .mdz-noti { position: absolute; width: max-content; max-width: min(300px, 72vw); display: flex; gap: 9px; align-items: center; padding: 8px 12px 9px 9px; border-radius: 12px; background: rgba(12, 7, 34, 0.55); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); color: #fff; font-size: 12px; line-height: 1.35; z-index: 2; animation: mdz-brinde 6.2s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .mdz-noti[data-ancora="dir-meio"] { --dx: 14px; --dy: -50%; }
  .mdz-noti[data-ancora="dir-cima"] { --dx: 14px; --dy: calc(-100% - 6px); }
  .mdz-noti[data-ancora="dir-baixo"] { --dx: 14px; --dy: 6px; }
  .mdz-noti[data-ancora="esq-meio"] { --dx: calc(-100% - 14px); --dy: -50%; }
  .mdz-noti[data-ancora="esq-cima"] { --dx: calc(-100% - 14px); --dy: calc(-100% - 6px); }
  .mdz-noti[data-ancora="esq-baixo"] { --dx: calc(-100% - 14px); --dy: 6px; }
  @keyframes mdz-brinde {
    0% { opacity: 0; transform: translate(var(--dx), var(--dy)) translateY(8px); }
    10% { opacity: 1; transform: translate(var(--dx), var(--dy)) translateY(0); }
    72% { opacity: 1; transform: translate(var(--dx), var(--dy)) translateY(-8px); }
    100% { opacity: 0; transform: translate(var(--dx), var(--dy)) translateY(-22px); }
  }
  .mdz-noti-logo { width: 22px; height: 22px; display: block; flex: none; }
  .mdz-noti-corpo { min-width: 0; }
  .mdz-noti-linha { display: flex; align-items: baseline; gap: 14px; }
  .mdz-noti-t { font-weight: 600; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mdz-noti-hora { margin-left: auto; flex: none; font-family: var(--zx-mono); font-size: 10.5px; color: rgba(255, 255, 255, 0.55); }
  .mdz-noti-sub { margin-top: 1px; font-size: 11.5px; color: rgba(255, 255, 255, 0.72); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* o Zé no céu do mapa (founder 17/09, "a visão do Zé de cima"): sem caixa, com halo; a cada
     notificação um anel sai dele e um fio se desenha até o card */
  .mdz-fios { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 1; }
  .mdz-fio { fill: none; stroke: rgba(168, 153, 255, 0.55); stroke-width: 1; stroke-dasharray: 1; stroke-dashoffset: 1; animation: mdz-fio 6.2s cubic-bezier(0.22, 1, 0.36, 1) both; }
  @keyframes mdz-fio { 0% { stroke-dashoffset: 1; opacity: 0; } 4% { opacity: 1; } 16% { stroke-dashoffset: 0; opacity: 1; } 72% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
  .mdz-ze-ceu { position: absolute; z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 6px; transform: translate(-50%, -50%); pointer-events: none; }
  .mdz-ze-corpo { position: relative; width: 160px; height: 160px; animation: mdz-ze-flutua 6s ease-in-out infinite alternate; }
  .mdz-ze-corpo::before { content: ""; position: absolute; left: 50%; top: 50%; width: 280px; height: 220px; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(closest-side, rgba(109, 74, 255, 0.36), rgba(109, 74, 255, 0)); z-index: -1; }
  .mdz-anel { position: absolute; left: 50%; top: 50%; width: 110px; height: 110px; border-radius: 50%; border: 1.5px solid rgba(168, 153, 255, 0.8); transform: translate(-50%, -50%); animation: mdz-anel 1.5s ease-out both; pointer-events: none; }
  .mdz-ze-ceu-face { width: 100%; height: 100%; display: block; filter: drop-shadow(0 18px 28px rgba(5, 3, 13, 0.7)) drop-shadow(0 0 22px rgba(109, 74, 255, 0.45)); }
  /* a piscada do produto: janela elíptica com overflow escondido, pálpebra laranja que desliza de cima */
  .mdz-olho { position: absolute; overflow: hidden; border-radius: 50%; }
  .mdz-palpebra { position: absolute; inset: 0; display: block; background: linear-gradient(#FF8A3D, #F0621A 78%, #D94E12); border-bottom: 2px solid rgba(150, 50, 10, 0.55); border-radius: 0 0 50% 50% / 0 0 46% 46%; transform: translateY(-103%); animation: mdz-pisca-ze 5.4s ease-in-out infinite; }
  @keyframes mdz-pisca-ze { 0%, 90%, 100% { transform: translateY(-103%); } 92.5%, 95.5% { transform: translateY(0); } 94% { transform: translateY(-85%); } 97%, 98.5% { transform: translateY(0); } }
  /* o painel fictício em cima do Zé: três números que crescem com as vendas da noite */
  .mdz-painel { display: flex; gap: 2px; padding: 3px; border-radius: 12px; background: rgba(12, 7, 34, 0.62); border: 1px solid rgba(255, 255, 255, 0.09); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.9); }
  .mdz-painel-item { display: flex; flex-direction: column; gap: 1px; padding: 6px 12px; border-radius: 9px; min-width: 86px; }
  .mdz-painel-item + .mdz-painel-item { border-left: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0; }
  .mdz-painel-rot { font-family: var(--zx-mono); font-size: 10px; letter-spacing: 0.04em; color: rgba(255, 255, 255, 0.55); }
  .mdz-painel-val { font-family: var(--zx-display); font-weight: 500; font-size: 15px; letter-spacing: -0.02em; color: #fff; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .mdz-painel-val--ok { color: #7EF0A6; }
  @keyframes mdz-anel { from { transform: translate(-50%, -50%) scale(1); opacity: 0.9; } to { transform: translate(-50%, -50%) scale(2.6); opacity: 0; } }
  @keyframes mdz-ze-flutua { from { transform: translateY(-3px); } to { transform: translateY(4px); } }
  @media (prefers-reduced-motion: reduce) { .mdz-palpebra, .mdz-ze-corpo, .mdz-anel, .mdz-fio { animation: none; } }

  /* o retrato e a citação */
  .mdz-retrato-palco { position: relative; width: 100%; max-width: 760px; min-height: 720px; }
  .mdz-retrato { position: absolute; left: 0; top: 0; width: min(76%, 560px); aspect-ratio: 1; border-radius: 14px; overflow: hidden; background: #160C3A; box-shadow: 0 40px 100px -40px rgba(0, 0, 0, 0.9); isolation: isolate; z-index: 1; }
  .mdz-retrato-poster, .mdz-retrato-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .mdz-retrato-video { z-index: 1; }
  .mdz-citacao { position: absolute; z-index: 2; left: min(30%, 220px); right: 0; top: calc(62% - 56px); padding: clamp(24px, 3vw, 40px); border-radius: 14px; background: rgba(18, 10, 48, 0.72); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: 0 40px 100px -40px rgba(0, 0, 0, 0.9); }
  .mdz-citacao-t { font-family: var(--zx-display); font-weight: 300; font-size: clamp(24px, 2.5vw, 36px); line-height: 1.15; letter-spacing: -0.025em; color: #fff; text-wrap: balance; }
  .mdz-citacao-ze { display: flex; gap: 12px; align-items: flex-start; margin-top: 26px; font-size: 15.5px; line-height: 1.5; color: rgba(255, 255, 255, 0.8); }
  .mdz-citacao-ze .mdz-face28 { margin-top: 1px; }
  .mdz-citacao-pe { display: flex; align-items: center; gap: 10px; margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 14px; color: rgba(255, 255, 255, 0.72); }
  .mdz-citacao-pe b { color: #fff; font-weight: 600; font-size: 15px; }
  .mdz-citacao-meta { margin-left: 2px; }
  /* a cara do agente novo: anel violeta com brilho, pra ler de cara que o Téo acabou de nascer */
  .mdz-citacao-face { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 0 0 2px #14092E, 0 0 0 4px var(--ai), 0 0 18px rgba(109, 74, 255, 0.55); }
  .mdz-item-t .mdz-novo { margin-left: 10px; vertical-align: middle; }
  /* o selo "Novo": chip de raio 6 (a forma do produto), no violeta do Zé */
  .mdz-novo { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 6px; background: rgba(109, 74, 255, 0.2); border: 1px solid rgba(168, 153, 255, 0.4); color: var(--ai-ink); font-family: var(--zx-body); font-size: 11.5px; font-weight: 600; letter-spacing: 0; text-transform: none; white-space: nowrap; }

  /* a janela de ajustes */
  .mdz-aj-cab { height: 44px; display: flex; align-items: center; gap: 6px; padding: 0 20px; border-bottom: 1px solid #ececec; }
  .mdz-aj-quem { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; color: #5f5f5f; font-size: 12px; }
  .mdz-aj-corpo { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 14px; }
  .mdz-aj-tres { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .mdz-aj-card { border: 1px solid #ececec; border-radius: 12px; padding: 10px 12px; }
  .mdz-aj-card--sw { display: flex; flex-direction: column; gap: 6px; }
  .mdz-aj-rot { font-size: 11.5px; color: #5f5f5f; }
  .mdz-aj-num { margin-top: 4px; font-family: var(--zx-display); font-weight: 500; font-size: 20px; letter-spacing: -0.02em; }
  .mdz-aj-sw { display: flex; align-items: center; justify-content: space-between; font-size: 12px; }
  .mdz-sw { width: 28px; height: 16px; border-radius: 8px; background: var(--zx-lar); position: relative; flex: none; }
  .mdz-sw::after { content: ""; position: absolute; top: 2px; left: 14px; width: 12px; height: 12px; border-radius: 50%; background: #fff; }
  .mdz-aj-log { border: 1px solid #ececec; border-radius: 12px; padding: 10px 12px 4px; box-shadow: 0 1px 2px rgba(23, 23, 23, 0.04); }
  .mdz-aj-log-cab { display: flex; align-items: center; justify-content: space-between; height: 24px; margin-bottom: 4px; }
  .mdz-aj-linha { display: flex; align-items: center; gap: 10px; height: 38px; border-top: 1px solid #ececec; }
  .mdz-aj-hora { width: 40px; color: #5f5f5f; font-size: 12px; font-variant-numeric: tabular-nums; flex: none; }
  .mdz-aj-oque { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mdz-aj-oque b { font-weight: 500; }
  .mdz-aj-oque.riscado { color: #5f5f5f; text-decoration: line-through; }
  .mdz-desfazer { display: inline-flex; align-items: center; gap: 5px; color: #5f5f5f; font-size: 12.5px; font-weight: 500; }

  /* fecho */
  .mdz-fecho { padding: clamp(64px, 8vw, 120px) 24px clamp(96px, 11vw, 160px); text-align: center; }
  .mdz-fecho-miolo { max-width: 820px; margin: 0 auto; }
  .mdz-fecho-t { margin: 0 0 24px; font-family: var(--zx-display); font-weight: 300; font-size: clamp(44px, 6vw, 88px); line-height: 1; letter-spacing: -0.035em; color: #fff; text-wrap: balance; }
  .mdz-fecho-t span { color: var(--ai-ink); }

  /* larguras */
  @media (max-width: 900px) {
    .mdz-wide { display: none; }
    .mdz-noti { max-width: 76vw; }
    .mdz-ze-corpo { width: 84px; height: 84px; }
    .mdz-ze-corpo::before { width: 150px; height: 120px; }
    .mdz-anel { width: 64px; height: 64px; }
    .mdz-painel-item { min-width: 0; padding: 5px 9px; }
    .mdz-painel-val { font-size: 13px; }
    /* sem mouse não há o que seguir: no celular a fonte vagava sozinha por cima do texto */
    .mdz-particulas { display: none; }
    .mdz-mapa-palco { margin-left: 0; }
  }
  @media (max-width: 700px) {
    .mdz-retrato-palco { min-height: 0; }
    .mdz-retrato { position: relative; width: 100%; }
    .mdz-citacao { position: relative; left: 0; top: 0; margin-top: -32px; }
    .mdz-stats { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  }
  @media (prefers-reduced-motion: reduce) {
    .mdz-rev { opacity: 1; transform: none; transition: none; }
    .mdz-flutua, .mdz-sobe, .mdz-cursor, .mdz-spin { animation: none; }
    .mdz-retrato-video { display: none; }
  }
`;
