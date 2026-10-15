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
import { EST, priceOrder } from "@/lib/estimator/core";
import type { OrderPartInput, PartEstimate } from "@/lib/estimator/core";
import type { IntlHubContent } from "@/data/intlTypes";
import { useLanguage } from "@/contexts/LanguageContext";

import { StlEstimator } from "@/components/StlEstimator";

// Price table computed at module level: no window/Date calls → no hydration mismatch.
// Reference part: 50 g, 0.8 h, 80×80×40 mm — same reference as the B2B batch table.
const _REF: PartEstimate = {
  plasticCm3: 50 / 1.27,
  supportCm3: 0,
  grams: 50,
  timeSec: 0.8 * 3600,
  fixedSec: 0,
  sizeXMm: 80,
  sizeYMm: 80,
  heightMm: 40,
  fitsPlate: true,
  orientation: 0,
  orientationName: "as uploaded",
};

const PRICE_QTY = [1, 10, 50] as const;
const PRICE_MATERIALS = ["PLA", "PETG", "ASA"] as const;

function _unitCents(material: string, qty: number): number {
  const part: PartEstimate = {
    ..._REF,
    plasticCm3: _REF.grams / (EST.materials[material]?.density ?? 1.27),
  };
  const inp: OrderPartInput = { name: "ref", quantity: qty, material, estimate: part };
  return Math.round(priceOrder([inp], "standard").baseCents / qty);
}

const PRICE_TABLE = PRICE_MATERIALS.map((mat) => ({
  material: mat,
  prices: PRICE_QTY.map((q) => _unitCents(mat, q)),
}));

function fmtEur(cents: number, locale: string): string {
  return (cents / 100).toLocaleString(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function renderProse(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
      {p.trim()}
    </p>
  ));
}

interface Props {
  content: IntlHubContent;
}

const IntlHubPage = ({ content }: Props) => {
  const PAGE_URL = `${SITE_URL}${content.slug}`;
  const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);
  const { t } = useLanguage();

  const scrollToCalc = () => {
    capture("hub_cta_click", { market: content.countryCode, type: "calculator" });
    const el = document.getElementById("calculator");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      capture("international_page_view", {
        market: content.countryCode,
        lang: content.lang,
        slug: content.slug,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [content.slug, content.countryCode, content.lang]);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": PAGE_URL,
    url: PAGE_URL,
    name: content.metaTitle,
    description: content.metaDescription,
    inLanguage: content.locale,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Dimension3D", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: content.breadcrumbHub, item: PAGE_URL },
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
    areaServed: { "@type": "Country", identifier: content.countryCode },
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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <html lang={content.locale} />
        <title>{content.metaTitle}</title>
        <meta name="description" content={content.metaDescription} />
        <link rel="canonical" href={PAGE_URL} />
        {/* Full reciprocal hreflang cluster — all 5 hubs + English hub, x-default = EN */}
        <link rel="alternate" hrefLang="de" href={`${SITE_URL}/de/3d-druck-service`} />
        <link rel="alternate" hrefLang="nl" href={`${SITE_URL}/nl/3d-printen-laten-maken`} />
        <link rel="alternate" hrefLang="fr" href={`${SITE_URL}/fr/impression-3d-en-ligne`} />
        <link rel="alternate" hrefLang="it" href={`${SITE_URL}/it/stampa-3d-online`} />
        <link rel="alternate" hrefLang="pt" href={`${SITE_URL}/pt/impressao-3d-online`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/3d-printing-service`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/3d-printing-service`} />
        <meta property="og:title" content={content.metaTitle} />
        <meta property="og:description" content={content.metaDescription} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={content.locale.replace("-", "_")} />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content={content.metaTitle} />
        <meta name="twitter:description" content={content.metaDescription} />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden hero-gradient">
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

          <div className="container relative z-10 px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <nav className="flex items-center justify-center gap-2 text-xs text-primary-foreground/50 mb-5">
                <Link to="/" className="hover:text-primary-foreground/80 transition-colors">
                  Dimension3D
                </Link>
                <span>/</span>
                <span className="text-primary-foreground/70">{content.breadcrumbHub}</span>
              </nav>

              <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                {content.eyebrow}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
                {content.h1}
              </h1>

              <p className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
                {content.heroSubtitle ?? content.promise}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="cta" size="xl" className="shadow-lg" onClick={scrollToCalc}>
                  {t("hub.ctaButton")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="whatsapp-outline"
                  size="xl"
                  onClick={() => {
                    capture("whatsapp_click", {
                      location: "hub_hero",
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

        {/* Calculator — immediately after hero so upload CTA is near top */}
        <section id="calculator" className="py-16 bg-muted/30 scroll-mt-20">
          <div className="container px-4 max-w-5xl mx-auto">
            <StlEstimator />
          </div>
        </section>

        {/* Full intro / promise text (moved below calculator for SEO, above fold already covered by hero) */}
        {content.heroSubtitle && (
          <section className="py-12 bg-background">
            <div className="container px-4 max-w-4xl mx-auto">
              {renderProse(content.promise)}
            </div>
          </section>
        )}

        {/* How ordering works */}
        <section className="py-16 bg-background">
          <div className="container px-4 max-w-4xl mx-auto">
            {renderProse(content.howItWorks)}
          </div>
        </section>

        {/* What we print */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 max-w-4xl mx-auto">
            {renderProse(content.whatWePrint)}
          </div>
        </section>

        {/* Materials */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 max-w-4xl mx-auto">
            {renderProse(content.materialsText)}
          </div>
        </section>

        {/* Price table */}
        <section className="py-16 bg-background">
          <div className="container px-4 max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">{content.priceTableCaption}</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Material</th>
                    {PRICE_QTY.map((q) => (
                      <th key={q} className="px-4 py-3 text-right font-medium">
                        ×&thinsp;{q}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRICE_TABLE.map((row) => (
                    <tr key={row.material} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{row.material}</td>
                      {row.prices.map((p, i) => (
                        <td key={i} className="px-4 py-3 text-right tabular-nums">
                          {fmtEur(p, content.locale)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* File formats */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 max-w-4xl mx-auto">
            {renderProse(content.fileFormatsText)}
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

        {/* City and guide links */}
        {(content.cityLinks.length > 0 || content.guideLinks.length > 0) && (
          <section className="py-16 bg-muted/30">
            <div className="container px-4 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {content.cityLinks.length > 0 && (
                <ul className="space-y-2">
                  {content.cityLinks.map((link) => (
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
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default IntlHubPage;
