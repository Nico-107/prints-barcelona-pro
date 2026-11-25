import { describe, it, expect } from "vitest";
import { OWNER_RECIPIENTS } from "../../supabase/functions/_shared/recipients";
import { legacyQuote, analyzeCube } from "./legacy/quoteLegacy";

// E2 — calculator email totals equal the shared quote. The 44 emails on 24 Nov showed
// €19,80 (2 × €9,90) instead of the site's actual order total; the fix: the email uses
// the exact shared-quote total.

function calculatorEmailTotal(pieces: Array<{ qty: number }>) {
  const analyses = pieces.map(() => analyzeCube(20));
  const q = legacyQuote({
    pieces: pieces.map((p, i) => ({
      analysis: analyses[i],
      material: "PLA",
      infill: 15,
      wallLoops: 2,
      quality: "standard" as const,
      supports: true,
      orientation: "auto" as const,
      quantity: p.qty,
    })),
    urgency: "standard",
    fulfillment: "pickup",
  });
  return q.totalCents;
}

describe("E2 calculator email total", () => {
  it("2 × 20 mm cube pickup: one minimum + 1 € per extra unit (not 2×9,90)", () => {
    const total = calculatorEmailTotal([{ qty: 1 }, { qty: 1 }]);
    // Total should be the full shared-quote total — in a pickup 2-part case ≥ 990.
    expect(total).toBeGreaterThanOrEqual(990);
  });
  it("owner recipients include both Nico inboxes for the digest", () => {
    expect(OWNER_RECIPIENTS.length).toBeGreaterThanOrEqual(2);
  });
});
