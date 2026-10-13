import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, MessageCircle, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { whatsappUrl, ACTIVE_CITY } from "@/config/cities";
import { capture } from "@/lib/analytics";
import { SITE_URL, SOCIAL_IMAGE_URL } from "@/seo/registry";
import type { IntlCityContent } from "@/data/intlTypes";
import { useLanguage } from "@/contexts/LanguageContext";

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
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
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
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden hero-gradient">
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          <div className="absolute top-12 left-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

          <div className="container relative z-10 px-4 py-14">
            <div className="max-w-3xl mx-auto text-center">
              <nav className="flex items-center justify-center gap-2 text-xs text-primary-foreground/50 mb-5">
                <Link to="/" className="hover:text-primary-foreground/80 transition-colors">
                  Dimension3D
                </Link>
                <span>/</span>
                <Link
                  to={content.hubLink.to}
                  className="hover:text-primary-foreground/80 transition-colors"
                >
                  {content.hubLink.label}
                </Link>
                <span>/</span>
                <span className="text-primary-foreground/70">{content.city}</span>
              </nav>

              <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                {content.eyebrow}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                {content.h1}
              </h1>

              <p className="text-base md:text-lg text-primary-foreground/80 mb-4 max-w-xl mx-auto">
                {content.deliveryNote}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button variant="cta" size="xl" className="shadow-lg" onClick={scrollToCalc}>
                  {t("hub.ctaButton")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="whatsapp-outline"
                  size="xl"
                  onClick={() => {
                    capture("whatsapp_click", {
                      location: "city_hero",
                      path: content.slug,
                    });
                    window.open(
                      `${WHATSAPP_URL}?text=${encodeURIComponent(content.whatsappMsg)}`,
                      "_blank"
                    );
                  }}
                  className="group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Intro body text */}
        <section className="py-16 bg-background">
          <div className="container px-4 max-w-4xl mx-auto">
            {renderProse(content.introText)}
          </div>
        </section>

        {/* Calculator */}
        <section id="calculator" className="py-16 bg-muted/30 scroll-mt-20">
          <div className="container px-4 max-w-5xl mx-auto">
            <StlEstimator />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-background">
          <div className="container px-4 max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {content.faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left font-medium py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
