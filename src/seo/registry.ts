import { LandingContent, LandingTopic, Lang } from "./landingPages";
import { PAGES_EN } from "./landingPages";
import { PAGES_ES } from "./landingPagesEs";
import { PAGES_CA } from "./landingPagesCa";
import { PAGES_DE } from "./landingPagesDe";
import { INTL_HUBS, INTL_GUIDES } from "@/data/intlRegistry";

export const ALL_PAGES: LandingContent[] = [...PAGES_EN, ...PAGES_ES, ...PAGES_CA, ...PAGES_DE];

export const PAGES_BY_SLUG: Record<string, LandingContent> = Object.fromEntries(
  ALL_PAGES.map((p) => [p.slug, p])
);

// Build topic -> { en, es, ca } slug map for hreflang and equivalent-page
// language switching.
export type AnyLang = Lang | "fr" | "nl" | "it" | "pt";
type TopicSlugMap = Partial<Record<AnyLang, string>>;
export const SLUGS_BY_TOPIC: Record<LandingTopic, TopicSlugMap> = ALL_PAGES.reduce(
  (acc, p) => {
    if (!acc[p.topic]) acc[p.topic] = {};
    acc[p.topic]![p.lang as AnyLang] = p.slug;
    return acc;
  },
  {} as Record<LandingTopic, TopicSlugMap>
);

// fix-polish §3: fold in the intl (fr / nl / it / pt) equivalents so menu
// items can link to the right-language page where one exists. Hubs map to
// the project's generic "hub" placeholder (not tied to a LandingTopic).
const INTL_TOPIC_ALIAS: Record<string, LandingTopic> = {
  price: "pricing",
  materials: "materials-guide",
  "file-prep": "file-prep",
};
for (const g of INTL_GUIDES) {
  const topic = INTL_TOPIC_ALIAS[g.topic];
  if (!topic) continue;
  if (!SLUGS_BY_TOPIC[topic]) SLUGS_BY_TOPIC[topic] = {};
  SLUGS_BY_TOPIC[topic]![g.lang as AnyLang] = g.slug;
}
// Hub slugs per language — used by the Header "home" fallback and the
// Footer international row. Not a LandingTopic, so keep this separate.
export const HUB_SLUG_BY_LANG: Partial<Record<AnyLang, string>> = {
  en: "/3d-printing-service",
  es: "/",
  ca: "/ca",
};
for (const h of INTL_HUBS) HUB_SLUG_BY_LANG[h.lang as AnyLang] = h.slug;

export const SITE_URL = "https://www.dimension3dprints.com";
export const SOCIAL_IMAGE_PATH = "/og/share-default.png";
export const SOCIAL_IMAGE_URL = `${SITE_URL}${SOCIAL_IMAGE_PATH}`;

// Grouped menu — items carry per-language slug + label. Header/Footer pick
// the language-appropriate value via pickLabel / slugForLang.
export interface MenuItem {
  topic?: LandingTopic;
  slugEn: string;
  slugEs: string;
  slugCa: string;
  labelEn: string;
  labelEs: string;
  labelCa: string;
  // fix-polish §3: optional per-language overrides for the five non-primary
  // locales. When a per-language slug is absent, Header/Footer links fall
  // back to slugEn (never slugEs, per §3). When a label override is absent,
  // it falls back to labelEn.
  slugDe?: string;
  slugFr?: string;
  slugNl?: string;
  slugIt?: string;
  slugPt?: string;
  labelDe?: string;
  labelFr?: string;
  labelNl?: string;
  labelIt?: string;
  labelPt?: string;
}

export interface MenuGroup {
  labelEn: string;
  labelEs: string;
  labelCa: string;
  labelDe?: string;
  labelFr?: string;
  labelNl?: string;
  labelIt?: string;
  labelPt?: string;
  items: MenuItem[];
}

