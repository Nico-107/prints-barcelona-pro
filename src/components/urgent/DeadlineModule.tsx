import { useEffect, useState } from "react";
import { computeShipDate, formatShipDate, CUTOFF_HOUR } from "@/lib/shipDate";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, {
  before: string;   // "Si pides en las próximas {hrs} h {mins} min → listo el {date}"
  after: string;    // "Después de las 14:00 → listo el {date}"
  tierStd: string;  // tier labels
  tierExp: string;
  tierUrg: string;
}> = {
  es: {
    before: "Si pides en las próximas {hrs} h {mins} min → listo el {date}",
    after: "Pedido tras las 14:00 → listo el {date}",
    tierStd: "Estándar", tierExp: "Express", tierUrg: "Urgente",
  },
  ca: {
    before: "Si demanes en les properes {hrs} h {mins} min → llest el {date}",
    after: "Comanda després de les 14:00 → llesta el {date}",
    tierStd: "Estàndard", tierExp: "Express", tierUrg: "Urgent",
  },
  en: {
    before: "Order within {hrs} h {mins} min → ready {date}",
    after: "Past 14:00 cutoff → ready {date}",
    tierStd: "Standard", tierExp: "Express", tierUrg: "Urgent",
  },
  de: {
    before: "Bestellung in den nächsten {hrs} h {mins} min → fertig am {date}",
    after: "Bestellung nach 14:00 → fertig am {date}",
    tierStd: "Standard", tierExp: "Express", tierUrg: "Dringend",
  },
  fr: {
    before: "Commande dans les {hrs} h {mins} min → prêt le {date}",
    after: "Après 14:00 → prêt le {date}",
    tierStd: "Standard", tierExp: "Express", tierUrg: "Urgent",
  },
  nl: {
    before: "Bestel binnen {hrs} u {mins} min → klaar op {date}",
    after: "Na 14:00 → klaar op {date}",
    tierStd: "Standaard", tierExp: "Express", tierUrg: "Urgent",
  },
  it: {
    before: "Ordina entro {hrs} h {mins} min → pronto il {date}",
    after: "Dopo le 14:00 → pronto il {date}",
    tierStd: "Standard", tierExp: "Express", tierUrg: "Urgente",
  },
  pt: {
    before: "Peça nas próximas {hrs} h {mins} min → pronto a {date}",
    after: "Depois das 14:00 → pronto a {date}",
    tierStd: "Padrão", tierExp: "Express", tierUrg: "Urgente",
  },
};

/**
 * Live deadline module — ticks every minute. The ready date comes from
 * the same function the configurator uses (computeShipDate). Shown per
 * urgency tier so a visitor can decide which tier matches their deadline.
 */
export default function DeadlineModule({
  lang,
  urgency = "urgent",
}: {
  lang: Lang;
  urgency?: "standard" | "express" | "urgent";
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const copy = COPY[lang] ?? COPY.en;
  const isBefore = now.getHours() < CUTOFF_HOUR;
  const cutoff = new Date(now);
  cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);
  const diffMs = Math.max(0, cutoff.getTime() - now.getTime());
  const hrs = Math.floor(diffMs / 3_600_000);
  const mins = Math.floor((diffMs % 3_600_000) / 60_000);
  const readyDate = formatShipDate(computeShipDate(now, urgency), lang);

  const line = (isBefore ? copy.before : copy.after)
    .replace("{hrs}", String(hrs))
    .replace("{mins}", String(mins).padStart(2, "0"))
    .replace("{date}", readyDate);

  return (
    <section
      data-testid="deadline-module"
      data-page-section="deadline-module"
      className="bg-amber-50 border-y border-amber-200 py-5 px-4"
      aria-live="polite"
    >
      <div className="container max-w-3xl mx-auto text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-amber-900 mb-1">
          {lang === "es" ? "Plazo en vivo" : lang === "ca" ? "Termini en viu" : "Live deadline"}
        </p>
        <p
          data-testid="deadline-line"
          data-ready-date={readyDate}
          className="text-lg md:text-xl font-semibold text-amber-950"
        >
          {line}
        </p>
      </div>
    </section>
  );
}
