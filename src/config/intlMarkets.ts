// owner: adjust typicalDeliveryDays to real Sendcloud/Correos transit times.
// carrierNote: null = use default phrasing; string = append to delivery sentence.

export interface IntlMarket {
  code: string;
  lang: string;
  locale: string;
  hubSlug: string;
  typicalDeliveryDays: string;
  /** English equivalent of typicalDeliveryDays — used by EN city pages */
  enDeliveryDays: string;
  carrierNote: string | null;
}

export const INTL_MARKETS: IntlMarket[] = [
  {
    code: "DE",
    lang: "de",
    locale: "de-DE",
    hubSlug: "/de/3d-druck-service",
    typicalDeliveryDays: "3–5 Werktage", // owner: adjust to real Sendcloud/Correos times
    enDeliveryDays: "3–5 business days",
    carrierNote: null,
  },
  {
    code: "NL",
    lang: "nl",
    locale: "nl-NL",
    hubSlug: "/nl/3d-printen-laten-maken",
    typicalDeliveryDays: "3–5 werkdagen", // owner: adjust to real Sendcloud/Correos times
    enDeliveryDays: "3–5 business days",
    carrierNote: null,
  },
  {
    code: "FR",
    lang: "fr",
    locale: "fr-FR",
    hubSlug: "/fr/impression-3d-en-ligne",
    typicalDeliveryDays: "2–4 jours ouvrables", // owner: adjust to real Sendcloud/Correos times
    enDeliveryDays: "2–4 business days",
    carrierNote: null,
  },
  {
    code: "IT",
    lang: "it",
    locale: "it-IT",
    hubSlug: "/it/stampa-3d-online",
    typicalDeliveryDays: "3–5 giorni lavorativi", // owner: adjust to real Sendcloud/Correos times
    enDeliveryDays: "3–5 business days",
    carrierNote: null,
  },
  {
    code: "PT",
    lang: "pt",
    locale: "pt-PT",
    hubSlug: "/pt/impressao-3d-online",
    typicalDeliveryDays: "2–4 dias úteis", // owner: adjust to real Sendcloud/Correos times
    enDeliveryDays: "2–4 business days",
    carrierNote: null,
  },
];

export function getMarket(code: string): IntlMarket | undefined {
  return INTL_MARKETS.find((m) => m.code === code);
}
