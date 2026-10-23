import { describe, it, expect } from "vitest";

// Pure helper that mirrors the body-building logic in StlEstimator
// (extracted here for unit testing without DOM or React)
function buildBatchBody(
  files: Array<{ fileName: string; material: string; infillPct: number; quantity: number; volumeCm3: number; grams: number; estHours: number; exactPrice: number }>,
  uploadedPaths: string[],
  uploadedNames: string[],
  language: string,
  sourceCity: string | null,
  sourcePath: string,
  phDistinctId: string | null,
  phSessionId: string | null,
) {
  const totalPrice = files.reduce((s, f) => s + f.exactPrice, 0);
  return {
    files,
    totalPrice,
    fileCount: files.length,
    filePaths: uploadedPaths,
    fileNames: uploadedNames,
    language,
    sourceCity,
    sourcePath,
    phDistinctId,
    phSessionId,
  };
}

describe("send-price-estimate batch body builder", () => {
  it("produces ONE batch object for 10 files with correct fileCount", () => {
    const files = Array.from({ length: 10 }, (_, i) => ({
      fileName: `part${i + 1}.stl`,
      material: "PLA",
      infillPct: 15,
      quantity: 1,
      volumeCm3: 5,
      grams: 6.2,
      estHours: 0.5,
      exactPrice: 10 + i,
    }));
    const body = buildBatchBody(files, [], [], "es", null, "/", null, null);
    expect(body.fileCount).toBe(10);
    expect(Array.isArray(body.files)).toBe(true);
    expect(body.files).toHaveLength(10);
    // totalPrice is sum of all exactPrices
    const expected = files.reduce((s, f) => s + f.exactPrice, 0);
    expect(body.totalPrice).toBeCloseTo(expected);
  });

  it("returns exactly one top-level object (not per-file)", () => {
    const files = [
      { fileName: "a.stl", material: "PLA", infillPct: 15, quantity: 1, volumeCm3: 3, grams: 4, estHours: 0.3, exactPrice: 10 },
      { fileName: "b.stl", material: "PETG", infillPct: 20, quantity: 2, volumeCm3: 7, grams: 8.9, estHours: 0.7, exactPrice: 15 },
    ];
    const body = buildBatchBody(files, ["p1", "p2"], ["a.stl", "b.stl"], "en", "Barcelona", "/en", "ph-id", "sess-id");
    // Must be a single object, not an array
    expect(Array.isArray(body)).toBe(false);
    expect(body.fileCount).toBe(2);
    expect(body.phDistinctId).toBe("ph-id");
    expect(body.phSessionId).toBe("sess-id");
    expect(body.sourcePath).toBe("/en");
  });
});
