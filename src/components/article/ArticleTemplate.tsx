import { ReactNode, useEffect, useState } from "react";
import { cta as ctaLabel } from "@/lib/ctaVocabulary";
import type { Lang as CtaLang } from "@/lib/ctaVocabulary";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Article layout used by every blog post, guide and comparison page.
 * Wraps body content with [data-testid="article-template"] and renders
 * a sticky Table of Contents ([data-testid="article-toc"]) on the right
 * on desktop. Hero is compact (no primary button — Item 8).
 */
export default function ArticleTemplate({
  lang,
  eyebrow,
  h1,
  authorLine,
  readingTime,
  children,
}: {
  lang: CtaLang;
  eyebrow?: ReactNode;
  h1: string;
  authorLine?: string;
  readingTime?: string;
  children: ReactNode;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Scan the article body for h2/h3 after mount; mount IDs if missing.
    const article = document.querySelector('[data-testid="article-template"]');
    if (!article) return;
    const nodes = article.querySelectorAll('h2, h3');
    const found: Heading[] = [];
    nodes.forEach((n) => {
      const el = n as HTMLElement;
      const text = (el.textContent || "").trim();
      if (!text) return;
      if (!el.id) {
        el.id = text.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 60);
      }
      found.push({ id: el.id, text, level: el.tagName === 'H3' ? 3 : 2 });
    });
    setHeadings(found);
  }, [children]);

  return (
    <section data-testid="article-template" data-page-section="article-template">
      {/* Compact hero — no primary CTA button here (Item 8). */}
      <div data-testid="page-hero" data-page-hero data-article-hero className="bg-secondary/20 py-10 md:py-12 border-b border-border/40">
        <div className="container max-w-3xl mx-auto px-4">
          {eyebrow && <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">{eyebrow}</div>}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-3">{h1}</h1>
          {(authorLine || readingTime) && (
            <p className="text-sm text-muted-foreground">
              {authorLine ?? ""}{authorLine && readingTime ? " · " : ""}{readingTime ?? ""}
            </p>
          )}
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="md:grid md:grid-cols-[1fr_240px] md:gap-10">
          <div data-article-body className="min-w-0">
            {/* Mid-article inline CTA — inserted before the body prose
                so it's visible without scrolling to the end. */}
            <aside
              data-testid="inline-cta"
              data-page-section="inline-cta-mid"
              className="rounded-xl border border-accent/30 bg-accent/5 p-5 md:p-6 mb-8 flex flex-wrap items-center justify-between gap-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {lang === "es" ? "Sube un archivo y ve el precio al instante — desde 10 €."
                  : lang === "ca" ? "Puja un arxiu i veu el preu al moment — des de 10 €."
                  : lang === "de" ? "Datei hochladen und Sofortpreis sehen — ab 10 €."
                  : lang === "fr" ? "Chargez un fichier et obtenez un prix instantané — à partir de 10 €."
                  : lang === "it" ? "Carica un file e vedi il prezzo istantaneo — da 10 €."
                  : lang === "nl" ? "Upload een bestand voor een directe prijs — vanaf 10 €."
                  : lang === "pt" ? "Carregue um ficheiro e veja o preço imediato — desde 10 €."
                  : "Upload a file and see the price — from €10."}
              </p>
              <a
                href="/#calculator"
                className="inline-flex items-center rounded-lg bg-cta text-cta-foreground font-semibold px-4 py-2 text-sm hover:bg-cta/90 transition-colors whitespace-nowrap"
                data-ph-name="article-inline-cta-mid"
              >
                {ctaLabel("primary", lang)}
              </a>
            </aside>
            {children}

            {/* End-of-article inline CTA — see mid-article version below for auto inject. */}
            <aside
              data-testid="inline-cta"
              data-page-section="inline-cta-end"
              className="mt-12 rounded-2xl border border-border bg-background p-6 md:p-8 text-center"
            >
              <p className="text-lg font-semibold text-foreground mb-3">
                {lang === "es"
                  ? "¿Listo para empezar?"
                  : lang === "ca"
                  ? "Llest per començar?"
                  : lang === "de"
                  ? "Bereit, loszulegen?"
                  : lang === "fr"
                  ? "Prêt à démarrer ?"
                  : lang === "it"
                  ? "Pronto per iniziare?"
                  : lang === "nl"
                  ? "Klaar om te beginnen?"
                  : lang === "pt"
                  ? "Pronto para começar?"
                  : "Ready to start?"}
              </p>
              <a
                href="/#calculator"
                className="inline-flex items-center justify-center rounded-lg bg-cta text-cta-foreground font-semibold px-5 py-2.5 text-sm hover:bg-cta/90 transition-colors"
                data-ph-name="article-inline-cta-end"
              >
                {ctaLabel("primary", lang)}
              </a>
            </aside>
          </div>

          {/* Sticky TOC on desktop. */}
          {headings.length > 0 && (
            <aside
              data-testid="article-toc"
              className="hidden md:block"
              aria-label={lang === "es" ? "Contenidos" : lang === "ca" ? "Continguts" : "Table of contents"}
            >
              <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto text-sm">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  {lang === "es"
                    ? "En esta guía"
                    : lang === "ca"
                    ? "En aquesta guia"
                    : lang === "de"
                    ? "In diesem Leitfaden"
                    : lang === "fr"
                    ? "Dans ce guide"
                    : lang === "it"
                    ? "In questa guida"
                    : lang === "nl"
                    ? "In deze gids"
                    : lang === "pt"
                    ? "Neste guia"
                    : "On this page"}
                </p>
                <ul className="flex flex-col gap-2">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                      <a
                        href={`#${h.id}`}
                        className="text-muted-foreground hover:text-foreground block"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