type LabelExtras = Pick<MenuItem, "labelDe" | "labelFr" | "labelNl" | "labelIt" | "labelPt">;
type SlugExtras = Pick<MenuItem, "slugDe" | "slugFr" | "slugNl" | "slugIt" | "slugPt">;

const item = (
  topic: LandingTopic,
  labelEn: string,
  labelEs: string,
  labelCa: string,
  labels: LabelExtras = {},
  slugs: SlugExtras = {},
): MenuItem => {
  const m = SLUGS_BY_TOPIC[topic] ?? {};
  const resolved: SlugExtras = {
    slugDe: slugs.slugDe ?? m.de,
    slugFr: slugs.slugFr ?? m.fr,
    slugNl: slugs.slugNl ?? m.nl,
    slugIt: slugs.slugIt ?? m.it,
    slugPt: slugs.slugPt ?? m.pt,
  };
  return {
    topic,
    slugEn: m.en ?? "/",
    slugEs: m.es ?? "/",
    slugCa: m.ca ?? m.es ?? "/",
    labelEn,
    labelEs,
    labelCa,
    ...labels,
    ...resolved,
  };
};

// Static menu item for pages that live at the same URL in every language
// (e.g. /makers, /maker-guide).
const staticItem = (
  slug: string,
  labelEn: string,
  labelEs: string,
  labelCa: string,
  extras: LabelExtras = {},
): MenuItem => ({
  slugEn: slug,
  slugEs: slug,
  slugCa: slug,
  labelEn,
  labelEs,
  labelCa,
  ...extras,
});

