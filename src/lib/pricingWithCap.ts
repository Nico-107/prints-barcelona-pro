/**
 * Prompt 2 — pricing wrapper that applies the volume-only safety cap on top
 * of `computeBundleV3`.
 *
 * `computeBundleV3` already does the right thing with a repaired analysis.
 * The cap is a backstop for the case where (a) the file is "clean" by
 * shell count but its surfaces are still inflated, or (b) repair finishes
 * but the result is unexpectedly heavy. We re-price the order with a
 * synthesized volume-only analysis for each part, and if the repaired
 * total is more than 1.6× that, we fall back to the capped number.
 *
 * This file lives OUTSIDE the shared `ESTIMATOR-*` markers because it is
 * not synced with the edge function — the edge function needs its own
 * equivalent (see LOVABLE_TODO.md for the exact code).
 */

import { computeBundleV3, type BundleEstimateV3 } from './estimate';
import type { ParsedFileForPricing, PartDefaults } from './pricing';
import { volumeOnlyAnalysis, SAFETY_CAP_MULT } from './meshSafetyCap';
import type { MeshAnalysis } from './estimator/core';

export interface BundleWithCap extends BundleEstimateV3 {
  /** True when the primary (repaired) price exceeded the safety cap and
   *  the capped number was substituted in. */
  priceCapped: boolean;
  /** True when ANY part's primary analysis is non-watertight / messy —
   *  used to decide whether to show the neutral "Nico revisará" line even
   *  if the cap didn't trigger. */
  usedFallback?: boolean;
}

/**
 * Compute the order price with the safety cap applied. Caller supplies the
 * same `parts` / `defaults` / `urgency` it would pass to `computeBundleV3`;
 * each part's `analysis` must already be the REPAIRED analysis (or the raw
 * one for clean files). The `partsAreMessy` flag indicates whether we
 * should also force the fallback marker (for review-note UX).
 */
/**
 * Prompt 2 — aggregate mesh stats across the priced parts for the
 * estimate_shown / buy_clicked monitoring events. Numbers are summed so a
 * multi-part order gets one row per field; watertight = AND across parts
 * (a single messy part flips the whole order to false).
 */
export function aggregateMeshStats(parts: ParsedFileForPricing[]): {
  mesh_tris: number;
  mesh_shells: number;
  mesh_watertight: boolean;
  mesh_area_cm2: number;
  mesh_volume_cm3: number;
  mesh_repaired: boolean;
  estimate_ms: number;
} {
  let tris = 0, shells = 0, area = 0, vol = 0, ms = 0;
  let watertight = true;
  let repaired = false;
  for (const p of parts) {
    if (!p.meshQuality) continue;
    tris += p.meshQuality.tris;
    shells += p.meshQuality.shells;
    area += p.meshQuality.totalSurfaceCm2;
    if (!p.meshQuality.watertight) watertight = false;
    if (p.meshRepaired) repaired = true;
    if (p.analysis) vol += p.analysis.volumeMm3 / 1000;
    if (typeof p.meshRepairMs === 'number') ms += p.meshRepairMs;
  }
  return {
    mesh_tris: tris,
    mesh_shells: shells,
    mesh_watertight: watertight,
    mesh_area_cm2: Math.round(area),
    mesh_volume_cm3: Math.round(vol * 10) / 10,
    mesh_repaired: repaired,
    estimate_ms: Math.round(ms),
  };
}

export function computeBundleWithCap(
  parts: ParsedFileForPricing[],
  defaults: PartDefaults,
  urgency: string,
  flags: { v4?: boolean; partsAreMessy?: boolean } = {},
): BundleWithCap | null {
  const primary = computeBundleV3(parts, defaults, urgency, { v4: flags.v4 });
  if (!primary) return null;

  // Build a parallel "volume-only" set of parts — same qty, same settings,
  // but each analysis is the bounding-box synthesised one.
  const volumeParts: ParsedFileForPricing[] = parts.map(p => {
    if (!p.analysis || !p.analysis.volumeMm3) return p;
    const volOnly = volumeOnlyAnalysis(p.analysis.boundsMm, p.analysis.volumeMm3);
    const out: ParsedFileForPricing = { ...p, analysis: volOnly as MeshAnalysis };
    return out;
  });
  const volumeBundle = computeBundleV3(volumeParts, defaults, urgency, { v4: flags.v4 });
  if (!volumeBundle) {
    return { ...primary, priceCapped: false, usedFallback: flags.partsAreMessy };
  }

  const capCents = Math.round(volumeBundle.order.totalCents * SAFETY_CAP_MULT);
  if (primary.order.totalCents <= capCents) {
    return { ...primary, priceCapped: false, usedFallback: flags.partsAreMessy };
  }

  // Cap triggered: return the volume-only bundle (which already respects
  // minimum, charm rounding, urgency, etc.) rather than the inflated one.
  return {
    ...volumeBundle,
    priceCapped: true,
    usedFallback: true,
  };
}
