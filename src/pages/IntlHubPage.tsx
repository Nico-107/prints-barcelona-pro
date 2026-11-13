import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { capture } from "@/lib/analytics";
import { Hero as DsHero, FAQAccordion, FactsStrip, FinalCta, FounderSection, LinkCardGrid, QuoteFeature, StepCards, UploadPanel } from "@/components/ds";
import { whatsappUrl } from "@/config/cities";
import { SITE_URL, SOCIAL_IMAGE_URL } from "@/seo/registry";
import { WEBSITE_SCHEMA } from "@/seo/entities";
import { EST, priceOrder } from "@/lib/estimator/core";
import type { OrderPartInput, PartEstimate } from "@/lib/estimator/core";
import type { IntlHubContent } from "@/data/intlTypes";
import { INTL_MARKETS } from "@/config/intlMarkets";

import { StlEstimator } from "@/components/StlEstimator";
import { REVIEWS, reviewText } from "@/data/reviews";
import { useLanguage } from "@/contexts/LanguageContext";

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

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderProse(text: string) {
  return text.split(/\n\n+/).map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) return <h3 key={i} className="font-semibold text-foreground mt-4 mb-1">{trimmed.slice(3)}</h3>;
    if (trimmed.startsWith('# ')) return <h2 key={i} className="font-bold text-foreground text-lg mt-6 mb-2">{trimmed.slice(2)}</h2>;
    const lines = trimmed.split('\n');
    if (lines.some(l => l.startsWith('- '))) {
      return (
        <ul key={i} className="list-disc pl-5 mb-4 text-muted-foreground leading-relaxed space-y-1">
          {lines.filter(l => l.startsWith('- ')).map((l, j) => <li key={j}>{renderInline(l.slice(2))}</li>)}
        </ul>
      );
    }
    return (
      <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
        {renderInline(trimmed)}
      </p>
    );
  });
}


function renderHowItWorks(text: string) {
  const isStepList = /^\d+\.\s+\*\*/m.test(text);
  if (!isStepList) return renderProse(text);

  const lines = text.split('\n');
  let heading: string | null = null;
  const steps: Array<{ number: number; title: string; description: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !/^\d+\./.test(trimmed)) {
      heading = trimmed.slice(2, -2);
      continue;
    }
    const m = trimmed.match(/^(\d+)\.\s+\*\*([^*]+)\*\*\s*[—–-]\s*(.+)/);
    if (m) steps.push({ number: parseInt(m[1]), title: m[2], description: m[3] });
  }

  if (steps.length === 0) return renderProse(text);

  return (
    <>
      {heading && <h2 className="font-bold text-foreground text-xl mb-6">{heading}</h2>}
      <StepCards steps={steps} />
    </>
  );
}

interface Props {
  content: IntlHubContent;
}

