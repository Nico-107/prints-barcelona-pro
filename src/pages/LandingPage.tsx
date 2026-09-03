import { Fragment, lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Zap, Award, Settings2, Upload, MessageCircle, ChevronRight, CheckCircle2, Wrench, Users, BookOpen, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reviews from "@/components/Reviews";
import PictureImg from "@/components/PictureImg";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PAGES_BY_SLUG, SITE_URL, SLUGS_BY_TOPIC } from "@/seo/registry";
import type { LandingContent, LandingTopic } from "@/seo/landingPages";
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";
import { ACTIVE_CITY, CITIES, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

// Topics classed as guides — get TechArticle instead of plain Article, and
// benefit most from freshness signals since they compete for AI-answer
// citation on procedural queries.
const StlEstimator = lazy(() => import("@/components/StlEstimator"));

const GUIDE_TOPICS: ReadonlySet<LandingTopic> = new Set<LandingTopic>([
  "choosing-service",
  "materials-guide",
  "file-prep",
  "best-service",
  "maker-income",
  "maker-profitability",
  "maker-customers",
  "materials-comparison",
  "turnaround-comparison",
  "technology-comparison",
]);

const DEFAULT_DATE_PUBLISHED = "2026-08-01";
const DEFAULT_DATE_MODIFIED = "2026-08-10";

const SECTION_ICONS = [Wrench, Zap, Award, Users];

interface Props {
  page?: LandingContent;
}

const LandingPage = ({ page: pageProp }: Props) => {
  const params = useParams();
  // when used as element with explicit page prop, use it; otherwise lookup by location
  const slug = pageProp?.slug ?? `/${params["*"] ?? ""}`;
  const page = pageProp ?? PAGES_BY_SLUG[slug];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  const [calcHighlight, setCalcHighlight] = useState(false);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page not found</p>
      </div>
    );
  }

  const pageCity = page.cityId ? CITIES[page.cityId] ?? ACTIVE_CITY : ACTIVE_CITY;
  const WHATSAPP_URL = whatsappUrl(pageCity);
  const isMadrid = pageCity.id === "madrid";

  const isEs = page.lang === "es";
  const isCa = page.lang === "ca";
  const isDe = page.lang === "de";
  const t = (en: string, es: string, de?: string) =>
    isDe ? (de ?? en) : (isCa || isEs) ? es : en;
  const url = `${SITE_URL}${page.slug}`;
  const topicSlugs = SLUGS_BY_TOPIC[page.topic] ?? {};

  // Pages authored for makers (people who own a 3D printer and want income
  // from it) — CTAs route to the maker network funnel instead of a print
  // quote. audience defaults to "customer", preserving old behaviour.
  const isMaker = page.audience === "maker";
  const makerJoinLabel = t("Join the Maker Network", "Únete a la red de Makers", "Werde Teil des Maker-Netzwerks");
  const makerHowLabel = t("How it works", "Cómo funciona", "So funktioniert es");

  const trustBadges = [
    { icon: MapPin, label: t(`${pageCity.cityName} Based`, `Local en ${pageCity.cityName}`, `Standort ${pageCity.cityName}`), iconClass: isMadrid ? "text-orange-300" : "text-accent" },
    { icon: Zap, label: t("Fast Turnaround", "Entregas Rápidas", "Schnelle Lieferung"), iconClass: "text-accent" },
    { icon: Award, label: t("Quality Materials", "Materiales de Calidad", "Qualitätsmaterialien"), iconClass: "text-accent" },
    { icon: Settings2, label: t("Custom Orders", "Pedidos a Medida", "Individuelle Aufträge"), iconClass: "text-accent" },
  ];

  // Category label per page.category, translated with the same t() helper.
  const categoryLabel =
    page.category === "material"
      ? t("Materials", "Materiales", "Materialien")
      : page.category === "service"
        ? t("Services", "Servicios", "Dienstleistungen")
        : t("Use Cases", "Aplicaciones", "Anwendungsfälle");

  // Hub URL for the category level of the breadcrumb — points to the main
  // service page in the current language (or the materials guide for material
  // pages when it exists in that language).
  const homeSlug = page.lang === "ca" ? "/ca" : "/";
  const serviceHub =
    SLUGS_BY_TOPIC["service-3d-printing"]?.[page.lang]
      ?? SLUGS_BY_TOPIC["service-3d-printing"]?.en
      ?? homeSlug;
  const materialHub =
    SLUGS_BY_TOPIC["materials-guide"]?.[page.lang]
      ?? SLUGS_BY_TOPIC["materials-guide"]?.en
      ?? serviceHub;
  const categoryHub = page.category === "material" ? materialHub : serviceHub;

  // Skip the category level when the current page IS the hub — avoids a
  // Home > X > X redundancy in Google's rich result.
  const includeCategoryCrumb = page.slug !== categoryHub;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Dimension3D", item: `${SITE_URL}${homeSlug}` },
      ...(includeCategoryCrumb
        ? [{ "@type": "ListItem", position: 2, name: categoryLabel, item: `${SITE_URL}${categoryHub}` }]
        : []),
      {
        "@type": "ListItem",
        position: includeCategoryCrumb ? 3 : 2,
        name: page.h1,
        item: url,
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.schemaServiceName,
    provider: {
      "@type": "LocalBusiness",
      name: `Dimension3D ${pageCity.cityName}`,
      url: SITE_URL,
      telephone: `+${pageCity.whatsappNumber}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: pageCity.addressLocality,
        addressCountry: pageCity.countryCode,
      },
    },
    areaServed: { "@type": "City", name: pageCity.areaServed },
    description: page.metaDescription,
    url,
    mainEntityOfPage: url,
    isRelatedTo: page.related.map((r) => ({
      "@type": "Service",
      name: r.label,
      url: `${SITE_URL}${r.slug}`,
    })),
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

  const datePublished = page.datePublished ?? DEFAULT_DATE_PUBLISHED;
  const dateModified = page.dateModified ?? DEFAULT_DATE_MODIFIED;
  const isGuide = GUIDE_TOPICS.has(page.topic);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": isGuide ? "TechArticle" : "Article",
    headline: page.h1,
    description: page.metaDescription,
    inLanguage: page.lang,
    author: AUTHOR_REF,
    publisher: PUBLISHER_REF,
    datePublished,
    dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${SITE_URL}/og-image.jpg`,
  };

  const howToSchema = page.howToSteps && page.howToSteps.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: page.h1,
        description: page.metaDescription,
        inLanguage: page.lang,
        author: AUTHOR_REF,
        datePublished,
        dateModified,
        step: page.howToSteps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      }
    : null;

  const scrollToCalc = () => {
    capture('landing_page_upload_cta_click', { slug: page.slug });
    setCalcHighlight(true);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => setCalcHighlight(false), 3000);
  };

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'landing_page' });
    const msg = isDe
      ? `Hallo, ich interessiere mich für: ${page.h1}`
      : isEs || isCa
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
        {topicSlugs.de && <link rel="alternate" hrefLang="de" href={`${SITE_URL}${topicSlugs.de}`} />}
        {topicSlugs.en && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${topicSlugs.en}`} />}
        <meta property="og:title" content={page.metaTitle} />
        <meta property="og:description" content={page.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={isDe ? "de_DE" : isCa ? "ca_ES" : isEs ? "es_ES" : "en_US"} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.metaTitle} />
        <meta name="twitter:description" content={page.metaDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {howToSchema && (
          <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
        )}
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
        <section className={`relative overflow-hidden ${isMadrid ? "hero-gradient-madrid" : "hero-gradient"}`}>
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl ${isMadrid ? "bg-orange-400/10" : "bg-accent/10"}`} />
          <div className={`absolute bottom-32 right-20 w-48 h-48 rounded-full blur-3xl ${isMadrid ? "bg-orange-400/10" : "bg-accent/10"}`} />

          <div className="container relative z-10 px-4 pt-12 md:pt-16 pb-32 md:pb-40">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-widest text-primary-foreground/60 mb-4 font-medium">
                Dimension3D {pageCity.cityName}
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-5 border ${isMadrid ? "bg-orange-400/20 text-orange-200 border-orange-400/30" : "bg-white/10 text-white border-white/20"}`}>
                <MapPin className="w-3.5 h-3.5" /> {pageCity.cityName}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight mb-5">
                {page.h1}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed mb-8">
                {page.intro}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {isMaker ? (
                  <>
                    <Button asChild variant="accent" size="lg" className="gap-2">
                      <Link to="/makers">
                        <Users className="w-4 h-4" />
                        {makerJoinLabel}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                      <Link to="/maker-guide">
                        <BookOpen className="w-4 h-4" />
                        {makerHowLabel}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="accent" size="lg" className="gap-2" onClick={scrollToCalc}>
                      <Upload className="w-4 h-4" />
                      {t("Request a Quote", "Solicitar Presupuesto", "Angebot anfordern")}
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleWhatsApp} className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {t("Contact on WhatsApp", "Contactar por WhatsApp", "Auf WhatsApp kontaktieren")}
                    </Button>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
                {trustBadges.map((b) => (
                  <div key={b.label} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5">
                    <b.icon className={`w-4 h-4 ${b.iconClass} flex-shrink-0`} />
                    <span className="text-xs font-medium text-white">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 70C1200 65 1320 55 1380 50L1440 45V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
            </svg>
          </div>
        </section>

        {/* Content sections — alternating bands with icon cards */}
        {page.sections.map((s, i) => {
          const Icon = SECTION_ICONS[i % SECTION_ICONS.length];
          const isAlt = i % 2 === 1;
          return (
            <Fragment key={i}>
              <section className={`py-16 md:py-20 ${isAlt ? "bg-secondary/30" : "bg-background"}`}>
                <div className="container px-4">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isMadrid ? "bg-orange-50" : "bg-accent/10"}`}>
                        <Icon className={`w-6 h-6 ${isMadrid ? "text-orange-700" : "text-accent"}`} />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-1.5">{s.heading}</h2>
                    </div>
                    <div className="text-muted-foreground leading-relaxed space-y-4 md:pl-16">
                      {s.body.split("\n\n").map((p, j) => (
                        <p key={j} className="whitespace-pre-line">{p}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Mid-article maker CTA band — fires once, right after section 2 */}
              {isMaker && i === 1 && (
                <section className="py-8 md:py-12 bg-background">
                  <div className="container px-4">
                    <div className="max-w-3xl mx-auto rounded-2xl border-2 border-accent/40 bg-accent/5 p-6 md:p-8">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                        {t(
                          "Prefer orders that come to you?",
                          "¿Prefieres que los pedidos lleguen solos?",
                          "Lieber Aufträge, die zu dir kommen?"
                        )}
                      </h3>
                      <p className="text-muted-foreground mb-5">
                        {t(
                          "Free to join, no commission, no exclusivity — orders from your area go directly to you.",
                          "Unirse es gratis, sin comisión, sin exclusividad — los pedidos de tu zona van directamente a ti.",
                          "Kostenloser Beitritt, keine Provision, keine Exklusivität — Aufträge aus deiner Region gehen direkt an dich."
                        )}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild variant="accent" size="lg" className="gap-2">
                          <Link to="/makers">
                            <Users className="w-4 h-4" />
                            {makerJoinLabel}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="gap-2">
                          <Link to="/maker-guide">
                            <BookOpen className="w-4 h-4" />
                            {makerHowLabel}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </Fragment>
          );
        })}

        {/* Comparison table — AI Overview extraction target */}
        {page.comparisonTable && (
          <section className="py-16 md:py-20 bg-background">
            <div className="container px-4">
              <div className="max-w-5xl mx-auto overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/50">
                      {page.comparisonTable.headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 font-semibold text-foreground whitespace-nowrap border-b border-border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {page.comparisonTable.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "bg-background" : "bg-secondary/20"}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-3 text-muted-foreground border-b border-border/50 align-top">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {page.comparisonTable.caption && (
                <p className="mt-3 text-xs text-muted-foreground max-w-5xl mx-auto">{page.comparisonTable.caption}</p>
              )}
            </div>
          </section>
        )}

        {/* Gallery */}
        {page.galleryImages.length > 0 && (
          <section className="bg-secondary/30 py-16 md:py-20">
            <div className="container px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                {t(`Real prints from our ${pageCity.cityName} workshop`, `Impresiones reales de nuestro taller en ${pageCity.cityName}`, `Echte Drucke aus unserer Werkstatt in ${pageCity.cityName}`)}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {page.galleryImages.map((img) => (
                  <div key={img} className="aspect-square rounded-xl overflow-hidden bg-card border border-border/50">
                    <PictureImg src={img} alt={page.h1} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Calculator */}
        {!isMaker && (
          <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-xl mx-4" />}>
            <StlEstimator highlighted={calcHighlight} />
          </Suspense>
        )}

        {/* CTA */}
        <section className="hero-gradient py-16 md:py-20">
          <div className="container px-4 text-center max-w-2xl mx-auto">
            {isMaker ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  {t(
                    "Start earning with your 3D printer",
                    "Empieza a ganar con tu impresora 3D",
                    "Verdiene Geld mit deinem 3D-Drucker"
                  )}
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-8">
                  {t(
                    "Free to join. No fees, no commission, no exclusivity. Orders from your area go to you.",
                    "Unirse es gratis. Sin cuotas, sin comisión, sin exclusividad. Los pedidos de tu zona van para ti.",
                    "Kostenloser Beitritt. Keine Gebühren, keine Provision, keine Exklusivität. Aufträge aus deiner Region gehen an dich."
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="accent" size="xl" className="shadow-lg gap-2">
                    <Link to="/makers"><Users className="w-5 h-5" /> {makerJoinLabel}</Link>
                  </Button>
                  <Button asChild variant="hero-outline" size="xl" className="gap-2">
                    <Link to="/maker-guide"><BookOpen className="w-5 h-5" /> {makerHowLabel}</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  {t("Ready to start your project?", "¿Listo para empezar tu proyecto?", "Bereit für dein Projekt?")}
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-8">
                  {t("Send your file or describe your idea. Free quote in under 1 hour.", "Envía tu archivo o describe tu idea. Presupuesto gratis en menos de 1 hora.", "Schick uns deine Datei oder beschreib deine Idee. Kostenloses Angebot in unter 1 Stunde.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="accent" size="xl" className="shadow-lg" onClick={scrollToCalc}>
                    <Upload className="w-5 h-5" /> {t("Upload File", "Subir Archivo", "Datei hochladen")}
                  </Button>
                  <Button variant="hero-outline" size="xl" onClick={handleWhatsApp}>
                    <MessageCircle className="w-5 h-5" /> {t("WhatsApp", "WhatsApp", "WhatsApp")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="container px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              {t("Frequently Asked Questions", "Preguntas Frecuentes", "Häufige Fragen")}
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
        <Reviews cityName={pageCity.cityName} />

        {/* Related pages */}
        <section className="container px-4 py-16 md:py-20 border-t border-border/40">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            {t("Related services", "Servicios relacionados", "Weiterführende Themen")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {page.related.map((r) => (
              <Link key={r.slug} to={r.slug} className="group p-5 rounded-xl border border-border/50 bg-card hover:border-accent hover:card-shadow-hover transition-all">
                <div className="flex items-start justify-between mb-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-accent transition-all" />
                </div>
                <h3 className="font-semibold text-foreground">{r.label}</h3>
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
