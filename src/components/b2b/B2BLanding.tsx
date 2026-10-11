// Shared B2B landing component used by all three B2B pages (ES/EN/CA).
// All sections from the spec are implemented here; per-language copy lives
// in the CONTENT object below. b2bFacts drives facts blocks.
// Hydration rule: nothing that reads Date/Math.random/window at render time.

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Building2, MessageCircle, ArrowRight, CheckCircle2, Clock,
  Package, RefreshCw, Upload, Layers,
  Wrench, Tag, ChevronRight, Box, Factory, FileCheck, Users, Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { StlEstimator } from "@/components/StlEstimator";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";
import { SITE_URL, SOCIAL_IMAGE_URL, SLUGS_BY_TOPIC } from "@/seo/registry";
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";
import {
  CLIENTS, FREE_SAMPLE, FOUNDER, STATS, CAPABILITIES, TRUST,
} from "@/config/b2bFacts";
import { EST, priceOrder } from "@/lib/estimator/core";
import type { OrderPartInput, PartEstimate } from "@/lib/estimator/core";
import { cn } from "@/lib/utils";
import HeroVisual from "./HeroVisual";

export type B2BLang = "es" | "en" | "ca";

// ---------------------------------------------------------------------------
// Batch price table — computed at module level (deterministic, no hydration
// mismatch). Reference part: 50 g, 0.8 h print time, fits a standard plate.
// ---------------------------------------------------------------------------
const REF_SIZE_MM = 80;
export const BATCH_REF_PART: Omit<PartEstimate, "orientation" | "orientationName"> = {
  plasticCm3: 50 / 1.27,
  supportCm3: 0,
  grams: 50,
  timeSec: 0.8 * 3600,
  fixedSec: 0,
  sizeXMm: REF_SIZE_MM,
  sizeYMm: REF_SIZE_MM,
  heightMm: 40,
  fitsPlate: true,
};
export const BATCH_QUANTITIES = [1, 10, 50, 100, 250] as const;
export const BATCH_MATERIALS = ["PETG", "ASA"] as const;

function batchUnitPriceCents(material: string, qty: number): number {
  const estimate: PartEstimate = {
    ...(BATCH_REF_PART as PartEstimate),
    orientation: 0,
    orientationName: "as uploaded",
    plasticCm3: BATCH_REF_PART.grams / (EST.materials[material]?.density ?? 1.27),
  };
  const input: OrderPartInput = { name: "ref", quantity: qty, material, estimate };
  const order = priceOrder([input], "standard");
  return Math.round(order.baseCents / qty);
}

export type BatchRow = { material: string; prices: number[] };
export const BATCH_TABLE: BatchRow[] = BATCH_MATERIALS.map((mat) => ({
  material: mat,
  prices: BATCH_QUANTITIES.map((q) => batchUnitPriceCents(mat, q)),
}));

// Unit price for 50 units of ASA — pre-computed for HeroVisual
export const ASA_50_UNIT_CENTS: number = (() => {
  const row = BATCH_TABLE.find((r) => r.material === "ASA");
  const qi = BATCH_QUANTITIES.indexOf(50 as typeof BATCH_QUANTITIES[number]);
  return row ? row.prices[qi] : 0;
})();

// Confirmed logos: permission confirmed + canName + has logo file
const CONFIRMED_LOGOS = CLIENTS.filter(
  (c) => c.permission === "confirmed" && c.canName && c.logoSrc
);
const SHOW_LOGO_ROW = CONFIRMED_LOGOS.length >= 3;

// Named confirmed clients first, anonymous after (for the descriptor cards)
const ORDERED_CLIENTS = [
  ...CLIENTS.filter((c) => c.canName && c.permission === "confirmed"),
  ...CLIENTS.filter((c) => !(c.canName && c.permission === "confirmed")),
];

