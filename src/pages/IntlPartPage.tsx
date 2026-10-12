import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ChevronRight } from "lucide-react";
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
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";
import type { IntlPartContent } from "@/data/intlTypes";

function renderProse(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
      {p.trim()}
    </p>
  ));
}

interface Props {
  content: IntlPartContent;
}

const IntlPartPage = ({ content }: Props) => {
  const PAGE_URL = `${SITE_URL}${content.slug}`;
  const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

  // price formatted in locale (e.g. "12,50 €")
  const formattedPrice = content.price.toLocaleString(content.locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      capture("part_page_view", {
        lang: content.lang,
        countryCode: content.countryCode,
        slug: content.slug,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [content.slug, content.lang, content.countryCode]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.h1,
    description: content.metaDescription,
    inLanguage: content.locale,
    url: PAGE_URL,
    author: AUTHOR_REF,
    publisher: PUBLISHER_REF,
    image: SOCIAL_IMAGE_URL,
    mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
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
      { "@type": "ListItem", position: 3, name: content.productName, item: PAGE_URL },
    ],
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
        {/* hreflang: pair with Spanish original; x-default = Spanish */}
        <link rel="alternate" hrefLang={content.lang} href={PAGE_URL} />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}${content.originalSlug}`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${content.originalSlug}`} />
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
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden hero-gradient py-20">
          <div className="absolute top-12 left-8 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-12 w-56 h-56 bg-accent/10 rounded-full blur-3xl" />

          <div className="container relative z-10 px-4">
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
                <span className="text-primary-foreground/70 truncate max-w-[200px]">
                  {content.productName}
                </span>
              </nav>

              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                {content.h1}
              </h1>

              <p className="text-lg text-primary-foreground/85 mb-8 max-w-2xl mx-auto leading-relaxed">
                {content.problemStatement}
              </p>

              <div className="inline-flex items-center gap-3 bg-accent/15 border border-accent/30 rounded-xl px-6 py-3 mb-8">
                <span className="text-3xl font-bold text-accent">{formattedPrice}</span>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="whatsapp-outline"
                  size="xl"
                  onClick={() => {
                    capture("whatsapp_click", {
                      location: "part_hero",
                      path: content.slug,
                    });
                    window.open(
                      `${WHATSAPP_URL}?text=${encodeURIComponent(
                        `Hola, me interesa ${content.productName}`
                      )}`,
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

        {/* Product details */}
        <section className="py-16 bg-background">
          <div className="container px-4 max-w-3xl mx-auto space-y-10">
            {/* Description */}
            <div>{renderProse(content.description)}</div>

            {/* How it's made */}
            <div>{renderProse(content.howItsMade)}</div>

            {/* Specs grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Material
                </p>
                <p className="font-medium">{content.material}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Compatibilidad
                </p>
                <p className="font-medium">{content.compatibleWith}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 max-w-3xl mx-auto">
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

        {/* Disclaimer */}
        <section className="py-8 bg-background">
          <div className="container px-4 max-w-3xl mx-auto">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">{content.disclaimer}</p>
          </div>
        </section>

        {/* Hub link */}
        <section className="py-8 bg-muted/30">
          <div className="container px-4 max-w-3xl mx-auto">
            <Link
              to={content.hubLink.to}
              className="flex items-center gap-2 text-accent hover:underline text-sm"
            >
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              {content.hubLink.label}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default IntlPartPage;
