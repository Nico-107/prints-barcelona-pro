/**
 * Section 2.0 contract: "The site must never show a price the server will not charge."
 *
 * For every test case, computes the client-side bundle (what the price window shows)
 * and simulates what the server evaluates (via evaluateV3 / evaluateV4), then asserts:
 *   Math.round(bundle.order.totalCents) === server priced.order.totalCents
 *
 * Also asserts the shipping fee shown matches what the server would charge.
 */
import { describe, it, expect } from "vitest";
import { analyzeTriangles } from "./core";
import { boxMesh, prismMesh, tBeamMesh } from "./fixtures";
import { computeBundleV3 } from "../estimate";
import { buildCheckoutBody } from "../checkoutBody";
import { evaluateV3 } from "../checkoutV3";
import { evaluateV4 } from "../checkoutV4";
import { EST } from "./core";
import { freeShippingThresholdCents } from "../usePricingVersion";
import type { ParsedFile, PartDefaults } from "../pricing";

const boxAnalysis    = analyzeTriangles(boxMesh(40, 40, 40));
const tAnalysis      = analyzeTriangles(tBeamMesh());
const prismAnalysis  = analyzeTriangles(prismMesh(3, 5, 8)); // tiny — hits minimum

function parsedFile(id: string, name: string, qty: number, analysis: ReturnType<typeof analyzeTriangles>): ParsedFile {
  return { id, name, qty, volumeMm3: analysis.volumeMm3, sizeBytes: 5000, analysis };
}

const defaults: PartDefaults = {
  material: "PLA", color: "", infill: 15, wallLoops: 2,
  multicolour: false, quality: "standard", supports: false, orientation: "auto",
};

const mockUploaded = (files: ParsedFile[]) => ({
  paths: files.map(f => `path/${f.name}`),
  names: files.map(f => f.name),
  byId: Object.fromEntries(files.map(f => [f.id, `path/${f.name}`])),
});

const baseParams = {
  defaults,
  urgency: "standard",
  fulfillment: "pickup" as const,
  contactEmail: "", contactPhone: "", colorPref: "", language: "en",
  phId: null, phSid: null, utmSource: null, utmMedium: null,
  utmContent: null, utmCampaign: null, checkoutRef: null,
};

// ── V3 cases ──────────────────────────────────────────────────────────────────

describe("V3 price match: shown == charged", () => {
  const cases: Array<{ label: string; files: ParsedFile[]; urgency?: string; fulfillment?: "pickup" | "shipping" }> = [
    { label: "single box pickup",          files: [parsedFile("a", "box.stl", 1, boxAnalysis)] },
    { label: "single box shipping",        files: [parsedFile("a", "box.stl", 1, boxAnalysis)],       fulfillment: "shipping" },
    { label: "tiny part (minimum order)",  files: [parsedFile("s", "clip.stl", 1, prismAnalysis)] },
    { label: "2-part express shipping",    files: [parsedFile("a", "box.stl", 2, boxAnalysis), parsedFile("b", "t.stl", 1, tAnalysis)], urgency: "express", fulfillment: "shipping" },
  ];

  for (const { label, files, urgency = "standard", fulfillment = "pickup" } of cases) {
    it(label, () => {
      const bundle = computeBundleV3(files, defaults, urgency)!;
      expect(bundle).not.toBeNull();

      const body = buildCheckoutBody({ ...baseParams, validFiles: files, bundle, urgency, fulfillment, uploaded: mockUploaded(files), pricingVersion: 3 });
      const result = evaluateV3(body, files.map(f => f.analysis!));
      expect(result.ok).toBe(true);

      // Print total shown == print total charged
      expect(bundle.order.totalCents).toBe(result.value!.priced.order.totalCents);

      // Shipping shown == shipping charged
      const freeCents = freeShippingThresholdCents(3);
      const clientShipping = fulfillment === "shipping" && bundle.order.totalCents < freeCents ? EST.shippingCents : 0;
      expect(clientShipping).toBe(result.value!.shippingCents);
    });
  }
});

// ── V4 cases ──────────────────────────────────────────────────────────────────

describe("V4 price match: shown == charged", () => {
  const cases: Array<{ label: string; files: ParsedFile[]; urgency?: string; fulfillment?: "pickup" | "shipping" }> = [
    { label: "single box pickup",          files: [parsedFile("a", "box.stl", 1, boxAnalysis)] },
    { label: "single box shipping",        files: [parsedFile("a", "box.stl", 1, boxAnalysis)],       fulfillment: "shipping" },
    { label: "tiny part (minimum 9,90 €)", files: [parsedFile("s", "clip.stl", 1, prismAnalysis)] },
    { label: "2-part express shipping",    files: [parsedFile("a", "box.stl", 2, boxAnalysis), parsedFile("b", "t.stl", 1, tAnalysis)], urgency: "express", fulfillment: "shipping" },
  ];

  for (const { label, files, urgency = "standard", fulfillment = "pickup" } of cases) {
    it(label, () => {
      const bundle = computeBundleV3(files, defaults, urgency, { v4: true })!;
      expect(bundle).not.toBeNull();

      const body = buildCheckoutBody({ ...baseParams, validFiles: files, bundle, urgency, fulfillment, uploaded: mockUploaded(files), pricingVersion: 4 });
      // pricingVersion is 4 so use evaluateV4
      const result = evaluateV4(body, files.map(f => f.analysis!));
      expect(result.ok).toBe(true);

      // Print total shown == print total charged
      expect(bundle.order.totalCents).toBe(result.value!.priced.order.totalCents);

      // Shipping shown == shipping charged
      const freeCents = freeShippingThresholdCents(4);
      const clientShipping = fulfillment === "shipping" && bundle.order.totalCents < freeCents ? EST.shippingCents : 0;
      expect(clientShipping).toBe(result.value!.shippingCents);
    });
  }
});
