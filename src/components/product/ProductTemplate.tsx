import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

/**
 * Shared product template used by every product page:
 *   - Catalogue items  (CatalogProduct.tsx)
 *   - SEO parts        (PartPage.tsx)
 *   - Intl SEO parts   (IntlPartPage.tsx)
 *
 * Each renders [data-testid="product-template"] once on the top-level
 * wrapper. The chrome (Header + Footer + WhatsAppFloat) is supplied here
 * so the two old templates can share the same shell without duplicating
 * boilerplate.
 */
export default function ProductTemplate({
  lang,
  helmet,
  children,
}: {
  lang?: string;
  helmet?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-testid="product-template"
      data-product-template
      data-product-lang={lang ?? "es"}
      className="min-h-screen bg-background flex flex-col"
    >
      {helmet}
      <Header />
      <main id="main-content" className="flex-1 pt-[var(--header-h)]">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