// ---------------------------------------------------------------------------
// Per-language copy
// ---------------------------------------------------------------------------
interface B2BCopy {
  lang: B2BLang;
  htmlLang: string;
  canonicalPath: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  heroPromise: string;
  heroSub: string;
  ctaPrimary: string;
  ctaWhatsApp: string;
  ctaSubline: string;
  heroSampleLine: string;
  trustItems: string[];
  // logos section (Change 1)
  logosHeading: string;
  logosSubline: string;
  // hero visual (Change 2)
  heroVisualAriaTitle: string;
  heroVisualAriaDesc: string;
  heroVisualExampleLabel: string;
  heroVisualStatusLabel: string;
  heroVisualStepLabels: [string, string, string, string];
  heroVisualDataLabels: { price: string; delivery: string; quote: string; note: string };
  heroVisualOrderLabel: string;
  // proof bar (Change 4)
  proofBarOrdersLabel: string;
  proofBarQuoteLabel: string;
  proofBarDeliveryLabel: string;
  proofBarMinOrderLabel: string;
  proofBarMonthlyLine: string;
  // existing
  sectionProof: string;
  sectionProofAnon: string;
  sectionFreeSample: string;
  freeSampleCta: string;
  sectionWhatWeMake: string;
  sectionScale: string;
  sectionBatchTable: string;
  batchTableLabel: string;
  sectionMaterials: string;
  sectionProcess: string;
  sectionCalculator: string;
  // how we work strip (Change 5)
  howWeWorkTitle: string;
  howWeWorkItems: [string, string, string];
  sectionFaq: string;
  sectionCta: string;
  ctaFinalLine: string;
  ctaFinalSub: string;
  whatWeMakeCards: Array<{ title: string; example: string; material: string; time: string }>;
  processSteps: Array<{ title: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
  materialLinks: { label: string; href: string; desc: string }[];
  breadcrumbHome: string;
  breadcrumbBusiness: string;
  supportLabel: string;
  relatedLinks: Array<{ label: string; href: string }>;
  whatsAppMsg: string;
  whatsAppSampleMsg: string;
}

const CONTENT: Record<B2BLang, B2BCopy> = {
  es: {
    lang: "es",
    htmlLang: "es",
    canonicalPath: "/impresion-3d-empresas-barcelona",
    metaTitle: "Impresión 3D para Empresas en Barcelona — Presupuesto en 1 h | Dimension3D",
    metaDesc: "Impresión 3D para empresas en Barcelona: piezas funcionales, prototipos, recambios y tiradas cortas. Desde €10, sin tarifa de configuración. Presupuesto en 1 hora. Factura para empresas. NDA disponible.",
    h1: "Impresión 3D para Empresas en Barcelona",
    heroPromise: "Más de 250 pedidos completados. Piezas listas en 2–5 días, presupuesto en 1 hora.",
    heroSub: "Sin tarifa de configuración. Pedido mínimo 10 €. Factura para empresas. NDA disponible. Soporte en ES · CA · EN · DE · PL.",
    ctaPrimary: "Sube tu archivo y ve el precio",
    ctaWhatsApp: "Escríbenos por WhatsApp",
    ctaSubline: "Sin cuenta. Presupuesto en menos de 1 hora.",
    heroSampleLine: "Primera pieza de muestra gratis para empresas con proyecto real.",
    trustItems: [
      "NDA disponible",
      "Factura para empresas",
      "Soporte ES · CA · EN · DE · PL",
    ],
    logosHeading: "Empresas de Barcelona que ya han producido con nosotros",
    logosSubline: "Intercruises, Cultural Habits, GS Bikes y nuestro socio de impresión local Lemon Printers.",
    heroVisualAriaTitle: "Ejemplo de pedido de impresión 3D para empresas — Dimension3D Barcelona",
    heroVisualAriaDesc: "Visualización de ejemplo de un pedido de impresión 3D para empresas: placa con 24 piezas, proceso de producción y precio indicativo.",
    heroVisualExampleLabel: "Ejemplo",
    heroVisualStatusLabel: "En producción",
    heroVisualStepLabels: ["Archivo", "Presupuesto 1h", "Impresión", "Entrega"],
    heroVisualDataLabels: { price: "Precio/ud (50 pcs, ASA)", delivery: "Plazo de entrega", quote: "Tiempo de presupuesto", note: "Indicativo, pieza de 50 g" },
    heroVisualOrderLabel: "PEDIDO / ORDER · SAMPLE",
    proofBarOrdersLabel: "pedidos completados",
    proofBarQuoteLabel: "tiempo de presupuesto",
    proofBarDeliveryLabel: "entrega estándar",
    proofBarMinOrderLabel: "pedido mínimo",
    proofBarMonthlyLine: "30+ pedidos al mes actualmente",
    sectionProof: "Empresas con las que trabajamos",
    sectionProofAnon: "Proyectos recientes para empresas de Barcelona, un municipio y talleres locales de impresión.",
    sectionFreeSample: "Prototipo gratis para empresas",
    freeSampleCta: "Pide tu prototipo gratis",
    sectionWhatWeMake: "Qué fabricamos para empresas",
    sectionScale: "De un prototipo a cientos de unidades",
    sectionBatchTable: "Precio de referencia por unidad (pieza de 50 g, PETG / ASA)",
    batchTableLabel: "Indicativo para una pieza de 50 g. Tu archivo obtiene un precio exacto en la calculadora.",
    sectionMaterials: "Materiales disponibles",
    sectionProcess: "Cómo funciona",
    sectionCalculator: "Precio instantáneo",
    howWeWorkTitle: "Cómo trabajamos con empresas",
    howWeWorkItems: [
      "Cola de producción prioritaria para pedidos de empresa",
      "Archivos y parámetros guardados para reencargos inmediatos",
      "Factura para empresas en todos los pedidos",
    ],
    sectionFaq: "Preguntas frecuentes sobre impresión 3D para empresas",
    sectionCta: "Envíanos tu archivo o tu plano.",
    ctaFinalLine: "Primer presupuesto en menos de 1 hora.",
    ctaFinalSub: "Sin tarifas de configuración. Sin pedidos mínimos absurdos. Con factura.",
    whatWeMakeCards: [
      { title: "Prototipos funcionales", example: "Validación de forma y ensamblaje antes de fabricación en serie", material: "PLA, PETG, ABS", time: "24–72 h" },
      { title: "Utillaje y jigs", example: "Plantillas de taladrado, casquillos, guías de ensamblaje", material: "PETG, ABS, Nylon", time: "2–4 días" },
      { title: "Carcasas y electrónica", example: "Cajas para PCB, carcasas de sensor, soportes de montaje", material: "PETG, ASA, ABS", time: "2–4 días" },
      { title: "Recambios y descatalogados", example: "Piezas que el fabricante ya no vende", material: "PETG, ABS, Nylon", time: "2–5 días" },
      { title: "Piezas de marca y eventos", example: "Expositores, trofeos, artículos promocionales personalizados", material: "PLA, PETG", time: "2–4 días" },
      { title: "Tiradas de producción", example: "Lotes repetitivos de piezas técnicas idénticas", material: "PETG, ASA, Nylon", time: "5–10 días" },
    ],
    processSteps: [
      { title: "Envía tu STL, STEP o dibujo", body: "Sube el archivo al calculador o envíalo por WhatsApp. Aceptamos STL, STEP, IGES, OBJ y 3MF. Si solo tienes un dibujo o una foto de la pieza rota, también podemos trabajar con eso." },
      { title: "Presupuesto en 1 hora (o precio instantáneo)", body: "Las piezas con precio automático te dan un precio al instante. Para piezas más complejas, revisamos el archivo manualmente y respondemos en menos de 1 hora en horario laboral." },
      { title: "Impresión y control de calidad", body: "Imprimimos en nuestra Bambu Lab X2D con cámara cerrada y cámara climatizada. Cada pieza se revisa antes de salir del taller." },
      { title: "Entrega en Barcelona o envío", body: "Recogida en taller con cita previa. Envío a domicilio desde €5,90 a España y la UE. La mayoría de pedidos listos en 2–5 días laborables; urgente en 24–48 h (con recargo)." },
    ],
    faqs: [
      { q: "¿Cuál es el pedido mínimo para empresas?", a: "El pedido mínimo es de 10€. No hay tarifa de configuración. Desde una sola pieza, sin burocracia." },
      { q: "¿Cuánto cuesta el servicio urgente?", a: "El servicio express (24–48 h) tiene un recargo del 25% sobre el precio base. El servicio urgente (24 h) tiene un recargo del 60%. El precio estándar es sin recargo y cubre la mayoría de proyectos empresariales en 2–5 días laborables." },
      { q: "¿Firmáis NDA o acuerdo de confidencialidad?", a: "Sí. Firmamos NDA para cualquier proyecto que lo requiera. Tus archivos y diseños nunca se comparten con terceros." },
      { q: "¿Emitís factura para empresas?", a: "Sí. Emitimos factura para todos los pedidos de empresa. Facilítanos el nombre de tu empresa al hacer el pedido." },
      { q: "¿Cuántas piezas podéis fabricar en una tirada?", a: "Fabricamos desde 1 hasta varios cientos de unidades. El precio por unidad baja con la cantidad. Para lotes de más de 50 unidades, pide presupuesto por tramos." },
      { q: "¿Qué tolerancias podéis mantener?", a: "La precisión típica de impresión FDM es ±0,2 mm. Para características de mayor precisión ajustamos los parámetros. Dinos el requisito en el presupuesto." },
      { q: "¿Guardáis los archivos para reencargos?", a: "Sí. Una vez validada la pieza, guardamos el archivo y los parámetros de impresión. Los reencargos se preparan en minutos." },
      { q: "¿Qué formatos de archivo aceptáis?", a: "STL, STEP, IGES, OBJ y 3MF. Exportaciones directas de SolidWorks, Fusion 360, Onshape, FreeCAD y CATIA funcionan sin conversión." },
      { q: "¿Se puede hacer recogida en el taller?", a: "Sí, con cita previa en Barcelona. El envío por mensajería está disponible desde €5,90." },
    ],
    materialLinks: [
      { label: "PLA", href: "/impresion-pla-barcelona", desc: "Prototipos y piezas de baja carga" },
      { label: "PETG", href: "/impresion-petg-barcelona", desc: "Piezas funcionales y exteriores" },
      { label: "ASA", href: "/3d-printing-materials-comparison#asa", desc: "Alta temperatura, UV, exterior" },
      { label: "ABS", href: "/3d-printing-materials-comparison#abs", desc: "Resistente al calor, mecanizable" },
      { label: "TPU", href: "/impresion-tpu-barcelona", desc: "Flexible, juntas, fundas" },
      { label: "Nylon", href: "/3d-printing-materials-comparison#nylon", desc: "Alta carga mecánica, desgaste" },
    ],
    breadcrumbHome: "Inicio",
    breadcrumbBusiness: "Para empresas",
    supportLabel: "Soporte en ES · CA · EN · DE · PL",
    relatedLinks: [
      { label: "Prototipado rápido en Barcelona", href: "/prototipado-rapido-barcelona" },
      { label: "Comparativa de materiales", href: "/comparativa-materiales-impresion-3d" },
      { label: "Verificador de archivo 3D", href: "/verificador-archivo-3d" },
      { label: "Lemon Printers — socio local", href: "/lemon" },
    ],
    whatsAppMsg: "Hola, me interesa el servicio de impresión 3D para mi empresa. Me gustaría hablar de un proyecto.",
    whatsAppSampleMsg: "Hola, me gustaría solicitar el prototipo de muestra gratuito para mi empresa. Tenemos un proyecto real en marcha.",
  },
  en: {
    lang: "en",
    htmlLang: "en",
    canonicalPath: "/3d-printing-for-business-barcelona",
    metaTitle: "3D Printing for Business in Barcelona — Quote in 1 h | Dimension3D",
    metaDesc: "3D printing for companies in Barcelona: functional parts, prototypes, replacement parts and short production runs. From €10, no setup fee. Quote in 1 hour. Invoice for companies. NDA available.",
    h1: "3D Printing for Business in Barcelona",
    heroPromise: "250+ orders completed. Production-grade parts quoted in 1 hour, delivered in 2–5 days.",
    heroSub: "No setup fee. €10 minimum order. Invoice for companies. NDA available. Support in ES · CA · EN · DE · PL.",
    ctaPrimary: "Upload your file, see your price",
    ctaWhatsApp: "Message us on WhatsApp",
    ctaSubline: "No account needed. Quote within 1 hour.",
    heroSampleLine: "Free prototype part for companies with a real project.",
    trustItems: [
      "NDA available",
      "Invoice for companies",
      "Support ES · CA · EN · DE · PL",
    ],
    logosHeading: "Barcelona companies that have already produced with us",
    logosSubline: "Intercruises, Cultural Habits, GS Bikes and our print-shop partner Lemon Printers.",
    heroVisualAriaTitle: "Example 3D print business order — Dimension3D Barcelona",
    heroVisualAriaDesc: "Illustration of an example 3D printing business order: a print plate with 24 parts, production progress and indicative pricing.",
    heroVisualExampleLabel: "Example",
    heroVisualStatusLabel: "In production",
    heroVisualStepLabels: ["File", "Quote 1 h", "Print", "Delivery"],
    heroVisualDataLabels: { price: "Unit price (50 pcs, ASA)", delivery: "Lead time", quote: "Quote time", note: "Indicative, 50 g part" },
    heroVisualOrderLabel: "ORDER / PEDIDO · SAMPLE",
    proofBarOrdersLabel: "completed orders",
    proofBarQuoteLabel: "quote time",
    proofBarDeliveryLabel: "standard delivery",
    proofBarMinOrderLabel: "minimum order",
    proofBarMonthlyLine: "30+ orders a month at the moment",
    sectionProof: "Companies we work with",
    sectionProofAnon: "Recent projects for Barcelona companies, a municipality and local print shops.",
    sectionFreeSample: "Free prototype for companies",
    freeSampleCta: "Request your free prototype",
    sectionWhatWeMake: "What we make for companies",
    sectionScale: "From one prototype to hundreds of units",
    sectionBatchTable: "Indicative per-unit price (50 g part, PETG / ASA)",
    batchTableLabel: "Indicative for a 50 g part. Your file gets an exact price in the calculator.",
    sectionMaterials: "Materials available",
    sectionProcess: "How it works",
    sectionCalculator: "Instant price",
    howWeWorkTitle: "How we work with companies",
    howWeWorkItems: [
      "Priority production queue for business clients",
      "Files and parameters saved for instant repeat orders",
      "Invoice issued for all business orders",
    ],
    sectionFaq: "Frequently asked questions about 3D printing for business",
    sectionCta: "Send us your file or your drawing.",
    ctaFinalLine: "First quote within 1 hour.",
    ctaFinalSub: "No setup fee. No absurd minimums. With invoice.",
    whatWeMakeCards: [
      { title: "Functional prototypes", example: "Form-fit and assembly validation before series production", material: "PLA, PETG, ABS", time: "24–72 h" },
      { title: "Jigs & fixtures", example: "Drilling templates, bushings, assembly guides", material: "PETG, ABS, Nylon", time: "2–4 days" },
      { title: "Enclosures & housings", example: "PCB boxes, sensor housings, mounting brackets", material: "PETG, ASA, ABS", time: "2–4 days" },
      { title: "Spare & discontinued parts", example: "Parts the original manufacturer no longer sells", material: "PETG, ABS, Nylon", time: "2–5 days" },
      { title: "Branded & event pieces", example: "Displays, trophies, custom promotional items", material: "PLA, PETG", time: "2–4 days" },
      { title: "Series production", example: "Repeat batches of identical technical parts", material: "PETG, ASA, Nylon", time: "5–10 days" },
    ],
    processSteps: [
      { title: "Send your STL, STEP or drawing", body: "Upload the file to the calculator or send it via WhatsApp. We accept STL, STEP, IGES, OBJ and 3MF. If you only have a drawing or a photo of the broken part, we can work with that too." },
      { title: "Quote in 1 hour (or instant price)", body: "Parts with automatic pricing get an instant price. For more complex parts, we review the file manually and reply within 1 hour during business hours." },
      { title: "Print & quality check", body: "We print on our Bambu Lab X2D with enclosed, heated chamber. Every part is checked before leaving the workshop." },
      { title: "Delivery in Barcelona or shipping", body: "Local pickup by appointment in Barcelona. Shipping from €5.90 to Spain and the EU. Most orders ready in 2–5 business days; urgent in 24–48 h (surcharge applies)." },
    ],
    faqs: [
      { q: "What is the minimum order for business customers?", a: "The minimum order is €10. No setup fee. From a single part, no overhead." },
      { q: "How much does the urgent service cost?", a: "Express service (24–48 h) carries a 25% surcharge on the base price. Urgent service (24 h) carries a 60% surcharge. Standard price has no surcharge and covers most business projects in 2–5 business days." },
      { q: "Do you sign NDAs?", a: "Yes. We sign NDAs for any project that requires it. Your files and designs are never shared with third parties." },
      { q: "Do you issue invoices for companies?", a: "Yes. We issue invoices for all business orders. Provide your company name when placing the order." },
      { q: "How many parts can you produce in a run?", a: "From 1 to several hundred units. Per-unit price drops with quantity. For batches above 50 units, ask for a tiered quote." },
      { q: "What tolerances can you hold?", a: "Typical FDM accuracy is ±0.2 mm. For tighter features we adjust parameters. State your requirement in the quote request." },
      { q: "Do you keep files for repeat orders?", a: "Yes. Once a part is validated, we keep the file and print parameters. Repeat orders are set up in minutes." },
      { q: "Which file formats do you accept?", a: "STL, STEP, IGES, OBJ and 3MF. Direct exports from SolidWorks, Fusion 360, Onshape, FreeCAD and CATIA work without conversion." },
      { q: "Is local pickup available?", a: "Yes, by appointment in Barcelona. Courier shipping is available from €5.90." },
    ],
    materialLinks: [
      { label: "PLA", href: "/pla-printing-barcelona", desc: "Prototypes and low-stress parts" },
      { label: "PETG", href: "/petg-printing-barcelona", desc: "Functional and outdoor parts" },
      { label: "ASA", href: "/3d-printing-materials-comparison#asa", desc: "High temp, UV, outdoor" },
      { label: "ABS", href: "/3d-printing-materials-comparison#abs", desc: "Heat-resistant, machinable" },
      { label: "TPU", href: "/tpu-printing-barcelona", desc: "Flexible, gaskets, covers" },
      { label: "Nylon", href: "/3d-printing-materials-comparison#nylon", desc: "High mechanical load, wear" },
    ],
    breadcrumbHome: "Home",
    breadcrumbBusiness: "For business",
    supportLabel: "Support in ES · CA · EN · DE · PL",
    relatedLinks: [
      { label: "Rapid prototyping in Barcelona", href: "/rapid-prototyping-barcelona" },
      { label: "Materials comparison", href: "/3d-printing-materials-comparison" },
      { label: "3D file checker", href: "/3d-file-checker" },
      { label: "Lemon Printers — local partner", href: "/lemon" },
    ],
    whatsAppMsg: "Hi, I'm interested in 3D printing services for my business. I'd like to discuss a project.",
    whatsAppSampleMsg: "Hi, I'd like to request the free prototype sample for my company. We have a real project in progress.",
  },
  ca: {
    lang: "ca",
    htmlLang: "ca",
    canonicalPath: "/ca/impressio-3d-empreses-barcelona",
    metaTitle: "Impressió 3D per a Empreses a Barcelona — Pressupost en 1 h | Dimension3D",
    metaDesc: "Impressió 3D per a empreses a Barcelona: peces funcionals, prototips, recanvis i tirades curtes. Des de €10, sense tarifa de configuració. Pressupost en 1 hora. Factura per a empreses. NDA disponible.",
    h1: "Impressió 3D per a Empreses a Barcelona",
    heroPromise: "Més de 250 comandes completades. Peces llestes en 2–5 dies, pressupost en 1 hora.",
    heroSub: "Sense tarifa de configuració. Comanda mínima 10 €. Factura per a empreses. NDA disponible. Suport en ES · CA · EN · DE · PL.",
    ctaPrimary: "Puja el teu arxiu i veu el preu",
    ctaWhatsApp: "Escriu-nos per WhatsApp",
    ctaSubline: "Sense compte. Pressupost en menys d'1 hora.",
    heroSampleLine: "Primera peça de mostra gratuïta per a empreses amb projecte real.",
    trustItems: [
      "NDA disponible",
      "Factura per a empreses",
      "Suport ES · CA · EN · DE · PL",
    ],
    logosHeading: "Empreses de Barcelona que ja han produït amb nosaltres",
    logosSubline: "Intercruises, Cultural Habits, GS Bikes i el nostre soci d'impressió local Lemon Printers.",
    heroVisualAriaTitle: "Exemple de comanda d'impressió 3D per a empreses — Dimension3D Barcelona",
    heroVisualAriaDesc: "Il·lustració d'exemple d'una comanda d'impressió 3D per a empreses: placa amb 24 peces, procés de producció i preu indicatiu.",
    heroVisualExampleLabel: "Exemple",
    heroVisualStatusLabel: "En producció",
    heroVisualStepLabels: ["Arxiu", "Pressupost 1h", "Impressió", "Lliurament"],
    heroVisualDataLabels: { price: "Preu/u (50 pcs, ASA)", delivery: "Termini de lliurament", quote: "Temps de pressupost", note: "Indicatiu, peça de 50 g" },
    heroVisualOrderLabel: "COMANDA / ORDER · SAMPLE",
    proofBarOrdersLabel: "comandes completades",
    proofBarQuoteLabel: "temps de pressupost",
    proofBarDeliveryLabel: "lliurament estàndard",
    proofBarMinOrderLabel: "comanda mínima",
    proofBarMonthlyLine: "30+ comandes al mes ara",
    sectionProof: "Empreses amb les quals treballem",
    sectionProofAnon: "Projectes recents per a empreses de Barcelona, un municipi i tallers locals d'impressió.",
    sectionFreeSample: "Prototip gratuït per a empreses",
    freeSampleCta: "Demana el teu prototip gratis",
    sectionWhatWeMake: "Què fabriquem per a empreses",
    sectionScale: "D'un prototip a centenars d'unitats",
    sectionBatchTable: "Preu de referència per unitat (peça de 50 g, PETG / ASA)",
    batchTableLabel: "Indicatiu per a una peça de 50 g. El teu arxiu obté un preu exacte a la calculadora.",
    sectionMaterials: "Materials disponibles",
    sectionProcess: "Com funciona",
    sectionCalculator: "Preu instantani",
    howWeWorkTitle: "Com treballem amb empreses",
    howWeWorkItems: [
      "Cua de producció prioritària per a comandes d'empresa",
      "Arxius i paràmetres guardats per a recomandes immediates",
      "Factura per a empreses en totes les comandes",
    ],
    sectionFaq: "Preguntes freqüents sobre impressió 3D per a empreses",
    sectionCta: "Envia'ns el teu arxiu o el teu plànol.",
    ctaFinalLine: "Primer pressupost en menys d'1 hora.",
    ctaFinalSub: "Sense tarifes de configuració. Sense comandes mínimes absurdes. Amb factura.",
    whatWeMakeCards: [
      { title: "Prototips funcionals", example: "Validació de forma i acoblament abans de fabricació en sèrie", material: "PLA, PETG, ABS", time: "24–72 h" },
      { title: "Utillatge i jigs", example: "Plantilles de perforació, casquets, guies d'acoblament", material: "PETG, ABS, Nylon", time: "2–4 dies" },
      { title: "Carcasses i electrònica", example: "Caixes per a PCB, carcasses de sensor, suports de muntatge", material: "PETG, ASA, ABS", time: "2–4 dies" },
      { title: "Recanvis i descatalogats", example: "Peces que el fabricant ja no ven", material: "PETG, ABS, Nylon", time: "2–5 dies" },
      { title: "Peces de marca i esdeveniments", example: "Expositors, trofeus, articles promocionals personalitzats", material: "PLA, PETG", time: "2–4 dies" },
      { title: "Tirades de producció", example: "Lots repetitius de peces tècniques idèntiques", material: "PETG, ASA, Nylon", time: "5–10 dies" },
    ],
    processSteps: [
      { title: "Envia el teu STL, STEP o plànol", body: "Puja l'arxiu a la calculadora o envia'l per WhatsApp. Acceptem STL, STEP, IGES, OBJ i 3MF. Si només tens un plànol o una foto de la peça trencada, també podem treballar-hi." },
      { title: "Pressupost en 1 hora (o preu instantani)", body: "Les peces amb preu automàtic obtenen un preu al moment. Per a peces més complexes, revisem l'arxiu manualment i responem en menys d'1 hora en horari laboral." },
      { title: "Impressió i control de qualitat", body: "Imprimim a la nostra Bambu Lab X2D amb cambra tancada i climatitzada. Cada peça es revisa abans de sortir del taller." },
      { title: "Lliurament a Barcelona o enviament", body: "Recollida al taller amb cita prèvia a Barcelona. Enviament des de 5,90€ a Espanya i la UE. La majoria de comandes llestes en 2–5 dies laborables; urgent en 24–48 h (amb recàrrec)." },
    ],
    faqs: [
      { q: "Quina és la comanda mínima per a empreses?", a: "La comanda mínima és de 10€. Sense tarifa de configuració. Des d'una sola peça, sense burocràcia." },
      { q: "Quant costa el servei urgent?", a: "El servei express (24–48 h) té un recàrrec del 25% sobre el preu base. El servei urgent (24 h) té un recàrrec del 60%. El preu estàndard no té recàrrec i cobreix la majoria de projectes empresarials en 2–5 dies laborables." },
      { q: "Signeu NDA o acord de confidencialitat?", a: "Sí. Signem NDA per a qualsevol projecte que ho requereixi. Els teus arxius i dissenys mai es comparteixen amb tercers." },
      { q: "Emeteu factura per a empreses?", a: "Sí. Emetem factura per a totes les comandes d'empresa. Facilita'ns el nom de la teva empresa en fer la comanda." },
      { q: "Quantes peces podeu fabricar en una tirada?", a: "Des d'1 fins a diversos centenars d'unitats. El preu per unitat baixa amb la quantitat. Per a lots de més de 50 unitats, demana pressupost per trams." },
      { q: "Quines toleràncies podeu mantenir?", a: "La precisió típica d'impressió FDM és ±0,2 mm. Per a característiques de major precisió ajustem els paràmetres. Indica'ns el requisit en el pressupost." },
      { q: "Guardeu els arxius per a recomandes?", a: "Sí. Un cop validada la peça, guardem l'arxiu i els paràmetres d'impressió. Les recomandes es preparen en minuts." },
      { q: "Quins formats d'arxiu accepteu?", a: "STL, STEP, IGES, OBJ i 3MF. Les exportacions directes de SolidWorks, Fusion 360, Onshape, FreeCAD i CATIA funcionen sense conversió." },
      { q: "Es pot fer recollida al taller?", a: "Sí, amb cita prèvia a Barcelona. L'enviament per missatgeria està disponible des de 5,90€." },
    ],
    materialLinks: [
      { label: "PLA", href: "/ca/impressio-pla-barcelona", desc: "Prototips i peces de baixa càrrega" },
      { label: "PETG", href: "/ca/impressio-petg-barcelona", desc: "Peces funcionals i exteriors" },
      { label: "ASA", href: "/3d-printing-materials-comparison#asa", desc: "Alta temperatura, UV, exterior" },
      { label: "ABS", href: "/3d-printing-materials-comparison#abs", desc: "Resistent a la calor, mecanitzable" },
      { label: "TPU", href: "/ca/impressio-tpu-barcelona", desc: "Flexible, juntes, fundes" },
      { label: "Nylon", href: "/3d-printing-materials-comparison#nylon", desc: "Alta càrrega mecànica, desgast" },
    ],
    breadcrumbHome: "Inici",
    breadcrumbBusiness: "Per a empreses",
    supportLabel: "Suport en ES · CA · EN · DE · PL",
    relatedLinks: [
      { label: "Prototipatge ràpid a Barcelona", href: "/ca/prototipatge-rapid-barcelona" },
      { label: "Comparativa de materials", href: "/3d-printing-materials-comparison" },
      { label: "Comprovador d'arxiu 3D", href: "/comprovador-arxiu-3d" },
      { label: "Lemon Printers — soci local", href: "/lemon" },
    ],
    whatsAppMsg: "Hola, m'interessa el servei d'impressió 3D per a la meva empresa. M'agradaria parlar d'un projecte.",
    whatsAppSampleMsg: "Hola, voldria sol·licitar el prototip de mostra gratuït per a la meva empresa. Tenim un projecte real en marcha.",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface Props {
  lang: B2BLang;
  showLaunchBanner?: boolean;
}

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const B2BLanding = ({ lang, showLaunchBanner = false }: Props) => {
  const c = CONTENT[lang];
  const endRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // 75% page read tracking
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          capture("page_read_75pct", { page: `b2b-${lang}` });
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lang]);

  // Sticky CTA bar — visible after hero scrolls out, hidden when calc is in view
  const [heroInView, setHeroInView] = useState(true);
  const [calcInView, setCalcInView] = useState(false);
  const stickyBarVisible = !heroInView && !calcInView;

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const heroObs = new IntersectionObserver(
      ([e]) => setHeroInView(e.isIntersecting),
      { threshold: 0 }
    );
    heroObs.observe(heroEl);

    const calcEl = document.getElementById("calculator");
    const calcObs = calcEl
      ? new IntersectionObserver(
          ([e]) => setCalcInView(e.isIntersecting),
          { threshold: 0 }
        )
      : null;
    if (calcEl && calcObs) calcObs.observe(calcEl);

    return () => {
      heroObs.disconnect();
      calcObs?.disconnect();
    };
  }, [lang]);

  const topicSlugs = SLUGS_BY_TOPIC["business"] ?? {};
  const canonical = `${SITE_URL}${c.canonicalPath}`;

  const handleWhatsApp = (msg: string) => {
    capture("b2b_cta_whatsapp_click", { lang });
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const scrollToCalc = () => {
    capture("b2b_cta_primary_click", { lang });
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSampleWhatsApp = () => {
    capture("b2b_free_prototype_click", { lang });
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(c.whatsAppSampleMsg)}`, "_blank");
  };

  // Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: c.breadcrumbHome, item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: c.breadcrumbBusiness, item: canonical },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: c.h1,
    url: canonical,
    provider: { "@type": "LocalBusiness", "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "City", name: "Barcelona" },
      { "@type": "Country", name: "Spain" },
      { "@type": "Place", name: "Europe" },
    ],
    description: c.metaDesc,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: lang === "es" ? "Servicios de impresión 3D para empresas" : lang === "ca" ? "Serveis d'impressió 3D per a empreses" : "3D printing services for business",
      itemListElement: c.whatWeMakeCards.map((card) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: card.title, description: card.example },
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: c.metaTitle,
    description: c.metaDesc,
    url: canonical,
    author: AUTHOR_REF,
    publisher: PUBLISHER_REF,
    inLanguage: c.htmlLang,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    breadcrumb: breadcrumbSchema,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={c.htmlLang} />
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDesc} />
        <link rel="canonical" href={canonical} />
        {topicSlugs.en && <link rel="alternate" hrefLang="en" href={`${SITE_URL}${topicSlugs.en}`} />}
        {topicSlugs.es && <link rel="alternate" hrefLang="es" href={`${SITE_URL}${topicSlugs.es}`} />}
        {topicSlugs.ca && <link rel="alternate" hrefLang="ca" href={`${SITE_URL}${topicSlugs.ca}`} />}
        {topicSlugs.en && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${topicSlugs.en}`} />}
        <meta property="og:title" content={c.metaTitle} />
        <meta property="og:description" content={c.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content={c.metaTitle} />
        <meta name="twitter:description" content={c.metaDesc} />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      {showLaunchBanner && <LaunchOfferBanner />}
      <Header />

      <main className="pt-16">

        {/* ── 1. HERO ── */}
        <section ref={heroRef} className="hero-gradient py-14 md:py-20">
          <div className="container px-4 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <nav aria-label="breadcrumb" className="flex items-center gap-2 text-xs text-primary-foreground/50 mb-4">
                  <Link to="/" className="hover:text-primary-foreground/80 transition-colors">{c.breadcrumbHome}</Link>
                  <span>/</span>
                  <span className="text-primary-foreground/70">{c.breadcrumbBusiness}</span>
                </nav>
                <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest mb-4">
                  <Building2 className="w-3 h-3" aria-hidden="true" />
                  {c.breadcrumbBusiness}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground leading-tight mb-4">
                  {c.h1}
                </h1>
                <p className="text-base md:text-lg text-primary-foreground/90 font-medium mb-2">
                  {c.heroPromise}
                </p>
                <p className="text-sm text-primary-foreground/70 mb-6">
                  {c.heroSub}
                </p>
                <div className="flex flex-wrap gap-3 mb-3">
                  <Button
                    onClick={scrollToCalc}
                    variant="cta"
                    className="gap-2 min-h-[52px] px-7 text-base font-semibold"
                  >
                    <Upload className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {c.ctaPrimary}
                    <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  </Button>
                  <Button
                    onClick={() => handleWhatsApp(c.whatsAppMsg)}
                    variant="whatsapp"
                    className="gap-2 min-h-[52px] px-7 text-base font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    {c.ctaWhatsApp}
                  </Button>
                </div>
                <p className="text-sm text-primary-foreground/50">{c.ctaSubline}</p>
              </div>

              {/* Hero visual — stacks below buttons on mobile, right column on desktop */}
              <div className="flex items-center justify-center mt-6 md:mt-0">
                <HeroVisual
                  lang={lang}
                  unitPrice50ASACents={ASA_50_UNIT_CENTS}
                  ariaTitle={c.heroVisualAriaTitle}
                  ariaDesc={c.heroVisualAriaDesc}
                  exampleLabel={c.heroVisualExampleLabel}
                  statusLabel={c.heroVisualStatusLabel}
                  stepLabels={c.heroVisualStepLabels}
                  dataLabels={c.heroVisualDataLabels}
                  orderLabel={c.heroVisualOrderLabel}
                  className="w-full max-w-[480px] md:max-w-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. PROOF BAR (replaces thin trust bar) ── */}
        <section className="bg-secondary/20 border-y border-border/40 py-8 md:py-10">
          <div className="container px-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {STATS.totalOrders && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-accent tabular-nums leading-none">
                    {STATS.totalOrders}
                  </p>
                  <p className="text-sm font-medium text-foreground/80 mt-1">{c.proofBarOrdersLabel}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{STATS.totalOrdersPeriod[lang]}</p>
                </div>
              )}
              {STATS.responseTime && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-accent tabular-nums leading-none">
                    {STATS.responseTime}
                  </p>
                  <p className="text-sm font-medium text-foreground/80 mt-1">{c.proofBarQuoteLabel}</p>
                </div>
              )}
              {STATS.leadTimeDays && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-accent tabular-nums leading-none">
                    {STATS.leadTimeDays}
                    <span className="text-2xl font-semibold ml-1">
                      {lang === "es" ? "días" : lang === "ca" ? "dies" : "days"}
                    </span>
                  </p>
                  <p className="text-sm font-medium text-foreground/80 mt-1">{c.proofBarDeliveryLabel}</p>
                </div>
              )}
              {STATS.minOrderEur !== null && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-accent tabular-nums leading-none">
                    {lang === "en" ? `€${STATS.minOrderEur}` : `${STATS.minOrderEur} €`}
                  </p>
                  <p className="text-sm font-medium text-foreground/80 mt-1">{c.proofBarMinOrderLabel}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-3">
              {STATS.ordersPerMonth && (
                <p className="text-sm text-foreground/70 font-medium">{c.proofBarMonthlyLine}</p>
              )}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                {c.trustItems.map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-foreground/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent/70 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. PROOF ── */}
        <section className="py-14 md:py-20 container px-4 max-w-4xl mx-auto">
          {SHOW_LOGO_ROW ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
                {c.logosHeading}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8">{c.logosSubline}</p>

              {/* Logo tiles: full colour, fixed size, clear proof */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {CONFIRMED_LOGOS.map((client) => {
                  const isSquare = client.key === "lemon-printers" || client.key === "cultural-habits";
                  const hasLink = !!(client.website || client.instagram);
                  const href = client.website ?? client.instagram;
                  const isExternal = href?.startsWith("http");
                  const badgeLabel = client.badge === "partner"
                    ? (lang === "es" ? "Socio" : lang === "ca" ? "Soci" : "Partner")
                    : (lang === "es" ? "Cliente" : lang === "ca" ? "Client" : "Client");

                  const tileInner = (
                    <div className="bg-white border border-border rounded-lg flex items-center justify-center w-[136px] h-[68px] md:w-[168px] md:h-[80px]">
                      <img
                        src={client.logoSrc!}
                        alt={client.logoAlt}
                        style={{
                          maxHeight: isSquare ? 56 : 48,
                          maxWidth: isSquare ? 56 : 148,
                          objectFit: "contain",
                          width: "auto",
                          height: "auto",
                        }}
                        loading="lazy"
                        decoding="async"
                        width={isSquare ? 56 : 148}
                        height={isSquare ? 56 : 48}
                      />
                    </div>
                  );

                  return (
                    <div key={client.key} className="flex flex-col items-center gap-1.5">
                      {hasLink ? (
                        <a
                          href={href}
                          rel="noopener noreferrer"
                          target={isExternal ? "_blank" : undefined}
                          aria-label={client.logoAlt}
                          className="block rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        >
                          {tileInner}
                        </a>
                      ) : (
                        tileInner
                      )}
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {badgeLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              {c.sectionProof}
            </h2>
          )}

          {/* Descriptor cards — named clients first, anonymous after */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ORDERED_CLIENTS.filter((cl) => cl.summary !== null).slice(0, 6).map((client) => (
              <div
                key={client.key}
                className="rounded-xl border border-border bg-card p-4"
              >
                {client.permission === "confirmed" && client.canName && client.nameShown && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">{client.nameShown}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium uppercase tracking-wide">
                      {client.badge === "partner"
                        ? lang === "es" ? "Socio" : lang === "ca" ? "Soci" : "Partner"
                        : lang === "es" ? "Cliente" : lang === "ca" ? "Client" : "Client"}
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {client.descriptor[lang]}
                </p>
                {client.summary && (
                  <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
                    {client.summary[lang]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 3b. FREE SAMPLE ── */}
        {FREE_SAMPLE.enabled && (
          <section className="container px-4 max-w-3xl mx-auto mb-14 md:mb-20">
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
              <div className="flex items-start gap-3 mb-3">
                <Tag className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                <h2 className="text-lg font-bold text-foreground">{c.sectionFreeSample}</h2>
              </div>
              <p className="text-sm text-foreground/75 leading-relaxed mb-4">
                {FREE_SAMPLE.wording[lang]}
              </p>
              <Button
                onClick={handleSampleWhatsApp}
                variant="cta"
                className="gap-2 min-h-[52px] px-7 text-base font-semibold"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                {c.freeSampleCta}
              </Button>
            </div>
          </section>
        )}

        {/* ── 4. WHAT WE MAKE ── */}
        <section className="bg-secondary/20 py-14 md:py-20">
          <div className="container px-4 max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {c.sectionWhatWeMake}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {c.whatWeMakeCards.map((card, i) => {
                const icons = [Factory, Wrench, Box, RefreshCw, Tag, Layers];
                const Icon = icons[i % icons.length];
                return (
                  <div key={card.title} className="rounded-xl border border-border bg-card p-5">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">{card.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{card.example}</p>
                    <div className="flex items-center gap-3 text-xs text-foreground/50">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" aria-hidden="true" />{card.material}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />{card.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. SCALE + BATCH TABLE ── */}
        <section className="py-14 md:py-20 container px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
            {c.sectionScale}
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            {lang === "es"
              ? "El precio por unidad baja cuando se imprimen varias piezas idénticas a la vez — las placas se organizan eficientemente y el tiempo de máquina se amortiza. Guardamos el archivo validado para que los reencargos sean inmediatos. Para piezas más grandes que la cama, las dividimos y ensamblamos, o las producimos a través de nuestra red de socios."
              : lang === "ca"
              ? "El preu per unitat baixa quan s'imprimeixen diverses peces idèntiques alhora — les plaques s'organitzen eficientment i el temps de màquina s'amortitza. Guardem l'arxiu validat perquè les recomandes siguin immediates. Per a peces més grans que la plataforma, les dividim i assemblem, o les produïm a través de la nostra xarxa de socis."
              : "Per-unit price falls when multiple identical parts are printed together — plates pack efficiently and machine time is amortised. We keep the validated file so repeat orders are instant. For parts larger than the build plate, we split and bond them, or produce them through our partner network."}
          </p>

          {/* Batch price table — tabular nums, sticky first column, 50-unit column highlighted */}
          <div className="rounded-xl border border-border overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <caption className="sr-only">{c.sectionBatchTable}</caption>
              <thead>
                <tr className="bg-secondary/30 border-b border-border">
                  <th className="sticky left-0 bg-secondary/30 px-4 py-3 text-left font-semibold text-foreground z-10 whitespace-nowrap">
                    {lang === "es" ? "Material" : "Material"}
                  </th>
                  {BATCH_QUANTITIES.map((q, qi) => (
                    <th
                      key={q}
                      className={cn(
                        "px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap",
                        qi === 2 && "bg-accent/10 text-accent"
                      )}
                    >
                      ×{q}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BATCH_TABLE.map((row, ri) => (
                  <tr key={row.material} className={ri % 2 === 0 ? "bg-card" : "bg-secondary/10"}>
                    <td
                      className={cn(
                        "sticky left-0 px-4 py-3 font-medium text-foreground z-10 whitespace-nowrap",
                        ri % 2 === 0 ? "bg-card" : "bg-secondary/10"
                      )}
                    >
                      {row.material}
                    </td>
                    {row.prices.map((cents, qi) => (
                      <td
                        key={qi}
                        className={cn(
                          "px-4 py-3 text-right tabular-nums text-foreground/80",
                          qi === 2 && "bg-accent/5 font-semibold text-accent"
                        )}
                      >
                        {(cents / 100).toFixed(2)} €
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center">{c.batchTableLabel}</p>
        </section>

        {/* ── 6. MATERIALS STRIP ── */}
        <section className="bg-secondary/20 py-12 border-y border-border/40">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-4">{c.sectionMaterials}</h2>
            <div className="flex flex-wrap gap-3">
              {c.materialLinks.map((m) => (
                <Link
                  key={m.label}
                  to={m.href}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-accent/50 hover:bg-accent/5 transition-colors text-sm"
                >
                  <span className="font-medium text-foreground">{m.label}</span>
                  <span className="text-muted-foreground text-xs">{m.desc}</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {lang === "es" ? (
                <>Guía completa: <Link to="/comparativa-materiales-impresion-3d" className="text-accent hover:underline">Comparativa de materiales de impresión 3D</Link></>
              ) : lang === "ca" ? (
                <>Guia completa: <Link to="/3d-printing-materials-comparison" className="text-accent hover:underline">Comparativa de materials d'impressió 3D</Link></>
              ) : (
                <>Full guide: <Link to="/3d-printing-materials-comparison" className="text-accent hover:underline">3D printing materials comparison</Link></>
              )}
            </p>
          </div>
        </section>

        {/* ── 7. PROCESS ── */}
        <section className="py-14 md:py-20 container px-4 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            {c.sectionProcess}
          </h2>
          <div className="space-y-6">
            {c.processSteps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. CALCULATOR ── */}
        <StlEstimator />

        {/* ── 8b. HOW WE WORK WITH COMPANIES ── */}
        <section className="py-14 md:py-20 bg-secondary/20 border-y border-border/40">
          <div className="container px-4 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {c.howWeWorkTitle}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {c.howWeWorkItems.map((item, i) => {
                const icons = [Users, FileCheck, Receipt];
                const Icon = icons[i] ?? FileCheck;
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 9. FAQ ── */}
        <section className="py-14 md:py-20 container px-4 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
            {c.sectionFaq}
          </h2>
          <Accordion type="single" collapsible className="border border-border rounded-2xl px-2">
            {c.faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-border/60 last:border-0"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ── Founder block (hidden while photoSrc is null) ── */}
        {FOUNDER.photoSrc && (
          <section className="container px-4 max-w-2xl mx-auto pb-12">
            <div className="rounded-xl border border-border bg-card p-6 flex gap-5 items-start">
              <img
                src={FOUNDER.photoSrc}
                alt={FOUNDER.name}
                width={96}
                height={96}
                className="rounded-full object-cover flex-shrink-0 w-24 h-24"
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="font-semibold text-foreground">{FOUNDER.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{FOUNDER.role[lang]}</p>
                <p className="text-sm text-foreground/75 leading-relaxed">{FOUNDER.bio[lang]}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Related links ── */}
        <section className="container px-4 max-w-3xl mx-auto pb-8">
          <div className="grid sm:grid-cols-2 gap-3">
            {c.relatedLinks.map((r) => (
              <Link
                key={r.href}
                to={r.href}
                className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                  {r.label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── 10. FINAL CTA ── */}
        <section
          ref={endRef as React.RefObject<HTMLElement>}
          className="py-14 md:py-20 bg-foreground text-background"
        >
          <div className="container px-4 max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-2">
              {c.sectionCta}
            </h2>
            <p className="text-accent font-semibold mb-1">{c.ctaFinalLine}</p>
            <p className="text-background/60 text-sm mb-8">{c.ctaFinalSub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={scrollToCalc}
                variant="cta"
                className="gap-2 min-h-[52px] px-7 text-base font-semibold"
              >
                <Upload className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {c.ctaPrimary}
                <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              </Button>
              <Button
                onClick={() => handleWhatsApp(c.whatsAppMsg)}
                variant="whatsapp"
                className="gap-2 min-h-[52px] px-7 text-base font-semibold"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                {c.ctaWhatsApp}
              </Button>
            </div>
            {FREE_SAMPLE.enabled && (
              <p className="mt-4 text-sm text-background/50">
                {lang === "es"
                  ? "Primera muestra gratis para empresas con proyecto real."
                  : lang === "ca"
                  ? "Primera mostra gratuïta per a empreses amb projecte real."
                  : "Free first sample part for companies with a real project."}{" "}
                <button
                  onClick={handleSampleWhatsApp}
                  className="underline hover:text-background/80 transition-colors cursor-pointer"
                >
                  {c.freeSampleCta}
                </button>
              </p>
            )}
          </div>
        </section>

      </main>

      <Footer />
      {!stickyBarVisible && <WhatsAppFloat />}

      {/* ── Sticky bottom CTA bar (B2B pages only, after hero scrolls out) ── */}
      {stickyBarVisible && (
        <div
          className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border flex gap-2 px-3 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
          role="toolbar"
          aria-label={lang === "es" ? "Acciones rápidas" : lang === "ca" ? "Accions ràpides" : "Quick actions"}
        >
          <Button
            onClick={() => {
              capture("b2b_sticky_cta_click", { which: "calculator", lang });
              scrollToCalc();
            }}
            variant="cta"
            className="flex-1 gap-2 min-h-[52px] text-base font-semibold"
          >
            <Upload className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {c.ctaPrimary}
          </Button>
          <Button
            onClick={() => {
              capture("b2b_sticky_cta_click", { which: "whatsapp", lang });
              handleWhatsApp(c.whatsAppMsg);
            }}
            variant="whatsapp"
            className="flex-1 gap-2 min-h-[52px] text-base font-semibold"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {c.ctaWhatsApp}
          </Button>
        </div>
      )}
    </div>
  );
};

export default B2BLanding;
