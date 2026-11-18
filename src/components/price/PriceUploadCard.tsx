import { StlEstimator } from "@/components/StlEstimator";
import { UploadPanel } from "@/components/ds";

type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, { label: string; heading: string; description: string }> = {
  es: { label: "PRECIO AL INSTANTE — DESDE 9,90 €", heading: "Sube tu archivo y ve el precio ahora.", description: "Sin cuenta. Pedido mínimo 9,90 €, sin tarifa de setup." },
  ca: { label: "PREU AL MOMENT — DES DE 9,90 €", heading: "Puja el teu arxiu i veu el preu ara.", description: "Sense compte. Comanda mínima 9,90 €, sense tarifa de setup." },
  en: { label: "INSTANT PRICE — FROM €9.90", heading: "Upload your file and see the price now.", description: "No account. €9.90 minimum order, no setup fee." },
  de: { label: "SOFORTPREIS — AB 9,90 €", heading: "Datei hochladen und Preis sehen.", description: "Ohne Konto. 9,90 € Mindestbestellwert, keine Setup-Gebühr." },
  fr: { label: "PRIX INSTANTANÉ — À PARTIR DE 9,90 €", heading: "Chargez votre fichier et voyez le prix.", description: "Sans compte. 9,90 € minimum, sans frais de setup." },
  nl: { label: "DIRECTE PRIJS — VANAF 9,90 €", heading: "Upload je bestand en zie direct de prijs.", description: "Zonder account. 9,90 € minimum, geen setup kosten." },
  it: { label: "PREZZO ISTANTANEO — DA 9,90 €", heading: "Carica il file e vedi il prezzo.", description: "Senza account. Minimo 9,90 €, nessun costo di setup." },
  pt: { label: "PREÇO IMEDIATO — DESDE 9,90 €", heading: "Carregue o seu ficheiro e veja o preço.", description: "Sem conta. Mínimo 9,90 €, sem taxa de setup." },
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
