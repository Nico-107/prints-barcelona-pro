import { describe, it, expect } from "vitest";
import { evaluateCheckout } from "../../supabase/functions/_shared/checkout/evaluate";
import { analyzeCube } from "./legacy/quoteLegacy";

// S2 — PRICE_UPDATED contract. Returned only when server > client by more than 2 cents;
// client should re-show the price and accept Buy at the new total.

describe("S2 PRICE_UPDATED contract", () => {
  const cube = analyzeCube(20);
  const body = (clientTotal: number) => ({
    pricingVersion: 5 as const,
    urgency: "standard" as const,
    fulfillment: "pickup" as const,
    pageGroup: "local" as const,
    pieces: [{ name: "c", quantity: 1, path: "u/c.stl", material: "PLA", infill: 15, wallLoops: 2, quality: "standard" as const, supports: true, orientation: "auto" as const }],
    clientQuote: { partsSubtotalCents: clientTotal, shippingCents: 0, totalCents: clientTotal, pricingVersion: 5 as const },
  });

  it("server higher than client by 1 cent → still OK (±2 cents tolerance)", () => {
    const serverPreview = evaluateCheckout(body(0), [cube]);
    const serverTotal = serverPreview.quote!.totalCents;
    const r = evaluateCheckout(body(serverTotal - 1), [cube]);
    expect(r.ok).toBe(true);
  });

  it("server higher by 5 cents → PRICE_UPDATED with the full breakdown", () => {
    const serverPreview = evaluateCheckout(body(0), [cube]);
    const serverTotal = serverPreview.quote!.totalCents;
    const r = evaluateCheckout(body(serverTotal - 5), [cube]);
    expect(r.ok).toBe(false);
    expect(r.error).toBe("PRICE_UPDATED");
    expect(r.quote).toBeDefined();
    expect(r.priceUpdated).toEqual({ from: serverTotal - 5, to: serverTotal });
  });

  it("server lower than client → honor the lower price (never charges more)", () => {
    const r = evaluateCheckout(body(99999), [cube]);
    expect(r.ok).toBe(true);
    expect(r.quote!.totalCents).toBeLessThan(99999);
  });
});