export const SERVICES_MENU: MenuGroup[] = [
  {
    labelEn: "Services",
    labelEs: "Servicios",
    labelCa: "Serveis",
    labelDe: "Leistungen",
    labelFr: "Services",
    labelNl: "Diensten",
    labelIt: "Servizi",
    labelPt: "Serviços",
    items: [
      // Phase 2.6: "Impresión 3D en Barcelona" removed — in ES/CA it just
      // reloaded the home page. The hub is still reachable via the logo.
      item("custom-parts", "Custom Parts", "Piezas Personalizadas", "Peces Personalitzades", {
        labelDe: "Maßgefertigte Teile", labelFr: "Pièces sur mesure", labelNl: "Op maat gemaakte onderdelen",
        labelIt: "Pezzi personalizzati", labelPt: "Peças personalizadas",
      }),
      item("prototypes", "Prototype Printing", "Prototipos 3D", "Prototips 3D", {
        labelDe: "Prototypen-Druck", labelFr: "Impression de prototypes", labelNl: "Prototype printen",
        labelIt: "Stampa di prototipi", labelPt: "Impressão de protótipos",
      }),
      item("urgent", "Urgent / Express", "Impresión Urgente", "Impressió Urgent", {
        labelDe: "Eil / Express", labelFr: "Urgent / Express", labelNl: "Spoed / Express",
        labelIt: "Urgente / Express", labelPt: "Urgente / Express",
      }),
      item("replacement-parts", "Replacement Parts", "Recambios 3D", "Recanvis 3D", {
        labelDe: "Ersatzteile", labelFr: "Pièces de rechange", labelNl: "Reserveonderdelen",
        labelIt: "Ricambi", labelPt: "Peças de substituição",
      }),
      item("pricing", "Pricing", "Precios", "Preus", {
        labelDe: "Preise", labelFr: "Prix", labelNl: "Prijzen",
        labelIt: "Prezzi", labelPt: "Preços",
      }),
    ],
  },
  {
    labelEn: "Materials",
    labelEs: "Materiales",
    labelCa: "Materials",
    labelDe: "Materialien",
    labelFr: "Matériaux",
    labelNl: "Materialen",
    labelIt: "Materiali",
    labelPt: "Materiais",
    items: [
      item("pla", "PLA Printing", "Impresión PLA", "Impressió PLA", {
        labelDe: "PLA-Druck", labelFr: "Impression PLA", labelNl: "PLA printen",
        labelIt: "Stampa PLA", labelPt: "Impressão PLA",
      }),
      item("petg", "PETG Printing", "Impresión PETG", "Impressió PETG", {
        labelDe: "PETG-Druck", labelFr: "Impression PETG", labelNl: "PETG printen",
        labelIt: "Stampa PETG", labelPt: "Impressão PETG",
      }),
      item("tpu", "TPU Flexible", "TPU Flexible", "TPU Flexible", {
        labelDe: "Flexibles TPU", labelFr: "TPU Flexible", labelNl: "Flexibel TPU",
        labelIt: "TPU Flessibile", labelPt: "TPU Flexível",
      }),
    ],
  },
  {
    labelEn: "For Business",
    labelEs: "Para Empresas",
    labelCa: "Per a Empreses",
    labelDe: "Für Unternehmen",
    labelFr: "Pour les entreprises",
    labelNl: "Voor bedrijven",
    labelIt: "Per aziende",
    labelPt: "Para empresas",
    items: [
      item("business", "3D Printing for Business", "Impresión 3D para Empresas", "Impressió 3D per a Empreses", {
        labelDe: "3D-Druck für Unternehmen", labelFr: "Impression 3D pour entreprises", labelNl: "3D printen voor bedrijven",
        labelIt: "Stampa 3D per aziende", labelPt: "Impressão 3D para empresas",
      }),
      item("rapid-prototyping", "Rapid Prototyping", "Prototipado Rápido", "Prototipatge Ràpid", {
        labelDe: "Rapid Prototyping", labelFr: "Prototypage rapide", labelNl: "Rapid prototyping",
        labelIt: "Prototipazione rapida", labelPt: "Prototipagem rápida",
      }),
      item("short-run", "Short-Run Production", "Tiradas Cortas", "Tirades Curtes", {
        labelDe: "Kleinserien", labelFr: "Petites séries", labelNl: "Kleine oplage",
        labelIt: "Piccole serie", labelPt: "Pequenas tiragens",
      }),
      item("functional-parts", "Functional Parts", "Piezas Funcionales", "Peces Funcionals", {
        labelDe: "Funktionsteile", labelFr: "Pièces fonctionnelles", labelNl: "Functionele onderdelen",
        labelIt: "Pezzi funzionali", labelPt: "Peças funcionais",
      }),
    ],
  },
  {
    labelEn: "Specialties",
    labelEs: "Especialidades",
    labelCa: "Especialitats",
    labelDe: "Spezialbereiche",
    labelFr: "Spécialités",
    labelNl: "Specialiteiten",
    labelIt: "Specialità",
    labelPt: "Especialidades",
    items: [
      item("miniatures", "Miniatures & Figures", "Miniaturas y Figuras", "Miniatures i Figures", {
        labelDe: "Miniaturen & Figuren", labelFr: "Figurines & miniatures", labelNl: "Miniaturen & figuren",
        labelIt: "Miniature & figure", labelPt: "Miniaturas & figuras",
      }),
    ],
  },
  {
    labelEn: "Guides",
    labelEs: "Guías",
    labelCa: "Guies",
    labelDe: "Ratgeber",
    labelFr: "Guides",
    labelNl: "Gidsen",
    labelIt: "Guide",
    labelPt: "Guias",
    items: [
      item("choosing-service", "How to Choose a Service", "Cómo Elegir un Servicio", "Com Triar un Servei", {
        labelDe: "So wählst du den passenden Dienst", labelFr: "Comment choisir un service", labelNl: "Een dienst kiezen",
        labelIt: "Come scegliere il servizio", labelPt: "Como escolher um serviço",
      }),
      item("materials-guide", "Materials Guide", "Guía de Materiales", "Guia de Materials", {
        labelDe: "Material-Ratgeber", labelFr: "Guide des matériaux", labelNl: "Materiaalgids",
        labelIt: "Guida ai materiali", labelPt: "Guia de materiais",
      }),
      item("file-prep", "File Preparation Guide", "Cómo Preparar tu Archivo", "Com Preparar el teu Arxiu", {
        labelDe: "Datei vorbereiten", labelFr: "Préparer ton fichier", labelNl: "Bestand voorbereiden",
        labelIt: "Preparare il file", labelPt: "Preparar o ficheiro",
      }),
      item("best-service", "Best 3D Printing Service", "Mejor Servicio en Barcelona", "Millor Servei a Barcelona", {
        labelDe: "Bester 3D-Druck-Service", labelFr: "Meilleur service d'impression 3D", labelNl: "Beste 3D printservice",
        labelIt: "Miglior servizio di stampa 3D", labelPt: "Melhor serviço de impressão 3D",
      }),
      item("materials-comparison", "Materials Comparison Table", "Comparativa de Materiales", "Comparativa de Materials", {
        labelDe: "Materialvergleich", labelFr: "Comparatif des matériaux", labelNl: "Materialenvergelijking",
        labelIt: "Tabella comparativa materiali", labelPt: "Comparação de materiais",
      }),
      item("turnaround-comparison", "Turnaround Times Compared", "Comparativa de Plazos", "Comparativa de Terminis", {
        labelDe: "Lieferzeiten im Vergleich", labelFr: "Délais comparés", labelNl: "Doorlooptijd-vergelijking",
        labelIt: "Confronto tempi di consegna", labelPt: "Comparação de prazos",
      }),
      item("technology-comparison", "FDM vs SLA vs SLS", "FDM vs SLA vs SLS", "FDM vs SLA vs SLS", {
        labelDe: "FDM vs SLA vs SLS", labelFr: "FDM vs SLA vs SLS", labelNl: "FDM vs SLA vs SLS",
        labelIt: "FDM vs SLA vs SLS", labelPt: "FDM vs SLA vs SLS",
      }),
    ],
  },
  {
    labelEn: "Popular",
    labelEs: "Popular",
    labelCa: "Popular",
    items: [
      staticItem("/impresion-3d-sin-pedido-minimo", "From 1 piece", "Desde 1 pieza", "Des d'1 peça", {
        labelDe: "Ab 1 Stück",
        labelFr: "Dès 1 pièce",
        labelNl: "Vanaf 1 stuk",
        labelIt: "Da 1 pezzo",
        labelPt: "A partir de 1 peça",
      }),
      staticItem("/repuesto-descatalogado", "Discontinued Parts", "Repuesto Descatalogado", "Recanvi Descatalogat"),
      staticItem("/adaptador-vesa-monitor", "VESA Monitor Adapter", "Adaptador VESA Monitor", "Adaptador VESA Monitor"),
      staticItem("/embudo-dosificador-cafe-58mm", "Coffee Dosing Funnel", "Embudo Café 58mm", "Embut Cafè 58mm"),
      staticItem("/rueda-cesto-lavavajillas-bosch", "Dishwasher Basket Wheel", "Rueda Lavavajillas Bosch", "Roda Rentaplats Bosch"),
      staticItem("/adaptador-manguera-gardena", "Gardena Hose Adapter", "Adaptador Manguera Gardena", "Adaptador Mànega Gardena"),
    ],
  },
];

// fix-polish §3: pick the per-language slug. Non-es/ca locales never fall
// back to the Spanish slug — if no translated page exists, the English
// slug is used (which is intentional per the §3 spec). Translation of the
// label still happens separately via pickLabel.
export function slugForLang(
  i: Partial<MenuItem> & { slugEn: string; slugEs: string; slugCa: string },
  lang: AnyLang,
): string {
  switch (lang) {
    case "es": return i.slugEs;
    case "ca": return i.slugCa;
    case "de": return i.slugDe ?? i.slugEn;
    case "fr": return i.slugFr ?? i.slugEn;
    case "nl": return i.slugNl ?? i.slugEn;
    case "it": return i.slugIt ?? i.slugEn;
    case "pt": return i.slugPt ?? i.slugEn;
    default: return i.slugEn;
  }
}
