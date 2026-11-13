import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, MessageCircle, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { whatsappUrl, ACTIVE_CITY } from "@/config/cities";
import { capture } from "@/lib/analytics";
import { SITE_URL, SOCIAL_IMAGE_URL } from "@/seo/registry";
import type { IntlCityContent } from "@/data/intlTypes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Hero as DsHero, FAQAccordion, UploadPanel } from "@/components/ds";
import DeliveryTimeline from "@/components/city/DeliveryTimeline";
import EnginePriceTable from "@/components/city/EnginePriceTable";
import { INTL_MARKETS } from "@/config/intlMarkets";

import { StlEstimator } from "@/components/StlEstimator";

function renderProse(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
      {p.trim()}
    </p>
  ));
}

interface Props {
  content: IntlCityContent;
}

const IntlCityPage = ({ content }: Props) => {
  const PAGE_URL = `${SITE_URL}${content.slug}`;
  const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);
  const { t } = useLanguage();

  const scrollToCalc = () => {
    capture("city_cta_click", {
      city: content.city,
      market: content.countryCode,
      type: "calculator",
    });
    const el = document.getElementById("calculator");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    // Open the native file picker on the same user gesture so the CTA isn't a dead click.
    const clickFileInput = () => {
      const fileInput = el.querySelector('input[type="file"]') as HTMLInputElement | null;
      if (fileInput) { fileInput.click(); return true; }
      return false;
    };
    if (clickFileInput()) return;
    let tries = 0;
    const retry = () => {
      if (clickFileInput() || tries++ > 10) return;
      requestAnimationFrame(retry);
    };
    requestAnimationFrame(retry);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      capture("city_page_view", {
        city: content.city,
        market: content.countryCode,
        lang: content.lang,
        slug: content.slug,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [content.slug, content.city, content.countryCode, content.lang]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.h1,
    description: content.metaDescription,
    inLanguage: content.locale,
    url: PAGE_URL,
    dateModified: "2026-10-15",
    datePublished: "2026-08-01",
    publisher: {
      "@type": "Organization",
      name: "Dimension3D",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    image: SOCIAL_IMAGE_URL,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Dimension3D", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: content.hubLink.label,
        item: `${SITE_URL}${content.hubLink.to}`,
      },
      { "@type": "ListItem", position: 3, name: content.city, item: PAGE_URL },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.h1,
    description: content.metaDescription,
    provider: {
      "@type": "Organization",
      name: "Dimension3D",
      url: SITE_URL,
    },
    areaServed: [
      { "@type": "Country", identifier: content.countryCode },
      { "@type": "City", name: content.city },
    ],
    url: PAGE_URL,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // hreflang: when altSlug present, pair native ↔ en, x-default = English page
  const enSlug = content.altSlug;
  const isNativeLang = content.lang !== "en";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={content.locale} />
        <title>{content.metaTitle}</title>
        <meta name="description" content={content.metaDescription} />
        <link rel="canonical" href={PAGE_URL} />
        {enSlug && isNativeLang && (
          <link rel="alternate" hrefLang={content.lang} href={PAGE_URL} />
        )}
        {enSlug && isNativeLang && (
          <link rel="alternate" hrefLang="en" href={`${SITE_URL}${enSlug}`} />
        )}
        {enSlug && isNativeLang && (
          <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${enSlug}`} />
        )}
        <meta property="og:title" content={content.metaTitle} />
        <meta property="og:description" content={content.metaDescription} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content={content.locale.replace("-", "_")} />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content={content.metaTitle} />
        <meta name="twitter:description" content={content.metaDescription} />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        {content.noindex && <meta name="robots" content="noindex,follow" />}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main id="main-content" className="pt-[var(--header-h)]">
        {/* Hero */}
        <DsHero
          variant="centered"
          extendBehindHeader={false}
          starLine={
            <span style={{ display: 'flex', gap: '4px 10px', flexWrap: 'wrap', alignItems: 'center', color: '#B8C4DA' }}>
              <Link to="/" style={{ color: '#B8C4DA', textDecoration: 'none' }}>Dimension3D</Link>
              <span>/</span>
              <Link to={content.hubLink.to} style={{ color: '#B8C4DA', textDecoration: 'none' }}>{content.hubLink.label}</Link>
              <span>/</span>
              <span>{content.city}</span>
            </span>
          }
          h1={content.h1}
          paragraph={content.deliveryNote}
          primaryButton={{
            label: <>{t("hub.ctaButton")} <ArrowRight style={{ width: 20, height: 20 }} /></>,
            onClick: scrollToCalc,
          }}
          reassuranceItems={[]}
        />

        {/* Calculator — immediately after hero so upload CTA is near top */}
        <div id="calculator" style={{ background: '#F6F8FC', scrollMarginTop: 80 }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "84px 24px" }}>
            <UploadPanel
              label="INSTANT PRICE — FROM 10 €"
              heading="Upload your files and see the price now."
              description="No account required. 10 € minimum order, no setup fee. Shipping calculated at checkout."
            >
              <StlEstimator compact shippingOnly />
            </UploadPanel>
          </div>
        </div>

        {/* Item 5: delivery timeline + engine price table. Transit days come
            from INTL_MARKETS for the page's country. */}
        {(() => {
          const market = INTL_MARKETS.find((m) => m.code === content.countryCode);
          const transitRaw = market?.typicalDeliveryDays ?? "3–5 business days";
          const transitDays = transitRaw.replace(/\s+(business days|días hábiles|días laborables|jours ouvrés|jours ouvrables|Werktage|werkdagen|giorni lavorativi|dias úteis)\s*$/i, "");
          return (
            <>
              <DeliveryTimeline lang={content.lang as "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt"} transitDays={transitDays} shippingPrice="5,90 €" />
              <EnginePriceTable lang={content.lang as "es" | "en" | "ca" | "de" | "fr" | "it" | "nl" | "pt"} testId="city-price-table" />
            </>
          );
        })()}

        {/* Intro body text — moved below calculator; hero already shows button above fold */}
        <section className="py-16 bg-background">
          <div className="container px-4 max-w-4xl mx-auto">
            {renderProse(content.introText)}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-[#F6F8FC]">
          <div className="container px-4 max-w-4xl mx-auto">
            <FAQAccordion
              items={content.faqs.map(f => ({ question: f.q, answer: f.a }))}
            />
          </div>
        </section>

        {/* Related links */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {content.siblingLinks.length > 0 && (
              <ul className="space-y-2">
                {content.siblingLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-2 text-accent hover:underline text-sm"
                    >
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {content.guideLinks.length > 0 && (
              <ul className="space-y-2">
                {content.guideLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-2 text-accent hover:underline text-sm"
                    >
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default IntlCityPage;
