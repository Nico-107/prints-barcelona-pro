/**
 * Site-wide A/B variant hook.
 *
 * Priority: QA override (?xp=site_variant:A|B) > pre-paint attribute on <html>
 * > deterministic fallback from the visitor id (handled by getVariant).
 *
 * Bots, prerender output and SSR always resolve to 'A' (control). The
 * attribute is applied before first paint by the pre-paint IIFE in
 * `index.html`, so there is no variant flash.
 */
import { useEffect, useState } from "react";
import { getVariant } from "@/lib/experiments";

export type SiteVariant = "A" | "B";

export const SITE_VARIANT_EXP = "site_variant" as const;
export const SITE_VARIANT_ATTR = "data-xp-site-variant" as const;

export function readSiteVariant(): SiteVariant {
  if (typeof document === "undefined") return "A";
  const v = document.documentElement.getAttribute(SITE_VARIANT_ATTR);
  return v === "B" ? "B" : "A";
}

export function useVariant(): SiteVariant {
  const [variant, setVariant] = useState<SiteVariant>("A");

  useEffect(() => {
    // After mount, resolve the final variant (QA override > html attr > fallback).
    const resolved = getVariant(SITE_VARIANT_EXP);
    setVariant(resolved === "B" ? "B" : "A");

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
