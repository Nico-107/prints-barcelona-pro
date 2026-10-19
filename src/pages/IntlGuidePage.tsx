import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ChevronRight } from "lucide-react";
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
import { AUTHOR_REF, PUBLISHER_REF } from "@/seo/entities";
import type { IntlGuideContent } from "@/data/intlTypes";
import { StlEstimator } from "@/components/StlEstimator";

function renderProse(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
      {p.trim()}
    </p>
  ));
}

interface Props {
  content: IntlGuideContent;
}

const IntlGuidePage = ({ content }: Props) => {
  const PAGE_URL = `${SITE_URL}${content.slug}`;

  const scrollToCalc = () => {
    capture("guide_cta_click", { lang: content.lang, topic: content.topic });
    const el = document.getElementById("calculator");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      capture("guide_page_view", {
        lang: content.lang,
        topic: content.topic,
        slug: content.slug,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [content.slug, content.lang, content.topic]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.h1,
    description: content.metaDescription,
    inLanguage: content.locale,
    url: PAGE_URL,
    dateModified: "2026-10-15",
    datePublished: "2026-08-01",
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
      { "@type": "ListItem", position: 3, name: content.h1, item: PAGE_URL },
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
                <span className="text-primary-foreground/70 truncate max-w-[160px]">
                  {content.h1}
                </span>
              </nav>

              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                {content.h1}
              </h1>

              <p className="text-lg text-primary-foreground/85 mb-8 max-w-2xl mx-auto leading-relaxed">
                {content.intro}
              </p>

              <Button variant="cta" size="lg" onClick={scrollToCalc}>
                Calculator
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Article body */}
        <article className="py-16 bg-background">
          <div className="container px-4 max-w-3xl mx-auto">
            {content.sections.map((sec, i) => (
              <section key={i} className="mb-12">
                <h2 className="text-2xl font-bold mb-4">{sec.heading}</h2>
                {renderProse(sec.body)}
              </section>
            ))}

            {/* Worked examples table (price guide only) */}
            {content.workedExamples && content.workedExamples.length > 0 && (
              <section className="mb-12">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Teil</th>
                        <th className="px-4 py-3 text-right font-medium">g</th>
                        <th className="px-4 py-3 text-right font-medium">h</th>
                        <th className="px-4 py-3 text-left font-medium">Material</th>
                        <th className="px-4 py-3 text-right font-medium">Preis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.workedExamples.map((ex, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-4 py-3 font-medium">{ex.name}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{ex.grams}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{ex.hours}</td>
                          <td className="px-4 py-3">{ex.material}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">
                            {ex.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </article>

        {/* Calculator */}
        <section id="calculator" className="py-16 bg-muted/30 scroll-mt-20">
          <div className="container px-4 max-w-5xl mx-auto">
            <StlEstimator />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-background">
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

        {/* City links */}
        {content.cityLinks.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container px-4 max-w-3xl mx-auto">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {content.cityLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-1.5 text-accent hover:underline text-sm"
                    >
                      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default IntlGuidePage;
