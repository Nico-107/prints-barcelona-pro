import { describe, it, expect } from "vitest";
import { evaluateCheckout, stripeLines } from "../../supabase/functions/_shared/checkout/evaluate";
import { analyzeCube } from "./legacy/quoteLegacy";

// S8 — Test orders. Passing `isTest: true` through the server body propagates to the
// Stripe metadata and later marks orders.is_test = true. Admin hides test orders by
// default.

describe("S8 test orders", () => {
  it("evaluateCheckout succeeds when isTest=true", () => {
    const r = evaluateCheckout(
      {
        pricingVersion: 5,
        urgency: "standard",
        fulfillment: "pickup",
        pageGroup: "local",
        isTest: true,
        pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" }],
      },
      [analyzeCube(20)],
    );
    expect(r.ok).toBe(true);
    expect(r.quote!.totalCents).toBeGreaterThanOrEqual(990);
  });

  it("stripeLines returns at least one line for a pickup cube", () => {
    const body = {
      pricingVersion: 5 as const,
      urgency: "standard" as const,
      fulfillment: "pickup" as const,
      pageGroup: "local" as const,
      isTest: true,
      pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard" as const, supports: true, orientation: "auto" as const }],
    };
    const quote = { partsSubtotalCents: 990, shippingCents: 0, discountedPartsCents: 990, promoDiscountCents: 0, promoPct: 0 };
    const lines = stripeLines(body, quote);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.reduce((a, l) => a + l.amountCents, 0)).toBe(990);
  });
});
