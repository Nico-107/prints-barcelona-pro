import { EST, priceOrder } from "@/lib/estimator/core";
import type { OrderPartInput, PartEstimate } from "@/lib/estimator/core";
import { formatEUR } from "@/lib/formatPrice";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

// Four worked example parts spanning small / medium / large / batch.
const EXAMPLES: Array<{ label: Record<Lang, string>; grams: number; hours: number; material: string; qty: number }> = [
  {
    label: {
      es: "Clip pequeño (1 pieza)", ca: "Clip petit (1 peça)", en: "Small clip (1 piece)",
      de: "Kleiner Clip (1 Stück)", fr: "Petit clip (1 pièce)", nl: "Kleine clip (1 stuk)",
      it: "Piccolo clip (1 pezzo)", pt: "Clip pequeno (1 peça)",
    },
    grams: 12, hours: 0.6, material: "PLA", qty: 1,
  },
  {
    label: {
      es: "Soporte mediano (1 pieza)", ca: "Suport mitjà (1 peça)", en: "Medium bracket (1 piece)",
      de: "Mittelgroße Halterung (1 Stück)", fr: "Support moyen (1 pièce)", nl: "Middelgrote houder (1 stuk)",
      it: "Supporto medio (1 pezzo)", pt: "Suporte médio (1 peça)",
    },
    grams: 48, hours: 1.4, material: "PETG", qty: 1,
  },
  {
    label: {
      es: "Pieza grande (1 pieza)", ca: "Peça gran (1 peça)", en: "Large part (1 piece)",
      de: "Großes Teil (1 Stück)", fr: "Grosse pièce (1 pièce)", nl: "Grote onderdeel (1 stuk)",
      it: "Pezzo grande (1 pezzo)", pt: "Peça grande (1 peça)",
    },
    grams: 150, hours: 4.5, material: "PETG", qty: 1,
  },
  {
    label: {
      es: "Lote (10 piezas)", ca: "Lot (10 peces)", en: "Batch (10 pieces)",
      de: "Serie (10 Stück)", fr: "Lot (10 pièces)", nl: "Serie (10 stuks)",
      it: "Lotto (10 pezzi)", pt: "Lote (10 peças)",
    },
    grams: 48, hours: 1.4, material: "PLA", qty: 10,
  },
];

const COPY: Record<Lang, { heading: string; cols: [string, string, string] }> = {
  es: { heading: "Ejemplos de precio", cols: ["Pieza", "Material", "Precio total"] },
  ca: { heading: "Exemples de preu", cols: ["Peça", "Material", "Preu total"] },
  en: { heading: "Price examples", cols: ["Part", "Material", "Total price"] },
  de: { heading: "Preisbeispiele", cols: ["Teil", "Material", "Gesamtpreis"] },
  fr: { heading: "Exemples de prix", cols: ["Pièce", "Matière", "Prix total"] },
  nl: { heading: "Prijsvoorbeelden", cols: ["Onderdeel", "Materiaal", "Totaalprijs"] },
  it: { heading: "Esempi di prezzo", cols: ["Pezzo", "Materiale", "Prezzo totale"] },
  pt: { heading: "Exemplos de preço", cols: ["Peça", "Material", "Preço total"] },
};

function examplePart(grams: number, hours: number): PartEstimate {
  return {
    plasticCm3: grams / 1.27, supportCm3: 0, grams, timeSec: hours * 3600,
    fixedSec: 0, sizeXMm: 60, sizeYMm: 60, heightMm: 30, fitsPlate: true,
    orientation: 0, orientationName: "as uploaded",
  };
}

export default function EnginePriceTable({
  lang,
  testId = "engine-examples",
}: {
  lang: Lang;
  testId?: string;
}) {
  const copy = COPY[lang] ?? COPY.en;
  const rows = EXAMPLES.map((ex) => {
    const part: PartEstimate = { ...examplePart(ex.grams, ex.hours), plasticCm3: ex.grams / (EST.materials[ex.material]?.density ?? 1.27) };
    const inp: OrderPartInput = { name: ex.label.en, quantity: ex.qty, material: ex.material, estimate: part };
    const totalCents = priceOrder([inp], "standard").baseCents;
    return { label: ex.label[lang] ?? ex.label.en, material: ex.material, qty: ex.qty, totalCents };
  });
  return (
    <section data-testid={testId} data-page-section={testId} className="py-12 md:py-16 bg-secondary/20">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">{copy.heading}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">{copy.cols[0]}</th>
                <th className="text-left px-4 py-3 font-semibold">{copy.cols[1]}</th>
                <th className="text-right px-4 py-3 font-semibold">{copy.cols[2]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} data-row={i + 1} data-material={r.material} data-qty={r.qty} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{r.label}</td>
                  <td className="px-4 py-3 text-foreground">{r.material}</td>
                  <td className="px-4 py-3 text-right text-foreground" data-total-cents={r.totalCents}>
                    {formatEUR(r.totalCents / 100, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
