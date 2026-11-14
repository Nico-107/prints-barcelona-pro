import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SocialMeta from "@/components/SocialMeta";
import { LEGAL_IDENTITY, LEGAL_UPDATED_AT } from "@/config/legalIdentity";
import { LEGAL_LINKS, type LegalLang, type LegalPageKey } from "@/config/legalLinks";

const SITE_URL = "https://www.dimension3dprints.com";

/**
 * Localised strings for the four legal pages, shared across all 8 languages.
 * Spanish is the binding version; every translation carries a visible
 * "Spanish prevails" line at the top linking back to the Spanish page.
 */

type Copy = {
  prevailsNotice: string; // empty for Spanish
  updatedLabel: string;
  tableHeadings: { name: string; purpose: string; duration: string; when: string };
};

const COPY: Record<LegalLang, Copy> = {
  es: {
    prevailsNotice: "",
    updatedLabel: "Última actualización",
    tableHeadings: { name: "Nombre", purpose: "Finalidad", duration: "Duración", when: "Cuándo se activa" },
  },
  ca: {
    prevailsNotice: "La versió en castellà prevaleix en cas de discrepància.",
    updatedLabel: "Última actualització",
    tableHeadings: { name: "Nom", purpose: "Finalitat", duration: "Durada", when: "Quan s'activa" },
  },
  en: {
    prevailsNotice: "The Spanish version prevails in case of discrepancy.",
    updatedLabel: "Last updated",
    tableHeadings: { name: "Name", purpose: "Purpose", duration: "Duration", when: "Set when" },
  },
  de: {
    prevailsNotice: "Im Fall einer Abweichung ist die spanische Fassung maßgeblich.",
    updatedLabel: "Zuletzt aktualisiert",
    tableHeadings: { name: "Name", purpose: "Zweck", duration: "Dauer", when: "Wann gesetzt" },
  },
  fr: {
    prevailsNotice: "La version espagnole prévaut en cas de divergence.",
    updatedLabel: "Dernière mise à jour",
    tableHeadings: { name: "Nom", purpose: "Finalité", duration: "Durée", when: "Quand est-il défini" },
  },
  it: {
    prevailsNotice: "In caso di discrepanza prevale la versione spagnola.",
    updatedLabel: "Ultimo aggiornamento",
    tableHeadings: { name: "Nome", purpose: "Finalità", duration: "Durata", when: "Quando viene impostato" },
  },
  nl: {
    prevailsNotice: "Bij discrepantie geldt de Spaanse versie.",
    updatedLabel: "Laatst bijgewerkt",
    tableHeadings: { name: "Naam", purpose: "Doel", duration: "Duur", when: "Wanneer ingesteld" },
  },
  pt: {
    prevailsNotice: "A versão em castelhano prevalece em caso de discrepância.",
    updatedLabel: "Última atualização",
    tableHeadings: { name: "Nome", purpose: "Finalidade", duration: "Duração", when: "Quando é definido" },
  },
};

/** Localised, numbered date — "13 de noviembre de 2026", "13 November 2026", etc. */
function formatUpdated(lang: LegalLang): string {
  const date = new Date(LEGAL_UPDATED_AT + "T00:00:00Z");
  try {
    return new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(date);
  } catch {
    return LEGAL_UPDATED_AT;
  }
}

interface LegalPageProps {
  pageKey: LegalPageKey;
  lang: LegalLang;
  title: string;
  metaDescription: string;
  /** JSX body — sections already in the correct language. */
  body: React.ReactNode;
}

export default function LegalPage({ pageKey, lang, title, metaDescription, body }: LegalPageProps) {
  const copy = COPY[lang];
  const slug = LEGAL_LINKS[lang][pageKey].slug;
  const canonical = `${SITE_URL}${slug}`;
  const htmlLangCode = lang; // already a bare 2-letter code (Conv 6.1)
  const spanishSlug = LEGAL_LINKS.es[pageKey].slug;

  return (
    <>
      <Helmet>
        <html lang={htmlLangCode} />
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
        {/* Legal pages carry low SEO value and are kept out of the marketing
            internal-link blocks per the legal prompt (section 2). The owner
            can flip this to "index, follow" later if a specific jurisdiction
            requires it. hreflang still references each counterpart so a
            visitor landing on one is sent to the right language. */}
        <meta name="robots" content="noindex, follow" />
        {/* hreflang — every language's counterpart for this legal page. */}
        {(Object.keys(LEGAL_LINKS) as LegalLang[]).map((l) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={l}
            href={`${SITE_URL}${LEGAL_LINKS[l][pageKey].slug}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${LEGAL_LINKS.es[pageKey].slug}`} />
      </Helmet>
      <SocialMeta title={title} description={metaDescription} path={slug} />

      <Header />
      <main id="main-content" className="min-h-screen bg-background pt-[var(--header-h)] pb-20">
        <div className="container px-4 max-w-2xl mx-auto">
          <section data-testid="page-hero" data-page-hero data-testid-legal={pageKey}>
            <h1 className="text-3xl font-bold text-foreground mb-2 mt-8" data-testid={`legal-${pageKey}-h1`}>{title}</h1>
            <p className="text-xs text-muted-foreground mb-4">
              {copy.updatedLabel}: {formatUpdated(lang)}
            </p>
            {copy.prevailsNotice && (
              <p data-testid="legal-prevails-notice" className="text-xs text-muted-foreground border-l-2 border-accent/60 pl-3 mb-6">
                {copy.prevailsNotice}{" "}
                <Link to={spanishSlug} className="underline">
                  ES →
                </Link>
              </p>
            )}
          </section>
          <article className="prose prose-sm max-w-none dark:prose-invert">
            {body}
          </article>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

/** Convenience props used by the ES Aviso legal body (reused by other langs). */
export { LEGAL_IDENTITY, formatUpdated };