const IntlHubPage = ({ content }: Props) => {
  const PAGE_URL = `${SITE_URL}${content.slug}`;
  const { t } = useLanguage();

  // Phase 1.3: exactly one <h1> in the DOM. Same pattern as Index.tsx.
  // Read the html attribute directly (set pre-paint) and remove once.
  useEffect(() => {
    const v = document.documentElement.getAttribute("data-xp-site-variant");
    const dropClass = v === "B" ? "xp-home-v1-only" : "xp-home-v2-only";
    document.querySelectorAll("." + dropClass).forEach((el) => el.remove());
  }, []);

  const hubReviews = REVIEWS.slice(0, 3).map((r) => {
    const text = reviewText(r, content.lang);
    const isTranslated = content.lang !== r.originalLang;
    return {
      text,
      author: `— ${r.name}`,
      original: isTranslated ? r.original : undefined,
      translatedLabel: isTranslated ? t("review.translatedFrom") : undefined,
      seeLabel: t("review.seeOriginal"),
      hideLabel: t("review.hideOriginal"),
    };
  });

  const scrollToCalc = (section: string) => {
    capture("international_cta_click", { market: content.countryCode, lang: content.lang, section });
    const el = document.getElementById("calculator");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    // The StlEstimator mounts lazily; the file <input> may not exist yet on
    // first click (that's the deadclick 14 IT users hit on /it/stampa-3d-online).
    // Try immediately AND once the lazy chunk resolves — synchronous call keeps
    // the user-gesture context for the native file picker.
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

      <main id="main-content" className="pt-[var(--header-h)]">
        {/* V1 hero */}
        <div className="xp-home-v1-only">
          <DsHero
            variant="centered"
            extendBehindHeader={false}
            starLine={
              <span style={{ display: 'flex', gap: '4px 10px', flexWrap: 'wrap', alignItems: 'center', color: '#B8C4DA' }}>
                <Link to="/" style={{ color: '#B8C4DA', textDecoration: 'none' }}>Dimension3D</Link>
                <span>/</span>
                <span>{content.breadcrumbHub}</span>
              </span>
            }
            h1={content.h1}
            paragraph={content.heroSubtitle ?? content.promise.split("\n\n")[0]}
            primaryButton={{
              label: <>{content.ctaLabel} <ArrowRight style={{ width: 20, height: 20 }} /></>,
              onClick: () => scrollToCalc("hero"),
            }}
            reassuranceItems={content.trustChips}
          />
        </div>

        {/* V2 hero — split-image, extends behind fixed header via built-in marginTop=-header-h */}
        <div className="xp-home-v2-only">
          <DsHero
            variant="split-image"
            starLine={
              <span style={{ display: 'flex', gap: '4px 10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/" style={{ color: '#B8C4DA', textDecoration: 'none' }}>Dimension3D</Link>
                <span style={{ color: '#B8C4DA' }}>/</span>
                <span style={{ color: '#B8C4DA' }}>{content.breadcrumbHub}</span>
              </span>
            }
            h1={content.h1}
            paragraph={content.heroSubtitle ?? content.promise.split("\n\n")[0]}
            primaryButton={{
              label: <>{content.ctaLabel} <ArrowRight style={{ width: 20, height: 20 }} /></>,
              onClick: () => scrollToCalc("hero"),
            }}
            reassuranceItems={[content.noRegistration]}
            splitImage={{ src: "/img/x2d/x2d-inside.jpg", alt: content.h1 }}
          />
        </div>

        {/* Quick stats — V1 light, V2 dark */}
        {(() => {
          const statsItems = [
            { value: "< 1 h", label: content.trustChips[1] },
            { value: INTL_MARKETS.find(m => m.code === content.countryCode)?.typicalDeliveryDays ?? "3–5 d", label: content.trustChips[3] },
            { value: "5,90 €", label: content.trustChips[2] },
            { value: "10 €", label: content.trustChips[0] },
          ];
          return (
            <>
              <div className="xp-home-v1-only"><FactsStrip items={statsItems} variant="light" /></div>
              <div className="xp-home-v2-only"><FactsStrip items={statsItems} variant="dark" /></div>
            </>
          );
        })()}

        {/* Calculator */}
        <div id="calculator" style={{ background: '#F6F8FC', scrollMarginTop: 80 }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "84px 24px" }}>
            <UploadPanel
              label={content.lang === "de" ? "SOFORTPREIS — AB 10 €" : content.lang === "fr" ? "PRIX INSTANTANÉ — DÈS 10 €" : content.lang === "nl" ? "DIRECTE PRIJS — VANAF 10 €" : content.lang === "it" ? "PREZZO ISTANTANEO — DA 10 €" : content.lang === "pt" ? "PREÇO INSTANTÂNEO — A PARTIR DE 10 €" : "INSTANT PRICE — FROM 10 €"}
              heading={content.lang === "de" ? "Lade deine Dateien hoch und sieh den Preis sofort." : content.lang === "fr" ? "Télécharge tes fichiers et vois le prix maintenant." : content.lang === "nl" ? "Upload je bestanden en zie de prijs direct." : content.lang === "it" ? "Carica i tuoi file e vedi il prezzo subito." : content.lang === "pt" ? "Carrega os teus ficheiros e vê o preço agora." : "Upload your files and see the price now."}
              description={content.lang === "de" ? "Kein Konto erforderlich. Mindestbestellung 10 €, keine Einrichtungsgebühr." : content.lang === "fr" ? "Sans compte. Commande minimum 10 €, sans frais de mise en place." : content.lang === "nl" ? "Geen account nodig. Minimumbestelling 10 €, geen installatiekosten." : content.lang === "it" ? "Nessun account richiesto. Ordine minimo 10 €, nessuna tariffa di configurazione." : content.lang === "pt" ? "Sem conta. Encomenda mínima 10 €, sem taxa de configuração." : "No account required. 10 € minimum order, no setup fee."}
            >
              <StlEstimator compact shippingOnly />
            </UploadPanel>
          </div>
        </div>

        {/* Promise / intro text */}
        {content.heroSubtitle && (
          <section className="py-12 bg-background">
            <div className="container px-4 max-w-[720px] mx-auto prose prose-sm md:prose-base max-w-none">
              {renderProse(content.promise)}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="bg-secondary/20 py-14 md:py-20">
          <div className="container px-4">
            <div className="max-w-[720px] mx-auto">
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
                {renderHowItWorks(content.howItWorks)}
              </div>
            </div>
          </div>
        </section>

        {/* What we print */}
        <section className="py-14 md:py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-[720px] mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
              {renderProse(content.whatWePrint)}
            </div>
          </div>
        </section>

        {/* Materials */}
        <section className="bg-secondary/20 py-14 md:py-20">
          <div className="container px-4">
            <div className="max-w-[720px] mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
              {renderProse(content.materialsText)}
            </div>
          </div>
        </section>

        {/* Price table */}
        <section className="py-14 md:py-20 bg-background">
          <div className="container px-4 max-w-[720px] mx-auto">
            <p className="text-sm text-muted-foreground mb-4">{content.priceTableCaption}</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">{content.materialLabel ?? "Material"}</th>
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
          <div className="container px-4 max-w-[720px] mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
            {renderProse(content.fileFormatsText)}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-20 bg-[#F6F8FC]">
          <div className="container px-4 max-w-[720px] mx-auto">
            <FAQAccordion
              items={content.faqs.map(f => ({ question: f.q, answer: f.a }))}
            />
          </div>
        </section>

        {/* Long SEO text (optional) */}
        {content.seoText && (
          <section className="py-14 bg-secondary/20">
            <div className="container px-4 max-w-[720px] mx-auto prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
              {renderProse(content.seoText)}
            </div>
          </section>
        )}

        {/* City and guide links */}
        {(content.cityLinks.length > 0 || content.guideLinks.length > 0) && (
          <section className="py-14 bg-background">
            <div className="container px-4 max-w-5xl mx-auto">
              <LinkCardGrid
                items={[
                  ...content.cityLinks.map(l => ({ href: l.to, title: l.label })),
                  ...content.guideLinks.map(l => ({ href: l.to, title: l.label })),
                ]}
              />
            </div>
          </section>
        )}

        {/* Reviews */}
        <QuoteFeature
          featured={hubReviews[0]}
          secondary={hubReviews.slice(1)}
          variant="dark"
        />

        {/* Founder section — V2 only */}
        <div className="xp-home-v2-only">
          <FounderSection
            imageSrc="/img/x2d/x2d-room.jpg"
            imageAlt={t("home.founder.spec1")}
            label={t("home.founder.label")}
            heading={t("home.founder.heading")}
            body={t("home.founder.body")}
            specs={[t("home.founder.spec1"), t("home.founder.spec2"), t("home.founder.spec3")]}
            cta={{ label: t("home.founder.cta"), href: whatsappUrl() }}
          />
        </div>

        {/* Final CTA band */}
        <FinalCta
          heading={content.h1}
          cta={{ label: content.ctaLabel, onClick: () => scrollToCalc("final") }}
          reassurance={content.noRegistration}
        />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default IntlHubPage;
