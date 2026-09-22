"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

interface Props {
  calLink: string;
  calOrigin: string;
  /** Prefill do booking */
  name?: string;
  email?: string;
  notes?: string;
  /** Convidados fixos adicionados a toda reserva (recebem o Google Meet). */
  guests?: string[];
  /**
   * Primeiro toque (fbp/fbc/click-ids/ip/ua). Vai como `metadata[...]` do booking
   * → chega no webhook do Cal → vira atribuição do lead. É o que permite ligar o
   * comparecimento (evento offline, sem navegador) ao anúncio que trouxe a pessoa.
   *
   * Reimplantado em 17/09/2026: o PR #16 (`fe054ac`) removeu esta prop junto com o
   * resto do rastreio, e desde 15/09 toda reserva chegava ao Cal sem atribuição.
   */
  metadata?: Record<string, string>;
  onBookingSuccess?: () => void;
  className?: string;
}

/**
 * Embed inline do Cal.com self-hosted (cal.osvertex.com).
 */
export default function CalEmbed({
  calLink,
  calOrigin,
  name,
  email,
  notes,
  guests,
  metadata,
  onBookingSuccess,
  className,
}: Props) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({
        namespace: "demo",
        embedJsUrl: `${calOrigin}/embed/embed.js`,
      });
      if (cancelled) return;

      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: { "cal-brand": "#ED4B00" },
          dark: { "cal-brand": "#ED4B00" },
        },
        // A descrição do evento fica fora do embed (21/09/2026): no celular ela
        // abria primeiro, rolável, e o calendário ficava escondido embaixo — o
        // lead não achava os horários. A LP já explica a call antes do passo 3.
        hideEventTypeDetails: true,
        layout: "month_view",
      });

      if (onBookingSuccess) {
        cal("on", {
          action: "bookingSuccessfulV2",
          callback: () => onBookingSuccess(),
        });
        // fallback em versões antigas do embed
        cal("on", {
          action: "bookingSuccessful",
          callback: () => onBookingSuccess(),
        });
      }
      // Em `astro dev`: todo evento do embed no console (é o que o Cal Listener
      // do GTM ouve em produção). A reserva aqui é de teste, e o Cal a confirma
      // com `dryRunBookingSuccessfulV2` — nome que os tipos do pacote não
      // conhecem, por isso é lido pelo "*".
      if (import.meta.env.DEV) {
        cal("on", {
          action: "*",
          callback: (e) => {
            console.info("[cal][local]", e.detail?.type, e.detail?.data);
            if (e.detail?.type === "dryRunBookingSuccessfulV2") onBookingSuccess?.();
          },
        });
      }
    })().catch(() => {
      /* embed indisponível */
    });

    return () => {
      cancelled = true;
    };
  }, [calOrigin, onBookingSuccess]);

  const config: Record<string, string | string[]> = {
    theme: "light",
    layout: "month_view",
  };
  if (name) config.name = name;
  if (email) config.email = email;
  if (notes) config.notes = notes;
  // Convidados fixos: entram como attendees em toda reserva (recebem o Meet).
  if (guests && guests.length) config.guests = guests;
  // O Cal lê `metadata[chave]=valor` da query e grava no booking; o webhook
  // devolve isso pra gente costurar a atribuição por e-mail. 500 chars é o
  // teto que o Cal aceita por valor.
  if (metadata) {
    for (const [k, v] of Object.entries(metadata)) {
      if (v) config[`metadata[${k}]`] = String(v).slice(0, 500);
    }
  }
  // O Cal é o de PRODUÇÃO: reserva real vira reunião no Calendar, negócio no
  // CRM, WhatsApp para o lead e Schedule na Meta. Em `astro dev` a reserva é
  // de teste (dry run do próprio Cal: nada é gravado, nada é avisado) e a
  // página mostra a faixa de teste. No build isto é código morto.
  if (import.meta.env.DEV) config["cal.isBookingDryRun"] = "true";

  return (
    <div className={className ?? "h-[480px] w-full overflow-hidden rounded-xl"}>
      <Cal
        namespace="demo"
        calLink={calLink}
        calOrigin={calOrigin}
        style={{ width: "100%", height: "100%", overflow: "auto" }}
        config={config}
      />
    </div>
  );
}
