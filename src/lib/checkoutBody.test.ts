import { describe, it, expect } from "vitest";
import { buildCheckoutBody, type CheckoutBody } from "./checkoutBody";
import { computeBundleV2, computeOrder } from "./pricing";
import type { ParsedFile, PartDefaults } from "./pricing";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function file(
  id: string, name: string, qty: number, volumeMm3: number,
  mat: string, infill: number, walls: number
): ParsedFile {
  return { id, name, qty, volumeMm3, sizeBytes: 1000, settings: { material: mat, infill, wallLoops: walls } };
}

// E1: A soporte.stl ×2 PETG 50% 3w vol30000 | B tapa.stl ×1 TPU 15% 2w vol15000 | C eje.stl ×4 PLA 15% 2w vol40000
// NOTE: docs examples use 20% but the server only accepts [5,15,30,50,80]; 15% is the nearest valid value.
const e1Files: ParsedFile[] = [
  file("a", "soporte.stl", 2, 30000, "PETG", 50, 3),
  file("b", "tapa.stl",    1, 15000, "TPU",  15, 2),
  file("c", "eje.stl",     4, 40000, "PLA",  15, 2),
];
const defaultsStd: PartDefaults = { material: "PLA", color: "", infill: 15, wallLoops: 2, multicolour: false };

// E3: clip.stl ×1 PLA 15% 2w vol3000 (hits minimum price)
const e3Files: ParsedFile[] = [{ id: "s", name: "clip.stl", qty: 1, volumeMm3: 3000, sizeBytes: 100 }];
const e3Defaults: PartDefaults = { material: "PLA", color: "", infill: 15, wallLoops: 2, multicolour: false };

// E4: base.stl ×1 PLA 80% 4w vol184140 — total ~€50.90 → cap applies → charged = €50.00
// (docs example used 20% infill which is invalid; 80%/4w chosen to produce a capped total)
const e4Files: ParsedFile[] = [{ id: "big", name: "base.stl", qty: 1, volumeMm3: 184140, sizeBytes: 100 }];
const e4Defaults: PartDefaults = { material: "PLA", color: "", infill: 80, wallLoops: 4, multicolour: false };

// Nylon order — NOT instant-eligible (Nylon not in INSTANT_MATERIALS)
const nylonFiles: ParsedFile[] = [
  file("n", "bracket.stl", 1, 10000, "Nylon", 15, 2),
];

const mockUploaded = (ids: string[], names: string[]) => ({
  paths: names,
  names,
  byId: Object.fromEntries(ids.map((id, i) => [id, names[i]])),
});

