import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap, Package, Wrench, Zap } from "lucide-react";
import { EST } from "@/lib/estimator/core";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { useSectionView } from "@/hooks/usePageTracking";
import { useXpExposure } from "@/lib/experiments";
import Header from "@/components/Header";
import StlEstimator from "@/components/StlEstimator";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import MobileStickyBar from "@/components/MobileStickyBar";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from "@/seo/entities";
import { GOOGLE_RATING, formatRating } from "@/data/rating";
import { capture } from "@/lib/analytics";
import {
  Hero as DsHero,
  StepCards,
  LinkCardGrid,
  B2BCards,
  FounderSection,
  ImageBand,
  QuoteFeature,
  FactsStrip,
  PathCards,
  UploadPanel,
  PriceTable,
  ImageSplit,
  FAQAccordion,
} from "@/components/ds";

const SITE_URL = "https://www.dimension3dprints.com";

function matPrice(key: string): string {
  const m = EST.materials[key];
  if (!m) return "";
  const g = (EST.plasticEurPerG * m.priceMult).toFixed(3).replace(".", ",");
  const h = (EST.timeTiers[0].eurPerH * m.priceMult).toFixed(2).replace(".", ",");
  return `${g} €/g + ${h} €/h`;
}
const SOCIAL_IMAGE_URL = `${SITE_URL}/og/share-default.png`;

const HOME_META: Record<string, { title: string; description: string; locale: string }> = {
  es: {
    title: `Impresión 3D en ${ACTIVE_CITY.cityName} — Desde 10€, Presupuesto en 1h`,
    description:
      `Piezas a medida, prototipos y recambios en ${ACTIVE_CITY.cityName}. Presupuesto gratis en menos de 1 hora. Desde 10€, sin pedido mínimo. Recogida local o envío.`,
    locale: "es_ES",
  },
  en: {
    title: `3D Printing ${ACTIVE_CITY.cityName} — From 10€, Quote in Under 1 Hour`,
    description:
      `Custom parts, prototypes and replacements in ${ACTIVE_CITY.cityName}. Free quote in under 1 hour. From 10€, no minimum order. Local pickup or shipping.`,
    locale: "en_US",
  },
  ca: {
    title: `Impressió 3D a ${ACTIVE_CITY.cityName} — Des de 10€, Pressupost en 1h`,
    description:
      `Peces a mida, prototips i recanvis a ${ACTIVE_CITY.cityName}. Pressupost gratis en menys d'1 hora. Des de 10€, sense comanda mínima. Recollida local o enviament.`,
    locale: "ca_ES",
  },
};

const HOME_FAQS: Record<string, { q: string; a: string }[]> = {
  es: [
    { q: "¿Cuánto tarda un pedido?", a: "Normalmente entre 24 y 48 horas para pedidos express. Pedidos estándar entre 2 y 5 días laborables." },
    { q: "¿Qué materiales usáis?", a: "Trabajamos con PLA, PETG, ABS/ASA, TPU flexible y materiales especiales como Nylon con fibra de carbono." },
    { q: "¿Cómo envío mi archivo?", a: "Por WhatsApp o nuestro formulario web. Aceptamos STL, OBJ, 3MF y STEP, entre otros." },
    { q: "¿Hacéis pedidos urgentes?", a: `Sí, ofrecemos servicio express con entrega en 24-48h en ${ACTIVE_CITY.cityName}.` },
    { q: "¿Dónde estáis?", a: `Somos un servicio basado en ${ACTIVE_CITY.cityName} con recogida local con cita previa y envío a toda España.` },
  ],
  en: [
    { q: "How long does an order take?", a: "Express orders typically take 24–48 hours. Standard orders take 2–5 business days." },
    { q: "What materials do you use?", a: "We work with PLA, PETG, ABS/ASA, flexible TPU, and specialty materials like carbon-fiber Nylon." },
    { q: "How do I send my file?", a: "Via WhatsApp or our web form. We accept STL, OBJ, 3MF, and STEP, among others." },
    { q: "Do you handle urgent orders?", a: `Yes, we offer express service with 24–48h delivery in ${ACTIVE_CITY.cityName}.` },
    { q: "Where are you located?", a: `We're a ${ACTIVE_CITY.cityName}-based service with local pickup by appointment and shipping across Spain.` },
  ],
  ca: [
    { q: "Quant triga una comanda?", a: "Les comandes express triguen entre 24 i 48 hores. Les estàndard, entre 2 i 5 dies laborables." },
    { q: "Quins materials utilitzeu?", a: "Treballem amb PLA, PETG, ABS/ASA, TPU flexible i materials especials com Niló amb fibra de carboni." },
    { q: "Com envio el meu arxiu?", a: "Per WhatsApp o el nostre formulari web. Acceptem STL, OBJ, 3MF i STEP, entre altres." },
    { q: "Feu comandes urgents?", a: `Sí, oferim servei express amb lliurament en 24-48h a ${ACTIVE_CITY.cityName}.` },
    { q: "On esteu?", a: `Som un servei amb seu a ${ACTIVE_CITY.cityName} amb recollida local amb cita prèvia i enviament a tota Espanya.` },
  ],
};

