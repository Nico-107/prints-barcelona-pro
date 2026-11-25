import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// P1 — single pricing source. The engine lives in supabase/functions/_shared/pricing/
// and is consumed by the Deno edge function (relative import) and by the Vite client
// (path-aliased as @pricing). This test guards against anyone re-introducing the old
// inline-ESTIMATOR copy inside create-instant-checkout.

describe("P1: engine is shared, not inline-copied", () => {
  const engineSrc = readFileSync("supabase/functions/_shared/pricing/engine.ts", "utf8");

  it("shared engine exports EST, priceOrder and estimatePart", () => {
    expect(engineSrc).toMatch(/export const EST\s*=/);
    expect(engineSrc).toMatch(/export function priceOrder\b/);
    expect(engineSrc).toMatch(/export function estimatePart\b/);
    expect(engineSrc).toMatch(/export function charmCents\b/);
  });

  it("legacy ESTIMATOR-START marker no longer present in create-instant-checkout/index.ts", () => {
    const fn = readFileSync("supabase/functions/create-instant-checkout/index.ts", "utf8");
    expect(fn).not.toContain("// ESTIMATOR-START");
  });

  it("client and edge function pricing code produce identical totals for a canonical case", async () => {
    const { EST: engineEst, priceOrder: enginePrice, estimatePart: engineEstimate } = await import(
      "../../supabase/functions/_shared/pricing/engine"
    );
    const { EST: clientEst, priceOrder: clientPrice, estimatePart: clientEstimate } = await import(
      "@/lib/estimator/core"
    );
    expect(engineEst.plate).toEqual(clientEst.plate);
    expect(engineEst.plasticEurPerG).toBe(clientEst.plasticEurPerG);
    expect(engineEst.materials.PLA).toEqual(clientEst.materials.PLA);
    // Price a cube the same way with both copies:
    const analysis = {
      triangles: 12,
      skipped: 0,
      volumeMm3: 8000,
      insideOut: false,
      boundsMm: [20, 20, 20] as [number, number, number],
      orientations: Array.from({ length: 6 }, (_v, i) => ({
        index: i,
        name: `o${i}`,
        aUp: 400,
        aDown: 400,
        aSide: 1600,
        heightMm: 20,
        sizeXMm: 20,
        sizeYMm: 20,
        overhangCm2: 0,
      })),
    };
    const settings = {
      material: "PLA" as const,
      infillPct: 15,
      wallLoops: 2,
      quality: "standard" as const,
      supports: true,
      orientation: "auto" as const,
    };
    const engEst = engineEstimate(analysis as any, settings);
    const cliEst = clientEstimate(analysis as any, settings);
    const engOrd = enginePrice([{ name: "c", quantity: 1, material: "PLA", estimate: engEst }], "standard", { v4: true });
    const cliOrd = clientPrice([{ name: "c", quantity: 1, material: "PLA", estimate: cliEst }], "standard", { v4: true });
    expect(engOrd.totalCents).toBe(cliOrd.totalCents);
  });
});
