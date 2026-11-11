import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Zap, Award, Settings2, Upload, MessageCircle, MapPin, Wrench, Users, BookOpen, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reviews from "@/components/Reviews";
import PictureImg from "@/components/PictureImg";
import { Button } from "@/components/ui/button";
import { PAGES_BY_SLUG, SITE_URL, SOCIAL_IMAGE_URL, SLUGS_BY_TOPIC } from "@/seo/registry";
import type { LandingContent, LandingTopic } from "@/seo/landingPages";
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";
import { ACTIVE_CITY, CITIES, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";
import { StlEstimator } from "@/components/StlEstimator";
import { Hero as DsHero, Breadcrumbs, FAQAccordion, FinalCta, LinkCardGrid } from "@/components/ds";


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
  const navigate = useNavigate();
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
  const t = (en: string, es: string, de?: string, ca?: string) =>
    isDe ? (de ?? en) : isCa ? (ca ?? es) : isEs ? es : en;
  const url = `${SITE_URL}${page.slug}`;
  const topicSlugs = SLUGS_BY_TOPIC[page.topic] ?? {};

  // Pages authored for makers (people who own a 3D printer and want income
  // from it) — CTAs route to the maker network funnel instead of a print
  // quote. audience defaults to "customer", preserving old behaviour.
  const isMaker = page.audience === "maker";
  const makerJoinLabel = t("Join the Maker Network", "Únete a la red de Makers", "Werde Teil des Maker-Netzwerks", "Uneix-te a la xarxa de Makers");
  const makerHowLabel = t("How it works", "Cómo funciona", "So funktioniert es", "Com funciona");

  const trustBadges = [
    { icon: MapPin, label: t(`${pageCity.cityName} Based`, `Local en ${pageCity.cityName}`, `Standort ${pageCity.cityName}`, `Local a ${pageCity.cityName}`), iconClass: isMadrid ? "text-orange-300" : "text-accent" },
    { icon: Zap, label: t("Fast Turnaround", "Entregas Rápidas", "Schnelle Lieferung", "Lliuraments Ràpids"), iconClass: "text-accent" },
    { icon: Award, label: t("Quality Materials", "Materiales de Calidad", "Qualitätsmaterialien", "Materials de Qualitat"), iconClass: "text-accent" },
    { icon: Settings2, label: t("Custom Orders", "Pedidos a Medida", "Individuelle Aufträge", "Comandes a Mida"), iconClass: "text-accent" },
  ];

  // Category label per page.category, translated with the same t() helper.
  const categoryLabel =
    page.category === "material"
      ? t("Materials", "Materiales", "Materialien", "Materials")
      : page.category === "service"
        ? t("Services", "Servicios", "Dienstleistungen", "Serveis")
        : page.category === "guide"
          ? t("Guides", "Guías", "Leitfäden", "Guies")
          : t("Use Cases", "Aplicaciones", "Anwendungsfälle", "Aplicacions");

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
    mainEntity: [
      ...faqsForSchema.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a }
      })),
      {
        "@type": "Question",
        name: "What if there's a problem with my print?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `If it's a defect or doesn't match what was quoted, tell us within 7 days of delivery and we'll make it right at no cost. Full quality guarantee: ${SITE_URL}/politica-devoluciones`,
        },
      },
    ]
  };

  const datePublished = page.datePublished ?? DEFAULT_DATE_PUBLISHED;
  const dateModified = page.dateModified ?? DEFAULT_DATE_MODIFIED;
  const isGuide = GUIDE_TOPICS.has(page.topic);
  const isBlogPost = page.topic.startsWith("blog-");

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
    image: SOCIAL_IMAGE_URL,
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
    capture('whatsapp_click', { source: 'landing_page', location: 'landing_hero', path: window.location.pathname });
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
        {/* For EN pages whose ES twin is the homepage (altSlug="/"), the topic registry has no ES entry */}
        {(topicSlugs.es
          ? <link rel="alternate" hrefLang="es" href={`${SITE_URL}${topicSlugs.es}`} />
          : (!isEs && !isCa && page.altSlug === "/"
              ? <link rel="alternate" hrefLang="es" href={`${SITE_URL}/`} />
              : null)
        )}
        {(topicSlugs.ca
          ? <link rel="alternate" hrefLang="ca" href={`${SITE_URL}${topicSlugs.ca}`} />
          : (!isEs && !isCa && page.altSlug === "/"
              ? <link rel="alternate" hrefLang="ca" href={`${SITE_URL}/ca/`} />
              : null)
        )}
        {topicSlugs.de && <link rel="alternate" hrefLang="de" href={`${SITE_URL}${topicSlugs.de}`} />}
        {page.extraHreflang?.map((h) => (
          <link key={h.lang} rel="alternate" hrefLang={h.lang} href={`${SITE_URL}${h.slug}`} />
        ))}
        {topicSlugs.en && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${topicSlugs.en}`} />}
        <meta property="og:title" content={page.metaTitle} />
        <meta property="og:description" content={page.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={isDe ? "de_DE" : isCa ? "ca_ES" : isEs ? "es_ES" : "en_US"} />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content={page.metaTitle} />
        <meta name="twitter:description" content={page.metaDescription} />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {howToSchema && (
          <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
        )}
      </Helmet>

      <Header />

      <main className="pt-[var(--header-h)]">
        {/* Hero — dark grid, H1 unchanged */}
        <DsHero
          variant="centered"
          extendBehindHeader={false}
          starLine={
            <span style={{ color: '#B8C4DA', display: 'flex', flexWrap: 'wrap', gap: '4px 10px', alignItems: 'center' }}>
              <Breadcrumbs
                items={[
                  { label: 'Dimension3D', href: homeSlug },
                  ...(includeCategoryCrumb ? [{ label: categoryLabel, href: categoryHub }] : []),
                  { label: page.h1 },
                ]}
              />
            </span>
          }
          h1={
            isBlogPost
              ? (
                <>
                  {page.h1}
                  <span style={{ display: 'block', fontSize: '0.44em', fontWeight: 500, color: '#B8C4DA', marginTop: 12, letterSpacing: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>
                    {isEs || isCa ? `Nico · Actualizado ${dateModified}` : isDe ? `Nico · Aktualisiert ${dateModified}` : `Nico · Updated ${dateModified}`}
                  </span>
                </>
              )
              : page.h1
          }
          paragraph={page.intro}
          primaryButton={{
            label: (
              <>
                {isMaker ? <Users style={{ width: 20, height: 20 }} /> : <Upload style={{ width: 20, height: 20 }} />}
                {isMaker
                  ? makerJoinLabel
                  : t("Request a Quote", "Solicitar Presupuesto", "Angebot anfordern", "Sol·licitar Pressupost")}
              </>
            ),
            onClick: isMaker ? () => navigate("/makers") : scrollToCalc,
          }}
          reassuranceItems={trustBadges.map(b => b.label)}
        />

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
                          "Lieber Aufträge, die zu dir kommen?",
                          "Prefereixes que les comandes arribin soles?"
                        )}
                      </h3>
                      <p className="text-muted-foreground mb-5">
                        {t(
                          "Free to join, no commission, no exclusivity — orders from your area go directly to you.",
                          "Unirse es gratis, sin comisión, sin exclusividad — los pedidos de tu zona van directamente a ti.",
                          "Kostenloser Beitritt, keine Provision, keine Exklusivität — Aufträge aus deiner Region gehen direkt an dich.",
                          "Unir-s'hi és gratuït, sense comissió, sense exclusivitat — les comandes de la teva zona van directament a tu."
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
                {t(`Real prints from our ${pageCity.cityName} workshop`, `Impresiones reales de nuestro taller en ${pageCity.cityName}`, `Echte Drucke aus unserer Werkstatt in ${pageCity.cityName}`, `Impressions reals del nostre taller a ${pageCity.cityName}`)}
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
          <StlEstimator highlighted={calcHighlight} />
        )}

        {/* Final CTA */}
        {isMaker ? (
          <section className="bg-[#0F172A] py-16 md:py-20 text-white">
            <div className="container px-4 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
                {t("Start earning with your 3D printer", "Empieza a ganar con tu impresora 3D", "Verdiene Geld mit deinem 3D-Drucker", "Comença a guanyar amb la teva impressora 3D")}
              </h2>
              <p className="text-lg text-white/80 mb-8">
                {t("Free to join. No fees, no commission, no exclusivity. Orders from your area go to you.", "Unirse es gratis. Sin cuotas, sin comisión, sin exclusividad. Los pedidos de tu zona van para ti.", "Kostenloser Beitritt. Keine Gebühren, keine Provision, keine Exklusivität. Aufträge aus deiner Region gehen an dich.", "Unir-s'hi és gratuït. Sense quotes, sense comissió, sense exclusivitat. Les comandes de la teva zona van per a tu.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="accent" size="xl" className="shadow-lg gap-2">
                  <Link to="/makers"><Users className="w-5 h-5" /> {makerJoinLabel}</Link>
                </Button>
                <Button asChild variant="hero-outline" size="xl" className="gap-2">
                  <Link to="/maker-guide"><BookOpen className="w-5 h-5" /> {makerHowLabel}</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <FinalCta
            heading={t("Ready to start your project?", "¿Listo para empezar tu proyecto?", "Bereit für dein Projekt?", "Llest per iniciar el teu projecte?")}
            cta={{
              label: t("Upload File", "Subir Archivo", "Datei hochladen", "Pujar Arxiu"),
              onClick: scrollToCalc,
            }}
            reassurance={t("Send your file or describe your idea. Free quote in under 1 hour.", "Envía tu archivo o describe tu idea. Presupuesto gratis en menos de 1 hora.", "Schick uns deine Datei oder beschreib deine Idee. Kostenloses Angebot in unter 1 Stunde.", "Envia el teu arxiu o descriu la teva idea. Pressupost gratis en menys d'1 hora.")}
          />
        )}

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-[#F6F8FC]">
          <div className="container px-4 max-w-3xl mx-auto">
            <FAQAccordion
              heading={t("Frequently Asked Questions", "Preguntas Frecuentes", "Häufige Fragen", "Preguntes Freqüents")}
              items={[
                ...page.faqs.map(f => ({ question: f.q, answer: f.a })),
                {
                  question: t("What if there's a problem with my print?", "¿Qué pasa si hay algún problema con mi impresión?", "Was passiert bei einem Problem?", "Què passa si hi ha algun problema?"),
                  answer: t(
                    "If it's a defect or doesn't match what was quoted, tell us within 7 days of delivery and we'll make it right at no cost.",
                    "Si hay un defecto o no coincide con lo presupuestado, comunícalo en 7 días desde la entrega y lo resolvemos sin coste.",
                    "Bei einem Defekt oder wenn es nicht dem Angebot entspricht, melde es innerhalb von 7 Tagen — wir lösen es kostenlos.",
                    "Si hi ha un defecte, comunica'ns-ho en 7 dies des del lliurament i ho resolem sense cost."
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* Reviews */}
        <Reviews cityName={pageCity.cityName} />

        {/* Related pages */}
        {page.related.length > 0 && (
          <section className="py-16 md:py-20 bg-[#F6F8FC]">
            <div className="container px-4 max-w-5xl mx-auto">
              <h2 className="text-xl font-bold text-[#0F172A] mb-8 text-center" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
                {t("Related services", "Servicios relacionados", "Weiterführende Themen", "Serveis relacionats")}
              </h2>
              <LinkCardGrid
                items={page.related.map(r => ({ href: r.slug, title: r.label }))}
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default LandingPage;
