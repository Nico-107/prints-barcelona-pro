/**
 * Prompt 2 safety cap — never let a messy-mesh area inflate the price past
 * 1.6× the volume-only estimate. Even if the area-based price went to €200,
 * the cap drags it back to a bound the volume can support.
 *
 * The "volume-only" analysis treats the part as an axis-aligned box with
 * the mesh's bounding-box dimensions and the mesh's real (signed) volume.
 * Running the standard `analyzeTriangles` on a synthesized box gives us
 * reasonable aUp/aDown/aSide to feed the same estimator, so the cap always
 * lives on the same math as the primary estimate.
 */

import type { MeshAnalysis } from './estimator/core';
import { analyzeTriangles } from './estimator/core';

/** Synthesize a box mesh (36 triangles) of given dimensions. 9 floats / tri. */
function boxTriangles(xMm: number, yMm: number, zMm: number): Float32Array {
  const verts: [number, number, number][] = [
    [0, 0, 0], [xMm, 0, 0], [xMm, yMm, 0], [0, yMm, 0],
    [0, 0, zMm], [xMm, 0, zMm], [xMm, yMm, zMm], [0, yMm, zMm],
  ];
  // CCW outward normals.
  const quads: [number, number, number, number][] = [
    [0, 3, 2, 1], // z=0 bottom (normal -z)
    [4, 5, 6, 7], // z=max top (normal +z)
    [0, 1, 5, 4], // y=0 side
    [3, 7, 6, 2], // y=max side
    [0, 4, 7, 3], // x=0 side
    [1, 2, 6, 5], // x=max side
  ];
  const out: number[] = [];
  for (const [a, b, c, d] of quads) {
    out.push(...verts[a], ...verts[b], ...verts[c]);
    out.push(...verts[a], ...verts[c], ...verts[d]);
  }
  return Float32Array.from(out);
}

/**
 * Build a "volume-only" MeshAnalysis from the real bounding box and signed
 * volume. Areas are the box's outer surfaces (no inflated interiors). Volume
 * is clamped to the real mesh's signed volume — if the mesh volume is
 * larger than the bounding box can hold (never happens for real STLs but
 * defensively), we cap at the box volume.
 */
export function volumeOnlyAnalysis(
  boundsMm: [number, number, number],
  volumeMm3: number,
): MeshAnalysis {
  const [bx, by, bz] = boundsMm.map(d => Math.max(d, 0.001)) as [number, number, number];
  const tri = boxTriangles(bx, by, bz);
  const a = analyzeTriangles(tri);
  // `analyzeTriangles` set bounds/orientations from the box dims already.
  // Override the volume with the real mesh's signed volume so the infill
  // term in `estimatePart` sees the right interior to fill.
  const vol = Math.min(Math.max(volumeMm3, 0.001), bx * by * bz);
  return { ...a, volumeMm3: vol, triangles: a.triangles };
}

/** Cap configuration for the safety net. */
export const SAFETY_CAP_MULT = 1.6;

/**
 * Given the real analysis of a part and a candidate price (cents), return
 * the capped price. When a cap triggers, `capped` is true.
 */
export interface SafetyCapResult {
  capped: boolean;
  capCents: number;
  volumeOnlyAnalysis: MeshAnalysis;
}

export function computeSafetyCap(
  realAnalysis: MeshAnalysis,
  priceOneCopyCents: (a: MeshAnalysis) => number,
): SafetyCapResult {
  const volOnly = volumeOnlyAnalysis(realAnalysis.boundsMm, realAnalysis.volumeMm3);
  const volCents = priceOneCopyCents(volOnly);
  return {
    capped: false,
    capCents: Math.round(volCents * SAFETY_CAP_MULT),
    volumeOnlyAnalysis: volOnly,
  };
}
