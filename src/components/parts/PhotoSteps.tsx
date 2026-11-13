type Lang = "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt";

const COPY: Record<Lang, {
  heading: string;
  steps: [string, string, string];
  tip: string;
}> = {
  es: {
    heading: "¿Cómo funciona desde una foto?",
    steps: [
      "Nos envías una foto de la pieza rota o del hueco donde encaja",
      "Diseñamos la pieza y te la enseñamos para que apruebes",
      "Imprimimos y entregamos (recogida en Les Corts o envío)",
    ],
    tip: "Tip: haz la foto con una regla o una moneda al lado para medir.",
  },
  ca: {
    heading: "Com funciona des d'una foto?",
    steps: [
      "Ens envies una foto de la peça trencada o del forat on encaixa",
      "Dissenyem la peça i te l'ensenyem perquè aprovis",
      "Imprimim i lliurem (recollida a Les Corts o enviament)",
    ],
    tip: "Consell: fes la foto amb un regle o una moneda al costat per mesurar.",
  },
  en: {
    heading: "How does it work from a photo?",
    steps: [
      "Send us a photo of the broken part or the slot it needs to fit",
      "We model the piece and send you a preview to approve",
      "We print and deliver (pickup in Les Corts or courier shipping)",
    ],
    tip: "Tip: take the photo with a ruler or a coin next to it for scale.",
  },
  de: {
    heading: "Wie funktioniert es mit einem Foto?",
    steps: [
      "Schicken Sie ein Foto des defekten Teils oder der Stelle",
      "Wir modellieren das Teil und schicken Ihnen eine Vorschau",
      "Wir drucken und liefern (Abholung oder Versand)",
    ],
    tip: "Tipp: Foto mit einem Lineal oder einer Münze daneben für den Maßstab.",
  },
  fr: {
    heading: "Comment ça marche à partir d'une photo ?",
    steps: [
      "Envoyez-nous une photo de la pièce cassée ou de l'emplacement",
      "Nous modélisons la pièce et envoyons un aperçu pour approbation",
      "Nous imprimons et livrons (retrait à Les Corts ou envoi)",
    ],
    tip: "Astuce : prenez la photo avec une règle ou une pièce à côté.",
  },
  nl: {
    heading: "Hoe werkt het vanaf een foto?",
    steps: [
      "Stuur ons een foto van het gebroken deel of de plek",
      "Wij modelleren het en sturen een preview ter goedkeuring",
      "Wij printen en leveren (afhalen of verzending)",
    ],
    tip: "Tip: maak de foto met een liniaal of munt erbij voor schaal.",
  },
  it: {
    heading: "Come funziona da una foto?",
    steps: [
      "Inviaci una foto del pezzo rotto o del foro dove va",
      "Modelliamo il pezzo e ti inviamo un'anteprima per l'ok",
      "Stampiamo e consegniamo (ritiro o spedizione)",
    ],
    tip: "Consiglio: fai la foto con un righello o una moneta accanto.",
  },
  pt: {
    heading: "Como funciona a partir de uma foto?",
    steps: [
      "Envie-nos uma foto da peça partida ou do sítio",
      "Modelamos a peça e enviamos-lhe uma pré-visualização",
      "Imprimimos e entregamos (recolha ou envio)",
    ],
    tip: "Dica: tire a foto com uma régua ou moeda ao lado para escala.",
  },
};

export default function PhotoSteps({ lang }: { lang: Lang }) {
  const copy = COPY[lang] ?? COPY.en;
  return (
    <section data-testid="photo-steps" data-page-section="photo-steps" className="py-12 md:py-16 bg-secondary/20">
      <div className="container max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">{copy.heading}</h2>
        <ol className="grid md:grid-cols-3 gap-4 mb-5">
          {copy.steps.map((step, i) => (
            <li
              key={i}
              data-photo-step={i + 1}
              className="rounded-xl border border-border bg-background p-4 flex flex-col gap-2"
            >
              <span className="inline-flex w-8 h-8 rounded-full bg-accent/10 text-accent font-bold items-center justify-center text-sm">
                {i + 1}
              </span>
              <p className="text-sm text-foreground leading-snug">{step}</p>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground text-center">{copy.tip}</p>
      </div>
    </section>
  );
}
