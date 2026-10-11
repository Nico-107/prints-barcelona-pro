// Shared B2B landing component used by all three B2B pages (ES/EN/CA).
// All sections from the spec are implemented here; per-language copy lives
// in the CONTENT object below. b2bFacts drives facts blocks.
// Hydration rule: nothing that reads Date/Math.random/window at render time.

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Building2, MessageCircle, ArrowRight, CheckCircle2, Clock,
  Shield, FileText, Package, RefreshCw, Zap, Layers,
  Wrench, Tag, ChevronRight, Box, Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import PictureImg from "@/components/PictureImg";
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

export type B2BLang = "es" | "en" | "ca";

// ---------------------------------------------------------------------------
// Batch price table — computed at module level (deterministic, no hydration
// mismatch). Reference part: 50 g, 0.8 h print time, fits a standard plate.
// ---------------------------------------------------------------------------
const REF_SIZE_MM = 80; // mm per side (fits many on one plate)
export const BATCH_REF_PART: Omit<PartEstimate, "orientation" | "orientationName"> = {
  plasticCm3: 50 / 1.27, // PETG density
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
  ctaQuote: string;
  ctaWhatsApp: string;
  heroSampleLine: string;
  trustItems: string[];
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
    heroPromise: "Piezas de producción listas en 2–5 días, presupuesto en 1 hora.",
    heroSub: "Sin tarifa de configuración. Pedido mínimo 10€. Factura para empresas. NDA disponible. Soporte en ES · CA · EN · DE · PL.",
    ctaQuote: "Precio instantáneo",
    ctaWhatsApp: "Habla con nosotros",
    heroSampleLine: "Primera pieza de muestra gratis para empresas con proyecto real.",
    trustItems: [
      "Presupuesto en 1 h",
      "2–5 días laborables",
      "NDA disponible",
      "Factura para empresas",
      "Soporte ES · CA · EN · DE · PL",
    ],
    sectionProof: "Empresas con las que trabajamos",
    sectionProofAnon: "Proyectos recientes para empresas de Barcelona, un municipio y talleres locales de impresión.",
    sectionFreeSample: "Prototipo gratis para empresas",
    freeSampleCta: "Solicita tu prototipo gratis",
    sectionWhatWeMake: "Qué fabricamos para empresas",
    sectionScale: "De un prototipo a cientos de unidades",
    sectionBatchTable: "Precio de referencia por unidad (pieza de 50 g, PETG / ASA)",
    batchTableLabel: "Indicativo para una pieza de 50 g. Tu archivo obtiene un precio exacto en la calculadora.",
    sectionMaterials: "Materiales disponibles",
    sectionProcess: "Cómo funciona",
    sectionCalculator: "Precio instantáneo",
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
      { title: "Impresión y control de calidad", body: "Imprimimos en nuestra Bambu Lab X1C con cámara cerrada y cámara climatizada. Cada pieza se revisa antes de salir del taller." },
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
    heroPromise: "Production-grade parts quoted in 1 hour, delivered in 2–5 days.",
    heroSub: "No setup fee. €10 minimum order. Invoice for companies. NDA available. Support in ES · CA · EN · DE · PL.",
    ctaQuote: "Get an instant quote",
    ctaWhatsApp: "Talk to us on WhatsApp",
    heroSampleLine: "Free prototype part for companies with a real project.",
    trustItems: [
      "Quote in 1 h",
      "2–5 business days",
      "NDA available",
      "Invoice for companies",
      "Support ES · CA · EN · DE · PL",
    ],
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
      { title: "Print & quality check", body: "We print on our Bambu Lab X1C with enclosed, heated chamber. Every part is checked before leaving the workshop." },
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
    heroPromise: "Peces de producció llestes en 2–5 dies, pressupost en 1 hora.",
    heroSub: "Sense tarifa de configuració. Comanda mínima 10€. Factura per a empreses. NDA disponible. Suport en ES · CA · EN · DE · PL.",
    ctaQuote: "Preu instantani",
    ctaWhatsApp: "Parla amb nosaltres",
    heroSampleLine: "Primera peça de mostra gratuïta per a empreses amb projecte real.",
    trustItems: [
      "Pressupost en 1 h",
      "2–5 dies laborables",
      "NDA disponible",
      "Factura per a empreses",
      "Suport ES · CA · EN · DE · PL",
    ],
    sectionProof: "Empreses amb les quals treballem",
    sectionProofAnon: "Projectes recents per a empreses de Barcelona, un municipi i tallers locals d'impressió.",
    sectionFreeSample: "Prototip gratuït per a empreses",
    freeSampleCta: "Sol·licita el teu prototip gratuït",
    sectionWhatWeMake: "Què fabriquem per a empreses",
    sectionScale: "D'un prototip a centenars d'unitats",
    sectionBatchTable: "Preu de referència per unitat (peça de 50 g, PETG / ASA)",
    batchTableLabel: "Indicatiu per a una peça de 50 g. El teu arxiu obté un preu exacte a la calculadora.",
    sectionMaterials: "Materials disponibles",
    sectionProcess: "Com funciona",
    sectionCalculator: "Preu instantani",
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
      { title: "Impressió i control de qualitat", body: "Imprimim a la nostra Bambu Lab X1C amb cambra tancada i climatitzada. Cada peça es revisa abans de sortir del taller." },
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
    whatsAppSampleMsg: "Hola, voldria sol·licitar el prototip de mostra gratuït per a la meva empresa. Tenim un projecte real en marxa.",
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

// Confirmed logos only (file exists + permission confirmed)
const CONFIRMED_LOGOS = CLIENTS.filter(
  (c) => c.permission === "confirmed" && c.canName && c.logoSrc
);
const SHOW_LOGO_ROW = CONFIRMED_LOGOS.length >= 3;

const B2BLanding = ({ lang, showLaunchBanner = false }: Props) => {
  const c = CONTENT[lang];
  const endRef = useRef<HTMLElement>(null);

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
        <section className="hero-gradient py-16 md:py-24">
          <div className="container px-4 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
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
                <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground leading-tight mb-4">
                  {c.h1}
                </h1>
                <p className="text-lg text-primary-foreground/90 font-medium mb-2">
                  {c.heroPromise}
                </p>
                <p className="text-sm text-primary-foreground/70 mb-2">
                  {c.heroSub}
                </p>
                <p className="text-sm text-primary-foreground/60 mb-6 italic">
                  {c.heroSampleLine}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={scrollToCalc} variant="cta" size="lg" className="gap-2">
                    <Zap className="w-4 h-4" aria-hidden="true" />
                    {c.ctaQuote}
                  </Button>
                  <Button
                    onClick={() => handleWhatsApp(c.whatsAppMsg)}
                    variant="hero-outline"
                    size="lg"
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    {c.ctaWhatsApp}
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-primary-foreground/10">
                  <PictureImg
                    src="/projects/intake-manifold.jpg"
                    alt={lang === "es" ? "Piezas técnicas impresas en 3D para empresas — Dimension3D Barcelona" : lang === "ca" ? "Peces tècniques impreses en 3D per a empreses — Dimension3D Barcelona" : "Technical 3D printed parts for business — Dimension3D Barcelona"}
                    width={800}
                    height={600}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. TRUST BAR ── */}
        <section className="bg-secondary/30 border-y border-border/40 py-3">
          <div className="container px-4">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {c.trustItems.map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-foreground/75">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. PROOF ── */}
        <section className="py-16 container px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{c.sectionProof}</h2>
          {SHOW_LOGO_ROW ? (
            <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
              {CONFIRMED_LOGOS.map((client) => (
                <a
                  key={client.key}
                  href={client.website ?? "#"}
                  rel="noopener noreferrer"
                  target={client.website?.startsWith("http") ? "_blank" : undefined}
                  className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all focus:outline-none focus:ring-2 focus:ring-accent rounded"
                  aria-label={client.logoAlt}
                >
                  <img
                    src={client.logoSrc!}
                    alt={client.logoAlt}
                    height={32}
                    style={{ maxHeight: 32, maxWidth: 120, objectFit: "contain" }}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mb-8">{c.sectionProofAnon}</p>
          )}
          {/* Descriptor cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CLIENTS.filter((cl) => cl.summary !== null).slice(0, 6).map((client) => (
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
          <section className="container px-4 max-w-3xl mx-auto mb-16">
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
                variant="outline"
                size="sm"
                className="gap-2 border-accent/50 text-accent hover:bg-accent/10"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                {c.freeSampleCta}
              </Button>
            </div>
          </section>
        )}

        {/* ── 4. WHAT WE MAKE ── */}
        <section className="bg-secondary/20 py-16 md:py-20">
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
        <section className="py-16 md:py-20 container px-4 max-w-4xl mx-auto">
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

          {/* Batch price table */}
          <div className="rounded-xl border border-border overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <caption className="sr-only">{c.sectionBatchTable}</caption>
              <thead>
                <tr className="bg-secondary/30 border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {lang === "es" ? "Material" : "Material"}
                  </th>
                  {BATCH_QUANTITIES.map((q) => (
                    <th key={q} className="px-4 py-3 text-center font-semibold text-foreground">
                      ×{q}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BATCH_TABLE.map((row, ri) => (
                  <tr key={row.material} className={ri % 2 === 0 ? "bg-card" : "bg-secondary/10"}>
                    <td className="px-4 py-3 font-medium text-foreground">{row.material}</td>
                    {row.prices.map((cents, qi) => (
                      <td key={qi} className="px-4 py-3 text-center text-foreground/80">
                        {(cents / 100).toFixed(2)} €
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center">{c.batchTableLabel}</p>

          {/* Stats row */}
          {(STATS.ordersPerMonth || STATS.responseTime) && (
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              {STATS.ordersPerMonth && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{STATS.ordersPerMonth}</p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "es" ? "Pedidos al mes" : lang === "ca" ? "Comandes al mes" : "Orders/month"}
                  </p>
                </div>
              )}
              {STATS.responseTime && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{STATS.responseTime}</p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "es" ? "Tiempo de respuesta" : lang === "ca" ? "Temps de resposta" : "Response time"}
                  </p>
                </div>
              )}
            </div>
          )}
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
        <section className="py-16 md:py-20 container px-4 max-w-3xl mx-auto">
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

        {/* ── 9. FAQ ── */}
        <section className="py-16 md:py-20 container px-4 max-w-3xl mx-auto">
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
                width={72}
                height={72}
                className="rounded-full object-cover flex-shrink-0"
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
          className="py-16 md:py-20 bg-foreground text-background"
        >
          <div className="container px-4 max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-2">
              {c.sectionCta}
            </h2>
            <p className="text-accent font-semibold mb-1">{c.ctaFinalLine}</p>
            <p className="text-background/60 text-sm mb-8">{c.ctaFinalSub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={scrollToCalc} variant="cta" size="lg" className="gap-2">
                <Zap className="w-4 h-4" aria-hidden="true" />
                {c.ctaQuote}
              </Button>
              <Button
                onClick={() => handleWhatsApp(c.whatsAppMsg)}
                variant="outline"
                size="lg"
                className="gap-2 border-background/30 text-background hover:bg-background/10"
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
      <WhatsAppFloat />
    </div>
  );
};

export default B2BLanding;
