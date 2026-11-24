/**
 * Site-wide design switch.
 *
 * The old site_variant A/B test ended on 2026-11-24 with V1 (variant A) ahead
 * on uploads and buy clicks. V1 is now served to every visitor. The V2 code
 * stays in the repo — flip SITE_DESIGN to 'v2' to serve it again site-wide.
 *
 * Preview override: visit any URL with `?xp_home_v2=v2` to force the V2 design
 * for the session (or `?xp_home_v2=control` to force V1 even when SITE_DESIGN
 * is 'v2'). Handled by the pre-paint IIFE in index.html so there's no flash.
 *
 * `useVariant()` returns:
 *   - 'A' when SITE_DESIGN === 'v1' (default — V1 served)
 *   - 'B' when SITE_DESIGN === 'v2'
 *   - respects the pre-paint override attribute so the preview flag still works
 */
import { useEffect, useState } from "react";

export type SiteVariant = "A" | "B";
export type SiteDesign = "v1" | "v2";

/** Single-line flip: change to 'v2' to serve the V2 design to everyone. */
export const SITE_DESIGN: SiteDesign = "v1";

export const SITE_VARIANT_ATTR = "data-xp-site-variant" as const;

function designToVariant(d: SiteDesign): SiteVariant {
  return d === "v2" ? "B" : "A";
}

export const DEFAULT_SITE_VARIANT: SiteVariant = designToVariant(SITE_DESIGN);

export function readSiteVariant(): SiteVariant {
  if (typeof document === "undefined") return DEFAULT_SITE_VARIANT;
  const v = document.documentElement.getAttribute(SITE_VARIANT_ATTR);
  if (v === "B") return "B";
  if (v === "A") return "A";
  return DEFAULT_SITE_VARIANT;
}

export function useVariant(): SiteVariant {
  const [variant, setVariant] = useState<SiteVariant>(DEFAULT_SITE_VARIANT);

  useEffect(() => {
    setVariant(readSiteVariant());

    const observer = new MutationObserver(() => {
      setVariant(readSiteVariant());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [SITE_VARIANT_ATTR],
    });
    return () => observer.disconnect();
  }, []);

  return variant;
}
