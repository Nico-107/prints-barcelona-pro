/**
 * Prompt 2 — mesh preparation pipeline.
 *
 * Called with the parsed triangles of an uploaded STL, returns the
 * `MeshAnalysis` the estimator should price against + diagnostics for
 * analytics.
 *
 * Pipeline:
 *   1. `analyzeTriangles` → raw analysis (volume, bounds, per-orientation
 *      area). Captures `mesh_tris` / `mesh_shells` / `mesh_watertight`.
 *   2. If the mesh is clean (1 watertight shell, no open edges), return
 *      the raw analysis — nothing to repair.
 *   3. Otherwise run `repairMesh` in a worker with an 8-second budget.
 *      On success re-run `analyzeTriangles` on the repaired triangles.
 *   4. On timeout / failure fall back to a VOLUME-ONLY estimate (the
 *      bounding-box analysis from `meshSafetyCap`).
 *
 * The caller still runs the safety cap on top (volume-only × 1.6×) so the
 * even-rarer case where repair succeeds but the output is still messy
 * can't blow past the cap.
 */

import { analyzeTriangles, type MeshAnalysis } from './estimator/core';
import { analyzeMeshQuality, splitWatertightShells, type MeshQuality } from './meshQuality';
import { repairMeshWithBudget } from './meshRepair';
import { volumeOnlyAnalysis } from './meshSafetyCap';

export const REPAIR_BUDGET_MS = 8_000;

export interface PrepareResult {
  /** The analysis the estimator should price against. */
  analysis: MeshAnalysis;
  /** Raw mesh quality stats — logged on estimate_shown / buy_clicked. */
  quality: MeshQuality;
  /** True when manifold-3d successfully produced a repaired envelope. */
  repaired: boolean;
  /** True when we gave up on repair and used the volume-only fallback. */
  usedFallback: boolean;
  /** Wall-clock milliseconds spent inside `prepareMeshForPricing`. */
  elapsedMs: number;
  /** Shell count of discarded open shells from the repair step. */
  skippedOpenShells: number;
}

export async function prepareMeshForPricing(tri: Float32Array): Promise<PrepareResult> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const raw = analyzeTriangles(tri);
  const quality = analyzeMeshQuality(tri);

  // Clean mesh: skip repair entirely.
  if (quality.watertight && quality.shells === 1) {
    return {
      analysis: raw,
      quality,
      repaired: false,
      usedFallback: false,
      elapsedMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0,
      skippedOpenShells: 0,
    };
  }

  // All shells closed (disjoint multi-shell): raw analyzeTriangles sum is already the
  // correct union volume + area. Phase P's volume-only envelope would under-represent
  // the surface area for complex shells like the organic camera-roman fixture.
  const split = splitWatertightShells(tri);
  if (split.openShellCount === 0 && split.shells.length >= 1) {
    return {
      analysis: raw,
      quality,
      repaired: false,
      usedFallback: false,
      elapsedMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0,
      skippedOpenShells: 0,
    };
  }

  // Phase P robust path: repairMesh now returns `volumeMm3` from `robust.ts` (pure-TS,
  // no WASM dependency). Synthesise a volume-only analysis from that + the raw bounds so
  // the estimator prices from the union volume instead of the bloated raw surface area.
  const repair = await repairMeshWithBudget(tri, quality, REPAIR_BUDGET_MS);
  if (repair) {
    const repairedAnalysis = volumeOnlyAnalysis(raw.boundsMm, repair.volumeMm3);
    return {
      analysis: repairedAnalysis,
      quality,
      repaired: true,
      usedFallback: false,
      elapsedMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0,
      skippedOpenShells: repair.skippedOpenShells,
    };
  }

  // Repair timed out or failed: fall back to the volume-only analysis.
  // NEVER return the raw-area analysis — that's the bug we're here to fix.
  const fallback = volumeOnlyAnalysis(raw.boundsMm, raw.volumeMm3);
  return {
    analysis: fallback,
    quality,
    repaired: false,
    usedFallback: true,
    elapsedMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0,
    skippedOpenShells: 0,
  };
}
