"use client";

/**
 * ZeRevealAI — apresentação da IA na /v4, modo LIGHT estilo ClickUp.
 * Esquerda: painel com o gradiente da marca (roxo→vermelho→laranja, granulado)
 * em tilt 3D (script [data-tilt] da v4, com preserve-3d + translateZ nas camadas).
 * Ao entrar na viewport os óculos DESCEM e encaixam no rosto do Zé (pixel-perfect,
 * base+óculos no mesmo canvas 2000²) e a nuvem digita "Olá, como eu posso te ajudar?".
 * Anotações mono com linha (estilo ClickUp) ficam fora do painel, no fundo light.
 * Direita: eyebrow + headline + CTA.
 *
 * Assets: public/mascote/ze-roxo-nogog.webp, ze-roxo-goggles.png, ze-roxo-full.png.
 * `videoSrc` (opcional) só faz sentido em fundo escuro (blend screen); no light fica off.
 * Respeita prefers-reduced-motion.
 */
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { GetStartedButton } from "../ui/get-started-button";

// entrada lateral (0.85s) com os óculos JÁ caindo (delay 0.4s + 0.95s) + respiro
const SNAP_MS = 1450;
// giro de super-herói (depois do encaixe, ANTES da nuvem)
const SPIN_MS = 1650;
// fala do Zé na nuvem (digitada letra a letra)
const BUBBLE_MSG = "Olá, como eu posso te ajudar?";

