/**
 * Phase 2.5: single CTA vocabulary used by every customer-facing page in
 * all 8 languages. Every page/template that renders a primary action must
 * import from here — no hand-typed button labels.
 *
 * Primary (customer pages): opens the file picker / price configurator,
 * never a plain form.
 * Header button: compact variant of primary.
 * Photo path: used by parts/replacement-parts pages where a photo starts
 * the funnel.
 * Business: used by B2B pages (brief form + file upload).
 * Secondary: WhatsApp link, outlined, no green buttons.
 * Maker: only on /makers and related maker-audience pages.
 */

export type Lang = "es" | "ca" | "en" | "de" | "fr" | "nl" | "it" | "pt";

export const CTA_LABELS = {
  primary: {
    es: "Subir archivo y ver precio",
    ca: "Pujar arxiu i veure preu",
    en: "Upload file and see price",
    de: "Datei hochladen und Preis sehen",
    fr: "Envoyer le fichier et voir le prix",
    nl: "Bestand uploaden en prijs zien",
    it: "Carica il file e vedi il prezzo",
    pt: "Carregar ficheiro e ver preço",
  },
  headerButton: {
    es: "Ver mi precio",
    ca: "Veure el meu preu",
    en: "See my price",
    de: "Meinen Preis sehen",
    fr: "Voir mon prix",
    nl: "Mijn prijs bekijken",
    it: "Vedi il mio prezzo",
    pt: "Ver o meu preço",
  },
  photoPath: {
    es: "Enviar una foto",
    ca: "Enviar una foto",
    en: "Send a photo",
    de: "Foto senden",
    fr: "Envoyer une photo",
    nl: "Een foto sturen",
    it: "Invia una foto",
    pt: "Enviar uma foto",
  },
  business: {
    es: "Enviar mi proyecto",
    ca: "Enviar el meu projecte",
    en: "Send my project",
    de: "Mein Projekt senden",
    fr: "Envoyer mon projet",
    nl: "Mijn project versturen",
    it: "Invia il mio progetto",
    pt: "Enviar o meu projeto",
  },
  secondary: {
    es: "Escribir por WhatsApp",
    ca: "Escriure per WhatsApp",
    en: "Message on WhatsApp",
    de: "Per WhatsApp schreiben",
    fr: "Écrire sur WhatsApp",
    nl: "Schrijf via WhatsApp",
    it: "Scrivere su WhatsApp",
    pt: "Escrever por WhatsApp",
  },
  maker: {
    es: "Unirme a la red de makers",
    ca: "Unir-me a la xarxa de makers",
    en: "Join the maker network",
    de: "Dem Maker-Netzwerk beitreten",
    fr: "Rejoindre le réseau maker",
    nl: "Lid worden van het maker-netwerk",
    it: "Unirmi alla rete maker",
    pt: "Juntar-me à rede de makers",
  },
} as const;

export type CtaKind = keyof typeof CTA_LABELS;

export function cta(kind: CtaKind, lang: Lang): string {
  return CTA_LABELS[kind][lang] ?? CTA_LABELS[kind].en;
}

/**
 * Returns the full set of acceptable primary-CTA labels, in every language.
 * Used by scripts/verify-site.mjs to assert that the CTA on every page
 * matches one of these strings (Phase 9.1).
 */
export function allPrimaryLabels(): string[] {
  const kinds: CtaKind[] = ["primary", "headerButton", "photoPath", "business", "maker"];
  const out = new Set<string>();
  for (const kind of kinds) {
    for (const label of Object.values(CTA_LABELS[kind])) out.add(label);
  }
  return [...out];
}
