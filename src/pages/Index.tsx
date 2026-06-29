import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhatCanWePrint from "@/components/WhatCanWePrint";
import Materials from "@/components/Materials";
import FileUpload from "@/components/FileUpload";
import StlEstimator from "@/components/StlEstimator";
import WhyChooseUs from "@/components/WhyChooseUs";
import ExpressPrinting from "@/components/ExpressPrinting";
import Reviews from "@/components/Reviews";
import BusinessCTA from "@/components/BusinessCTA";
import Projects from "@/components/Projects";
import PricingInfo from "@/components/PricingInfo";
import ServiceInfo from "@/components/ServiceInfo";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import LocationMap from "@/components/LocationMap";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";

const SITE_URL = "https://www.dimension3dprints.com";

const HOME_META: Record<string, { title: string; description: string; locale: string }> = {
  es: {
    title: `Impresión 3D en ${ACTIVE_CITY.cityName} | Dimension3D`,
    description:
      `Servicio profesional de impresión 3D en ${ACTIVE_CITY.cityName}. Piezas a medida, prototipos y urgentes. Presupuesto en menos de 1 hora.`,
    locale: "es_ES",
  },
  en: {
    title: `3D Printing Service in ${ACTIVE_CITY.cityName} | Dimension3D`,
    description:
      `Professional 3D printing in ${ACTIVE_CITY.cityName}. Custom parts, prototypes, urgent orders. Quote in under 1 hour.`,
    locale: "en_US",
  },
  ca: {
    title: `Impressió 3D a ${ACTIVE_CITY.cityName} | Dimension3D`,
    description:
      `Servei professional d'impressió 3D a ${ACTIVE_CITY.cityName}. Peces a mida, prototips i urgents. Pressupost en menys d'1 hora.`,
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

const Index = () => {
  const { language } = useLanguage();
  const meta = HOME_META[language] ?? HOME_META.es;

  // Shared calculator highlight — toggled by any primary quote CTA click
  const [calcHighlight, setCalcHighlight] = useState(false);

  const handleScrollToCalc = () => {
    const el = document.getElementById("calculator");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setCalcHighlight(true);
    setTimeout(() => setCalcHighlight(false), 1500);
  };
  // Always emit a single English FAQPage schema to avoid duplicate/multi-language
  // FAQPage entries being reported in Google Search Console.
  const faqs = HOME_FAQS.en;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: `Dimension3D ${ACTIVE_CITY.cityName}`,
    url: SITE_URL,
    telephone: `+${ACTIVE_CITY.whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: ACTIVE_CITY.addressLocality,
      addressRegion: ACTIVE_CITY.addressRegion,
      addressCountry: ACTIVE_CITY.countryCode,
    },
    description: meta.description,
    priceRange: "€€",
    image: `${SITE_URL}/og-image.jpg`,
    areaServed: [
      { "@type": "City", name: ACTIVE_CITY.areaServed },
      { "@type": "Country", name: ACTIVE_CITY.countryName },
    ],
    geo: { "@type": "GeoCoordinates", latitude: 41.3851, longitude: 2.1734 },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
    hasMap: "https://maps.google.com/?q=Dimension3D+Barcelona+impresion+3D",
    sameAs: ["https://www.instagram.com/dimension3dprints/"],
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    foundingDate: "2024",
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 41.3851, longitude: 2.1734 },
      geoRadius: "50000",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Impresión 3D Barcelona",
    serviceType: "3D Printing Service",
    provider: { "@type": "LocalBusiness", name: "Dimension3D Barcelona" },
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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={language} />
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/`} />
        <link rel="alternate" hrefLang="ca" href={`${SITE_URL}/`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={meta.locale} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>
      <LaunchOfferBanner />
      <Header />
      <main className="pt-16">
        <Hero onScrollToCalc={handleScrollToCalc} />
        <HowItWorks />
        <StlEstimator highlighted={calcHighlight} />
        <WhatCanWePrint />
        <Materials />
        <WhyChooseUs />
        <Projects />
        <Reviews />
        <BusinessCTA />
        <PricingInfo />
        <ServiceInfo />
        <ExpressPrinting />
        <FileUpload />
        <FAQ />
        <LocationMap />
        <CallToAction />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
