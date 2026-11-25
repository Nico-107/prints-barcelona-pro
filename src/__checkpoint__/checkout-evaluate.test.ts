import { describe, it, expect } from "vitest";
import { evaluateCheckout, stripeLines, MAX_CHARGE_CENTS } from "../../supabase/functions/_shared/checkout/evaluate";
import { analyzeCube } from "./legacy/quoteLegacy";

describe("S1 evaluateCheckout basics", () => {
  const cube = analyzeCube(20);
  const BODY = (overrides: any = {}) => ({
    pricingVersion: 5 as const,
    urgency: "standard" as const,
    fulfillment: "pickup" as const,
    pageGroup: "local" as const,
    pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard" as const, supports: true, orientation: "auto" as const }],
    ...overrides,
  });

  it("20mm cube pickup returns total >= minimum (990)", () => {
    const r = evaluateCheckout(BODY({}), [cube]);
    expect(r.ok).toBe(true);
    expect(r.quote!.totalCents).toBeGreaterThanOrEqual(990);
  });

  it("stripeLines sum equals discountedPartsCents + shipping", () => {
    const body = BODY({});
    const r = evaluateCheckout(body, [cube]);
    const lines = stripeLines(body, {
      partsSubtotalCents: r.quote!.partsSubtotalCents,
      shippingCents: r.quote!.shippingCents,
      discountedPartsCents: r.quote!.discountedPartsCents,
      promoDiscountCents: r.quote!.promoDiscountCents,
      promoPct: r.quote!.promoPct,
    });
    const sum = lines.reduce((a, l) => a + l.amountCents, 0);
    expect(sum).toBe(r.quote!.totalCents);
  });

  it("MAX_CHARGE_CENTS is the stable 20590 ceiling", () => {
    expect(MAX_CHARGE_CENTS).toBe(20590);
  });
});
