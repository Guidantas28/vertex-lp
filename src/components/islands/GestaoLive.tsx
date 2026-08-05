"use client";

/**
 * GestaoLive — feed de notificações do negócio (produto + serviço + agenda).
 * A cada ~2.6s uma notificação nova entra por cima com spring (como push do
 * celular), empurra as demais pra baixo e a mais antiga sai por baixo.
 * Sem tabs/pills: a variedade (loja, oficina, clínica, agenda) passa sozinha.
 * Estilos globais .zx-fnotif* em FeaturesBento4.astro. Respeita reduced-motion.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Notif = { icon: keyof typeof ICONS; c: string; title: string; sub: string; badge: string; bc: string };

const FEED: Notif[] = [
  { icon: "bag", c: "#1F6FEB", title: "Venda no WhatsApp", sub: "Tênis Runner 42 · PIX confirmado", badge: "R$ 389,90", bc: "#1EB258" },
  { icon: "box", c: "#7A5BFF", title: "Estoque atualizado", sub: "Tênis Runner 42 baixou sozinho", badge: "Restam 8", bc: "#1F6FEB" },
  { icon: "doc", c: "#C9810C", title: "OS #231 · Instalação Split", sub: "Equipe do Caio saiu pra rua", badge: "Em rota", bc: "#C9810C" },
  { icon: "cal", c: "#15935A", title: "Consulta confirmada", sub: "Amanhã 09:30 · lembrete no WhatsApp", badge: "Agenda", bc: "#1EB258" },
  { icon: "pix", c: "#1EB258", title: "PIX recebido", sub: "Pedido #4812 · caixa atualizado", badge: "+R$ 640", bc: "#1EB258" },
  { icon: "gear", c: "#1F6FEB", title: "Orçamento aprovado", sub: "Troca de óleo · Civic virou OS", badge: "OS aberta", bc: "#1F6FEB" },
  { icon: "cal", c: "#7A5BFF", title: "Horário preenchido", sub: "Zé encaixou cliente na vaga das 14h", badge: "Hoje", bc: "#7A5BFF" },
  { icon: "doc", c: "#15935A", title: "NF-e emitida", sub: "Enviada no e-mail do cliente", badge: "Fiscal ok", bc: "#1EB258" },
];

const ICONS: Record<string, JSX.Element> = {
  box: <><path d="M12 3.2 19 7.1v9.8L12 20.8 5 16.9V7.1z" /><path d="M5 7.1 12 11l7-3.9M12 11v9.8" /></>,
  bag: <><path d="M6 8h12l-1 11.5a1.5 1.5 0 0 1-1.5 1.3H8.5A1.5 1.5 0 0 1 7 19.5z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 4v2m0 12v2M4 12h2m12 0h2M6.3 6.3l1.4 1.4m8.6 8.6-1.4-1.4m0-8.6-1.4 1.4m-8.6 8.6 1.4-1.4" /></>,
  doc: <><rect x="5" y="3" width="14" height="18" rx="2.6" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4.5" /></>,
  cal: <><rect x="4" y="4.5" width="16" height="16" rx="2.6" /><path d="M4 9.5h16M8.5 2.5v4M15.5 2.5v4" /></>,
  pix: <><path d="M12 3.5 20.5 12 12 20.5 3.5 12z" /><path d="M8.6 8.6l3.4 3.4 3.4-3.4M8.6 15.4l3.4-3.4 3.4 3.4" /></>,
};

const VISIBLE = 4;
const TICK_MS = 2600;

export default function GestaoLive() {
  const reduce = useReducedMotion();
  const [head, setHead] = useState(VISIBLE);
  const seq = useRef(FEED.map((_, i) => i));

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setHead((h) => h + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduce]);

  // janela: as VISIBLE mais recentes, mais nova primeiro
  const items = Array.from({ length: VISIBLE }, (_, k) => {
    const n = head - k;
    return { key: n, notif: FEED[((n % FEED.length) + FEED.length) % FEED.length], fresh: k === 0 };
  });

  return (
    <div className="zx-fnotif" aria-hidden="true">
      <div className="zx-fnotif-stack">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map(({ key, notif, fresh }) => (
            <motion.div
              key={key}
              layout
              className="zx-fnotif-card"
              initial={reduce ? false : { opacity: 0, y: -34, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.94, transition: { duration: 0.28 } }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <span className="zx-fnotif-ico" style={{ ["--c" as string]: notif.c }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[notif.icon]}
                </svg>
              </span>
              <div className="zx-fnotif-txt">
                <strong>
                  {notif.title}
                  {fresh && <i className="zx-fnotif-now">agora</i>}
                </strong>
                <span>{notif.sub}</span>
              </div>
              <em style={{ ["--cc" as string]: notif.bc }}>{notif.badge}</em>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="zx-fcard-note"><i className="zx-fdot" />Loja, oficina, clínica ou agenda: tudo avisa aqui</p>
    </div>
  );
}
