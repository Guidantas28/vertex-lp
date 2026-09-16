"use client";

/**
 * GestaoLive: feed de notificações do negócio (produto + serviço + agenda).
 * A cada ~2.6s uma notificação nova entra por cima com spring (como push do
 * celular), empurra as demais pra baixo e a mais antiga sai por baixo.
 * Sem tabs/pills: a variedade (loja, oficina, clínica, agenda) passa sozinha.
 * Estilos globais .zx-fnotif* em FeaturesBento4.astro. Respeita reduced-motion.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Notif = {
  /** `art` = imagem real: logo do canal, marca do PIX, foto do produto ou a cara do cliente */
  art: string;
  /** moldura redonda pra gente, quadrada pra marca e produto */
  round?: boolean;
  title: string;
  sub: string;
  badge: string;
  /** variante do chip do produto: ok · info · warn */
  bc: "ok" | "info" | "warn";
};

const FEED: Notif[] = [
  { art: "/assets/icons/whatsapp.svg", title: "Venda no WhatsApp", sub: "Tênis Runner 42 · PIX confirmado", badge: "R$ 389,90", bc: "ok" },
  { art: "/assets/product/commerce-catalogo.webp", title: "Estoque atualizado", sub: "Tênis Runner 42 baixou sozinho", badge: "Restam 8", bc: "info" },
  { art: "/assets/people/social-22.webp", round: true, title: "OS #231 · Instalação split", sub: "Equipe do Caio saiu pra rua", badge: "Em rota", bc: "warn" },
  { art: "/assets/people/social-25.webp", round: true, title: "Consulta confirmada", sub: "Amanhã 09:30 · lembrete no WhatsApp", badge: "Agenda", bc: "ok" },
  { art: "/assets/icons/pix.svg", title: "PIX recebido", sub: "Pedido #4812 · caixa atualizado", badge: "+R$ 640", bc: "ok" },
  { art: "/assets/people/social-16.webp", round: true, title: "Orçamento aprovado", sub: "Troca de óleo · Civic virou OS", badge: "OS aberta", bc: "info" },
  { art: "/assets/icons/instagram.svg", title: "Pedido pelo Instagram", sub: "Vestido bege M · reservado no balcão", badge: "Hoje", bc: "info" },
  { art: "/assets/icons/nfe.svg", title: "NF-e emitida", sub: "Enviada no e-mail do cliente", badge: "Fiscal ok", bc: "ok" },
];

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
              className={`zx-fnotif-card${fresh ? " is-fresh" : ""}`}
              /* Entrada 320ms (o degrau de entrada do sistema); saída em 220,
                 que é ~70% dela: o que some importa menos que o que chega.
                 A sombra nasce 60ms DEPOIS do cartão, pra ele parecer pousar. */
              initial={reduce ? false : { opacity: 0, y: -34, scale: 0.94, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                boxShadow: "0 14px 30px -18px rgba(0,0,0,0.65)",
                transition: {
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                  boxShadow: { duration: 0.3, delay: 0.06, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
            >
              <span className={`zx-fnotif-ico${notif.round ? " is-round" : ""}`}>
                <img src={notif.art} alt="" width={38} height={38} loading="lazy" decoding="async" />
              </span>
              <div className="zx-fnotif-txt">
                <strong>
                  <span>{notif.title}</span>
                </strong>
                <span>{notif.sub}</span>
              </div>
              <em className={`zx-chip zx-chip--${notif.bc}`}>{notif.badge}</em>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="zx-fcard-note"><i className="zx-fdot" />Loja, oficina, clínica ou agenda: tudo avisa aqui</p>
    </div>
  );
}
