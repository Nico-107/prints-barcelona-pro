import { describe, it, expect } from "vitest";
import { verifyClientSummary, type AnalysisSummary } from "../../supabase/functions/_shared/checkout/evaluate";

// S3 — heavy files: verified client summary. Tampered summaries fail every invariant;
// honest summaries pass.

function base(): AnalysisSummary {
  return {
    sha256: "a".repeat(64),
    triangles: 50_000,
    bbox: [100, 80, 40],
    unionVolumeMm3: 80_000, // 80 cm³
    shellVolumesAbs: [60_000, 15_000, 5_000], // sum 80_000
    class: "overlapping",
  };
}

describe("S3 verifyClientSummary", () => {
  it("honest summary passes", () => {
    const s = base();
    expect(verifyClientSummary(s, s.sha256, 1_000_000).ok).toBe(true);
  });
  it("sha mismatch rejects", () => {
    const s = base();
    expect(verifyClientSummary(s, "b".repeat(64), 1_000_000).ok).toBe(false);
  });
  it("union > sum(|shell|) rejects", () => {
    const s = base();
    s.unionVolumeMm3 = 100_000;
    expect(verifyClientSummary(s, s.sha256, 1).ok).toBe(false);
  });
  it("union < max shell rejects", () => {
    const s = base();
    s.unionVolumeMm3 = 1000; // less than the largest shell 60_000
    expect(verifyClientSummary(s, s.sha256, 1).ok).toBe(false);
  });
  it("union > bbox rejects", () => {
    const s = base();
    s.unionVolumeMm3 = 1_000_000; // bbox is 320_000
    expect(verifyClientSummary(s, s.sha256, 1).ok).toBe(false);
  });
  it("tri-count out of range rejects", () => {
    const s = base();
    s.triangles = 0;
    expect(verifyClientSummary(s, s.sha256, 1).ok).toBe(false);
    s.triangles = 100_000_000;
    expect(verifyClientSummary(s, s.sha256, 1).ok).toBe(false);
  });
  it("empty shell list rejects", () => {
    const s = base();
    s.shellVolumesAbs = [];
    expect(verifyClientSummary(s, s.sha256, 1).ok).toBe(false);
  });
});
