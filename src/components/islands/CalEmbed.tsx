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
   * comparecimento (evento offline) ao anúncio que trouxe a pessoa.
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
        hideEventTypeDetails: false,
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
  // devolve isso pra gente costurar a atribuição por e-mail.
  if (metadata) {
    for (const [k, v] of Object.entries(metadata)) {
      if (v) config[`metadata[${k}]`] = String(v).slice(0, 500);
    }
  }

  return (
    <div className={className ?? "w-full rounded-xl"}>
      <Cal
        namespace="demo"
        calLink={calLink}
        calOrigin={calOrigin}
        // Sem height fixo: o embed inline do Cal auto-redimensiona pra altura
        // natural do conteúdo. Quem rola é a área do modal (overflow-y-auto),
        // então o calendário nunca é cortado.
        style={{ width: "100%" }}
        config={config}
      />
    </div>
  );
}
