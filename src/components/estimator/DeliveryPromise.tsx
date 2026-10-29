import { useState, useEffect } from "react";
import type { Language } from "@/lib/pathLanguage";

/**
 * Business days to add for printing, keyed by urgency.
 * Rough estimates: standard prints in 2-3 days, express in 1-2, urgent same/next.
 */
const PRODUCTION_DAYS: Record<string, number> = {
  standard: 3,
  express: 2,
  urgent: 1,
};

/** Transit days to add after printing, keyed by market language. */
const TRANSIT_DAYS: Record<string, number> = {
  es: 1, ca: 1,
  pt: 2, fr: 2,
  de: 4, nl: 4,
  it: 4,
  en: 4,
};

function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

interface Props {
  language: Language | string;
  urgency: string;
  fulfillment: "pickup" | "shipping" | null;
}

export function DeliveryPromise({ language, urgency, fulfillment }: Props) {
  const [dateStr, setDateStr] = useState<string | null>(null);

  useEffect(() => {
    if (fulfillment !== "shipping") { setDateStr(null); return; }

    const prodDays = PRODUCTION_DAYS[urgency] ?? 3;
    const transitDays = TRANSIT_DAYS[language] ?? 4;
    const total = prodDays + transitDays;

    const approxDate = addBusinessDays(new Date(), total);

    const locale = language === "ca" ? "ca-ES"
      : language === "es" ? "es-ES"
      : language === "pt" ? "pt-PT"
      : language === "fr" ? "fr-FR"
      : language === "de" ? "de-DE"
      : language === "nl" ? "nl-NL"
      : language === "it" ? "it-IT"
      : "en-GB";

    const formatted = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(approxDate);

    const approxLabel = language === "ca" ? "aprox."
      : language === "es" ? "aprox."
      : language === "pt" ? "aprox."
      : language === "fr" ? "environ le"
      : language === "de" ? "ca."
      : language === "nl" ? "ca."
      : language === "it" ? "ca."
      : "approx.";

    const arrivesLabel = language === "ca" ? "Arriba"
      : language === "es" ? "Llega"
      : language === "pt" ? "Chega"
      : language === "fr" ? "Livraison"
      : language === "de" ? "Ankunft"
      : language === "nl" ? "Aankomst"
      : language === "it" ? "Consegna"
      : "Arrives";

    setDateStr(`${arrivesLabel} ${approxLabel} ${formatted}`);
  }, [language, urgency, fulfillment]);

  if (!dateStr) return null;

  return (
    <p className="text-xs text-muted-foreground text-right mt-0.5">
      {dateStr}
    </p>
  );
}
