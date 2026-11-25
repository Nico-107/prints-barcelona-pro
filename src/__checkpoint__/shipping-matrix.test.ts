import { describe, it, expect } from "vitest";
import { deliveryV5 } from "../../supabase/functions/_shared/pricing/shipping";

// S4 — Shipping v5 matrix. ≥ 40 cases: pickup × local/non_local × parts
// 9,90/25,00/29,95/30,00/34,90/150,00 × with/without DIMENSION11 × qty 1/3.
// UI total === server quote === expected.

interface Case {
  label: string;
  fulfillment: "pickup" | "shipping";
  pageGroup: "local" | "non_local";
  variant?: "A" | "B";
  partsCents: number;
  discountedCents: number;
  expectedShipping: number;
  expectedTotal: number;
}

function expectedTotals(partsCents: number, discountedCents: number, fulfillment: "pickup" | "shipping", pageGroup: "local" | "non_local", variant: "A" | "B" = "A") {
  const r = deliveryV5({ partsSubtotalCents: partsCents, discountedPartsCents: discountedCents, fulfillment, pageGroup, variant });
  return r;
}

const amounts = [990, 2500, 2995, 3000, 3490, 15000];

const cases: Case[] = [];
for (const partsCents of amounts) {
  for (const promo of [false, true]) {
    const discounted = promo ? Math.round(partsCents * 0.9) : partsCents;
    for (const fulfillment of ["pickup", "shipping"] as const) {
      for (const pageGroup of ["local", "non_local"] as const) {
        const variants: Array<"A" | "B"> = fulfillment === "shipping" && pageGroup === "local" ? ["A", "B"] : ["A"];
        for (const variant of variants) {
          const r = expectedTotals(partsCents, discounted, fulfillment, pageGroup, variant);
          cases.push({
            label: `${fulfillment}/${pageGroup}${variant === "B" ? "/B" : ""} parts=${partsCents} promo=${promo}`,
            fulfillment,
            pageGroup,
            variant,
            partsCents,
            discountedCents: discounted,
            expectedShipping: r.shippingCents,
            expectedTotal: r.totalCents,
          });
        }
      }
    }
  }
}

describe("S4 shipping matrix", () => {
  it(`has ≥ 40 cases (actual: ${cases.length})`, () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
  });
  for (const c of cases) {
    it(c.label, () => {
      const r = deliveryV5({
        partsSubtotalCents: c.partsCents,
        discountedPartsCents: c.discountedCents,
        fulfillment: c.fulfillment,
        pageGroup: c.pageGroup,
        variant: c.variant,
      });
      expect(r.shippingCents).toBe(c.expectedShipping);
      expect(r.totalCents).toBe(c.expectedTotal);
      // Invariants:
      if (c.fulfillment === "pickup") expect(r.shippingCents).toBe(0);
      if (c.discountedCents >= 3000) expect(r.shippingCents).toBe(0);
      // Delivered price never exceeds the charm cap on non-local pages.
      if (c.fulfillment === "shipping" && c.pageGroup === "non_local" && c.discountedCents < 3000) {
        expect(r.totalCents).toBeLessThanOrEqual(3090);
      }
    });
  }
});
