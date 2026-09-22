// NFC referral landing page for Lemon Printers partnership.
// Reached only by tapping a physical plaque — never linked from nav, footer or sitemap.
// CRITICAL: keep noindex meta tag. Do not add to sitemap or any navigation.

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MessageCircle, Camera, Tag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";
import { readAndPersistUTM, getStoredUTM } from "@/lib/utm";

// Switch to true only after Lemon Printers IP clearance is confirmed.
const SHOW_PARTNER_CREDIT = false;

const EXAMPLE_IMAGES = [
  { src: "/images/piezas/adaptador-gardena-cover.webp",    altKey: "lemon.examples.1.alt" as const },
  { src: "/images/piezas/adaptador-vesa-cover.webp",       altKey: "lemon.examples.2.alt" as const },
  { src: "/images/piezas/dishwasher-wheel-cover.webp",     altKey: "lemon.examples.3.alt" as const },
];

const STEPS = [
  { icon: Camera,      titleKey: "lemon.steps.1.title" as const, descKey: "lemon.steps.1.desc" as const },
  { icon: Tag,         titleKey: "lemon.steps.2.title" as const, descKey: "lemon.steps.2.desc" as const },
  { icon: MapPin,      titleKey: "lemon.steps.3.title" as const, descKey: "lemon.steps.3.desc" as const },
];

export default function Lemon() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();

  // Persist UTMs from this NFC tap before anything else — must run once on mount.
  useEffect(() => {
    readAndPersistUTM(searchParams);
    const utm = getStoredUTM();
    capture("lemon_page_view", { utm_content: utm?.utm_content ?? null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const utmContent = getStoredUTM()?.utm_content ?? null;

  const waUrl = `${whatsappUrl(ACTIVE_CITY)}?text=${encodeURIComponent(t("lemon.cta.whatsapp.prefill"))}`;

  const handleQuoteClick = () => {
    capture("lemon_cta_click", { cta: "quote", utm_content: utmContent });
  };

  const handleWhatsAppClick = () => {
    capture("lemon_cta_click", { cta: "whatsapp", utm_content: utmContent });
  };

  const langMeta: Record<string, { locale: string }> = {
    es: { locale: "es_ES" },
    en: { locale: "en_US" },
    ca: { locale: "ca_ES" },
  };
  const { locale } = langMeta[language] ?? langMeta.es;

  return (
    <>
      <Helmet>
        {/* noindex is mandatory — this is a private referral channel, not a SEO page */}
        <meta name="robots" content="noindex,follow" />
        <title>{t("lemon.meta.title")}</title>
        <meta name="description" content={t("lemon.meta.desc")} />
        <meta property="og:title" content={t("lemon.meta.title")} />
        <meta property="og:description" content={t("lemon.meta.desc")} />
        <meta property="og:locale" content={locale} />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Minimal header — logo only, no nav */}
        <header className="px-6 py-4 flex items-center">
          <a href="/" className="font-bold text-lg tracking-tight text-foreground hover:opacity-80 transition-opacity">
            Dimension<span className="text-primary">3D</span>
          </a>
        </header>

        <main className="flex-1 flex flex-col">
          {/* ── HERO ─────────────────────────────────────────────────── */}
          <section className="px-6 pt-10 pb-10 max-w-xl mx-auto w-full">
            {SHOW_PARTNER_CREDIT && (
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                {t("lemon.partner")}
              </p>
            )}
            <h1 className="text-4xl font-bold leading-tight tracking-tight mb-4">
              {t("lemon.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-3 leading-snug">
              {t("lemon.hero.subtitle")}
            </p>
            <p className="text-base text-muted-foreground">
              {t("lemon.hero.detail")}
            </p>
          </section>

          {/* ── STEPS ────────────────────────────────────────────────── */}
          <section className="px-6 pb-10 max-w-xl mx-auto w-full">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              {t("lemon.steps.title")}
            </h2>
            <ol className="flex flex-col gap-6">
              {STEPS.map(({ icon: Icon, titleKey, descKey }, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-base leading-snug mb-0.5">{t(titleKey)}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(descKey)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── PRICE ANCHOR ─────────────────────────────────────────── */}
          <section className="mx-6 mb-10 max-w-xl self-center w-full rounded-2xl bg-primary/5 border border-primary/15 px-6 py-6">
            <p className="text-4xl font-bold text-primary mb-0.5">{t("lemon.price.title")}</p>
            <p className="text-lg font-semibold mb-2">{t("lemon.price.subtitle")}</p>
            <p className="text-sm text-muted-foreground">{t("lemon.price.desc")}</p>
          </section>

          {/* ── EXAMPLE IMAGES ───────────────────────────────────────── */}
          <section className="px-6 pb-10 max-w-xl mx-auto w-full">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              {t("lemon.examples.title")}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {EXAMPLE_IMAGES.map(({ src, altKey }) => (
                <div key={src} className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={src}
                    alt={t(altKey)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── CTAs ─────────────────────────────────────────────────── */}
          {/* Mobile: WhatsApp first (flex-col-reverse), desktop: quote first (sm:flex-row) */}
          <section className="px-6 pb-12 max-w-xl mx-auto w-full flex flex-col-reverse sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="flex-1 text-base h-14 font-semibold"
              onClick={handleQuoteClick}
            >
              <a href="/#calculator">
                {t("lemon.cta.quote")}
              </a>
            </Button>

            <Button
              asChild
              size="lg"
              variant="whatsapp"
              className="flex-1 text-base h-14 font-semibold"
              onClick={handleWhatsAppClick}
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {t("lemon.cta.whatsapp.label")}
              </a>
            </Button>
          </section>
        </main>
      </div>
    </>
  );
}
