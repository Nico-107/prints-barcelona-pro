import { EST } from "@/lib/estimator/core";
import { formatEUR } from "@/lib/formatPrice";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, { heading: string; best: string; notFor: string; temp: string; flex: string; rate: string; perGram: string }> = {
  es: { heading: "Ficha técnica", best: "Ideal para", notFor: "No recomendado", temp: "Límite de temperatura", flex: "Flexibilidad", rate: "Tarifa del material", perGram: "/g" },
  ca: { heading: "Fitxa tècnica", best: "Ideal per a", notFor: "No recomanat", temp: "Límit de temperatura", flex: "Flexibilitat", rate: "Tarifa del material", perGram: "/g" },
  en: { heading: "Spec card", best: "Best for", notFor: "Not for", temp: "Temperature limit", flex: "Flexibility", rate: "Material rate", perGram: "/g" },
  de: { heading: "Datenblatt", best: "Ideal für", notFor: "Nicht geeignet", temp: "Temperaturgrenze", flex: "Flexibilität", rate: "Materialpreis", perGram: "/g" },
  fr: { heading: "Fiche technique", best: "Idéal pour", notFor: "Non recommandé", temp: "Limite de température", flex: "Flexibilité", rate: "Tarif matière", perGram: "/g" },
  nl: { heading: "Specblad", best: "Ideaal voor", notFor: "Niet geschikt voor", temp: "Temperatuurlimiet", flex: "Flexibiliteit", rate: "Materiaaltarief", perGram: "/g" },
  it: { heading: "Scheda tecnica", best: "Ideale per", notFor: "Non adatto", temp: "Limite di temperatura", flex: "Flessibilità", rate: "Tariffa materiale", perGram: "/g" },
  pt: { heading: "Ficha técnica", best: "Ideal para", notFor: "Não indicado", temp: "Limite de temperatura", flex: "Flexibilidade", rate: "Tarifa do material", perGram: "/g" },
};

const DATA: Record<string, {
  bestFor: Record<Lang, string>;
  notFor: Record<Lang, string>;
  tempLimit: string;
  flexibility: string;
}> = {
  PLA: {
    bestFor: {
      es: "Prototipos, maquetas, modelos decorativos", ca: "Prototips, maquetes, models decoratius",
      en: "Prototypes, mock-ups, decorative models", de: "Prototypen, Mock-ups, dekorative Modelle",
      fr: "Prototypes, maquettes, modèles décoratifs", nl: "Prototypes, mock-ups, decoratieve modellen",
      it: "Prototipi, mock-up, modelli decorativi", pt: "Protótipos, maquetes, modelos decorativos",
    },
    notFor: {
      es: "Piezas que soporten >60 °C o lluvia prolongada",
      ca: "Peces que suportin >60 °C o pluja prolongada",
      en: "Parts above 60 °C or prolonged outdoor UV",
      de: "Teile über 60 °C oder längere UV-Belastung",
      fr: "Pièces au-dessus de 60 °C ou UV prolongés",
      nl: "Onderdelen boven 60 °C of langdurige UV",
      it: "Parti sopra 60 °C o UV prolungato",
      pt: "Peças acima de 60 °C ou UV prolongado",
    },
    tempLimit: "~60 °C",
    flexibility: "Rígido",
  },
  PETG: {
    bestFor: {
      es: "Carcasas, soportes, contenedores de uso diario",
      ca: "Carcasses, suports, contenidors d'ús diari",
      en: "Enclosures, brackets, everyday containers",
      de: "Gehäuse, Halterungen, Alltagsbehälter",
      fr: "Boîtiers, supports, contenants du quotidien",
      nl: "Behuizingen, houders, dagelijkse containers",
      it: "Custodie, supporti, contenitori quotidiani",
      pt: "Caixas, suportes, contentores diários",
    },
    notFor: {
      es: "Piezas muy finas o con tolerancias apretadas",
      ca: "Peces molt fines o amb toleràncies ajustades",
      en: "Very thin parts or tight tolerances",
      de: "Sehr dünne Teile oder enge Toleranzen",
      fr: "Pièces très fines ou tolérances serrées",
      nl: "Zeer dunne onderdelen of strakke toleranties",
      it: "Pezzi molto sottili o tolleranze strette",
      pt: "Peças muito finas ou tolerâncias apertadas",
    },
    tempLimit: "~75 °C",
    flexibility: "Semi-rígido",
  },
  TPU: {
    bestFor: {
      es: "Juntas, protectores, agarres, cajas flexibles",
      ca: "Juntes, protectors, nanses, caixes flexibles",
      en: "Gaskets, protectors, grips, flexible cases",
      de: "Dichtungen, Schutzhüllen, Griffe, flexible Gehäuse",
      fr: "Joints, protections, poignées, étuis souples",
      nl: "Afdichtingen, protectors, grepen, flexibele behuizingen",
      it: "Guarnizioni, protezioni, impugnature, custodie flessibili",
      pt: "Juntas, protetores, pegas, caixas flexíveis",
    },
    notFor: {
      es: "Piezas rígidas o con buenas tolerancias",
      ca: "Peces rígides o amb bones toleràncies",
      en: "Rigid parts or tight-tolerance geometry",
      de: "Starre Teile oder enge Toleranzen",
      fr: "Pièces rigides ou tolérances serrées",
      nl: "Stijve onderdelen of strakke toleranties",
      it: "Parti rigide o tolleranze strette",
      pt: "Peças rígidas ou tolerâncias apertadas",
    },
    tempLimit: "~80 °C",
    flexibility: "Shore 95A (flexible)",
  },
};

export default function SpecCard({ lang, material }: { lang: Lang; material: "PLA" | "PETG" | "TPU" }) {
  const copy = COPY[lang] ?? COPY.en;
  const data = DATA[material];
  // Engine: base rate is EST.plasticEurPerG × material.priceMult.
  const rateEur = EST.plasticEurPerG * (EST.materials[material]?.priceMult ?? 1);
  return (
    <section data-testid="spec-card" data-page-section="spec-card" data-material={material} className="py-12 md:py-16 bg-white">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{copy.heading}</h2>
        <div className="rounded-xl border border-border p-5 space-y-3 bg-background">
          <div className="flex justify-between gap-4 pb-3 border-b border-border">
            <span className="text-sm font-semibold text-muted-foreground">{copy.best}</span>
            <span className="text-sm text-right text-foreground">{data.bestFor[lang] ?? data.bestFor.en}</span>
          </div>
          <div className="flex justify-between gap-4 pb-3 border-b border-border">
            <span className="text-sm font-semibold text-muted-foreground">{copy.notFor}</span>
            <span className="text-sm text-right text-foreground">{data.notFor[lang] ?? data.notFor.en}</span>
          </div>
          <div className="flex justify-between gap-4 pb-3 border-b border-border">
            <span className="text-sm font-semibold text-muted-foreground">{copy.temp}</span>
            <span className="text-sm font-mono text-foreground">{data.tempLimit}</span>
          </div>
          <div className="flex justify-between gap-4 pb-3 border-b border-border">
            <span className="text-sm font-semibold text-muted-foreground">{copy.flex}</span>
            <span className="text-sm text-foreground">{data.flexibility}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sm font-semibold text-muted-foreground">{copy.rate}</span>
            <span className="text-sm font-mono text-foreground" data-material-rate-eur-per-gram={rateEur.toFixed(4)}>
              {formatEUR(rateEur, lang)}{copy.perGram}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
