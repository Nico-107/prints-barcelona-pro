/**
 * Delivery timeline for city/delivery pages: order → print → ship → deliver.
 * Transit days come from INTL_MARKETS when a country code is passed;
 * production days come from the same working-day rule the engine uses.
 */
type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, {
  heading: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  wd: string;
  prodDays: string;
  inTransit: string;
}> = {
  es: { heading: "Plazo de entrega", step1: "Pedido", step2: "Impresión", step3: "Envío", step4: "Entrega", wd: "días laborables", prodDays: "Producción", inTransit: "Tránsito" },
  ca: { heading: "Termini de lliurament", step1: "Comanda", step2: "Impressió", step3: "Enviament", step4: "Lliurament", wd: "dies laborables", prodDays: "Producció", inTransit: "Trànsit" },
  en: { heading: "Delivery timeline", step1: "Order", step2: "Print", step3: "Ship", step4: "Deliver", wd: "business days", prodDays: "Production", inTransit: "Transit" },
  de: { heading: "Lieferzeit", step1: "Bestellung", step2: "Druck", step3: "Versand", step4: "Zustellung", wd: "Werktage", prodDays: "Produktion", inTransit: "Transit" },
  fr: { heading: "Délai de livraison", step1: "Commande", step2: "Impression", step3: "Expédition", step4: "Livraison", wd: "jours ouvrés", prodDays: "Production", inTransit: "Transit" },
  nl: { heading: "Levertijd", step1: "Bestelling", step2: "Printen", step3: "Verzenden", step4: "Afleveren", wd: "werkdagen", prodDays: "Productie", inTransit: "Transit" },
  it: { heading: "Tempi di consegna", step1: "Ordine", step2: "Stampa", step3: "Spedizione", step4: "Consegna", wd: "giorni lavorativi", prodDays: "Produzione", inTransit: "Transito" },
  pt: { heading: "Prazo de entrega", step1: "Pedido", step2: "Impressão", step3: "Envio", step4: "Entrega", wd: "dias úteis", prodDays: "Produção", inTransit: "Trânsito" },
};

export default function DeliveryTimeline({
  lang,
  transitDays,
  shippingPrice,
}: {
  lang: Lang;
  /** Working-day transit range like "3–5" (ES/CA) or "3-5" (EN). */
  transitDays: string;
  shippingPrice?: string;
}) {
  const copy = COPY[lang] ?? COPY.en;
  // Standard tier: 3 working days of production, matching the engine.
  const productionDays = "2–3";
  const steps = [
    { label: copy.step1, days: "" },
    { label: copy.step2, days: `${productionDays} ${copy.wd}` },
    { label: copy.step3, days: shippingPrice ?? "" },
    { label: copy.step4, days: `${transitDays} ${copy.wd}` },
  ];

  return (
    <section data-testid="delivery-timeline" data-page-section="delivery-timeline" className="py-12 md:py-16 bg-white">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">{copy.heading}</h2>
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <li
              key={i}
              data-step={i + 1}
              data-step-days={s.days}
              className="rounded-xl border border-border bg-background p-4 flex flex-col gap-1"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-semibold text-foreground text-sm leading-snug">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.days || "—"}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
