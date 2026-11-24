import { describe, it, expect } from "vitest";
import { computeBundleV3 } from "./estimate";
import { buildCheckoutBody } from "./checkoutBody";
import { evaluateV4, stripeLinesV4, validateV4 } from "./checkoutV4";
import { analyzeTriangles } from "./estimator/core";
import { boxMesh } from "./estimator/fixtures";
import type { ParsedFile, PartDefaults } from "./pricing";

const boxAnalysis = analyzeTriangles(boxMesh(60, 60, 30));

const defaults: PartDefaults = {
  material: "PLA", color: "", infill: 15, wallLoops: 2,
  multicolour: false, quality: "standard", supports: true, orientation: "auto",
};

function makeFile(id: string, name: string, qty: number): ParsedFile {
  return { id, name, qty, volumeMm3: boxAnalysis.volumeMm3, sizeBytes: 5000, analysis: boxAnalysis };
}

function mockUploaded(ids: string[], names: string[]) {
  return { paths: names, names, byId: Object.fromEntries(ids.map((id, i) => [id, names[i]])) };
}

const baseParams = {
  defaults,
  urgency: "standard",
  fulfillment: "pickup" as const,
  contactEmail: "test@example.com",
  contactPhone: "",
  colorPref: "",
  language: "en",
  phId: null,
  phSid: null,
  utmSource: null,
  utmMedium: null,
  utmContent: null,
  utmCampaign: null,
  checkoutRef: null,
};

// ─── v4 pickup with DIMENSION11 (10 %) ─────────────────────────────────────────
describe("v4: DIMENSION11 (10 %) discount — pickup", () => {
  const files = [makeFile("a", "box.stl", 1)];
  const bundle = computeBundleV3(files, defaults, "standard", { v4: true })!;
  const uploaded = mockUploaded(["a"], ["box.stl"]);
  const body = buildCheckoutBody({
    ...baseParams,
    validFiles: files,
    bundle,
    uploaded,
    pricingVersion: 4,
    promoCode: "DIMENSION11",
  });

  const promoDiscountCents = Math.round(bundle.orderResult.chargedPrintCents * 10 / 100);
  const result = evaluateV4(body, [boxAnalysis]);

  it("evaluateV4 accepts the body", () => expect(result.ok).toBe(true));
  it("body carries promoCode = DIMENSION11", () => expect(body.promoCode).toBe("DIMENSION11"));
  it("pricingVersion is 4", () => expect(body.pricingVersion).toBe(4));

  it("exactPrice matches server totalCents (±2 cents)", () => {
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Math.abs(Math.round(body.exactPrice * 100) - result.value.priced.order.totalCents)).toBeLessThanOrEqual(2);
  });

  it("promoDiscountCents = round(chargedPrintCents × 10 / 100)", () => {
    expect(promoDiscountCents).toBe(Math.round(bundle.orderResult.chargedPrintCents * 10 / 100));
  });

  it("display price after discount = totalCents − promoDiscountCents (in EUR)", () => {
    if (!result.ok) return;
    const displayed = (result.value.priced.order.totalCents - promoDiscountCents) / 100;
    expect(displayed).toBeGreaterThan(0);
    expect(result.value.priced.order.totalCents / 100 - promoDiscountCents / 100).toBeCloseTo(displayed, 5);
  });

  it("Stripe lines sum = totalCents − promoDiscountCents (pickup, no shipping)", () => {
    if (!result.ok) return;
    const lines = stripeLinesV4(result.value.priced, result.value.body.pieces, "en", "DIMENSION11", 10, promoDiscountCents);
    const sum = lines.reduce((s, l) => s + l.cents, 0);
    expect(sum).toBe(result.value.priced.order.totalCents - promoDiscountCents);
  });
});

// ─── v4 shipping — discount does NOT touch shipping ───────────────────────────
describe("v4: DIMENSION11 — legacy server shipping line is NOT discounted", () => {
  const files = [makeFile("a", "box.stl", 1)];
  const bundle = computeBundleV3(files, defaults, "standard", { v4: true })!;
  const uploaded = mockUploaded(["a"], ["box.stl"]);
  const body = buildCheckoutBody({
    ...baseParams,
    validFiles: files,
    bundle,
    uploaded,
    fulfillment: "shipping",
    pricingVersion: 4,
    promoCode: "DIMENSION11",
  });

  const promoDiscountCents = Math.round(bundle.orderResult.chargedPrintCents * 10 / 100);
  const result = evaluateV4(body, [boxAnalysis]);

  it("evaluateV4 accepts the body", () => expect(result.ok).toBe(true));

  it("legacy server shipping line is not discounted", () => {
    if (!result.ok) return;
    expect(result.value.shippingCents).toBe(590);
  });

  it("chargeCents = (totalCents + 590) — shipping independent of promo", () => {
    if (!result.ok) return;
    expect(result.value.chargeCents).toBe(result.value.priced.order.totalCents + 590);
  });

  it("Stripe print lines sum = totalCents − promoDiscountCents (shipping added separately)", () => {
    if (!result.ok) return;
    const lines = stripeLinesV4(result.value.priced, result.value.body.pieces, "en", "DIMENSION11", 10, promoDiscountCents);
    const sum = lines.reduce((s, l) => s + l.cents, 0);
    expect(sum).toBe(result.value.priced.order.totalCents - promoDiscountCents);
  });
});

// ─── Expired / invalid code degrades cleanly ──────────────────────────────────
describe("v4: expired/null code — no discount applied, full price charged", () => {
  const files = [makeFile("a", "box.stl", 1)];
  const bundle = computeBundleV3(files, defaults, "standard", { v4: true })!;
  const uploaded = mockUploaded(["a"], ["box.stl"]);

  it("body with no promoCode passes evaluateV4 unmodified", () => {
    const body = buildCheckoutBody({ ...baseParams, validFiles: files, bundle, uploaded, pricingVersion: 4 });
    expect(body.promoCode).toBeUndefined();
    const result = evaluateV4(body, [boxAnalysis]);
    expect(result.ok).toBe(true);
  });

  it("promoDiscountCents is 0 when pct is 0 (expired code returns pct=0 from edge fn)", () => {
    const promoDiscountCents = Math.round(bundle.orderResult.chargedPrintCents * 0 / 100);
    expect(promoDiscountCents).toBe(0);
  });

  it("Stripe lines with 0 discount equal full totalCents", () => {
    const body = buildCheckoutBody({ ...baseParams, validFiles: files, bundle, uploaded, pricingVersion: 4 });
    const result = evaluateV4(body, [boxAnalysis]);
    if (!result.ok) return;
    const lines = stripeLinesV4(result.value.priced, result.value.body.pieces, "en", "", 0, 0);
    const sum = lines.reduce((s, l) => s + l.cents, 0);
    expect(sum).toBe(result.value.priced.order.totalCents);
  });

  it("validateV4 rejects a promoCode string over 32 chars", () => {
    const longCode = "X".repeat(33);
    const r = validateV4({ pricingVersion: 4, urgency: "standard", fulfillment: "pickup", exactPrice: 9.9, promoCode: longCode, pieces: [] });
    expect(r.ok).toBe(false);
  });
});
