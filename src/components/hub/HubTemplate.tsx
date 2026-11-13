import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

/**
 * Shared hub template used by all 6 international hubs
 * (en, de, fr, nl, it, pt). Every hub is rendered through this
 * component — the DOM carries [data-testid="hub-template"] once,
 * at the top of the page, regardless of language or content shape.
 *
 * Head tags (Helmet) and body content are supplied by the caller
 * because each hub has language-specific SEO + translated content
 * that is not identical byte-for-byte across hubs.
 */
export default function HubTemplate({
  lang,
  helmet,
  children,
}: {
  lang: string;
  helmet: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-testid="hub-template"
      data-hub-template
      data-hub-lang={lang}
      className="min-h-screen bg-background"
    >
      {helmet}
      <Header />
      <main id="main-content" className="pt-[var(--header-h)]">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
