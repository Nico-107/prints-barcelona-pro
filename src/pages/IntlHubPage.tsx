import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, ChevronRight, Clock, Globe, Package } from "lucide-react";
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
import { capture } from "@/lib/analytics";
import { SITE_URL, SOCIAL_IMAGE_URL } from "@/seo/registry";
import { WEBSITE_SCHEMA } from "@/seo/entities";
import { EST, priceOrder } from "@/lib/estimator/core";
import type { OrderPartInput, PartEstimate } from "@/lib/estimator/core";
import type { IntlHubContent } from "@/data/intlTypes";
import { INTL_MARKETS } from "@/config/intlMarkets";

import { StlEstimator } from "@/components/StlEstimator";

// Reference part for price table — 50 g, 0.8 h — same as B2B table.
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

  const scrollToCalc = (section: string) => {
    capture("international_cta_click", { market: content.countryCode, lang: content.lang, section });
    const el = document.getElementById("calculator");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      const fileInput = el.querySelector('input[type="file"]') as HTMLInputElement | null;
      fileInput?.click();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      capture("international_page_view", {
        market: content.countryCode,
        lang: content.lang,
        slug: content.slug,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [content.slug, content.countryCode, content.lang]);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${SITE_URL}/#business`,
    name: "Dimension3D",
    alternateName: [
      "Dimension 3D Prints",
      "Dimension3D BCN",
      "Dimension 3D Barcelona",
      ...content.orgAlternateNames,
    ],
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
    image: SOCIAL_IMAGE_URL,
    telephone: "+34 672 051 147",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rambla del Brasil, 53",
      addressLocality: "Barcelona",
      postalCode: "08028",
      addressRegion: "Cataluña",
      addressCountry: "ES",
    },
  };

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
    provider: { "@type": "Organization", name: "Dimension3D", url: SITE_URL },
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
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
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
              <nav className="flex items-center justify-center gap-2 text-xs text-primary-foreground/70 mb-4">
                <Link to="/" className="hover:text-primary-foreground/90 transition-colors">
                  Dimension3D
                </Link>
                <span>/</span>
                <span className="text-primary-foreground/85">{content.breadcrumbHub}</span>
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

              <div className="flex flex-col items-center gap-3 mb-6">
                <Button
                  variant="cta"
                  size="xl"
                  className="shadow-lg w-full sm:w-auto"
                  data-ph-name="hub-hero-cta"
                  onClick={() => scrollToCalc("hero")}
                >
                  {content.ctaLabel}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-primary-foreground/60 text-sm">{content.noRegistration}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 text-primary-foreground/75 text-sm">
                {content.trustChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cta flex-shrink-0" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 46.7C1200 43.3 1320 36.7 1380 33.3L1440 30V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* Quick stats */}
        <section className="container px-4 py-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Clock, value: "< 1 h", label: content.trustChips[1] },
              { icon: Package, value: INTL_MARKETS.find(m => m.code === content.countryCode)?.typicalDeliveryDays ?? "3–5 d", label: content.trustChips[3] },
              { icon: Globe, value: "5,90 €", label: content.trustChips[2] },
              { icon: CheckCircle2, value: "€10", label: content.trustChips[0] },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center p-5 rounded-xl border border-border/50 bg-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-lg font-bold text-foreground mb-1 leading-tight">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Calculator */}
        <section id="calculator" className="py-16 bg-muted/30 scroll-mt-20">
          <div className="container px-4 max-w-5xl mx-auto">
            <StlEstimator />
          </div>
        </section>

        {/* Promise / intro text */}
        {content.heroSubtitle && (
          <section className="py-12 bg-background">
            <div className="container px-4 max-w-4xl mx-auto prose prose-sm md:prose-base max-w-none">
              {renderProse(content.promise)}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="bg-secondary/20 py-14 md:py-20">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
                {renderProse(content.howItWorks)}
              </div>
            </div>
          </div>
        </section>

        {/* What we print */}
        <section className="py-14 md:py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
              {renderProse(content.whatWePrint)}
            </div>
          </div>
        </section>

        {/* Materials */}
        <section className="bg-secondary/20 py-14 md:py-20">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
              {renderProse(content.materialsText)}
            </div>
          </div>
        </section>

        {/* Price table */}
        <section className="py-14 md:py-20 bg-background">
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
        <section className="py-14 bg-secondary/20">
          <div className="container px-4 max-w-4xl mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
            {renderProse(content.fileFormatsText)}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-20 bg-background">
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

        {/* Long SEO text (optional) */}
        {content.seoText && (
          <section className="py-14 bg-secondary/20">
            <div className="container px-4 max-w-3xl mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
              {renderProse(content.seoText)}
            </div>
          </section>
        )}

        {/* City and guide links */}
        {(content.cityLinks.length > 0 || content.guideLinks.length > 0) && (
          <section className="py-14 bg-background">
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

        {/* Final CTA band */}
        <section className="container px-4 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {content.h1}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {content.promise.split("\n\n")[0]}
            </p>
            <Button
              variant="cta"
              size="xl"
              className="shadow-lg"
              data-ph-name="hub-final-cta"
              onClick={() => scrollToCalc("final")}
            >
              {content.ctaLabel}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default IntlHubPage;
