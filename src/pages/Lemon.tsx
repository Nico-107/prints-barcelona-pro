// NFC referral landing page for Lemon Printers partnership.
// Reached only by tapping a physical navy-and-amber plaque — never linked
// from nav, footer or sitemap.
// CRITICAL: keep noindex meta tag. Do not add to sitemap or any navigation.
//
// Design intent: the page is a continuation of the physical plaque.
// - Hero on navy #0F172A with the Dimension3D lattice mark (amber apex)
//   is the moment of recognition — same colours, same mark.
// - Amber #E9A23B appears exactly twice on the whole page: the apex node
//   and the numeral "10" in the price. Do not spend it anywhere else.
// - White below-fold is the answer zone: how it works, price, repeat CTA.

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";
import { readAndPersistUTM, getStoredUTM } from "@/lib/utm";
import { GOOGLE_RATING } from "@/data/rating";

// Switch to true only after Lemon Printers IP clearance is confirmed.
const SHOW_PARTNER_CREDIT = false;

const NAVY = "#0F172A";
const AMBER = "#E9A23B";
const WHATSAPP = "#25D366";
const WHATSAPP_HOVER = "#1FB859";
const SLATE = "#94A3B8";

const DISPLAY_FONT = "'Space Grotesk', 'Inter', sans-serif";

// Dimension3D lattice mark — octahedron drawn as connected lines, amber apex.
// Same geometry as /public/favicon.svg but rendered inline so we can drop the
// rounded navy backdrop (the hero itself is the backdrop) and use the brief's
// amber token exactly.
function LatticeMark({ size = 76 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Dimension3D"
    >
      <polygon
        points="60,26 94,62 60,98 26,62"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1={26}
        y1={62}
        x2={94}
        y2={62}
        stroke="#FFFFFF"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <circle cx={60} cy={26} r={11} fill={AMBER} />
    </svg>
  );
}

const STEPS = [
  { titleKey: "lemon.steps.1.title" as const, descKey: "lemon.steps.1.desc" as const },
  { titleKey: "lemon.steps.2.title" as const, descKey: "lemon.steps.2.desc" as const },
  { titleKey: "lemon.steps.3.title" as const, descKey: "lemon.steps.3.desc" as const },
];

export default function Lemon() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();

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

  const ratingDisplay = new Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(GOOGLE_RATING.value);

  const langLocale: Record<string, string> = { es: "es_ES", en: "en_US", ca: "ca_ES" };
  const ogLocale = langLocale[language] ?? "es_ES";

  // Shared CTA block reused in hero and repeat sections.
  const WhatsAppCta = (
    <Button
      asChild
      size="lg"
      className="w-full h-14 text-[17px] font-semibold rounded-xl text-white shadow-md hover:shadow-lg transition-shadow"
      style={{ backgroundColor: WHATSAPP }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = WHATSAPP_HOVER)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = WHATSAPP)}
      onClick={handleWhatsAppClick}
    >
      <a href={waUrl} target="_blank" rel="noopener noreferrer">
        {t("lemon.cta.whatsapp.label")}
      </a>
    </Button>
  );

  return (
    <>
      <Helmet>
        {/* noindex is mandatory — private referral channel, not a SEO page */}
        <meta name="robots" content="noindex,follow" />
        <title>{t("lemon.meta.title")}</title>
        <meta name="description" content={t("lemon.meta.desc")} />
        <meta property="og:title" content={t("lemon.meta.title")} />
        <meta property="og:description" content={t("lemon.meta.desc")} />
        <meta property="og:locale" content={ogLocale} />
        <meta name="theme-color" content={NAVY} />
      </Helmet>

      <div className="w-full">
        {/* ── HERO ─ navy, matches physical plaque ────────────────────── */}
        <section
          className="min-h-[100svh] flex flex-col px-6 pt-14 pb-10"
          style={{ backgroundColor: NAVY, color: "#FFFFFF" }}
        >
          <div>
            <LatticeMark size={76} />

            {SHOW_PARTNER_CREDIT && (
              <p className="mt-8 text-sm font-medium" style={{ color: SLATE }}>
                {t("lemon.partner")}
              </p>
            )}

            <h1
              className="mt-10 text-[40px] leading-[1.05] tracking-tight font-bold text-balance"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {t("lemon.hero.headline")}
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed max-w-md" style={{ color: SLATE }}>
              {t("lemon.hero.sub")}
            </p>
          </div>

          <div className="mt-auto pt-12">
            {WhatsAppCta}

            <div className="mt-4 text-center">
              <a
                href="/#calculator"
                onClick={handleQuoteClick}
                className="inline-block text-[15px] py-2 hover:opacity-80 transition-opacity"
                style={{ color: SLATE }}
              >
                {t("lemon.cta.quote.secondary")}
                <span aria-hidden="true"> →</span>
              </a>
            </div>

            <p className="mt-8 text-center text-[13px]" style={{ color: SLATE }}>
              {ratingDisplay}<span aria-hidden="true"> ★</span> · {GOOGLE_RATING.count} {t("lemon.trust.reviews")} · Barcelona
            </p>
          </div>
        </section>

        {/* ── BELOW FOLD ─ white answer zone ──────────────────────────── */}
        <section
          className="px-6 pt-16 pb-14"
          style={{ backgroundColor: "#FFFFFF", color: NAVY }}
        >
          <h2
            className="text-[30px] leading-tight font-bold tracking-tight"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {t("lemon.steps.heading")}
          </h2>

          <ol className="mt-8 flex flex-col gap-8">
            {STEPS.map(({ titleKey, descKey }, i) => (
              <li key={i} className="flex gap-5">
                <span
                  className="flex-shrink-0 text-[26px] font-bold leading-none pt-1 w-6 tabular-nums"
                  style={{ fontFamily: DISPLAY_FONT, color: "#CBD5E1" }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[17px] font-semibold leading-snug">
                    {t(titleKey)}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: "#64748B" }}>
                    {t(descKey)}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Price — "10" in amber is the ONLY amber on this white surface */}
          <div className="mt-16 text-center">
            <p className="flex items-baseline justify-center font-bold" style={{ fontFamily: DISPLAY_FONT }}>
              <span className="text-[22px] mr-3">Desde</span>
              <span className="text-[96px] leading-none" style={{ color: AMBER }}>10</span>
              <span className="text-[34px] ml-1">€</span>
            </p>
            <p className="mt-3 text-[16px]" style={{ color: "#64748B" }}>
              {t("lemon.price.subtitle").toLowerCase().replace(/\.$/, "")}
            </p>
          </div>

          {/* Repeat CTA — same treatment as hero */}
          <div className="mt-14">
            {WhatsAppCta}

            <div className="mt-4 text-center">
              <a
                href="/#calculator"
                onClick={handleQuoteClick}
                className="inline-block text-[15px] py-2 hover:opacity-70 transition-opacity"
                style={{ color: "#64748B" }}
              >
                {t("lemon.cta.quote.secondary")}
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
