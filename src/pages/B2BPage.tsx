import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Upload, MessageCircle, ChevronRight, CheckCircle2,
  Package, RefreshCw, Zap, FileText, Shield, Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reviews from "@/components/Reviews";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PAGES_BY_SLUG, SITE_URL, SLUGS_BY_TOPIC } from "@/seo/registry";
import type { LandingContent } from "@/seo/landingPages";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

interface Props {
  page: LandingContent;
}

type ValueCard = { icon: React.ElementType; title: string; body: string };

const VALUE_CARDS: Record<string, ValueCard[]> = {
  en: [
    { icon: Package,    title: "Volume & Short Runs",          body: "From 5 to 200 identical parts per order. Per-unit cost drops with quantity — ask for a tiered quote." },
    { icon: RefreshCw,  title: "Ongoing Supply",               body: "We keep your file and print parameters on record. Repeat orders are ready in minutes, not days." },
    { icon: Zap,        title: "Priority Turnaround",          body: "Business projects join a dedicated queue. Most PETG, ABS or Nylon parts ready in 2–5 business days; urgent jobs in 24–48h." },
    { icon: FileText,   title: "All Standard CAD Formats",     body: "STL, STEP, IGES, OBJ and 3MF accepted. Direct exports from SolidWorks, Fusion 360, Onshape, CATIA and FreeCAD work without conversion." },
    { icon: Shield,     title: "Confidentiality & NDA",        body: "We sign NDAs for any project that requires it. Your files and designs are never shared — standard practice, not an exception." },
    { icon: Users,      title: "Dedicated Contact",            body: "One direct point of contact via WhatsApp for quotes, revisions and reorders. No ticketing systems, no waiting." },
  ],
  es: [
    { icon: Package,    title: "Volumen y Tiradas Cortas",     body: "De 5 a 200 piezas idénticas por pedido. El coste por unidad baja con la cantidad — pide un precio por tramos." },
    { icon: RefreshCw,  title: "Suministro Continuo",          body: "Guardamos tu archivo y parámetros de impresión. Los reencargos se preparan en minutos, no en días." },
    { icon: Zap,        title: "Plazos Prioritarios",          body: "Los proyectos de empresa tienen cola dedicada. La mayoría de piezas en PETG, ABS o Nylon en 2–5 días laborables; urgentes en 24–48h." },
    { icon: FileText,   title: "Todos los Formatos CAD",       body: "STL, STEP, IGES, OBJ y 3MF aceptados. Exportaciones directas de SolidWorks, Fusion 360, Onshape, CATIA y FreeCAD sin conversión." },
    { icon: Shield,     title: "Confidencialidad y NDA",       body: "Firmamos NDA para cualquier proyecto que lo requiera. Tus archivos y diseños nunca se comparten — práctica habitual, no excepción." },
    { icon: Users,      title: "Contacto Dedicado",            body: "Un punto de contacto directo por WhatsApp para presupuestos, revisiones y reencargos. Sin tickets ni colas." },
  ],
  ca: [
    { icon: Package,    title: "Volum i Tirades Curtes",       body: "De 5 a 200 peces idèntiques per comanda. El cost per unitat baixa amb la quantitat — demana un preu per trams." },
    { icon: RefreshCw,  title: "Subministrament Continu",      body: "Guardem el teu arxiu i paràmetres d'impressió. Les recomandes es preparen en minuts, no en dies." },
    { icon: Zap,        title: "Terminis Prioritaris",         body: "Els projectes d'empresa tenen cua dedicada. La majoria de peces en PETG, ABS o Nylon en 2–5 dies laborables; urgents en 24–48h." },
    { icon: FileText,   title: "Tots els Formats CAD",         body: "STL, STEP, IGES, OBJ i 3MF acceptats. Exportacions directes de SolidWorks, Fusion 360, Onshape, CATIA i FreeCAD sense conversió." },
    { icon: Shield,     title: "Confidencialitat i NDA",       body: "Signem NDA per a qualsevol projecte que ho requereixi. Els teus arxius i dissenys mai es comparteixen — pràctica habitual, no excepció." },
    { icon: Users,      title: "Contacte Dedicat",             body: "Un punt de contacte directe per WhatsApp per a pressupostos, revisions i recomandes. Sense tickets ni cues." },
  ],
};

