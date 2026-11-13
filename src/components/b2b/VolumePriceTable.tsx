import { EST, priceOrder } from "@/lib/estimator/core";
import type { OrderPartInput, PartEstimate } from "@/lib/estimator/core";
import { formatEUR } from "@/lib/formatPrice";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const _REF: PartEstimate = {
  plasticCm3: 50 / 1.27,
  supportCm3: 0,
  grams: 50,
  timeSec: 0.8 * 3600,
  fixedSec: 0,
  sizeXMm: 80,
  sizeYMm: 80,
  heightMm: 40,
  fitsPlate: true,
  orientation: 0,
  orientationName: "as uploaded",
};

const QTYS = [1, 10, 50] as const;
const MATERIALS = ["PLA", "PETG", "ASA"] as const;

function unitCents(material: string, qty: number): number {
  const part: PartEstimate = { ..._REF, plasticCm3: _REF.grams / (EST.materials[material]?.density ?? 1.27) };
  const inp: OrderPartInput = { name: "ref", quantity: qty, material, estimate: part };
  return Math.round(priceOrder([inp], "standard").baseCents / qty);
}

const TABLE = MATERIALS.map((m) => ({ material: m, prices: QTYS.map((q) => unitCents(m, q)) }));

const COPY: Record<Lang, { heading: string; material: string; sub: string }> = {
  es: { heading: "Precio por volumen (unidad)", material: "Material", sub: "Pieza de referencia 50 g, 0,8 h · precio por unidad" },
  ca: { heading: "Preu per volum (unitat)", material: "Material", sub: "Peça de referència 50 g, 0,8 h · preu per unitat" },
  en: { heading: "Volume price (per unit)", material: "Material", sub: "Reference 50 g, 0.8 h part · unit price" },
  de: { heading: "Volumenpreis (pro Stück)", material: "Material", sub: "Referenzteil 50 g, 0,8 h · Stückpreis" },
  fr: { heading: "Prix au volume (unité)", material: "Matière", sub: "Pièce de référence 50 g, 0,8 h · prix unitaire" },
  nl: { heading: "Volumeprijs (per stuk)", material: "Materiaal", sub: "Referentie 50 g, 0,8 u · stukprijs" },
  it: { heading: "Prezzo per volume (unità)", material: "Materiale", sub: "Pezzo di riferimento 50 g, 0,8 h · prezzo unitario" },
  pt: { heading: "Preço por volume (unidade)", material: "Material", sub: "Peça de referência 50 g, 0,8 h · preço unitário" },
};

export default function VolumePriceTable({ lang }: { lang: Lang }) {
  const copy = COPY[lang] ?? COPY.en;
  return (
    <section data-testid="volume-price-table" data-page-section="volume-price-table" className="py-12 md:py-16 bg-secondary/20">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">{copy.heading}</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">{copy.sub}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">{copy.material}</th>
                {QTYS.map((q) => (
                  <th key={q} data-qty={q} className="text-right px-4 py-3 font-semibold">×{q}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE.map((row) => (
                <tr key={row.material} data-material={row.material} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{row.material}</td>
                  {row.prices.map((cents, i) => (
                    <td key={i} data-qty={QTYS[i]} data-unit-cents={cents} className="px-4 py-3 text-right text-foreground">
                      {formatEUR(cents / 100, lang)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
