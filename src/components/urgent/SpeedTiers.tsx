import { useEffect, useState } from "react";
import { EST } from "@/lib/estimator/core";
import { computeShipDate, formatShipDate } from "@/lib/shipDate";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, {
  heading: string;
  tier: string;
  ready: string;
  surcharge: string;
  std: string;
  exp: string;
  urg: string;
  noSurcharge: string;
}> = {
  es: {
    heading: "Plazos de entrega",
    tier: "Plazo", ready: "Listo el", surcharge: "Recargo",
    std: "Estándar", exp: "Express", urg: "Urgente",
    noSurcharge: "sin recargo",
  },
  ca: {
    heading: "Terminis d'entrega",
    tier: "Termini", ready: "Llest el", surcharge: "Recàrrec",
    std: "Estàndard", exp: "Express", urg: "Urgent",
    noSurcharge: "sense recàrrec",
  },
  en: {
    heading: "Delivery times",
    tier: "Tier", ready: "Ready", surcharge: "Surcharge",
    std: "Standard", exp: "Express", urg: "Urgent",
    noSurcharge: "no surcharge",
  },
  de: {
    heading: "Lieferzeiten",
    tier: "Stufe", ready: "Fertig am", surcharge: "Aufschlag",
    std: "Standard", exp: "Express", urg: "Dringend",
    noSurcharge: "ohne Aufschlag",
  },
  fr: {
    heading: "Délais de livraison",
    tier: "Niveau", ready: "Prêt le", surcharge: "Supplément",
    std: "Standard", exp: "Express", urg: "Urgent",
    noSurcharge: "sans supplément",
  },
  nl: {
    heading: "Levertijden",
    tier: "Niveau", ready: "Klaar op", surcharge: "Toeslag",
    std: "Standaard", exp: "Express", urg: "Urgent",
    noSurcharge: "zonder toeslag",
  },
  it: {
    heading: "Tempi di consegna",
    tier: "Livello", ready: "Pronto il", surcharge: "Sovrapprezzo",
    std: "Standard", exp: "Express", urg: "Urgente",
    noSurcharge: "senza sovrapprezzo",
  },
  pt: {
    heading: "Prazos de entrega",
    tier: "Prazo", ready: "Pronto a", surcharge: "Recargo",
    std: "Padrão", exp: "Express", urg: "Urgente",
    noSurcharge: "sem recargo",
  },
};

export default function SpeedTiers({ lang }: { lang: Lang }) {
  const copy = COPY[lang] ?? COPY.en;
  // SSR writes null so hydration matches the server-rendered DOM;
  // real wall-clock sweep starts after mount.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!now) {
    return (
      <section data-testid="speed-tiers" data-page-section="speed-tiers" className="py-10 md:py-14 bg-white">
        <div className="container max-w-3xl mx-auto px-4">
          <h2 data-testid="speed-tiers-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-5">{copy.heading}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-secondary/40">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">{copy.tier}</th>
                  <th className="text-left px-4 py-3 font-semibold">{copy.ready}</th>
                  <th className="text-left px-4 py-3 font-semibold">{copy.surcharge}</th>
                </tr>
              </thead>
              <tbody>
                <tr data-tier="standard" className="border-t border-border"><td className="px-4 py-3">{copy.std}</td><td className="px-4 py-3">—</td><td className="px-4 py-3">{copy.noSurcharge}</td></tr>
                <tr data-tier="express" className="border-t border-border"><td className="px-4 py-3">{copy.exp}</td><td className="px-4 py-3">—</td><td className="px-4 py-3">+25%</td></tr>
                <tr data-tier="urgent" className="border-t border-border"><td className="px-4 py-3">{copy.urg}</td><td className="px-4 py-3">—</td><td className="px-4 py-3">+60%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  const tiers: Array<{ key: "standard" | "express" | "urgent"; label: string }> = [
    { key: "standard", label: copy.std },
    { key: "express",  label: copy.exp },
    { key: "urgent",   label: copy.urg },
  ];

  return (
    <section data-testid="speed-tiers" data-page-section="speed-tiers" className="py-10 md:py-14 bg-white">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 data-testid="speed-tiers-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-5">{copy.heading}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">{copy.tier}</th>
                <th className="text-left px-4 py-3 font-semibold">{copy.ready}</th>
                <th className="text-left px-4 py-3 font-semibold">{copy.surcharge}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => {
                const mult = EST.urgency[t.key] ?? 1;
                const pct = Math.round((mult - 1) * 100);
                const ready = formatShipDate(computeShipDate(now, t.key), lang);
                return (
                  <tr key={t.key} data-tier={t.key} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{t.label}</td>
                    <td className="px-4 py-3 text-foreground" data-ready-date={ready}>{ready}</td>
                    <td className="px-4 py-3 text-foreground" data-surcharge-pct={pct}>
                      {pct === 0 ? copy.noSurcharge : `+${pct}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
