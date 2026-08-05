"use client";

import { Battery, Signal, Wifi } from "lucide-react";
import { PreviewSwitchHero } from "@/components/ui/preview-switch-hero";
import HeroAvatars from "./HeroAvatars";

export type TeamSolutionItem = {
  id: string;
  label: string;
  color: string;
  title: string;
  titleFade: string;
  body: string;
  replaces: string[];
  bullets: string[];
};

type ChatMsg = { from: "ze" | "client"; text: string };

/** Nome do Zé no WhatsApp, por time. */
const ZE_NAMES: Record<string, string> = {
  vendas: "Zé das Vendas",
  marketing: "Zé do Marketing",
  atendimento: "Zé do Suporte",
  orcamento: "Zé do Orçamento",
  operacao: "Zé da Operação",
  financeiro: "Zé do Financeiro",
  lideranca: "Zé da Liderança",
};

/** Mensagens que o cliente recebe no WhatsApp, por time. */
const CHATS: Record<string, ChatMsg[]> = {
  vendas: [
    { from: "ze", text: "Oi! Vi seu interesse 👋 Posso te ajudar com o modelo?" },
    { from: "client", text: "Quero o orçamento, pode ser?" },
    { from: "ze", text: "Pronto — proposta + link de pagamento: vos.app/p/4812" },
    { from: "client", text: "Paguei no PIX agora" },
    { from: "ze", text: "PIX confirmado ✓ Pedido #4812 no caixa." },
    { from: "ze", text: "Nota e comprovante no seu e-mail." },
  ],
  marketing: [
    { from: "ze", text: "Oi! Vi que você clicou no anúncio da promoção 🎯" },
    { from: "ze", text: "Separei 3 opções com 10% OFF pra você hoje." },
    { from: "client", text: "Manda a do meio!" },
    { from: "ze", text: "Link do checkout: vos.app/c/882" },
    { from: "client", text: "Fechei 🙌" },
    { from: "ze", text: "Pedido no CRM · time de vendas avisado." },
  ],
  atendimento: [
    { from: "client", text: "Oi, meu pedido #4812 já saiu?" },
    { from: "ze", text: "Saiu sim! Código de rastreio: BR392817 📦" },
    { from: "client", text: "E se eu precisar trocar?" },
    { from: "ze", text: "Pode trocar em até 7 dias — te passo pra Ana." },
    { from: "client", text: "Perfeito, obrigado!" },
    { from: "ze", text: "Ana já tem o histórico do chat ✓" },
  ],
  orcamento: [
    { from: "client", text: "Pode mandar o orçamento dos 3 climatizadores?" },
    { from: "ze", text: "Claro — preparei a proposta #ORC-882." },
    { from: "ze", text: "Total R$ 4.890 · validade 7 dias: vos.app/o/882" },
    { from: "client", text: "Aprovado, pode seguir!" },
    { from: "ze", text: "Orçamento aprovado ✓ Gerando pedido no CRM…" },
    { from: "ze", text: "Pedido #4812 criado · time avisado." },
  ],
  operacao: [
    { from: "ze", text: "Orçamento #OS-214 aprovado ✓" },
    { from: "ze", text: "Agenda liberada amanhã 14h." },
    { from: "client", text: "Pode ser sim!" },
    { from: "ze", text: "Peças reservadas no estoque. Técnico: Marcos." },
    { from: "ze", text: "Status: a caminho · previsão 13:50." },
    { from: "client", text: "Combinado, estou aguardando." },
  ],
  financeiro: [
    { from: "ze", text: "Lembrete: fatura #882 vence amanhã (R$ 890)." },
    { from: "ze", text: "Pague no PIX: vos.app/pix/882" },
    { from: "client", text: "Paguei agora" },
    { from: "ze", text: "PIX confirmado ✓" },
    { from: "ze", text: "NF-e enviada no e-mail." },
    { from: "client", text: "Recebi, valeu!" },
  ],
  lideranca: [
    { from: "ze", text: "Resumo do dia · 3 pontos:" },
    { from: "ze", text: "1) Funil: 4 leads parados em Proposta" },
    { from: "ze", text: "2) Meta: 87% do mês · falta R$ 12.4k" },
    { from: "ze", text: "3) 2 clientes em risco de churn" },
    { from: "client", text: "Aciona o time de vendas nos leads" },
    { from: "ze", text: "Feito — tarefas criadas pra cada lead ✓" },
  ],
};

function MsgBubble({ m }: { m: ChatMsg }) {
  return (
    <div
      className={
        m.from === "ze"
          ? "max-w-[88%] self-start rounded-2xl rounded-tl-md bg-[#1f2c34] px-3 py-2 text-[12.5px] leading-snug text-white/90"
          : "max-w-[88%] self-end rounded-2xl rounded-tr-md bg-[#005c4b] px-3 py-2 text-[12.5px] leading-snug text-white/95"
      }
    >
      {m.text}
    </div>
  );
}

