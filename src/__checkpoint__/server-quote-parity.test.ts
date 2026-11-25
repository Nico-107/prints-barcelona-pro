import { describe, it, expect } from "vitest";
import { evaluateCheckout } from "../../supabase/functions/_shared/checkout/evaluate";
import { analyzeCube } from "./legacy/quoteLegacy";
import { quoteV5 } from "../../supabase/functions/_shared/pricing/quote";

// S2 — Quote contract and PRICE_UPDATED. Client quote must match the server evaluation
// to the cent across every fixture × material × fulfillment × page group; if it differs,
// the server returns PRICE_UPDATED and the UI switches to the new price.

const cube = analyzeCube(20);

describe("S2 server quote parity", () => {
  it("client quote matches server evaluate (pickup, PLA, standard, DIMENSION11)", () => {
    const uiQuote = quoteV5({
      pieces: [{ analysis: cube, material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto", quantity: 1 }],
      urgency: "standard",
      fulfillment: "pickup",
      pageGroup: "local",
      promoCode: "DIMENSION11",
    });
    const server = evaluateCheckout(
      {
        pricingVersion: 5,
        urgency: "standard",
        fulfillment: "pickup",
        pageGroup: "local",
        promoCode: "DIMENSION11",
        pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" }],
        clientQuote: { partsSubtotalCents: uiQuote.partsSubtotalCents, shippingCents: uiQuote.shippingCents, totalCents: uiQuote.totalCents, pricingVersion: 5 },
      },
      [cube],
    );
    expect(server.ok).toBe(true);
    expect(server.quote!.totalCents).toBe(uiQuote.totalCents);
  });

  it("PRICE_UPDATED when client total is lower than server", () => {
    const server = evaluateCheckout(
      {
        pricingVersion: 5,
        urgency: "standard",
        fulfillment: "pickup",
        pageGroup: "local",
        pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" }],
        clientQuote: { partsSubtotalCents: 500, shippingCents: 0, totalCents: 500, pricingVersion: 5 },
      },
      [cube],
    );
    expect(server.ok).toBe(false);
    expect(server.error).toBe("PRICE_UPDATED");
    expect(server.priceUpdated!.from).toBe(500);
    expect(server.priceUpdated!.to).toBeGreaterThan(500);
  });

  it("server-lower → accept and bill the lower price", () => {
    const server = evaluateCheckout(
      {
        pricingVersion: 5,
        urgency: "standard",
        fulfillment: "pickup",
        pageGroup: "local",
        pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" }],
        clientQuote: { partsSubtotalCents: 9999, shippingCents: 0, totalCents: 9999, pricingVersion: 5 },
      },
      [cube],
    );
    expect(server.ok).toBe(true);
    expect(server.quote!.totalCents).toBeLessThan(9999);
  });

  it("OVERSIZE_PART when any piece doesn't fit any orientation", () => {
    // Fake an oversize analysis by mutating the cube's orientation sizes.
    const oversize = structuredClone(cube);
    for (const o of oversize.orientations) {
      o.sizeXMm = 500;
      o.sizeYMm = 500;
      o.heightMm = 500;
    }
    const server = evaluateCheckout(
      {
        pricingVersion: 5,
        urgency: "standard",
        fulfillment: "pickup",
        pageGroup: "local",
        pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto" }],
      },
      [oversize],
    );
    expect(server.ok).toBe(false);
    expect(server.error).toBe("OVERSIZE_PART");
  });
});
