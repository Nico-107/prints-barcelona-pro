import { describe, it, expect } from "vitest";
import { deliveryV5 } from "../../supabase/functions/_shared/pricing/shipping";

// F3 — fulfillment UI contract. Two equal-size cards (delivery vs pickup), each with its
// own final total. Non-local pages: one delivered line. The number in the card === total
// === Buy label === Stripe to the cent.

describe("F3 fulfillment card totals", () => {
  it("non-local 9,90 €: delivered total = min(charm(9.90 + 4.90), 30.90) = 14,90 €", () => {
    const r = deliveryV5({ partsSubtotalCents: 990, discountedPartsCents: 990, fulfillment: "shipping", pageGroup: "non_local" });
    expect(r.totalCents).toBe(1490);
    expect(r.shippingCents).toBe(500);
    expect(r.mode).toBe("included");
  });

  it("non-local 34,90 €: free shipping from 30 € so total = 34,90", () => {
    const r = deliveryV5({ partsSubtotalCents: 3490, discountedPartsCents: 3490, fulfillment: "shipping", pageGroup: "non_local" });
    expect(r.totalCents).toBe(3490);
    expect(r.shippingCents).toBe(0);
    expect(r.mode).toBe("free");
  });

  it("local variant B: shipping shows 4,90 € upfront, label 'upfront'", () => {
    const r = deliveryV5({ partsSubtotalCents: 990, discountedPartsCents: 990, fulfillment: "shipping", pageGroup: "local", variant: "B" });
    expect(r.shippingCents).toBe(490);
    expect(r.totalCents).toBe(1480);
    expect(r.mode).toBe("upfront");
  });

  it("pickup never shows shipping anywhere", () => {
    const r = deliveryV5({ partsSubtotalCents: 1500, discountedPartsCents: 1500, fulfillment: "pickup", pageGroup: "local" });
    expect(r.shippingCents).toBe(0);
    expect(r.totalCents).toBe(1500);
  });
});