function PhoneChat({
  team,
  title,
  color,
}: {
  team: string;
  title: string;
  color: string;
}) {
  const msgs = CHATS[team] ?? CHATS.vendas;
  const zeName = ZE_NAMES[team] ?? "Zé do VOS";

  return (
    <div className="relative mx-auto w-full max-w-[400px] px-2 [mask-image:linear-gradient(to_bottom,black_78%,transparent)]">
      <div className="overflow-hidden rounded-t-[2.5rem] bg-background/75 px-2 pt-2 shadow-md shadow-black/[0.06] ring-1 ring-foreground/10">
        <div className="flex h-[var(--vos-phone-h,360px)] max-h-full flex-col overflow-hidden rounded-t-[2rem] bg-[#0b141a] px-3 ring-1 ring-foreground/10 dark:bg-black">
          {/* status bar */}
          <div className="flex shrink-0 items-center justify-between px-2 py-2 text-xs text-white/90">
            <span className="font-semibold">9:41</span>
            <div className="flex items-end gap-1">
              <Signal aria-hidden className="size-4" />
              <Wifi aria-hidden className="size-[18px]" />
              <Battery aria-hidden className="-mb-px size-5" />
            </div>
          </div>

          {/* WhatsApp header */}
          <div className="mb-2 flex shrink-0 items-center gap-2.5 rounded-xl bg-white/[0.06] px-2.5 py-2">
            <span
              className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
              style={{ background: color }}
              aria-hidden="true"
            >
              <img src="/assets/ze/ze-heroi-sm.webp" alt="" width={30} height={30} className="size-[30px] object-contain" draggable={false} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">{zeName}</p>
              <p className="truncate text-[11px] text-white/50">{title}</p>
            </div>
          </div>

          {/* conversa correndo (loop lento) */}
          <div className="tchat-viewport relative min-h-0 flex-1 overflow-hidden">
            <div className="tchat-track" aria-hidden="true">
              {[0, 1].map((dup) => (
                <div key={dup} className="tchat-seq">
                  {msgs.map((m, i) => (
                    <MsgBubble key={`${dup}-${i}`} m={m} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .tchat-viewport {
          -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 88%, transparent 100%);
          mask-image: linear-gradient(180deg, transparent 0%, #000 8%, #000 88%, transparent 100%);
        }
        .tchat-track {
          display: flex;
          flex-direction: column;
          will-change: transform;
          animation: tchat-scroll 42s linear infinite;
        }
        .tchat-seq {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 4px 2px 14px;
        }
        @keyframes tchat-scroll {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tchat-track { animation: none; }
          .tchat-viewport {
            -webkit-mask-image: none;
            mask-image: none;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}

type Props = {
  title: string;
  lead: string;
  cta: string;
  signupUrl: string;
  items: TeamSolutionItem[];
  avatars?: { src?: string; initials?: string }[];
};

export default function TeamPreviewSwitch({
  title,
  lead,
  cta,
  signupUrl,
  items,
}: Props) {
  const tabs = items.map((item) => ({
    id: item.id,
    label: item.label,
    media: (
      <PhoneChat
        team={item.id}
        title={`${item.title} ${item.titleFade}`}
        color={item.color}
      />
    ),
  }));

  return (
    <PreviewSwitchHero
      title={title}
      description={lead}
      showEmail={false}
      enableScrollDrive={false}
      primaryCta={{ label: cta, href: signupUrl }}
      secondaryCta={{ label: "Ver segmentos", href: "#segmentos" }}
      socialProof={
        <span className="vos-trust inline-flex items-center gap-3">
          <HeroAvatars />
          <span className="vos-trust__rating">
            <strong>4.8</strong>{" "}
            <span className="vos-trust__stars" aria-hidden="true">
              ★★★★★
            </span>
          </span>
          <style>{`
            .vos-trust__rating {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.92);
              white-space: nowrap;
            }
            .vos-trust__rating strong {
              font-weight: 750;
              color: #fff;
            }
            .vos-trust__stars {
              color: #EFB008;
              letter-spacing: 0.12em;
            }
            /* HeroAvatars no fundo laranja: borda clara */
            .vos-trust .zx-hero-avatars img {
              border-color: rgba(255, 255, 255, 0.92);
            }
          `}</style>
        </span>
      }
      tabs={tabs}
      enableScrollDrive={false}
      autoRotate={3000}
      viewportScrollHighlight
      className="!bg-transparent vos-team-switch"
    />
  );
}
