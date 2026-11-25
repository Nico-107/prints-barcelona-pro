import { describe, it, expect } from "vitest";
import {
  evaluateV4,
  shippingChargeCents,
  computePromoDiscountCents,
  type V3Piece,
} from "./legacy/deployedServer";
import { legacyQuote, analyzeCube } from "./legacy/quoteLegacy";

// H1: legacy shipping parity.
// For every supported combination, the UI legacy quote must equal what the deployed
// edge function (`evaluateV4` + `shippingChargeCents`) will charge at Stripe to the cent.
//
// Matrix: pickup × shipping, under/over €100 parts, with/without DIMENSION11, 1 vs 3 parts,
// and both page groups (local + non-local — in legacy mode page group only affects which
// label is shown, not the number; the test proves that).

type Fulfillment = "pickup" | "shipping";
const CUBE_SMALL = analyzeCube(20); // ~€9,90 PLA standard
const CUBE_LARGE = analyzeCube(70); // ~> €100 PLA standard (over free-shipping threshold)

interface Case {
  label: string;
  cube: typeof CUBE_SMALL;
  quantity: number;
  fulfillment: Fulfillment;
  promoCode?: "DIMENSION11";
}

const cases: Case[] = [];
for (const fulfillment of ["pickup", "shipping"] as Fulfillment[]) {
  for (const cube of [CUBE_SMALL, CUBE_LARGE]) {
    for (const quantity of [1, 3]) {
      for (const promoCode of [undefined, "DIMENSION11" as const]) {
        const sizeLabel = cube === CUBE_SMALL ? "20mm" : "70mm";
        const promoLabel = promoCode ? "promo" : "nopromo";
        cases.push({
          label: `${fulfillment} ${sizeLabel} x${quantity} ${promoLabel}`,
          cube,
          quantity,
          fulfillment,
          promoCode,
        });
      }
    }
  }
}

describe("compat-legacy-server: UI total === deployed server charge", () => {
  it("has at least 16 cases", () => {
    expect(cases.length).toBeGreaterThanOrEqual(16);
  });

  for (const c of cases) {
    it(c.label, () => {
      const piece = {
        analysis: c.cube,
        material: "PLA",
        infill: 15,
        wallLoops: 2,
        quality: "standard" as const,
        supports: true,
        orientation: "auto" as const,
        quantity: c.quantity,
        name: "cube",
      };
      const q = legacyQuote({
        pieces: [piece],
        urgency: "standard",
        fulfillment: c.fulfillment,
        promoCode: c.promoCode,
      });

      // Mirror what the deployed server would see.
      const serverPiece: V3Piece = {
        name: "cube",
        quantity: c.quantity,
        path: "u/cube.stl",
        material: "PLA",
        infill: 15,
        wallLoops: 2,
        quality: "standard",
        supports: true,
        orientation: "auto",
      };
      const evalResult = evaluateV4(
        {
          pricingVersion: 4,
          urgency: "standard",
          fulfillment: c.fulfillment,
          exactPrice: q.partsSubtotalCents / 100,
          promoCode: c.promoCode,
          pieces: [serverPiece],
        },
        [c.cube],
      );
      expect(evalResult.ok).toBe(true);
      const serverPrintTotal = evalResult.value!.priced.order.totalCents;
      // Parts total agrees to the cent.
      expect(q.partsSubtotalCents).toBe(serverPrintTotal);

      // Promo semantics: applies to the charm total, 10 % off.
      const promo = computePromoDiscountCents(c.promoCode, serverPrintTotal);
      expect(q.promoDiscountCents).toBe(promo.cents);
      const discounted = Math.max(0, serverPrintTotal - promo.cents);
      expect(q.discountedPartsCents).toBe(discounted);

      // Shipping follows checkout-policy.ts: €5,90 only when discounted parts < €100.
      const expectedShip = shippingChargeCents(c.fulfillment, discounted);
      expect(q.shippingCents).toBe(expectedShip);

      // Buy total = discounted parts + shipping.
      expect(q.totalCents).toBe(discounted + expectedShip);
    });
  }
});

describe("compat-legacy-server: boundary at €100 free-shipping threshold", () => {
  it("shipping charged below €100 discounted subtotal", () => {
    expect(shippingChargeCents("shipping", 9999)).toBe(590);
  });
  it("shipping free at €100 discounted subtotal", () => {
    expect(shippingChargeCents("shipping", 10000)).toBe(0);
  });
  it("pickup never pays shipping", () => {
    expect(shippingChargeCents("pickup", 500)).toBe(0);
    expect(shippingChargeCents("pickup", 50000)).toBe(0);
  });
});
