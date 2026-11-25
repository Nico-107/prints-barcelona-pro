import { describe, it, expect } from "vitest";
import { evaluateCheckout } from "../../supabase/functions/_shared/checkout/evaluate";
import { analyzeCube } from "./legacy/quoteLegacy";

// S9 — Regression. Promo codes (DIMENSION11), quote-link payments (Phase 3) and
// pickup-only flows keep working under the v5 checkout.

const cube = analyzeCube(20);
const BODY = (overrides: any = {}) => ({
  pricingVersion: 5 as const,
  urgency: "standard" as const,
  fulfillment: "pickup" as const,
  pageGroup: "local" as const,
  pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard" as const, supports: true, orientation: "auto" as const }],
  ...overrides,
});

describe("S9 checkout regression", () => {
  it("DIMENSION11 reduces the total by 10%", () => {
    const base = evaluateCheckout(BODY({}), [cube]);
    const promo = evaluateCheckout(BODY({ promoCode: "DIMENSION11" }), [cube]);
    expect(base.ok && promo.ok).toBe(true);
    expect(promo.quote!.discountedPartsCents).toBe(Math.max(0, base.quote!.partsSubtotalCents - Math.round(base.quote!.partsSubtotalCents * 0.1)));
    expect(promo.quote!.totalCents).toBeLessThan(base.quote!.totalCents);
  });

  it("Pickup never charges shipping, regardless of parts total", () => {
    const r = evaluateCheckout(BODY({ pageGroup: "non_local" }), [cube]);
    expect(r.ok).toBe(true);
    expect(r.quote!.shippingCents).toBe(0);
  });

  it("Invalid promo code → INVALID_PROMO (too long)", () => {
    const r = evaluateCheckout(BODY({ promoCode: "X".repeat(40) }), [cube]);
    expect(r.ok).toBe(false);
    expect(r.error).toBe("INVALID_PROMO");
  });

  it("Unknown promo code returns no discount but still succeeds", () => {
    const r = evaluateCheckout(BODY({ promoCode: "NOTREAL2026" }), [cube]);
    expect(r.ok).toBe(true);
    expect(r.quote!.promoPct).toBe(0);
    expect(r.quote!.promoDiscountCents).toBe(0);
  });
});
