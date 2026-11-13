/**
 * SiteShell: variant-aware wrapper used by every route.
 *
 * Renders: Header → children → Footer → WhatsAppFloat → MobileStickyBar.
 * Applies `data-site-variant="A|B"` on the <body> so CSS can key off it, and
 * ensures the pre-paint `data-xp-site-variant` attribute on <html> is
 * mirrored (e.g. in tests where the pre-paint IIFE didn't run).
 *
 * During the Phase 1 migration pages may still render their own <Header/> and
 * <Footer/>; a page that migrates passes `embedded` to skip SiteShell's own
 * chrome. New code should NOT pass `embedded` — it exists only so that pages
 * which haven't been refactored yet don't double up.
 */
import { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useVariant, SITE_VARIANT_ATTR } from "@/lib/useVariant";

interface SiteShellProps {
  children: ReactNode;
  /**
   * Opt-out for pages that still render their own Header/Footer during
   * migration. Default false (new, correct behaviour).
   */
  embedded?: boolean;
}

export default function SiteShell({ children, embedded = false }: SiteShellProps) {
  const variant = useVariant();

  useEffect(() => {
    // Mirror the variant attribute to <body> for CSS selectors and to <html>
    // in case the pre-paint IIFE didn't run (jsdom, SSR hydration edge case).
    document.body.dataset.siteVariant = variant;
    if (!document.documentElement.hasAttribute(SITE_VARIANT_ATTR)) {
      document.documentElement.setAttribute(SITE_VARIANT_ATTR, variant);
    }
    return () => {
      delete document.body.dataset.siteVariant;
    };
  }, [variant]);

  if (embedded) {
    // Page renders its own Header/Footer (pre-migration). SiteShell only
    // adds the floating helpers.
    return (
      <>
        {children}
        <WhatsAppFloat />
      </>
    );
  }

  return (
    <div data-site-variant={variant} className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
