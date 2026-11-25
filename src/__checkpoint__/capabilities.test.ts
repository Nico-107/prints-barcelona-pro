import { describe, it, expect } from "vitest";
import { isLegacy, hasCapability, type ServerCapabilities } from "@/hooks/useServerCapabilities";
import { legacyQuote, analyzeCube } from "./legacy/quoteLegacy";

// D4 — capability detection and gating.
// Legacy mode: produces the UI numbers that exactly match the deployed server (H1 contract).
// v5 mode: the UI is free to apply D-2 shipping rules (checked against the same oracle under
// different flags once Phase S lands).

const LEGACY: ServerCapabilities = {
  mode: "legacy",
  build: null,
  capabilities: [],
  shipping: null,
  ready: true,
};
const V5: ServerCapabilities = {
  mode: "v5",
  build: "v5-abc0000000",
  capabilities: ["quote_v5", "shipping_v5", "price_updated", "scale"],
  shipping: { flatCents: 490, freeFromCents: 3000, charmCapCents: 3090 },
  ready: true,
};

describe("D4 server capability primitives", () => {
  it("legacy mode: isLegacy true, no capabilities", () => {
    expect(isLegacy(LEGACY)).toBe(true);
    expect(hasCapability(LEGACY, "quote_v5")).toBe(false);
  });
  it("v5 mode: quote_v5 reported, legacy false", () => {
    expect(isLegacy(V5)).toBe(false);
    expect(hasCapability(V5, "quote_v5")).toBe(true);
    expect(hasCapability(V5, "scale")).toBe(true);
    expect(hasCapability(V5, "shipping_v5")).toBe(true);
    expect(hasCapability(V5, "not_a_cap")).toBe(false);
  });
});

describe("D4 legacy quote parity still holds under mode gating", () => {
  it("20mm cube, shipping, no promo: legacy quote matches deployedServer charge", () => {
    const a = analyzeCube(20);
    const q = legacyQuote({
      pieces: [{ analysis: a, material: "PLA", infill: 15, wallLoops: 2, quality: "standard", supports: true, orientation: "auto", quantity: 1 }],
      urgency: "standard",
      fulfillment: "shipping",
    });
    // 9,90 € parts + 5,90 € shipping = 15,80 € (deployed server rule).
    expect(q.partsSubtotalCents).toBe(990);
    expect(q.shippingCents).toBe(590);
    expect(q.totalCents).toBe(1580);
  });
});
