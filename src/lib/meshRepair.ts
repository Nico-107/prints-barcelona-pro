/**
 * Mesh "repair" — Phase P replaces the manifold-3d repair with the pure-TS
 * `robust.ts` union analysis. The API surface stays the same so every caller
 * (prepareMeshForPricing, callMeshAnalysisWorker) keeps working.
 *
 * The real volume-aware analysis now lives in
 * `supabase/functions/_shared/pricing/robust.ts`; this file glues it into the
 * legacy callers.
 */

import { splitWatertightShells, type MeshQuality } from './meshQuality';
import { robustAnalyse } from '../../supabase/functions/_shared/pricing/robust';

export interface RepairResult {
  repaired: Float32Array;
  usedShells: number;
  skippedOpenShells: number;
  volumeMm3: number;
  surfaceAreaCm2: number;
  repairMs: number;
}

export async function repairMesh(tri: Float32Array, quality?: MeshQuality): Promise<RepairResult> {
  void quality;
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const { shells, openShellCount } = splitWatertightShells(tri);
  const { analysis } = robustAnalyse(tri);
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const bbox = analysis.boundsMm;
  const surfaceAreaMm2 = 2 * (bbox[0] * bbox[1] + bbox[0] * bbox[2] + bbox[1] * bbox[2]);
  return {
    repaired: tri,
    usedShells: shells.length,
    skippedOpenShells: openShellCount,
    volumeMm3: analysis.volumeMm3,
    surfaceAreaCm2: surfaceAreaMm2 / 100,
    repairMs: t1 - t0,
  };
}

export async function repairMeshWithBudget(
  tri: Float32Array,
  quality: MeshQuality,
  budgetMs: number,
): Promise<RepairResult | null> {
  void budgetMs;
  try {
    return await repairMesh(tri, quality);
  } catch {
    return null;
  }
}
