// NFC referral landing page for Lemon Printers partnership.
// Reached only by tapping a physical navy-and-amber plaque — never linked
// from nav, footer or sitemap.
// CRITICAL: keep noindex meta tag. Do not add to sitemap or any navigation.
//
// Design intent: the page is a continuation of the physical plaque.
// - Hero on navy #0F172A with the faceted Dimension3D crystal (amber apex
//   node) is the moment of recognition when someone taps the plaque —
//   same colours, same faceted crystal, same amber accent.
// - Amber #E9A23B appears exactly twice on the whole page: the apex node
//   on the crystal and the numeral "10" in the price. Nowhere else.
// - Content composes as one centred column (max-w-440), phone-width on
//   desktop too — the plaque audience is a phone in someone's hand.
// - Language is forced to ES via LanguageContext for this route; the
//   audience is a Barcelona walk-in, not a remote English visitor.

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
const GOLD_STAR = "#F5B301";
const WHATSAPP = "#25D366";
const SLATE = "#94A3B8";
const DISPLAY_FONT = "'Space Grotesk', 'Inter', sans-serif";

// Faceted Dimension3D crystal mark. Vertex coordinates and facet fills are
// fixed by the plaque artwork — do not tweak them without a matching update
// to the physical plaque design.
function CrystalMark({ size = 92 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Dimension3D"
      style={{ display: "block" }}
    >
      {/* Four filled front facets — flat tones, no gradients */}
      <polygon points="110,20 40,98 100,131"  fill="#3B4F7A" />
      <polygon points="110,20 100,131 162,98" fill="#2B3A5E" />
      <polygon points="91,173 40,98 100,131"  fill="#223050" />
      <polygon points="91,173 100,131 162,98" fill="#1A2542" />

      {/* White edges — round caps, stroke-width 5 */}
      <g stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round">
        <line x1={110} y1={20}  x2={40}  y2={98}  /> {/* A–L */}
        <line x1={110} y1={20}  x2={162} y2={98}  /> {/* A–R */}
        <line x1={110} y1={20}  x2={100} y2={131} /> {/* A–F */}
        <line x1={40}  y1={98}  x2={100} y2={131} /> {/* L–F */}
        <line x1={100} y1={131} x2={162} y2={98}  /> {/* F–R */}
        <line x1={91}  y1={173} x2={40}  y2={98}  /> {/* Bo–L */}
        <line x1={91}  y1={173} x2={162} y2={98}  /> {/* Bo–R */}
        <line x1={91}  y1={173} x2={100} y2={131} /> {/* Bo–F */}
      </g>

      {/* White vertex nodes */}
      <circle cx={40}  cy={98}  r={8} fill="#FFFFFF" />
      <circle cx={162} cy={98}  r={8} fill="#FFFFFF" />
      <circle cx={100} cy={131} r={8} fill="#FFFFFF" />
      <circle cx={91}  cy={173} r={8} fill="#FFFFFF" />

      {/* Amber apex — the single brightest point */}
      <circle cx={110} cy={20} r={11.5} fill={AMBER} />
    </svg>
  );
}

const STEPS = [
  { titleKey: "lemon.steps.1.title" as const, descKey: "lemon.steps.1.desc" as const },
  { titleKey: "lemon.steps.2.title" as const, descKey: "lemon.steps.2.desc" as const },
  { titleKey: "lemon.steps.3.title" as const, descKey: "lemon.steps.3.desc" as const },
];

// Single orchestrated entrance for the whole hero group, once on load.
// Reduced-motion users see the composition instantly with no animation.
const PAGE_STYLES = `
  @keyframes lemonFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .lemon-enter { animation: lemonFadeUp 600ms ease-out both; }
  @media (prefers-reduced-motion: reduce) {
    .lemon-enter { animation: none; }
  }
`;

export default function Lemon() {
  const { t } = useLanguage();
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

  // Locale-correct decimal — LanguageContext forces ES on this route.
  const ratingDisplay = new Intl.NumberFormat("es", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(GOOGLE_RATING.value);

  const WhatsAppCta = (
    <Button
      asChild
      size="lg"
      className="w-full h-14 text-[17px] font-semibold rounded-xl text-white"
      style={{
        backgroundColor: WHATSAPP,
        boxShadow: "0 8px 30px -4px rgba(37, 211, 102, 0.45)",
      }}
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
        <meta name="robots" content="noindex,follow" />
        <title>{t("lemon.meta.title")}</title>
        <meta name="description" content={t("lemon.meta.desc")} />
        <meta property="og:title" content={t("lemon.meta.title")} />
        <meta property="og:description" content={t("lemon.meta.desc")} />
        <meta property="og:locale" content="es_ES" />
        <meta name="theme-color" content={NAVY} />
      </Helmet>

      <style>{PAGE_STYLES}</style>

      <div className="w-full">
        {/* ── HERO ─ full-bleed navy, phone-width composition on any viewport ──── */}
        <section
          className="relative overflow-hidden min-h-[100svh] flex items-center justify-center px-6 py-16"
          style={{ backgroundColor: NAVY, color: "#FFFFFF" }}
        >
          {/* Soft amber glow behind the crystal — barely perceptible, not decorative */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(233, 162, 59, 0.09), transparent 55%)",
            }}
          />

          <div className="w-full max-w-[440px] relative lemon-enter">
            <div className="flex justify-center">
              <CrystalMark size={92} />
            </div>

            {SHOW_PARTNER_CREDIT && (
              <p className="mt-6 text-center text-sm font-medium" style={{ color: SLATE }}>
                {t("lemon.partner")}
              </p>
            )}

            <h1
              className="mt-8 text-[40px] leading-[1.05] tracking-tight font-bold text-balance"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {t("lemon.hero.headline")}
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed" style={{ color: SLATE }}>
              {t("lemon.hero.sub")}
            </p>

            <div className="mt-9">
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
            </div>

            <div className="mt-9 text-center space-y-1.5">
              <p className="text-[13px]" style={{ color: SLATE }}>
                <span style={{ color: GOLD_STAR }} aria-hidden="true">★</span>{" "}
                {ratingDisplay} · {GOOGLE_RATING.count} {t("lemon.trust.reviews")} · Barcelona
              </p>
              <p className="text-[13px] text-balance" style={{ color: SLATE }}>
                {t("lemon.location")}
              </p>
            </div>
          </div>
        </section>

        {/* ── BELOW FOLD ─ white answer zone, same 440px column ────────────────── */}
        <section
          className="px-6 pt-16 pb-14"
          style={{ backgroundColor: "#FFFFFF", color: NAVY }}
        >
          <div className="w-full max-w-[440px] mx-auto">
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
                    <p className="text-[17px] font-semibold leading-snug">{t(titleKey)}</p>
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
          </div>
        </section>
      </div>
    </>
  );
}
