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
    heading: "Tiers de velocidad",
    tier: "Tier", ready: "Listo el", surcharge: "Recargo",
    std: "Estándar", exp: "Express", urg: "Urgente",
    noSurcharge: "sin recargo",
  },
  ca: {
    heading: "Nivells de velocitat",
    tier: "Nivell", ready: "Llest el", surcharge: "Recàrrec",
    std: "Estàndard", exp: "Express", urg: "Urgent",
    noSurcharge: "sense recàrrec",
  },
  en: {
    heading: "Speed tiers",
    tier: "Tier", ready: "Ready", surcharge: "Surcharge",
    std: "Standard", exp: "Express", urg: "Urgent",
    noSurcharge: "no surcharge",
  },
  de: {
    heading: "Geschwindigkeits-Tiers",
    tier: "Tier", ready: "Fertig am", surcharge: "Aufschlag",
    std: "Standard", exp: "Express", urg: "Dringend",
    noSurcharge: "ohne Aufschlag",
  },
  fr: {
    heading: "Tiers de vitesse",
    tier: "Tier", ready: "Prêt le", surcharge: "Supplément",
    std: "Standard", exp: "Express", urg: "Urgent",
    noSurcharge: "sans supplément",
  },
  nl: {
    heading: "Snelheid-tiers",
    tier: "Tier", ready: "Klaar op", surcharge: "Toeslag",
    std: "Standaard", exp: "Express", urg: "Urgent",
    noSurcharge: "zonder toeslag",
  },
  it: {
    heading: "Tier di velocità",
    tier: "Tier", ready: "Pronto il", surcharge: "Sovrapprezzo",
    std: "Standard", exp: "Express", urg: "Urgente",
    noSurcharge: "senza sovrapprezzo",
  },
  pt: {
    heading: "Tiers de velocidade",
    tier: "Tier", ready: "Pronto a", surcharge: "Recargo",
    std: "Padrão", exp: "Express", urg: "Urgente",
    noSurcharge: "sem recargo",
  },
};

export default function SpeedTiers({ lang }: { lang: Lang }) {
  const copy = COPY[lang] ?? COPY.en;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const tiers: Array<{ key: "standard" | "express" | "urgent"; label: string }> = [
    { key: "standard", label: copy.std },
    { key: "express",  label: copy.exp },
    { key: "urgent",   label: copy.urg },
  ];

  return (
    <section data-testid="speed-tiers" data-page-section="speed-tiers" className="py-10 md:py-14 bg-white">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">{copy.heading}</h2>
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