const COPY: Record<string, {
  eyebrow: string; title: string; subtitle: string;
  ctaTalk: string; ctaFiles: string;
  trust: string[];
  ctaStripTitle: string; ctaStripSubtitle: string; ctaStripTalk: string; ctaStripFiles: string;
  faqHeading: string; relatedHeading: string; galleryHeading: string;
}> = {
  en: {
    eyebrow: "For Companies & Engineers",
    title: "Your 3D Printing Partner for Business in Barcelona",
    subtitle: "Volume production, short runs and ongoing supply — with priority turnaround and a direct line to your account. We work with engineering teams, R&D departments and workshops. No minimum order, no overhead.",
    ctaTalk: "Talk to us about your project",
    ctaFiles: "Send your files",
    trust: ["NDA available", "Volume pricing", "Priority queue", "STL · STEP · IGES accepted"],
    ctaStripTitle: "Ready to work together?",
    ctaStripSubtitle: "Send your files or describe your project — we'll review it manually and reply with a clear quote and realistic timeline.",
    ctaStripTalk: "Talk to us on WhatsApp",
    ctaStripFiles: "Send your files",
    faqHeading: "Frequently Asked Questions",
    relatedHeading: "Related services",
    galleryHeading: `Real work from our ${ACTIVE_CITY.cityName} workshop`,
  },
  es: {
    eyebrow: "Para Empresas e Ingenieros",
    title: "Tu Partner de Impresión 3D para Empresas en Barcelona",
    subtitle: "Producción en volumen, tiradas cortas y suministro continuo — con plazos prioritarios y un punto de contacto directo. Trabajamos con equipos de ingeniería, departamentos de I+D y talleres. Sin pedido mínimo, sin burocracia.",
    ctaTalk: "Cuéntanos tu proyecto",
    ctaFiles: "Enviar archivos",
    trust: ["NDA disponible", "Descuentos por volumen", "Cola prioritaria", "STL · STEP · IGES aceptados"],
    ctaStripTitle: "¿Listos para trabajar juntos?",
    ctaStripSubtitle: "Envía tus archivos o describe tu proyecto — lo revisamos manualmente y te respondemos con un presupuesto claro y un plazo realista.",
    ctaStripTalk: "Cuéntanos en WhatsApp",
    ctaStripFiles: "Enviar archivos",
    faqHeading: "Preguntas Frecuentes",
    relatedHeading: "Servicios relacionados",
    galleryHeading: `Trabajo real de nuestro taller en ${ACTIVE_CITY.cityName}`,
  },
  ca: {
    eyebrow: "Per a Empreses i Enginyers",
    title: "El Teu Partner d'Impressió 3D per a Empreses a Barcelona",
    subtitle: "Producció en volum, tirades curtes i subministrament continu — amb terminis prioritaris i un punt de contacte directe. Treballem amb equips d'enginyeria, departaments de R+D i tallers. Sense comanda mínima, sense burocràcia.",
    ctaTalk: "Explica'ns el teu projecte",
    ctaFiles: "Envia els arxius",
    trust: ["NDA disponible", "Descomptes per volum", "Cua prioritària", "STL · STEP · IGES acceptats"],
    ctaStripTitle: "Llests per treballar junts?",
    ctaStripSubtitle: "Envia els teus arxius o descriu el teu projecte — ho revisem manualment i et responem amb un pressupost clar i un termini realista.",
    ctaStripTalk: "Explica'ns-ho per WhatsApp",
    ctaStripFiles: "Envia els arxius",
    faqHeading: "Preguntes Freqüents",
    relatedHeading: "Serveis relacionats",
    galleryHeading: `Feina real del nostre taller a ${ACTIVE_CITY.cityName}`,
  },
};

