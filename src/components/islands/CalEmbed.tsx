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

  const config: Record<string, string> = {
    theme: "light",
    layout: "month_view",
  };
  if (name) config.name = name;
  if (email) config.email = email;
  if (notes) config.notes = notes;

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