const GUIDES_COPY: Record<string, {
  heading: string;
  posts: { slug: string; icon: typeof BookOpen; title: string; desc: string }[];
}> = {
  es: {
    heading: "¿Tienes dudas? Lee nuestras guías",
    posts: [
      { slug: "/blog/precio-impresion-3d-barcelona", icon: BookOpen, title: "¿Cuánto cuesta la impresión 3D en Barcelona?", desc: "Precios reales por tamaño y material, con ejemplos y tabla de tarifas." },
      { slug: "/blog/impresion-3d-urgente-barcelona", icon: Zap, title: "Impresión 3D urgente — entrega en 24-48h", desc: "Cómo funciona el servicio express y qué materiales están disponibles." },
      { slug: "/blog/recambios-piezas-rotas-impresion-3d-barcelona", icon: Wrench, title: "Recambios y piezas rotas en 3D", desc: "De la foto o la pieza rota a un recambio impreso en 3D en Barcelona." },
      { slug: "/impresion-3d-estudiantes-barcelona", icon: GraduationCap, title: "20% de descuento para estudiantes", desc: "Impresión 3D con descuento universitario. Sin pedido mínimo, mismo servicio express." },
      { slug: "/impresion-3d-sin-pedido-minimo", icon: Package, title: "Pedido mínimo 10 € — desde 1 pieza", desc: "Una sola pieza al mismo precio por unidad que un lote. Pedido mínimo 10 €." },
      { slug: "/repuesto-descatalogado", icon: Wrench, title: "Repuesto descatalogado — lo imprimimos en 3D", desc: "¿El fabricante ya no lo vende? Reproducimos desde foto o la pieza original." },
    ],
  },
  en: {
    heading: "Got questions? Read our guides",
    posts: [
      { slug: "/blog/precio-impresion-3d-barcelona", icon: BookOpen, title: "How much does 3D printing cost in Barcelona?", desc: "Real prices by size and material, with examples and a pricing table." },
      { slug: "/blog/impresion-3d-urgente-barcelona", icon: Zap, title: "Urgent 3D printing — delivery in 24-48h", desc: "How the express service works and which materials are available." },
      { slug: "/blog/recambios-piezas-rotas-impresion-3d-barcelona", icon: Wrench, title: "Replacement parts & broken pieces in 3D", desc: "From photo or broken part to a printed replacement in Barcelona." },
      { slug: "/impresion-3d-estudiantes-barcelona", icon: GraduationCap, title: "20% student discount", desc: "3D printing with university discount. No minimum order, same express service." },
      { slug: "/impresion-3d-sin-pedido-minimo", icon: Package, title: "10 € minimum order — from 1 part", desc: "Print a single part at the same per-unit price as a larger batch. Minimum order €10." },
      { slug: "/repuesto-descatalogado", icon: Wrench, title: "Discontinued part — we reproduce it in 3D", desc: "Manufacturer no longer sells it? We reproduce it from a photo or the original piece." },
    ],
  },
  ca: {
    heading: "Tens dubtes? Llegeix les nostres guies",
    posts: [
      { slug: "/blog/precio-impresion-3d-barcelona", icon: BookOpen, title: "¿Cuánto cuesta la impresión 3D en Barcelona?", desc: "Precios reales por tamaño y material, con ejemplos y tabla de tarifas." },
      { slug: "/blog/impresion-3d-urgente-barcelona", icon: Zap, title: "Impresión 3D urgente — entrega en 24-48h", desc: "Cómo funciona el servicio express y qué materiales están disponibles." },
      { slug: "/blog/recambios-piezas-rotas-impresion-3d-barcelona", icon: Wrench, title: "Recambios y piezas rotas en 3D", desc: "De la foto o la pieza rota a un recambio impreso en 3D en Barcelona." },
      { slug: "/impresion-3d-estudiantes-barcelona", icon: GraduationCap, title: "20% de descompte per a estudiants", desc: "Impressió 3D amb descompte universitari. Sense comanda mínima, mateix servei express." },
      { slug: "/impresion-3d-sin-pedido-minimo", icon: Package, title: "Comanda mínima 10 € — des d'1 peça", desc: "Una sola peça al mateix preu per unitat que un lot. Comanda mínima 10 €." },
      { slug: "/repuesto-descatalogado", icon: Wrench, title: "Recanvi descatalogat — ho imprimim en 3D", desc: "El fabricant ja no ven la peça? La reproduïm des d'una foto o la peça original." },
    ],
  },
};

const GOOGLE_REVIEWS_DATA = [
  {
    name: "Sara Dospassos",
    text: "What an amazing place! Mikolaj helped me with an urgent order on a Friday afternoon, and it was ready the very next morning. He not only delivered my pieces with a professional finish, but he even came over to where I was to hand them to me. Absolutely fantastic.",
  },
  {
    name: "Kirill Gromskiy",
    text: "I'm working for a construction company. We needed a special round shadow gap profile for a wall, but there was no way to buy one because nobody sells it. So we decided to make it with the help of 3D printing. It was fast, affordable, and worked perfectly.",
  },
  {
    name: "Yasser Chyoukha",
    text: "I had some parts printed for a project, and in addition to the excellent service and constant support, they helped me by doing resized tests so the printed nut would fit perfectly. The price was great, and it really saved me from a tight spot.",
  },
  {
    name: "Filip Copaescu",
    text: "Amazing! They were able to accurately 3D print this car part in TPU, a flexible material. Great quality and service.",
  },
  {
    name: "Daniel Cáceres Álvarez",
    text: "Spectacular! I bought two Stranger Things models for my Kinder Joy Funko Pops and they turned out great. Excellent service and quality.",
  },
  {
    name: "Valentino Modestino Lombardi",
    text: "Excellent on-demand 3D printing service, very helpful and patient customer service. Recommended!",
  },
];

// What we print cards per language
const WHAT_WE_PRINT: Record<string, { href: string; title: string; description: string }[]> = {
  es: [
    { href: "/prototipos-3d-barcelona", title: "Prototipos funcionales", description: "Valida tu diseño antes de producir" },
    { href: "/recambios-impresion-3d-barcelona", title: "Piezas de repuesto", description: "Electrodomésticos, máquinas, vehículos" },
    { href: "/piezas-personalizadas-3d-barcelona", title: "Soportes y adaptadores", description: "Montajes y soluciones a medida" },
    { href: "/piezas-funcionales-barcelona", title: "Piezas técnicas", description: "RC, drones, automoción y mecánica" },
    { href: "/piezas-personalizadas-3d-barcelona", title: "Proyectos personalizados", description: "Hobby, decoración o uso personal" },
    { href: "/disena-tu-pieza-3d", title: "Diseños originales", description: "Si lo puedes imaginar, lo podemos imprimir" },
  ],
  en: [
    { href: "/prototype-printing-barcelona", title: "Functional prototypes", description: "Validate your design before production" },
    { href: "/replacement-parts-barcelona", title: "Replacement parts", description: "Appliances, machines, vehicles" },
    { href: "/custom-parts-barcelona", title: "Brackets & adaptors", description: "Mounts and custom solutions" },
    { href: "/functional-parts-barcelona", title: "Technical parts", description: "RC, drones, automotive and mechanical" },
    { href: "/custom-parts-barcelona", title: "Custom projects", description: "Hobby, décor or personal use" },
    { href: "/design-your-3d-part", title: "Original designs", description: "If you can imagine it, we can print it" },
  ],
  ca: [
    { href: "/ca/prototips-3d-barcelona", title: "Prototips funcionals", description: "Valida el teu disseny abans de produir" },
    { href: "/ca/recanvis-impressio-3d-barcelona", title: "Peces de recanvi", description: "Electrodomèstics, màquines, vehicles" },
    { href: "/ca/peces-personalitzades-3d-barcelona", title: "Suports i adaptadors", description: "Muntatges i solucions a mida" },
    { href: "/ca/peces-funcionals-barcelona", title: "Peces tècniques", description: "RC, drones, automoció i mecànica" },
    { href: "/ca/peces-personalitzades-3d-barcelona", title: "Projectes personalitzats", description: "Hobby, decoració o ús personal" },
    { href: "/dissenya-la-teva-peca-3d", title: "Dissenys originals", description: "Si ho pots imaginar, ho podem imprimir" },
  ],
};