const B2BPage = ({ page }: Props) => {
  useEffect(() => { window.scrollTo(0, 0); }, [page.slug]);

  const lang = page.lang;
  const c = COPY[lang];
  const cards = VALUE_CARDS[lang];

  const url = `${SITE_URL}${page.slug}`;
  const topicSlugs = SLUGS_BY_TOPIC[page.topic] ?? {};
  const enSlug = topicSlugs.en;
  const enPage = enSlug ? PAGES_BY_SLUG[enSlug] : undefined;
  const faqsForSchema = enPage?.faqs ?? page.faqs;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.schemaServiceName,
    provider: {
      "@type": "LocalBusiness",
      name: `Dimension3D ${ACTIVE_CITY.cityName}`,
      url: SITE_URL,
      telephone: `+${ACTIVE_CITY.whatsappNumber}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: ACTIVE_CITY.addressLocality,
        addressCountry: ACTIVE_CITY.countryCode,
      },
    },
    areaServed: { "@type": "City", name: ACTIVE_CITY.areaServed },
    description: page.metaDescription,
    url,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqsForSchema.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const handleWhatsApp = () => {
    const msg =
      lang === "es"
        ? "Hola, me interesa el servicio de impresión 3D para mi empresa. Me gustaría hablar de un proyecto."
        : lang === "ca"
        ? "Hola, m'interessa el servei d'impressió 3D per a la meva empresa. M'agradaria parlar d'un projecte."
        : "Hi, I'm interested in 3D printing services for my business. I'd like to discuss a project.";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={page.lang} />
        <title>{page.metaTitle}</title>
        <meta name="description" content={page.metaDescription} />
        <link rel="canonical" href={url} />
        {topicSlugs.en && <link rel="alternate" hrefLang="en" href={`${SITE_URL}${topicSlugs.en}`} />}
        {topicSlugs.es && <link rel="alternate" hrefLang="es" href={`${SITE_URL}${topicSlugs.es}`} />}
        {topicSlugs.ca && <link rel="alternate" hrefLang="ca" href={`${SITE_URL}${topicSlugs.ca}`} />}
        {topicSlugs.en && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${topicSlugs.en}`} />}
        <meta property="og:title" content={page.metaTitle} />
        <meta property="og:description" content={page.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={lang === "ca" ? "ca_ES" : lang === "es" ? "es_ES" : "en_US"} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-16">
        {/* Full-screen B2B hero */}
        <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden hero-gradient">
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="absolute top-16 left-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-28 right-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

          <div className="container relative z-10 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                {c.eyebrow}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                {c.title}
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/85 mb-10 max-w-2xl mx-auto leading-relaxed">
                {c.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button variant="cta" size="xl" asChild className="shadow-lg">
                  <Link to="/#upload">
                    <Upload className="w-5 h-5" />
                    {c.ctaFiles}
                  </Link>
                </Button>
                <Button variant="whatsapp-outline" size="xl" onClick={handleWhatsApp} className="group">
                  <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                  {c.ctaTalk}
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 text-primary-foreground/75 text-sm">
                {c.trust.map((label) => (
                  <span key={label} className="inline-flex items-center gap-1.5 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cta flex-shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 46.7C1200 43.3 1320 36.7 1380 33.3L1440 30V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </section>

        {/* Value proposition grid */}
        <section className="container px-4 py-16 md:py-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card.title} className="p-6 rounded-xl border border-border/50 bg-card hover:border-accent/50 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Content sections */}
        <section className="bg-secondary/20 py-12 md:py-16">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto space-y-12">
              {page.sections.map((s, i) => (
                <article key={i}>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{s.heading}</h2>
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    {s.body.split("\n\n").map((p, j) => (
                      <p key={j} className="whitespace-pre-line">{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        {page.galleryImages.length > 0 && (
          <section className="py-16 md:py-20">
            <div className="container px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                {c.galleryHeading}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {page.galleryImages.map((img) => (
                  <div key={img} className="aspect-square rounded-xl overflow-hidden bg-card border border-border/50">
                    <img src={img} alt={page.h1} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA strip */}
        <section className="hero-gradient py-16 md:py-20">
          <div className="container px-4 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {c.ctaStripTitle}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {c.ctaStripSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="cta" size="xl" asChild className="shadow-lg">
                <Link to="/#upload">
                  <Upload className="w-5 h-5" />
                  {c.ctaStripFiles}
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" onClick={handleWhatsApp}>
                <MessageCircle className="w-5 h-5" />
                {c.ctaStripTalk}
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              {c.faqHeading}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {page.faqs.map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`}>
                  <AccordionTrigger className="text-left font-medium hover:text-accent hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Reviews */}
        <Reviews />

        {/* Related pages */}
        <section className="container px-4 py-16 md:py-20 border-t border-border/40">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            {c.relatedHeading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {page.related.map((r) => (
              <Link key={r.slug} to={r.slug} className="group p-5 rounded-xl border border-border/50 bg-card hover:border-accent hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-accent transition-all" />
                </div>
                <h3 className="font-semibold text-foreground">{r.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{ACTIVE_CITY.cityName}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default B2BPage;
