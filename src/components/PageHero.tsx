/**
 * PageHero: variant-aware hero used by every non-home template.
 *
 * A: white background, centered content, dark-grid accents.
 * B: dark background, split hero, optional photo on the right from a
 * per-template real photo (no stock / AI imagery).
 *
 * Rules enforced here:
 * - Exactly one <h1>.
 * - Subtitle is max 2 lines (clamp with CSS). If longer text is required,
 *   pass it as `leadParagraph` and it renders in a lead block beneath the
 *   hero (Phase 2.4).
 * - CTAs use the shared <Button> component (no page-specific green buttons).
 */
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useVariant } from "@/lib/useVariant";
import { cn } from "@/lib/utils";

export interface PageHeroCta {
  label: string;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

interface PageHeroProps {
  eyebrow?: ReactNode;
  h1: string;
  subtitle?: string;
  primaryCta?: PageHeroCta;
  secondaryCta?: PageHeroCta;
  /** Real photo path (public/img/...) for variant B. Pass only real photos. */
  photoSrc?: string;
  photoAlt?: string;
  /** Lead paragraph rendered under the hero when hero text would exceed 2 lines. */
  leadParagraph?: ReactNode;
}

function renderCta(cta: PageHeroCta, kind: "primary" | "secondary") {
  const variant = kind === "primary" ? "default" : "outline";
  if (cta.href) {
    return (
      <Button asChild size="lg" variant={variant} aria-label={cta.ariaLabel ?? cta.label}>
        <a href={cta.href} onClick={cta.onClick}>{cta.label}</a>
      </Button>
    );
  }
  return (
    <Button size="lg" variant={variant} onClick={cta.onClick} aria-label={cta.ariaLabel ?? cta.label}>
      {cta.label}
    </Button>
  );
}

export default function PageHero({
  eyebrow,
  h1,
  subtitle,
  primaryCta,
  secondaryCta,
  photoSrc,
  photoAlt,
  leadParagraph,
}: PageHeroProps) {
  const variant = useVariant();
  const isB = variant === "B";
  const showPhoto = isB && !!photoSrc;

  return (
    <>
      <section
        data-testid="page-hero"
        data-page-hero
        data-variant={variant}
        className={cn(
          "relative w-full",
          isB ? "bg-[#0B1120] text-white" : "bg-background text-foreground",
        )}
      >
        <div
          className={cn(
            "mx-auto max-w-[1200px] px-4 md:px-6",
            "pt-16 pb-12 md:pt-24 md:pb-20",
            showPhoto ? "md:grid md:grid-cols-2 md:gap-10 items-center" : "text-center md:text-left",
          )}
        >
          <div className={showPhoto ? "" : "mx-auto max-w-3xl"}>
            {eyebrow && (
              <div className="font-mono text-xs uppercase tracking-wider opacity-70 mb-3">
                {eyebrow}
              </div>
            )}
            <h1
              className={cn(
                "font-[Inter_Tight,sans-serif] font-bold tracking-tight",
                "text-4xl md:text-5xl lg:text-6xl",
              )}
            >
              {h1}
            </h1>
            {subtitle && (
              <p
                data-hero-subtitle
                className={cn(
                  "mt-4 text-lg md:text-xl opacity-80",
                  // Clamp to 2 lines — Phase 2.4.
                  "line-clamp-2",
                )}
              >
                {subtitle}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                {primaryCta && renderCta(primaryCta, "primary")}
                {secondaryCta && renderCta(secondaryCta, "secondary")}
              </div>
            )}
          </div>
          {showPhoto && (
            <div className="mt-8 md:mt-0">
              <img
                src={photoSrc}
                alt={photoAlt ?? ""}
                loading="eager"
                className="w-full h-auto rounded-xl object-cover aspect-[4/3]"
              />
            </div>
          )}
        </div>
      </section>
      {leadParagraph && (
        <section className="mx-auto max-w-[720px] px-4 md:px-6 py-8 md:py-12">
          <div className="prose prose-lg max-w-none">{leadParagraph}</div>
        </section>
      )}
    </>
  );
}
