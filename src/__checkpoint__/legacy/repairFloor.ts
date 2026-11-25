// H3 — repair-floor guard for `prepareMeshForPricing`.
//
// Rule (MASTER_PROMPT §1 H3): if repair discarded open shells whose summed |signed volume|
// is > 5 % of the mesh's total |signed volume|, OR the repaired bbox is smaller than 90 %
// of the raw bbox on any axis, discard the repair and keep the raw analysis.
//
// This module is pure math over triangle counts and bounds, so it can be unit-tested
// deterministically without needing meshRepair.ts to be fixed first.

export interface BBox {
  xMm: number;
  yMm: number;
  zMm: number;
}

export interface RepairFloorInput {
  rawBBox: BBox;
  rawSumAbsSignedVolume: number;
  repairedBBox: BBox;
  repairedSumAbsSignedVolume: number;
  discardedOpenShellAbsSignedVolume: number;
}

export interface RepairFloorDecision {
  useRepaired: boolean;
  reason?: "discarded-too-much-volume" | "repaired-bbox-shrunk" | "ok";
  volumeFraction?: number;
  smallestBBoxRatio?: number;
}

const DISCARD_VOLUME_FRACTION_THRESHOLD = 0.05;
const BBOX_MIN_RATIO = 0.9;

export function repairFloorDecision(input: RepairFloorInput): RepairFloorDecision {
  const totalAbsVol = input.rawSumAbsSignedVolume || 1;
  const volumeFraction = input.discardedOpenShellAbsSignedVolume / totalAbsVol;
  if (volumeFraction > DISCARD_VOLUME_FRACTION_THRESHOLD) {
    return { useRepaired: false, reason: "discarded-too-much-volume", volumeFraction };
  }
  const xRatio = input.repairedBBox.xMm / Math.max(input.rawBBox.xMm, 1e-9);
  const yRatio = input.repairedBBox.yMm / Math.max(input.rawBBox.yMm, 1e-9);
  const zRatio = input.repairedBBox.zMm / Math.max(input.rawBBox.zMm, 1e-9);
  const smallest = Math.min(xRatio, yRatio, zRatio);
  if (smallest < BBOX_MIN_RATIO) {
    return { useRepaired: false, reason: "repaired-bbox-shrunk", smallestBBoxRatio: smallest };
  }
  return { useRepaired: true, reason: "ok" };
}
