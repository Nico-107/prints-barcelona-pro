import { LandingContent, LandingTopic, Lang } from "./landingPages";
import { PAGES_EN } from "./landingPages";
import { PAGES_ES } from "./landingPagesEs";
import { PAGES_CA } from "./landingPagesCa";
import { PAGES_DE } from "./landingPagesDe";

export const ALL_PAGES: LandingContent[] = [...PAGES_EN, ...PAGES_ES, ...PAGES_CA, ...PAGES_DE];

export const PAGES_BY_SLUG: Record<string, LandingContent> = Object.fromEntries(
  ALL_PAGES.map((p) => [p.slug, p])
);

// Build topic -> { en, es, ca } slug map for hreflang and equivalent-page
// language switching.
type TopicSlugMap = Partial<Record<Lang, string>>;
export const SLUGS_BY_TOPIC: Record<LandingTopic, TopicSlugMap> = ALL_PAGES.reduce(
  (acc, p) => {
    if (!acc[p.topic]) acc[p.topic] = {};
    acc[p.topic]![p.lang] = p.slug;
    return acc;
  },
  {} as Record<LandingTopic, TopicSlugMap>
);

export const SITE_URL = "https://www.dimension3dprints.com";

// Grouped menu — items have all 3 language slugs. The Header picks the right
// one based on the active language.
export interface MenuItem {
  topic?: LandingTopic;
  slugEn: string;
  slugEs: string;
  slugCa: string;
  labelEn: string;
  labelEs: string;
  labelCa: string;
}

export interface MenuGroup {
  labelEn: string;
  labelEs: string;
  labelCa: string;
  items: MenuItem[];
}

const item = (
  topic: LandingTopic,
  labelEn: string,
  labelEs: string,
  labelCa: string
): MenuItem => ({
  topic,
  slugEn: SLUGS_BY_TOPIC[topic].en ?? "/",
  slugEs: SLUGS_BY_TOPIC[topic].es ?? "/",
  slugCa: SLUGS_BY_TOPIC[topic].ca ?? SLUGS_BY_TOPIC[topic].es ?? "/",
  labelEn,
  labelEs,
  labelCa,
});

// Static menu item for pages that live at the same URL in every language
// (e.g. /makers, /maker-guide).
const staticItem = (
  slug: string,
  labelEn: string,
  labelEs: string,
  labelCa: string
): MenuItem => ({
  slugEn: slug,
  slugEs: slug,
  slugCa: slug,
  labelEn,
  labelEs,
  labelCa,
});

export const SERVICES_MENU: MenuGroup[] = [
  {
    labelEn: "Services",
    labelEs: "Servicios",
    labelCa: "Serveis",
    items: [
      item("service-3d-printing", "3D Printing in Barcelona", "Impresión 3D en Barcelona", "Impressió 3D a Barcelona"),
      item("custom-parts", "Custom Parts", "Piezas Personalizadas", "Peces Personalitzades"),
      item("prototypes", "Prototype Printing", "Prototipos 3D", "Prototips 3D"),
      item("urgent", "Urgent / Express", "Impresión Urgente", "Impressió Urgent"),
      item("replacement-parts", "Replacement Parts", "Recambios 3D", "Recanvis 3D"),
      item("pricing", "Pricing", "Precios", "Preus"),
    ],
  },
  {
    labelEn: "Materials",
    labelEs: "Materiales",
    labelCa: "Materials",
    items: [
      item("pla", "PLA Printing", "Impresión PLA", "Impressió PLA"),
      item("petg", "PETG Printing", "Impresión PETG", "Impressió PETG"),
      item("tpu", "TPU Flexible", "TPU Flexible", "TPU Flexible"),
    ],
  },
  {
    labelEn: "For Business",
    labelEs: "Para Empresas",
    labelCa: "Per a Empreses",
    items: [
      item("business", "3D Printing for Business", "Impresión 3D para Empresas", "Impressió 3D per a Empreses"),
      item("rapid-prototyping", "Rapid Prototyping", "Prototipado Rápido", "Prototipatge Ràpid"),
      item("functional-parts", "Functional Parts", "Piezas Funcionales", "Peces Funcionals"),
    ],
  },
  {
    labelEn: "Specialties",
    labelEs: "Especialidades",
    labelCa: "Especialitats",
    items: [
      item("miniatures", "Miniatures & Figures", "Miniaturas y Figuras", "Miniatures i Figures"),
    ],
  },
  {
    labelEn: "Guides",
    labelEs: "Guías",
    labelCa: "Guies",
    items: [
      item("choosing-service", "How to Choose a Service", "Cómo Elegir un Servicio", "Com Triar un Servei"),
      item("materials-guide", "Materials Guide", "Guía de Materiales", "Guia de Materials"),
      item("file-prep", "File Preparation Guide", "Cómo Preparar tu Archivo", "Com Preparar el teu Arxiu"),
      item("best-service", "Best 3D Printing Service", "Mejor Servicio en Barcelona", "Millor Servei a Barcelona"),
    ],
  },
  {
    labelEn: "For Makers",
    labelEs: "Para Makers",
    labelCa: "Per a Makers",
    items: [
      item("maker-income", "Make Money With a 3D Printer", "Ganar Dinero con Impresora 3D", "Guanyar Diners amb Impressora 3D"),
      item("maker-profitability", "Is 3D Printing Profitable?", "¿Es Rentable la Impresión 3D?", "És Rendible la Impressió 3D?"),
      item("maker-customers", "Getting 3D Printing Customers", "Conseguir Clientes de Impresión 3D", "Aconseguir Clients d'Impressió 3D"),
      staticItem("/makers", "Join the Maker Network", "Únete a la Red de Makers", "Uneix-te a la Xarxa de Makers"),
      staticItem("/maker-guide", "Maker Network — How It Works", "Guía del Maker — Cómo Funciona", "Guia del Maker — Com Funciona"),
    ],
  },
];

// Helper to pick the slug for a given language with sensible fallbacks.
export function slugForLang(item: { slugEn: string; slugEs: string; slugCa: string }, lang: Lang): string {
  if (lang === "fr") return item.slugEn; // French pages use English slugs
  if (lang === "ca") return item.slugCa;
  if (lang === "es") return item.slugEs;
  return item.slugEn;
}
