import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Zap, Award, Settings2, Upload, MessageCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reviews from "@/components/Reviews";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PAGES_BY_SLUG, SITE_URL, SLUGS_BY_TOPIC } from "@/seo/registry";
import type { LandingContent } from "@/seo/landingPages";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

interface Props {
  page?: LandingContent;
}

const LandingPage = ({ page: pageProp }: Props) => {
  const params = useParams();
  // when used as element with explicit page prop, use it; otherwise lookup by location
  const slug = pageProp?.slug ?? `/${params["*"] ?? ""}`;
  const page = pageProp ?? PAGES_BY_SLUG[slug];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page not found</p>
      </div>
    );
  }

  const isEs = page.lang === "es";
  const isCa = page.lang === "ca";
  const t = (en: string, es: string) => (isCa ? es : isEs ? es : en);
  const url = `${SITE_URL}${page.slug}`;
  const topicSlugs = SLUGS_BY_TOPIC[page.topic] ?? {};

  const trustBadges = [
    { icon: MapPin, label: t(`${ACTIVE_CITY.cityName} Based`, `Local en ${ACTIVE_CITY.cityName}`) },
    { icon: Zap, label: t("Fast Turnaround", "Entregas Rápidas") },
    { icon: Award, label: t("Quality Materials", "Materiales de Calidad") },
    { icon: Settings2, label: t("Custom Orders", "Pedidos a Medida") },
  ];

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
    url
  };

  // Always emit the English FAQPage schema (look up the EN equivalent of this
  // topic) to avoid duplicate/multi-language FAQPage entries in GSC.
  const enSlug = topicSlugs.en;
  const enPage = enSlug ? PAGES_BY_SLUG[enSlug] : undefined;
  const faqsForSchema = enPage?.faqs ?? page.faqs;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqsForSchema.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'landing_page' });
    const msg = isEs
      ? `Hola, me interesa: ${page.h1}`
      : `Hi, I'm interested in: ${page.h1}`;
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
        <meta property="og:locale" content={isCa ? "ca_ES" : isEs ? "es_ES" : "en_US"} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.metaTitle} />
        <meta name="twitter:description" content={page.metaDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-16">
        {/* Breadcrumb */}
        <nav className="container px-4 pt-8 text-sm text-muted-foreground">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link to="/" className="hover:text-foreground">Dimension3D</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-foreground font-medium">{page.h1}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="container px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-5">
              <MapPin className="w-3.5 h-3.5" /> {ACTIVE_CITY.cityName}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-5">
              {page.h1}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {page.intro}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="accent" size="lg" className="gap-2">
                <Link to={isEs ? "/#upload" : "/#upload"}>
                  <Upload className="w-4 h-4" />
                  {t("Request a Quote", "Solicitar Presupuesto")}
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={handleWhatsApp} className="gap-2">
                <MessageCircle className="w-4 h-4" />
                {t("Contact on WhatsApp", "Contactar por WhatsApp")}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
              {trustBadges.map((b) => (
                <div key={b.label} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/50 bg-card">
                  <b.icon className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-xs font-medium text-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content sections */}
        <section className="container px-4 py-8 md:py-12">
          <div className="max-w-3xl space-y-12">
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
        </section>

        {/* Gallery */}
        {page.galleryImages.length > 0 && (
          <section className="bg-secondary/30 py-16 md:py-20">
            <div className="container px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                {t(`Real prints from our ${ACTIVE_CITY.cityName} workshop`, `Impresiones reales de nuestro taller en ${ACTIVE_CITY.cityName}`)}
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

        {/* CTA */}
        <section className="hero-gradient py-16 md:py-20">
          <div className="container px-4 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t("Ready to start your project?", "¿Listo para empezar tu proyecto?")}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {t("Send your file or describe your idea. Free quote in under 1 hour.", "Envía tu archivo o describe tu idea. Presupuesto gratis en menos de 1 hora.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="accent" size="xl" className="shadow-lg">
                <Link to="/#upload"><Upload className="w-5 h-5" /> {t("Upload File", "Subir Archivo")}</Link>
              </Button>
              <Button variant="hero-outline" size="xl" onClick={handleWhatsApp}>
                <MessageCircle className="w-5 h-5" /> {t("WhatsApp", "WhatsApp")}
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              {t("Frequently Asked Questions", "Preguntas Frecuentes")}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {page.faqs.map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`}>
                  <AccordionTrigger className="text-left font-medium hover:text-accent hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
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
            {t("Related services", "Servicios relacionados")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {page.related.map((r) => (
              <Link key={r.slug} to={r.slug} className="group p-5 rounded-xl border border-border/50 bg-card hover:border-accent hover:card-shadow-hover transition-all">
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

export default LandingPage;