export function ZeRevealAI({
  size = 470,
  videoSrc,
  signupUrl = "https://app.vos.com/signup",
}: {
  size?: number;
  videoSrc?: string;
  signupUrl?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(stageRef, { once: true, margin: "0px 0px -18% 0px" });
  const reduce = useReducedMotion();
  const play = inView || reduce;
  const [videoReady, setVideoReady] = useState(false);
  const [snapDone, setSnapDone] = useState(false);
  const [bubblePhase, setBubblePhase] = useState<"hidden" | "dots" | "typing">("hidden");
  const [typed, setTyped] = useState("");
  const [typeDone, setTypeDone] = useState(false);
  const [spin, setSpin] = useState(false);

  // vídeo pronto: evento OU readyState já adiantado (cache) no mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.readyState >= 2) {
      setVideoReady(true);
      return;
    }
    const on = () => setVideoReady(true);
    v.addEventListener("canplay", on);
    v.addEventListener("loadeddata", on);
    return () => {
      v.removeEventListener("canplay", on);
      v.removeEventListener("loadeddata", on);
    };
  }, []);

  // o loop só entra depois do encaixe dos óculos
  useEffect(() => {
    if (!play) return;
    if (reduce) {
      setSnapDone(true);
      return;
    }
    const t = setTimeout(() => setSnapDone(true), SNAP_MS);
    return () => clearTimeout(t);
  }, [play, reduce]);

  // ordem: encaixe → GIRO → nuvem ("digitando…" e digita a mensagem)
  useEffect(() => {
    if (!play) return;
    if (reduce) {
      setBubblePhase("typing");
      setTyped(BUBBLE_MSG);
      setTypeDone(true);
      return;
    }
    const tSpin = setTimeout(() => setSpin(true), SNAP_MS + 150);
    const t1 = setTimeout(() => setBubblePhase("dots"), SNAP_MS + SPIN_MS + 450);
    const t2 = setTimeout(() => setBubblePhase("typing"), SNAP_MS + SPIN_MS + 1350);
    return () => {
      clearTimeout(tSpin);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [play, reduce]);

  useEffect(() => {
    if (bubblePhase !== "typing" || reduce) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(BUBBLE_MSG.slice(0, i));
      if (i >= BUBBLE_MSG.length) {
        clearInterval(iv);
        setTypeDone(true);
      }
    }, 34);
    return () => clearInterval(iv);
  }, [bubblePhase, reduce]);

  const showVideo = !!videoSrc && videoReady && snapDone;

  const S = size;
  const img: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    userSelect: "none",
    pointerEvents: "none",
  };

  return (
    <section className="zx-zehero" aria-label="Conheça o Zé, a IA do VOS">
      <div className="zx-container zx-zehero-grid">
        {/* PALCO: Zé direto no fundo light, entrada lateral + óculos girando */}
        <div className="zx-zehero-stage" ref={stageRef}>
          <span className="zx-zehero-tag zx-zehero-tag--tl">
            Trabalha 24/7<i aria-hidden="true" />
          </span>
          <span className="zx-zehero-tag zx-zehero-tag--br">
            <i aria-hidden="true" />Memória infinita
          </span>

          {/* camada 1: entrada lateral */}
          <div className={`zx-zehero-enter ${play ? "is-in" : ""}`}>
            {/* camada 2: tilt 3D no ponteiro */}
            <div className={`zx-zehero-figure ${spin ? "is-spin" : ""}`} data-tilt>
              <span className="zx-zehero-floor" aria-hidden="true" />
              {/* anel dourado horizontal orbitando (atrás do Zé) */}
              <span className="zx-zehero-spinfx" aria-hidden="true" />
              {/* camada 3: giro de super-herói ao fim da fala */}
              <div className={`zx-zehero-spin ${spin ? "is-spin" : ""}`}>
                {/* camada 4: flutuação */}
                <div
                  className={`zx-zehero-ze ${play ? "is-play" : ""} ${reduce ? "is-static" : ""} ${showVideo ? "is-video" : ""}`}
                  style={{ width: S, height: S }}
                >
                {/* camada estática (some quando o loop de vídeo assume) */}
                <div className="zx-zehero-still">
                  {/* base sem óculos */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/mascote/ze-roxo-nogog.webp" alt="Zé" style={img} draggable={false} />
                  {/* óculos que caem girando e encaixam */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="zx-zehero-gog" src="/mascote/ze-roxo-goggles.webp" alt="" style={img} draggable={false} />
                  {/* flash de impacto */}
                  <span className="zx-zehero-flash" aria-hidden="true" />
                  {/* render completo (crossfade) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="zx-zehero-full" src="/mascote/ze-roxo-full.webp" alt="Zé com óculos" style={img} draggable={false} />
                </div>
                {/* loop do Zé flutuando (só em fundo escuro) */}
                {videoSrc && (
                  <video
                    ref={videoRef}
                    className={`zx-zehero-video ${showVideo ? "is-ready" : ""}`}
                    src={videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    style={img as React.CSSProperties}
                  />
                )}
                </div>
              </div>
            </div>
          </div>

          {/* nuvem de fala do Zé */}
          {bubblePhase !== "hidden" && (
            <div className="zx-zehero-bubble" role="status">
              {bubblePhase === "dots" ? (
                <span className="zx-zehero-dots" aria-label="Zé digitando">
                  <i /><i /><i />
                </span>
              ) : (
                <p>
                  {typed}
                  {!typeDone && <span className="zx-zehero-caret" aria-hidden="true" />}
                </p>
              )}
            </div>
          )}
        </div>

        {/* COPY */}
        <div className="zx-zehero-copy">
          <p className="zx-zehero-hand reveal" aria-hidden="true">
            A nova era de vender
            <svg className="zx-zehero-hand-line" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 8c40-6 120-7 194-3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </p>
          <h2 className="reveal reveal-delay-1">Conheça o Zé.<br />A IA que trabalha por você.</h2>
          <p className="zx-zehero-sub reveal reveal-delay-2">
            Ele mora dentro do VOS, enxerga seu negócio inteiro e executa: responde, vende,
            agenda e cobra. Você só pede, em português.
          </p>
          <div className="reveal reveal-delay-3 mt-6">
            <GetStartedButton label="Começar com o Zé" />
          </div>
        </div>
      </div>
    </section>
  );
}
