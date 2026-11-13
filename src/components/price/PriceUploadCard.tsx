import { StlEstimator } from "@/components/StlEstimator";
import { UploadPanel } from "@/components/ds";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, { label: string; heading: string; description: string }> = {
  es: { label: "PRECIO AL INSTANTE — DESDE 10 €", heading: "Sube tu archivo y ve el precio ahora.", description: "Sin cuenta. Pedido mínimo 10 €, sin tarifa de setup." },
  ca: { label: "PREU AL MOMENT — DES DE 10 €", heading: "Puja el teu arxiu i veu el preu ara.", description: "Sense compte. Comanda mínima 10 €, sense tarifa de setup." },
  en: { label: "INSTANT PRICE — FROM €10", heading: "Upload your file and see the price now.", description: "No account. 10 € minimum order, no setup fee." },
  de: { label: "SOFORTPREIS — AB 10 €", heading: "Datei hochladen und Preis sehen.", description: "Ohne Konto. 10 € Mindestbestellwert, keine Setup-Gebühr." },
  fr: { label: "PRIX INSTANTANÉ — À PARTIR DE 10 €", heading: "Chargez votre fichier et voyez le prix.", description: "Sans compte. 10 € minimum, sans frais de setup." },
  nl: { label: "DIRECTE PRIJS — VANAF 10 €", heading: "Upload je bestand en zie direct de prijs.", description: "Zonder account. 10 € minimum, geen setup kosten." },
  it: { label: "PREZZO ISTANTANEO — DA 10 €", heading: "Carica il file e vedi il prezzo.", description: "Senza account. Minimo 10 €, nessun costo di setup." },
  pt: { label: "PREÇO IMEDIATO — DESDE 10 €", heading: "Carregue o seu ficheiro e veja o preço.", description: "Sem conta. Mínimo 10 €, sem taxa de setup." },
};

/**
 * Price-page upload card. Rendered via a plain container so the whole
 * card carries [data-testid="upload-card"] — allowing the verify check
 * to assert it appears before the page's first h2.
 */
export default function PriceUploadCard({ lang }: { lang: Lang }) {
  const copy = COPY[lang] ?? COPY.en;
  return (
    <section data-testid="upload-card" data-page-section="price-upload-card" className="py-10 md:py-14 bg-[#F6F8FC]">
      <div className="container max-w-4xl mx-auto px-4">
        <UploadPanel label={copy.label} heading={copy.heading} description={copy.description}>
          <StlEstimator compact />
        </UploadPanel>
      </div>
    </section>
  );
}