const baseParams = {
  defaults: defaultsStd,
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

// ─── Server simulation (mirrors create-instant-checkout v2 validation) ───────

const INSTANT_MATS = new Set(["PLA", "PETG", "ABS", "TPU"]);
const VALID_INFILL  = new Set([5, 15, 30, 50, 80]);

function simulateServerValidation(body: CheckoutBody): void {
  if (!body.urgency || !["standard", "express", "urgent"].includes(body.urgency)) {
    throw new Error("INVALID_URGENCY");
  }
  if (!["pickup", "shipping"].includes(body.fulfillment)) {
    throw new Error("INVALID_FULFILLMENT");
  }
  if (!Array.isArray(body.pieces) || body.pieces.length < 1 || body.pieces.length > 20) {
    throw new Error("INVALID_PIECES");
  }
  for (const p of body.pieces) {
    if (!INSTANT_MATS.has(p.material))    throw new Error("INVALID_MATERIAL");
    if (!VALID_INFILL.has(p.infill))      throw new Error("INVALID_INFILL");
    if (!Number.isInteger(p.wallLoops) || p.wallLoops < 2 || p.wallLoops > 8)
      throw new Error("INVALID_WALLS");
    if (!Number.isInteger(p.quantity) || p.quantity < 1 || p.quantity > 999)
      throw new Error("INVALID_QUANTITY");
    if (!isFinite(p.volumeMm3) || p.volumeMm3 <= 0 || p.volumeMm3 > 50_000_000)
      throw new Error("INVALID_VOLUME");
    if (p.multicolour) throw new Error("INSTANT_NOT_AVAILABLE");
  }
  // PRICE_MISMATCH: |round(exactPrice×100) - chargedPrintCents| > 2
  const recomputed = computeOrder(body.pieces, body.urgency);
  if (Math.abs(Math.round(body.exactPrice * 100) - recomputed.chargedPrintCents) > 2) {
    throw new Error("PRICE_MISMATCH");
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("buildCheckoutBody — E1 standard pickup (PETG+TPU+PLA mixed)", () => {
  const bundle = computeBundleV2(e1Files, defaultsStd, "standard")!;
  const uploaded = mockUploaded(["a", "b", "c"], ["soporte.stl", "tapa.stl", "eje.stl"]);
  const body = buildCheckoutBody({ ...baseParams, validFiles: e1Files, bundle, uploaded });

  it("passes server validation", () => {
    expect(() => simulateServerValidation(body)).not.toThrow();
  });

  it("price matches server recompute (no PRICE_MISMATCH)", () => {
    const order = computeOrder(body.pieces, body.urgency);
    expect(order.chargedPrintCents).toBe(Math.round(body.exactPrice * 100));
  });

  it("urgency is present and valid", () => {
    expect(body.urgency).toBe("standard");
  });

  it("every piece has multicolour = false", () => {
    expect(body.pieces.every(p => p.multicolour === false)).toBe(true);
  });

  it("material summary is Mixed (PETG, TPU, PLA)", () => {
    expect(body.material).toBe("Mixed (PETG, TPU, PLA)");
  });

  it("top-level infill and wallLoops are null for mixed order", () => {
    expect(body.infill).toBeNull();
    expect(body.wallLoops).toBeNull();
  });

  it("pricingVersion is 2", () => {
    expect(body.pricingVersion).toBe(2);
  });
});

describe("buildCheckoutBody — E2 express + shipping (same parts as E1)", () => {
  const bundle = computeBundleV2(e1Files, defaultsStd, "express")!;
  const uploaded = mockUploaded(["a", "b", "c"], ["soporte.stl", "tapa.stl", "eje.stl"]);
  const body = buildCheckoutBody({
    ...baseParams, validFiles: e1Files, bundle, uploaded,
    urgency: "express", fulfillment: "shipping",
  });

  it("passes server validation", () => {
    expect(() => simulateServerValidation(body)).not.toThrow();
  });

  it("price matches server recompute (express urgency)", () => {
    const order = computeOrder(body.pieces, body.urgency);
    expect(order.chargedPrintCents).toBe(Math.round(body.exactPrice * 100));
  });

  it("urgency is express", () => {
    expect(body.urgency).toBe("express");
  });

  it("fulfillment is shipping", () => {
    expect(body.fulfillment).toBe("shipping");
  });
});

describe("buildCheckoutBody — E3 minimum price (PLA 15% 2w small vol)", () => {
  const bundle = computeBundleV2(e3Files, e3Defaults, "standard")!;
  const uploaded = mockUploaded(["s"], ["clip.stl"]);
  const body = buildCheckoutBody({ ...baseParams, validFiles: e3Files, defaults: e3Defaults, bundle, uploaded });

  it("passes server validation", () => {
    expect(() => simulateServerValidation(body)).not.toThrow();
  });

  it("charged price is the €10 minimum", () => {
    expect(Math.round(body.exactPrice * 100)).toBe(1000);
  });

  it("uniform order — material PLA, infill 15, wallLoops 2", () => {
    expect(body.material).toBe("PLA");
    expect(body.infill).toBe(15);
    expect(body.wallLoops).toBe(2);
  });
});

describe("buildCheckoutBody — E4 instant cap (PLA 80% 4w large vol)", () => {
  const bundle = computeBundleV2(e4Files, e4Defaults, "standard")!;
  const uploaded = mockUploaded(["big"], ["base.stl"]);
  const body = buildCheckoutBody({ ...baseParams, validFiles: e4Files, defaults: e4Defaults, bundle, uploaded });

  it("passes server validation", () => {
    expect(() => simulateServerValidation(body)).not.toThrow();
  });

  it("charged price is capped at €50", () => {
    expect(Math.round(body.exactPrice * 100)).toBe(5000);
  });

  it("price matches server recompute after cap", () => {
    const order = computeOrder(body.pieces, body.urgency);
    expect(order.chargedPrintCents).toBe(Math.round(body.exactPrice * 100));
  });
});

describe("buildCheckoutBody — Nylon order (not instant-eligible)", () => {
  it("server rejects Nylon — INVALID_MATERIAL", () => {
    const bundle = computeBundleV2(nylonFiles, defaultsStd, "standard");
    if (!bundle) return; // skip if no bundle (volume too small)
    const uploaded = mockUploaded(["n"], ["bracket.stl"]);
    const body = buildCheckoutBody({ ...baseParams, validFiles: nylonFiles, bundle, uploaded });
    expect(() => simulateServerValidation(body)).toThrow("INVALID_MATERIAL");
  });
});

describe("Guard — urgency MUST be present in body", () => {
  const bundle = computeBundleV2(e1Files, defaultsStd, "standard")!;
  const uploaded = mockUploaded(["a", "b", "c"], ["soporte.stl", "tapa.stl", "eje.stl"]);

  it("server rejects body with missing urgency", () => {
    const body = buildCheckoutBody({ ...baseParams, validFiles: e1Files, bundle, uploaded });
    const noUrgency = { ...body, urgency: undefined } as unknown as CheckoutBody;
    expect(() => simulateServerValidation(noUrgency)).toThrow("INVALID_URGENCY");
  });

  it("valid body with urgency passes", () => {
    const body = buildCheckoutBody({ ...baseParams, validFiles: e1Files, bundle, uploaded });
    expect(body.urgency).toBe("standard");
    expect(() => simulateServerValidation(body)).not.toThrow();
  });
});
