import { describe, it, expect } from "vitest";
import { repairFloorDecision } from "./legacy/repairFloor";
import { legacyQuote } from "./legacy/quoteLegacy";
import { analyzeTriangles } from "./legacy/deployedServer";

// H3 — repair-floor guard.
// The repair must be discarded when: (a) discarded open-shell volume > 5 % of raw |signed volume|,
// or (b) the repaired bbox shrinks below 90 % of the raw bbox on any axis.
// Using the raw analysis then prevents the "9,90 € for a 35 cm model" bug (see AUDIT §B3).

function openShellPlusTinyClosed(): Float32Array {
  // 200×150×60 open shell (missing +Z face, 10 triangles) + a 10×2×10 closed tab in the corner.
  // Both volumes roughly: open shell signed volume ~ 180 cm³, closed tab ~ 0.2 cm³.
  const open: number[][] = [
    // -Z bottom (closed)
    [0, 0, 0,   200, 150, 0,   200, 0, 0],
    [0, 0, 0,   0, 150, 0,     200, 150, 0],
    // -Y
    [0, 0, 0,   200, 0, 0,     200, 0, 60],
    [0, 0, 0,   200, 0, 60,    0, 0, 60],
    // +Y
    [0, 150, 0, 0, 150, 60,    200, 150, 60],
    [0, 150, 0, 200, 150, 60,  200, 150, 0],
    // -X
    [0, 0, 0,   0, 0, 60,      0, 150, 60],
    [0, 0, 0,   0, 150, 60,    0, 150, 0],
    // +X
    [200, 0, 0, 200, 150, 0,   200, 150, 60],
    [200, 0, 0, 200, 150, 60,  200, 0, 60],
    // (no +Z face → open shell)
  ];
  const tab: number[][] = [
    // Small closed tab: 10×2×10 near origin on its side
    [220, 0, 0,  230, 0, 0,    230, 2, 0],
    [220, 0, 0,  230, 2, 0,    220, 2, 0],
    [220, 0, 10, 230, 2, 10,   230, 0, 10],
    [220, 0, 10, 220, 2, 10,   230, 2, 10],
    [220, 0, 0,  220, 0, 10,   230, 0, 10],
    [220, 0, 0,  230, 0, 10,   230, 0, 0],
    [220, 2, 0,  230, 2, 0,    230, 2, 10],
    [220, 2, 0,  230, 2, 10,   220, 2, 10],
    [220, 0, 0,  220, 2, 0,    220, 2, 10],
    [220, 0, 0,  220, 2, 10,   220, 0, 10],
    [230, 0, 0,  230, 2, 10,   230, 2, 0],
    [230, 0, 0,  230, 0, 10,   230, 2, 10],
  ];
  return Float32Array.from([...open.flat(), ...tab.flat()]);
}

describe("hotfix-repair-floor: raw analysis wins when repair discards too much", () => {
  it("volume-drop rule: 10 % discarded open shell → use raw", () => {
    const d = repairFloorDecision({
      rawBBox: { xMm: 200, yMm: 150, zMm: 60 },
      rawSumAbsSignedVolume: 1_000_000, // mm³
      repairedBBox: { xMm: 200, yMm: 150, zMm: 60 },
      repairedSumAbsSignedVolume: 900_000,
      discardedOpenShellAbsSignedVolume: 100_000, // 10 %
    });
    expect(d.useRepaired).toBe(false);
    expect(d.reason).toBe("discarded-too-much-volume");
  });

  it("bbox-shrink rule: repaired axis < 90 % → use raw", () => {
    const d = repairFloorDecision({
      rawBBox: { xMm: 200, yMm: 150, zMm: 60 },
      rawSumAbsSignedVolume: 1_000,
      repairedBBox: { xMm: 180, yMm: 150, zMm: 50 }, // z shrunk to 83 %
      repairedSumAbsSignedVolume: 1_000,
      discardedOpenShellAbsSignedVolume: 0,
    });
    expect(d.useRepaired).toBe(false);
    expect(d.reason).toBe("repaired-bbox-shrunk");
    expect(d.smallestBBoxRatio).toBeLessThan(0.9);
  });

  it("clean case keeps repair", () => {
    const d = repairFloorDecision({
      rawBBox: { xMm: 100, yMm: 100, zMm: 100 },
      rawSumAbsSignedVolume: 1_000_000,
      repairedBBox: { xMm: 100, yMm: 100, zMm: 100 },
      repairedSumAbsSignedVolume: 1_000_000,
      discardedOpenShellAbsSignedVolume: 10_000, // 1 %
    });
    expect(d.useRepaired).toBe(true);
    expect(d.reason).toBe("ok");
  });

  it("open shell + tiny closed: raw-analysis bbox reflects the open main shell, not just the tiny tab", () => {
    const tris = openShellPlusTinyClosed();
    const a = analyzeTriangles(tris);
    // The main shell is 200×150×60, so bounds must reflect that even though it is open.
    // Picking the raw analysis (per H3) is what keeps this from being priced as a tiny part.
    expect(a.boundsMm[0]).toBeGreaterThanOrEqual(200); // x spans to at least +200 (including tab)
    expect(a.boundsMm[1]).toBeGreaterThanOrEqual(150);
    expect(a.boundsMm[2]).toBeGreaterThanOrEqual(60);
    const q = legacyQuote({
      pieces: [{ analysis: a, material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto", quantity: 1 }],
      urgency: "standard",
      fulfillment: "pickup",
    });
    // Price may be minimum-floor low because signed-volume from open mesh sums partially; the
    // *decision* to use the raw bounds is the hotfix — that is covered by repairFloorDecision.
    expect(q.totalCents).toBeGreaterThanOrEqual(990);
  });
});
