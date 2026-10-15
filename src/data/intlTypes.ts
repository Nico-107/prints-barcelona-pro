// Shared TypeScript interfaces for international page data files.

export interface IntlHubContent {
  slug: string;
  lang: string;
  locale: string;
  countryCode: string;
  metaTitle: string;       // ≤60 chars
  metaDescription: string; // ≤155 chars
  eyebrow: string;
  h1: string;
  heroSubtitle?: string;   // max 2 lines — shown in hero; full promise goes below calculator
  promise: string;
  howItWorks: string;
  whatWePrint: string;
  materialsText: string;
  fileFormatsText: string;
  faqs: Array<{ q: string; a: string }>;
  whatsappMsg: string;
  priceTableCaption: string;
  breadcrumbHub: string;
  cityLinks: Array<{ to: string; label: string }>;
  guideLinks: Array<{ to: string; label: string }>;
}

export interface IntlCityContent {
  slug: string;
  lang: string;
  locale: string;
  countryCode: string;
  city: string;
  altSlug?: string; // English equivalent for hreflang pairing
  metaTitle: string;       // ≤60 chars
  metaDescription: string; // ≤155 chars
  h1: string;
  eyebrow: string;
  introText: string; // ≥500 words
  deliveryNote: string;
  faqs: Array<{ q: string; a: string }>;
  whatsappMsg: string;
  hubLink: { to: string; label: string };
  siblingLinks: Array<{ to: string; label: string }>;
  guideLinks: Array<{ to: string; label: string }>;
}

export interface IntlGuideContent {
  slug: string;
  lang: string;
  locale: string;
  topic: "price" | "file-prep" | "materials";
  metaTitle: string;       // ≤60 chars
  metaDescription: string; // ≤155 chars
  h1: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  workedExamples?: Array<{
    name: string;
    grams: number;
    hours: number;
    material: string;
    price: string;
    description: string;
  }>;
  faqs: Array<{ q: string; a: string }>;
  hubLink: { to: string; label: string };
  cityLinks: Array<{ to: string; label: string }>;
}

export interface IntlPartContent {
  slug: string;
  lang: string;
  locale: string;
  countryCode: string;
  originalSlug: string; // Spanish original e.g. "/adaptador-vesa-monitor"
  metaTitle: string;       // ≤60 chars
  metaDescription: string; // ≤155 chars
  h1: string;
  productName: string;
  problemStatement: string;
  description: string;
  howItsMade: string;
  material: string;
  compatibleWith: string;
  price: number; // same as Spanish original
  faqs: Array<{ q: string; a: string }>;
  disclaimer: string;
  hubLink: { to: string; label: string };
}