// Ordered star counts label
const ORDERS_LABEL: Record<string, string> = {
  es: "250+ PEDIDOS ENTREGADOS",
  en: "250+ ORDERS DELIVERED",
  ca: "250+ COMANDES LLIURADES",
  de: "250+ BESTELLUNGEN GELIEFERT",
  fr: "250+ COMMANDES LIVRÉES",
  it: "250+ ORDINI CONSEGNATI",
  nl: "250+ BESTELLINGEN GELEVERD",
  pt: "250+ ENCOMENDAS ENTREGUES",
};

const Index = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const meta = HOME_META[language] ?? HOME_META.es;
  const { pathname } = useLocation();
  const isCa = pathname === "/ca" || pathname === "/ca/";
  const [searchParams] = useSearchParams();
  const refCity = searchParams.get("ref") ?? undefined;
  const refDays = searchParams.get("days") ?? undefined;

  const [calcHighlight, setCalcHighlight] = useState(false);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pageDragOver, setPageDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  // Section view tracking
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const materialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const b2bRef = useRef<HTMLDivElement>(null);
  useSectionView(heroRef, "hero");
  useSectionView(howItWorksRef, "how-it-works");
  useSectionView(calculatorRef, "calculator");
  useSectionView(reviewsRef, "reviews");
  useSectionView(materialsRef, "materials");
  useSectionView(faqRef, "faq");
  useSectionView(b2bRef, "b2b");
  useXpExposure(reviewsRef, "home_proof_r1");
  useXpExposure(heroRef, "home_v2");

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (refCity) setLanguage("en");
  }, [refCity]);

  useEffect(() => {
    if (!refCity) return;
    const timer = setTimeout(() => {
      const el = document.getElementById("calculator");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [refCity]);

  // Page-level drag-and-drop: show overlay, then drop file into calculator input
  useEffect(() => {
    const onEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      dragCounterRef.current += 1;
      setPageDragOver(true);
    };
    const onLeave = () => {
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setPageDragOver(false);
    };
    const onOver = (e: DragEvent) => { e.preventDefault(); };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setPageDragOver(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (!files.length) return;
      capture("upload_entry_click", { source: "page_drop", page_path: window.location.pathname });
      const calcEl = document.getElementById("calculator");
      if (calcEl) {
        calcEl.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          const fileInput = calcEl.querySelector('input[type="file"]') as HTMLInputElement | null;
          if (fileInput) {
            const dt = new DataTransfer();
            files.forEach((f) => dt.items.add(f));
            Object.defineProperty(fileInput, "files", { value: dt.files, writable: false, configurable: true });
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }, 400);
      }
    };
    document.addEventListener("dragenter", onEnter);
    document.addEventListener("dragleave", onLeave);
    document.addEventListener("dragover", onOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragenter", onEnter);
      document.removeEventListener("dragleave", onLeave);
      document.removeEventListener("dragover", onOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [pathname]);

  const openFilePicker = (source: 'hero' | 'header' | 'step_card' | 'path_card' | 'final_band' | 'sticky_bar' | 'page_drop') => {
    const el = document.getElementById("calculator");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    capture("upload_entry_click", { source, page_path: pathname });
    if (highlightTimerRef.current !== null) clearTimeout(highlightTimerRef.current);
    setCalcHighlight(true);
    highlightTimerRef.current = setTimeout(() => {
      setCalcHighlight(false);
      highlightTimerRef.current = null;
      const fileInput = document.getElementById("calculator")?.querySelector('input[type="file"]') as HTMLInputElement | null;
      fileInput?.click();
    }, 400);
  };

  const handleNoFile = () => {
    const url = language === "ca" ? "/dissenya-la-teva-peca-3d" : language === "en" ? "/design-your-3d-part" : "/disena-tu-pieza-3d";
    navigate(url);
  };

  const handleSendLink = async () => {
    capture("mobile_share_link", { page_path: pathname });
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  const faqs = HOME_FAQS[language] ?? HOME_FAQS.es;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Impresión 3D Barcelona",
    serviceType: "3D Printing Service",
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "City", name: "Barcelona" },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "10",
      description: "Impresión 3D desde 10€ con presupuesto en 1 hora",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // V1 hero star line — explicit · separators per design spec
  const heroStarLine = (
    <>
      <span className="text-amber">★★★★★ {GOOGLE_RATING.value ? formatRating(language) : "4,8"}</span>
      <span className="text-on-dark-muted">·</span>
      <span>{ORDERS_LABEL[language] ?? ORDERS_LABEL.es}</span>
      <span className="text-on-dark-muted">·</span>
      <span>BARCELONA</span>
    </>
  );

  // V1 hero H1 with amber underline on "Barcelona."
  const v1H1 = (
    <>
      {t("home.h1").replace("Barcelona.", "")}
      <span style={{ boxShadow: "inset 0 -0.16em 0 #F5A524" }}>Barcelona.</span>
    </>
  );

  // V2 hero H1: prefix [highlight] post — all three parts come from i18n
  const v2H1 = (
    <>
      {t("home.v2.h1.pre")} <span className="text-amber">{t("home.v2.h1.highlight")}</span> {t("home.v2.h1.post")}
    </>
  );

  // Facts strip items — V1 hero (3 items for compact 3-col mobile layout per C3)
  const factsItems = [
    { value: "Desde 10 €", label: t("home.facts.minOrder.label") },
    { value: "24–48 h", label: t("home.facts.delivery.label") },
    { value: "±0,2 mm", label: t("home.facts.tolerance.label") },
  ];

  // V2 facts strip (simpler, 4 items on navy)
  const v2FactsItems = [
    { value: "Desde 10 €", label: t("home.facts.minOrder.label") },
    { value: "<1 h", label: t("home.v2.facts.turnaround") },
    { value: "24–48 h", label: t("home.facts.delivery.label") },
    { value: "4,8/5", label: t("home.v2.facts.reviews") },
  ];

  const whatWePrint = WHAT_WE_PRINT[language] ?? WHAT_WE_PRINT.es;

  const designRequestUrl = language === "ca" ? "/dissenya-la-teva-peca-3d" : language === "en" ? "/design-your-3d-part" : "/disena-tu-pieza-3d";
  const b2bUrl = "/impresion-3d-empresas-barcelona";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={language} />
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={isCa ? `${SITE_URL}/ca/` : `${SITE_URL}/`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/`} />
        <link rel="alternate" hrefLang="ca" href={`${SITE_URL}/ca/`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/3d-printing-barcelona`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={isCa ? `${SITE_URL}/ca/` : `${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={meta.locale} />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(ORGANIZATION_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
      </Helmet>

      {/* Page-level drag overlay — appears when file is dragged over V2 hero */}
      {pageDragOver && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "rgba(11,17,32,0.88)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            pointerEvents: "none",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F5A524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" />
          </svg>
          <p style={{ color: "#FFFFFF", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 24, margin: 0 }}>
            {t("home.hero.cta")}
          </p>
        </div>
      )}

      <LaunchOfferBanner />
      <Header />

      <main id="main-content">
        {/* ── HERO V1 (default / A variant) ── */}
        <div ref={heroRef} className="xp-home-v1-only">
          <DsHero
            variant="centered"
            starLine={heroStarLine}
            h1={v1H1}
            paragraph={t("home.hero.p")}
            primaryButton={{
              label: (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" />
                  </svg>
                  {t("home.hero.cta")}
                </>
              ),
              onClick: () => openFilePicker("hero"),
            }}
            secondaryButton={{ label: t("home.hero.whatsapp"), href: whatsappUrl() }}
            sendLinkButton={{ label: t("home.hero.sendlink"), onClick: handleSendLink }}
            reassuranceItems={t("home.hero.reassurance").split(" · ")}
            noFileLink={{ label: t("home.hero.nofile"), onClick: handleNoFile }}
            factsItems={factsItems}
          />
        </div>

        {/* ── HERO V2 (B variant) ── */}
        <div className="xp-home-v2-only">
          <DsHero
            variant="split-image"
            starLine={
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: "0.08em", color: '#B8C4DA' }}>
                {t("home.v2.hero.eyebrow")}
              </span>
            }
            h1={v2H1}
            paragraph={t("home.hero.p")}
            primaryButton={{
              label: t("home.v2.hero.button"),
              onClick: () => openFilePicker("hero"),
            }}
            secondaryButton={{ label: t("home.hero.whatsapp"), href: whatsappUrl() }}
            sendLinkButton={{ label: t("home.hero.sendlink"), onClick: handleSendLink }}
            reassuranceItems={[t("home.v2.hero.reassurance")]}
            noFileLink={{
              label: t("home.v2.hero.nofile"),
              onClick: handleNoFile,
            }}
            splitImage={{
              src: "/img/x2d/x2d-inside.jpg",
              alt: t("home.v2.hero.img.alt"),
            }}
            mobileExtras={{
              quoteText: "Ready the very next morning. Absolutely fantastic.",
              quoteAuthor: "Sara D.",
              facts: [
                { value: "24–48 h", label: t("home.mobile.stat.delivery") },
                { value: "250+", label: t("home.mobile.stat.orders") },
                { value: "<1 h", label: t("home.mobile.stat.response") },
              ],
            }}
          />
          {/* V2 Facts Strip on navy */}
          <FactsStrip items={v2FactsItems} variant="dark" />
        </div>

        {/* ── HOW IT WORKS (V1 only — V2 uses PathCards instead) ── */}
        <div ref={howItWorksRef} className="xp-home-v1-only">
          <section className="bg-white">
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
              <h2
                className="font-display font-extrabold tracking-tight leading-none mb-2.5"
                style={{ fontSize: "clamp(30px, 3.6vw, 44px)", textAlign: "center" }}
              >
                {t("how.title")}
              </h2>
              <p className="text-text-muted" style={{ margin: "0 0 30px", textAlign: "center" }}>{t("how.subtitle")}</p>
              <StepCards
                steps={[
                  {
                    number: 1,
                    title: t("how.step1.title"),
                    description: t("how.step1.desc"),
                    cta: {
                      label: t("home.step1.cta"),
                      onClick: () => openFilePicker("step_card"),
                    },
                  },
                  { number: 2, title: t("how.step2.title"), description: t("how.step2.desc") },
                  { number: 3, title: t("how.step3.title"), description: t("how.step3.desc") },
                  { number: 4, title: t("how.step4.title"), description: t("how.step4.desc") },
                ]}
              />
            </div>
          </section>
        </div>

        {/* ── V2 PATH CARDS ── */}
        <div className="xp-home-v2-only">
          <section className="bg-white">
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
              <PathCards
                heading={t("home.v2.path.heading")}
                cards={[
                  {
                    variant: "amber",
                    heading: t("home.v2.path.card1.heading"),
                    description: t("home.v2.path.card1.desc"),
                    cta: t("home.v2.path.card1.cta"),
                    onClick: () => openFilePicker("path_card"),
                  },
                  {
                    variant: "blue",
                    heading: t("home.v2.path.card2.heading"),
                    description: t("home.v2.path.card2.desc"),
                    cta: t("home.v2.path.card2.cta"),
                    href: designRequestUrl,
                  },
                  {
                    variant: "dark",
                    heading: t("home.v2.path.card3.heading"),
                    description: t("home.v2.path.card3.desc"),
                    cta: t("home.v2.path.card3.cta"),
                    href: b2bUrl,
                  },
                ]}
              />
            </div>
          </section>
        </div>

        {/* ── CALCULATOR (dark upload panel) ── */}
        <div ref={calculatorRef} style={{ background: '#F6F8FC' }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
            <UploadPanel
              label={t("home.upload.label")}
              heading={t("home.upload.heading")}
              description={t("home.upload.desc")}
              examples={[
                { text: `${t("home.upload.example1")} ${t("home.upload.example1price")}` },
                { text: `${t("home.upload.example2")} ${t("home.upload.example2price")}` },
              ]}
            >
              <StlEstimator compact highlighted={calcHighlight} refCity={refCity} refDays={refDays} />
            </UploadPanel>
          </div>
        </div>

        {/* ── V2 REVIEWS (white section — after calculator) ── */}
        <div className="xp-home-v2-only">
          <section style={{ background: '#FFFFFF' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,88px) clamp(18px,4vw,24px) clamp(40px,5vw,56px)", display: "flex", flexDirection: "column", gap: 26 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: "0.08em", color: '#2F5BEA' }}>
                {t("home.v2.reviews.label")}
              </div>
              <blockquote style={{ margin: 0, font: `600 clamp(28px, 3.6vw, 48px)/1.12 'Bricolage Grotesque', sans-serif`, letterSpacing: "-0.015em", maxWidth: 1080 }}>
                "{GOOGLE_REVIEWS_DATA[0].text}"
                <footer style={{ marginTop: 16, font: "500 15px 'Inter', sans-serif", color: '#5B6577' }}>{GOOGLE_REVIEWS_DATA[0].name}</footer>
              </blockquote>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {GOOGLE_REVIEWS_DATA.slice(1, 4).map((r) => (
                  <blockquote key={r.name} style={{ margin: 0, background: '#F3F6FF', borderRadius: 16, padding: 22, fontSize: 16, color: '#26304A' }}>
                    "{r.text}"
                    <footer style={{ marginTop: 10, fontSize: 14, color: '#5B6577' }}>{r.name}</footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── V2 HOW WE PRINT (black section with nozzles fade) ── */}
        <div id="maquina" className="xp-home-v2-only">
          <section style={{ background: '#000000', color: '#FFFFFF' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", alignItems: "stretch" }}>
              <div style={{ flex: "1 1 380px", minWidth: 0, padding: "88px 40px 88px 0", display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: "0.08em", color: '#F5A524' }}>
                  {t("home.v2.how.eyebrow")}
                </div>
                <h2 style={{ margin: 0, font: `800 clamp(32px, 4vw, 54px)/1 'Bricolage Grotesque', sans-serif`, letterSpacing: "-0.02em" }}>
                  {t("home.v2.how.heading")}
                </h2>
                <p style={{ margin: 0, color: '#D5DCEA', maxWidth: 440 }}>{t("home.v2.how.body")}</p>
                <a
                  href="#calculator"
                  onClick={(e) => { e.preventDefault(); document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{ alignSelf: "flex-start", textDecoration: "none", border: "1.5px solid #FFFFFF", borderRadius: 10, padding: "14px 22px", fontWeight: 600, color: "#FFFFFF" }}
                >
                  {t("home.v2.how.cta")}
                </a>
              </div>
              <div
                role="img"
                aria-label={t("home.v2.how.img.alt")}
                style={{
                  flex: "1.4 1 520px",
                  minWidth: 0,
                  minHeight: 520,
                  background: "linear-gradient(90deg,#000 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 80%,#000 100%), linear-gradient(0deg,#000 0%,rgba(0,0,0,0) 34%), #000 url(/img/x2d/x2d-nozzles.jpg) center/cover no-repeat",
                }}
              />
            </div>
          </section>
        </div>

        {/* ── V2 REAL PRICES (price tiles) ── */}
        <div id="precios" className="xp-home-v2-only">
          <section style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,88px) clamp(18px,4vw,24px)", display: "flex", flexWrap: "wrap", gap: 48 }}>
            <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
              <h2 style={{ margin: 0, font: `800 clamp(32px, 4vw, 52px)/1.02 'Bricolage Grotesque', sans-serif`, letterSpacing: "-0.02em" }}>
                {t("home.v2.prices.heading")}
              </h2>
              <p style={{ margin: 0, color: '#5B6577', maxWidth: 520 }}>{t("home.v2.prices.desc")}</p>
            </div>
            <div style={{ flex: "1 1 520px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
              {[
                { price: "10,00 €", label: "Clip de cajón", spec: "PLA · 5 g" },
                { price: "12,10 €", label: "Adaptador VESA", spec: "PLA · 40 g" },
                { price: "27,50 €", label: "Figura mediana", spec: "PLA · 90 g" },
                { price: "42,35 €", label: "Prototipo funcional", spec: "PETG · 150 g" },
              ].map((tile) => (
                <div key={tile.label} style={{ background: '#F3F6FF', borderRadius: 16, padding: 20 }}>
                  <div style={{ font: `800 34px/1 'Bricolage Grotesque', sans-serif` }}>{tile.price}</div>
                  <div style={{ marginTop: 6 }}>{tile.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#5B6577' }}>{tile.spec}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── QUÉ IMPRIMIMOS ── */}
        <section className="bg-surface">
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
            <h2
              style={{
                margin: "0 0 10px",
                fontFamily: "'Inter Tight', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(30px, 3.6vw, 44px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {t("home.whatwep.heading")}
            </h2>
            <p className="text-text-muted" style={{ margin: "0 0 30px" }}>{t("home.whatwep.subheading")}</p>
            <LinkCardGrid items={whatWePrint} />
          </div>
        </section>

        {/* ── MATERIALS ── (V1 only — V2 uses price tiles instead) */}
        <div ref={materialsRef} className="xp-home-v1-only">
          <section style={{ background: '#FFFFFF' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)", display: "flex", flexWrap: "wrap", gap: 48, alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 540px", minWidth: 0 }}>
                <h2 style={{ margin: "0 0 28px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                  {t("home.materials.heading")}
                </h2>
                <PriceTable
                  columns={{ material: t("home.materials.col.material"), use: t("home.materials.col.use"), price: t("home.materials.col.price") }}
                  rows={[
                    { material: "PLA", useCase: t("home.materials.pla.use"), price: matPrice("PLA") },
                    { material: "PETG", useCase: t("home.materials.petg.use"), price: matPrice("PETG") },
                    { material: "ABS / ASA", useCase: t("home.materials.abs.use"), price: matPrice("ABS") },
                    { material: "TPU", useCase: t("home.materials.tpu.use"), price: matPrice("TPU") },
                    { material: "Nylon", useCase: t("home.materials.nylon.use"), price: matPrice("Nylon") },
                  ]}
                  button={{ label: t("home.materials.cta"), onClick: () => openFilePicker("step_card") }}
                />
                <p style={{ marginTop: 16, fontSize: 14, color: '#5B6577' }}>
                  {t("home.materials.help")}{" "}
                  <a href={whatsappUrl()} style={{ color: '#2F5BEA' }}>WhatsApp</a>
                </p>
                <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#5B6577', letterSpacing: "0.06em" }}>
                  {t("home.materials.spec")}
                </div>
              </div>
              <div
                role="img"
                aria-label={t("home.materials.img.alt")}
                style={{ flex: "1 1 360px", minWidth: 0, height: 400, borderRadius: 20, backgroundImage: "url(/img/x2d/x2d-desk.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
              />
            </div>
          </section>
        </div>

        {/* ── WHY CHOOSE US ── (V1 only — B3; mobile 2×2 grid fix — C6) */}
        <div className="xp-home-v1-only">
          <section style={{ background: '#F6F8FC' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
              <h2 style={{ margin: "0 0 40px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                {t("home.why.heading")}
              </h2>
              <div className="ds-why-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                {[
                  { title: t("home.why.col1.title"), desc: t("home.why.col1.desc") },
                  { title: t("home.why.col2.title"), desc: t("home.why.col2.desc") },
                  { title: t("home.why.col3.title"), desc: t("home.why.col3.desc") },
                  { title: t("home.why.col4.title"), desc: t("home.why.col4.desc") },
                ].map((col, i) => (
                  <div key={i} style={{ padding: "0 28px", borderLeft: i > 0 ? "1px solid #E3E8F0" : "none" }}>
                    <p style={{ margin: "0 0 8px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 20 }}>{col.title}</p>
                    <p style={{ margin: 0, color: '#5B6577', fontSize: 15 }}>{col.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── PROJECTS ── */}
        <section style={{ background: '#FFFFFF' }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
            <h2 style={{ margin: "0 0 32px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {t("home.projects.heading")}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {["/projects/custom-brackets.jpg", "/projects/intake-manifold.jpg", "/projects/red-adapter.jpg"].map((src, i) => (
                <div
                  key={i}
                  style={{ height: 280, borderRadius: 16, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
                  role="img"
                  aria-hidden="true"
                />
              ))}
            </div>
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <a href={whatsappUrl()} style={{ display: "inline-block", border: "1.5px solid #0F172A", borderRadius: 10, padding: "14px 26px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 600, color: "#0F172A", textDecoration: "none", fontSize: 15 }}>
                {t("home.projects.cta")}
              </a>
            </div>
          </div>
        </section>

        {/* ── REVIEWS (QuoteFeature dark grid) ── (V1 only — V2 has its own review section above) */}
        <div className="xp-home-v1-only">
          <section ref={reviewsRef}>
            <QuoteFeature
              label={`★★★★★ ${formatRating(language)} · ${t("home.reviews.googleLabel")}`}
              featured={{
                text: GOOGLE_REVIEWS_DATA[0].text,
                author: `— ${GOOGLE_REVIEWS_DATA[0].name}`,
              }}
              secondary={GOOGLE_REVIEWS_DATA.slice(1, 4).map((r) => ({
                text: r.text,
                author: `— ${r.name}`,
              }))}
              variant="dark"
            />
          </section>
        </div>

        {/* ── B2B CARDS ── */}
        <div ref={b2bRef}>
          <section className="bg-white">
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
              <B2BCards
                heading={t("home.b2b.heading")}
                cards={[
                  {
                    variant: "dark",
                    label: t("home.b2b.card1.label"),
                    heading: t("home.b2b.card1.heading"),
                    description: t("home.b2b.card1.desc"),
                    cta: t("home.b2b.card1.cta"),
                    href: designRequestUrl,
                  },
                  {
                    variant: "blue",
                    label: t("home.b2b.card2.label"),
                    heading: t("home.b2b.card2.heading"),
                    description: t("home.b2b.card2.desc"),
                    cta: t("home.b2b.card2.cta"),
                    href: b2bUrl,
                  },
                ]}
              />
            </div>
          </section>
        </div>

        {/* ── FOUNDER SECTION ── */}
        {/* V1: full image split with x2d-room */}
        <div className="xp-home-v1-only">
          <FounderSection
            imageSrc="/img/x2d/x2d-room.jpg"
            imageAlt={t("home.v2.hero.img.alt")}
            label={t("home.founder.label")}
            heading={t("home.founder.heading")}
            body={t("home.founder.body")}
            specs={[t("home.founder.spec1"), t("home.founder.spec2"), t("home.founder.spec3")]}
            cta={{ label: t("home.founder.cta"), href: whatsappUrl() }}
          />
        </div>
        {/* V2: text-only (no image — avoids x2d-room duplicate with V2 closing band per B4) */}
        <div className="xp-home-v2-only">
          <section style={{ background: '#F6F8FC' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,88px) clamp(18px,4vw,24px)", display: "flex", flexWrap: "wrap", gap: 48, alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 480px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: "0.08em", color: '#5B6577', textTransform: "uppercase" }}>
                  {t("home.founder.label")}
                </div>
                <h2 style={{ margin: 0, font: `800 clamp(32px, 4vw, 52px)/1.02 'Bricolage Grotesque', sans-serif`, letterSpacing: "-0.02em" }}>
                  {t("home.founder.heading")}
                </h2>
                <p style={{ margin: 0, color: '#5B6577', maxWidth: 580, fontSize: 18, lineHeight: 1.6 }}>{t("home.founder.body")}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[t("home.founder.spec1"), t("home.founder.spec2"), t("home.founder.spec3")].map((spec, i) => (
                    <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#5B6577', background: '#E3E8F0', borderRadius: 8, padding: "4px 10px" }}>{spec}</span>
                  ))}
                </div>
                <a href={whatsappUrl()} style={{ alignSelf: "flex-start", textDecoration: "none", background: '#F5A524', color: '#0B1020', fontWeight: 700, padding: "16px 28px", borderRadius: 12, fontSize: 16 }}>{t("home.founder.cta")}</a>
              </div>
            </div>
          </section>
        </div>

        {/* ── SERVICE INFO ── (V1 only — B3) */}
        <div className="xp-home-v1-only">
          <section style={{ background: '#F6F8FC' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 420px", minWidth: 0 }}>
                <h2 style={{ margin: "0 0 16px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                  {t("service.title")} {t("service.titleHighlight")}
                </h2>
                <p style={{ margin: 0, fontSize: 18, color: '#5B6577', lineHeight: 1.6 }}>{t("service.desc")}</p>
              </div>
              <div style={{ flex: "1 1 480px", minWidth: 0 }}>
                {[
                  { title: t("service.feat.online"), desc: t("service.feat.onlineDesc") },
                  { title: t("service.feat.local"), desc: t("service.feat.localDesc") },
                  { title: t("service.feat.appointment"), desc: t("service.feat.appointmentDesc") },
                  { title: t("service.feat.shipping"), desc: t("service.feat.shippingDesc") },
                ].map((f, i) => (
                  <div key={i} style={{ padding: "20px 0", borderTop: i === 0 ? "2px solid #0F172A" : "1px solid #E3E8F0" }}>
                    <p style={{ margin: "0 0 4px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 700, fontSize: 18 }}>{f.title}</p>
                    <p style={{ margin: 0, color: '#5B6577', fontSize: 15 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── EXPRESS ── (V1 only — B3) */}
        <div className="xp-home-v1-only">
          <section style={{ background: '#0F172A', color: '#FFFFFF' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em", color: '#F5A524' }}>
                  {t("home.express.eyebrow")}
                </div>
                <h2 style={{ margin: 0, fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                  {t("home.express.heading")}
                </h2>
                <p style={{ margin: 0, color: '#D5DCEA', fontSize: 15 }}>{t("home.express.facts")}</p>
              </div>
              <Link to="/blog/impresion-3d-urgente-barcelona" style={{ color: '#F5A524', fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                {t("home.express.link")}
              </Link>
            </div>
          </section>
        </div>

        {/* ── FAQ ── */}
        <div ref={faqRef}>
          <section style={{ background: '#FFFFFF' }}>
            <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
              <FAQAccordion
                heading={t("faq.title")}
                items={faqs.slice(0, 5).map((f) => ({ question: f.q, answer: f.a }))}
              />
            </div>
          </section>
        </div>

        {/* ── LOCATION ── (V1 only — B3; customer photo per B4) */}
        <div className="xp-home-v1-only">
          <ImageSplit
            imageSrc="/projects/intake-manifold.jpg"
            imageAlt={t("home.nozzles.img.alt")}
            imagePosition="left"
            label={t("location.addressLabel")}
            heading={t("location.title")}
            body={t("location.hours")}
            specs={[t("location.areasLabel") + ": " + t("location.areas")]}
            cta={{ label: t("location.viewMaps"), href: "https://www.google.com/maps/search/?api=1&query=Dimension+3D+BCN+Barcelona" }}
            background="surface"
          />
        </div>

        {/* ── FINAL IMAGE BAND ── (V1 only — B3; x2d-nozzles per B4) */}
        <div className="xp-home-v1-only">
          <ImageBand
            imageSrc="/img/x2d/x2d-nozzles.jpg"
            imageAlt={t("home.nozzles.img.alt")}
            fadeDirection="left"
            heading={t("home.final.heading")}
            cta={{
              label: t("home.hero.cta"),
              onClick: () => openFilePicker("final_band"),
            }}
            reassurance={t("home.hero.reassurance")}
          />
        </div>

        {/* ── V2 CLOSING BAND (over x2d-room with dark overlay) ── */}
        <div className="xp-home-v2-only">
          <section
            style={{ background: "#111 url(/img/x2d/x2d-room.jpg) center/cover no-repeat", color: '#FFFFFF' }}
          >
            <div style={{ background: "rgba(5,8,16,0.66)" }}>
              <div style={{ maxWidth: 1240, margin: "0 auto", padding: "120px 24px", display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
                <h2 style={{ margin: 0, font: `800 clamp(40px, 6vw, 84px)/0.96 'Bricolage Grotesque', sans-serif`, letterSpacing: "-0.03em", maxWidth: 820 }}>
                  {t("home.v2.closing.heading")}
                </h2>
                <button
                  onClick={() => openFilePicker("final_band")}
                  style={{ background: '#F5A524', color: '#0B1020', fontWeight: 700, fontSize: 21, padding: "22px 40px", borderRadius: 14, border: "none", cursor: "pointer" }}
                >
                  {t("home.v2.closing.cta")}
                </button>
                <a href={b2bUrl} style={{ fontWeight: 600, color: '#FFFFFF' }}>{t("home.v2.closing.b2b")}</a>
              </div>
            </div>
          </section>
        </div>

        {/* ── GUIDES ── */}
        {(() => {
          const guides = GUIDES_COPY[language] ?? GUIDES_COPY.es;
          return (
            <section style={{ background: '#F6F8FC' }}>
              <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(56px,7vw,84px) clamp(18px,4vw,24px)" }}>
                <h2 style={{ margin: "0 0 32px", fontFamily: "'Inter Tight', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                  {guides.heading}
                </h2>
                <LinkCardGrid
                  items={guides.posts.map(({ slug, title, desc }) => ({
                    href: slug,
                    title,
                    description: desc,
                  }))}
                />
              </div>
            </section>
          );
        })()}

        {/* ── SERVICES & INTERNATIONAL GRID ── */}
        <section style={{ background: '#FFFFFF', borderTop: '1px solid #E3E8F0' }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 24px" }}>
            <h2 style={{ margin: "0 0 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em", color: '#5B6577', textTransform: "uppercase", textAlign: "center" }}>
              {t("home.services.heading")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-8">
              {(language === "en" ? [
                { to: "/3d-printing-barcelona", label: "3D Printing in Barcelona" },
                { to: "/prototype-printing-barcelona", label: "Prototype Printing" },
                { to: "/rapid-prototyping-barcelona", label: "Rapid Prototyping" },
                { to: "/3d-printing-for-business-barcelona", label: "For Business" },
                { to: "/custom-parts-barcelona", label: "Custom Parts" },
                { to: "/3d-printing-price-barcelona", label: "Pricing" },
                { to: "/urgent-3d-printing-barcelona", label: "Urgent / Same-Day" },
                { to: "/functional-parts-barcelona", label: "Functional Parts" },
                { to: "/replacement-parts-barcelona", label: "Replacement Parts" },
                { to: "/short-run-3d-printing-barcelona", label: "Short Runs" },
              ] : language === "ca" ? [
                { to: "/ca/", label: "Impressió 3D a Barcelona" },
                { to: "/ca/prototips-3d-barcelona", label: "Prototips 3D" },
                { to: "/ca/prototipatge-rapid-barcelona", label: "Prototipatge Ràpid" },
                { to: "/ca/impressio-3d-empreses-barcelona", label: "Per a Empreses" },
                { to: "/ca/peces-personalitzades-3d-barcelona", label: "Peces a Mida" },
                { to: "/ca/preu-impressio-3d-barcelona", label: "Preus" },
                { to: "/ca/impressio-3d-urgent-barcelona", label: "Servei Urgent" },
                { to: "/ca/peces-funcionals-barcelona", label: "Peces Funcionals" },
                { to: "/ca/recanvis-impressio-3d-barcelona", label: "Recanvis 3D" },
              ] : [
                { to: "/prototipos-3d-barcelona", label: "Prototipos 3D" },
                { to: "/prototipado-rapido-barcelona", label: "Prototipado Rápido" },
                { to: "/impresion-3d-empresas-barcelona", label: "Para Empresas" },
                { to: "/piezas-personalizadas-3d-barcelona", label: "Piezas a Medida" },
                { to: "/precio-impresion-3d-barcelona", label: "Precios" },
                { to: "/impresion-3d-urgente-barcelona", label: "Servicio Urgente" },
                { to: "/piezas-funcionales-barcelona", label: "Piezas Funcionales" },
                { to: "/recambios-impresion-3d-barcelona", label: "Recambios 3D" },
                { to: "/tiradas-cortas-impresion-3d-barcelona", label: "Tiradas Cortas" },
                { to: "/impresion-3d-estudiantes-barcelona", label: "Descuento Estudiantes" },
              ]).map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.03em" }}
                  className="text-foreground/60 hover:text-accent transition-colors leading-relaxed"
                >
                  {label}
                </Link>
              ))}
            </div>

            <h2 style={{ margin: "32px 0 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em", color: '#5B6577', textTransform: "uppercase", textAlign: "center" }}>
              {t("home.intl.heading")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(language === "en" ? [
                { to: "/3d-printing-delivery-berlin", label: "🇩🇪 3D Printing → Berlin" },
                { to: "/3d-printing-delivery-paris", label: "🇫🇷 3D Printing → Paris" },
                { to: "/3d-printing-delivery-amsterdam", label: "🇳🇱 3D Printing → Amsterdam" },
                { to: "/3d-printing-delivery-milan", label: "🇮🇹 3D Printing → Milan" },
                { to: "/3d-printing-delivery-lisbon", label: "🇵🇹 3D Printing → Lisbon" },
                { to: "/de/3d-druck-service", label: "🇩🇪 3D-Druck Service" },
                { to: "/fr/impression-3d-en-ligne", label: "🇫🇷 Impression 3D" },
                { to: "/nl/3d-printen-laten-maken", label: "🇳🇱 3D Printen" },
                { to: "/it/stampa-3d-online", label: "🇮🇹 Stampa 3D" },
                { to: "/pt/impressao-3d-online", label: "🇵🇹 Impressão 3D" },
                { to: "/madrid", label: "🇪🇸 Madrid" },
                { to: "/impresion-3d-con-entrega-a-valencia", label: "🇪🇸 Valencia" },
              ] : [
                { to: "/de/3d-druck-service", label: "🇩🇪 3D-Druck Service (DE)" },
                { to: "/fr/impression-3d-en-ligne", label: "🇫🇷 Impression 3D (FR)" },
                { to: "/nl/3d-printen-laten-maken", label: "🇳🇱 3D Printen (NL)" },
                { to: "/it/stampa-3d-online", label: "🇮🇹 Stampa 3D (IT)" },
                { to: "/pt/impressao-3d-online", label: "🇵🇹 Impressão 3D (PT)" },
                { to: "/3d-printing-delivery-berlin", label: "🇩🇪 Envío a Berlín" },
                { to: "/3d-printing-delivery-paris", label: "🇫🇷 Envío a París" },
                { to: "/3d-printing-delivery-amsterdam", label: "🇳🇱 Envío a Amsterdam" },
                { to: "/3d-printing-delivery-milan", label: "🇮🇹 Envío a Milán" },
                { to: "/3d-printing-delivery-lisbon", label: "🇵🇹 Envío a Lisboa" },
                { to: "/madrid", label: "🇪🇸 Envío a Madrid" },
                { to: "/impresion-3d-con-entrega-a-valencia", label: "🇪🇸 Envío a Valencia" },
              ]).map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.03em" }}
                  className="text-foreground/60 hover:text-accent transition-colors leading-relaxed"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
      <MobileStickyBar heroCTARef={heroRef} onUploadClick={() => openFilePicker("sticky_bar")} />
    </div>
  );
};

export default Index;
