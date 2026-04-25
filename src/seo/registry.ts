import { LandingContent } from "./landingPages";
import { PAGES_EN } from "./landingPages";
import { PAGES_ES } from "./landingPagesEs";

export const ALL_PAGES: LandingContent[] = [...PAGES_EN, ...PAGES_ES];

export const PAGES_BY_SLUG: Record<string, LandingContent> = Object.fromEntries(
  ALL_PAGES.map((p) => [p.slug, p])
);

export const SITE_URL = "https://prints-barcelona-pro.lovable.app";

// Grouped menu (uses EN + ES slugs paired by altSlug). The dropdown shows the
// version that matches the active language, so we expose a function.
export interface MenuGroup {
  labelEn: string;
  labelEs: string;
  items: { slugEn: string; slugEs: string; labelEn: string; labelEs: string }[];
}

export const SERVICES_MENU: MenuGroup[] = [
  {
    labelEn: "Services",
    labelEs: "Servicios",
    items: [
      { slugEn: "/3d-printing-barcelona", slugEs: "/impresion-3d-barcelona", labelEn: "3D Printing in Barcelona", labelEs: "Impresión 3D en Barcelona" },
      { slugEn: "/custom-parts-barcelona", slugEs: "/piezas-personalizadas-3d-barcelona", labelEn: "Custom Parts", labelEs: "Piezas Personalizadas" },
      { slugEn: "/prototype-printing-barcelona", slugEs: "/prototipos-3d-barcelona", labelEn: "Prototype Printing", labelEs: "Prototipos 3D" },
      { slugEn: "/urgent-3d-printing-barcelona", slugEs: "/impresion-3d-urgente-barcelona", labelEn: "Urgent / Express", labelEs: "Impresión Urgente" },
      { slugEn: "/replacement-parts-barcelona", slugEs: "/recambios-impresion-3d-barcelona", labelEn: "Replacement Parts", labelEs: "Recambios 3D" },
      { slugEn: "/3d-printing-price-barcelona", slugEs: "/precio-impresion-3d-barcelona", labelEn: "Pricing", labelEs: "Precios" }
    ]
  },
  {
    labelEn: "Materials",
    labelEs: "Materiales",
    items: [
      { slugEn: "/pla-printing-barcelona", slugEs: "/impresion-pla-barcelona", labelEn: "PLA Printing", labelEs: "Impresión PLA" },
      { slugEn: "/petg-printing-barcelona", slugEs: "/impresion-petg-barcelona", labelEn: "PETG Printing", labelEs: "Impresión PETG" },
      { slugEn: "/tpu-printing-barcelona", slugEs: "/impresion-tpu-barcelona", labelEn: "TPU Flexible", labelEs: "TPU Flexible" }
    ]
  },
  {
    labelEn: "Specialties",
    labelEs: "Especialidades",
    items: [
      { slugEn: "/miniatures-barcelona", slugEs: "/miniaturas-3d-barcelona", labelEn: "Miniatures & Figures", labelEs: "Miniaturas y Figuras" }
    ]
  }
];
