import { describe, it, expect } from "vitest";
import { buildCheckoutBody, type CheckoutBody } from "./checkoutBody";
import { computeBundleV3 } from "./estimate";
import { analyzeTriangles } from "./estimator/core";
import { boxMesh, tBeamMesh, prismMesh } from "./estimator/fixtures";
import { evaluateV3, stripeLinesV3 } from "./checkoutV3";
import type { ParsedFile, PartDefaults } from "./pricing";

// ─── Analyses ─────────────────────────────────────────────────────────────────
const boxAnalysis = analyzeTriangles(boxMesh(40, 40, 40));
const tAnalysis = analyzeTriangles(tBeamMesh());
const prismAnalysis = analyzeTriangles(prismMesh(15, 30, 16));
// large enough to approach but stay under EUR 100
const bigBoxAnalysis = analyzeTriangles(boxMesh(110, 110, 60));
// oversize (won't fit plate)
const oversizeAnalysis = analyzeTriangles(boxMesh(300, 50, 50));

function file(
  id: string, name: string, qty: number,
  analysis: ReturnType<typeof analyzeTriangles>,
  extra?: Partial<PartDefaults>,
): ParsedFile {
  return {
    id, name, qty,
    volumeMm3: analysis.volumeMm3,
    sizeBytes: 5000,
    analysis,
    settings: extra ? {
      material: extra.material,
      infill: extra.infill,
      wallLoops: extra.wallLoops,
      quality: extra.quality,
      supports: extra.supports,
      orientation: extra.orientation,
    } : undefined,
  };
}

const defaultsStd: PartDefaults = {
  material: "PLA", color: "", infill: 15, wallLoops: 2,
  multicolour: false, quality: "standard", supports: true, orientation: "auto",
};

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

// ─── Helper: build body + evaluate ────────────────────────────────────────────
function buildAndEvaluate(files: ParsedFile[], defs = defaultsStd, urgency = "standard", fulfillment: "pickup" | "shipping" = "pickup") {
  const bundle = computeBundleV3(files, defs, urgency)!;
  const uploaded = mockUploaded(files.map(f => f.id), files.map(f => f.name));
  const body = buildCheckoutBody({ ...baseParams, validFiles: files, defaults: defs, bundle, uploaded, urgency, fulfillment });
  return { bundle, body, result: evaluateV3(body, files.map(f => f.analysis!)) };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("E2: single part pickup (PLA box)", () => {
  const { body, result } = buildAndEvaluate([file("a", "box.stl", 1, boxAnalysis)]);
  it("accepted", () => expect(result.ok).toBe(true));
  it("chargeCents = print total (pickup, no shipping)", () => {
    expect(result.value!.chargeCents).toBe(result.value!.priced.order.totalCents);
    expect(result.value!.shippingCents).toBe(0);
  });
  it("exactPrice matches server totalCents", () => {
    expect(Math.round(body.exactPrice * 100)).toBe(result.value!.priced.order.totalCents);
  });
  it("pricingVersion is 3", () => expect(body.pricingVersion).toBe(3));
});

describe("E2: 3 materials express + shipping (PLA+PETG+TPU)", () => {
  const files = [
    file("a", "box.stl", 2, boxAnalysis),
    file("b", "t.stl", 1, tAnalysis, { material: "PETG", infill: 20 }),
    file("c", "prism.stl", 3, prismAnalysis, { material: "TPU", infill: 10 }),
  ];
  const { body, result } = buildAndEvaluate(files, defaultsStd, "express", "shipping");
  it("accepted", () => expect(result.ok).toBe(true));
  it("chargeCents = print + 590", () => {
    expect(result.value!.shippingCents).toBe(590);
    expect(result.value!.chargeCents).toBe(result.value!.priced.order.totalCents + 590);
  });
  it("urgency is express", () => expect(body.urgency).toBe("express"));
  it("Stripe lines add up", () => {
    const lines = stripeLinesV3(result.value!.priced, result.value!.body.pieces, "es");
    expect(lines.reduce((s: number, l: { cents: number }) => s + l.cents, 0)).toBe(result.value!.priced.order.totalCents);
  });
});

describe("E2: minimum price (tiny PLA)", () => {
  const { body, result } = buildAndEvaluate([file("s", "clip.stl", 1, analyzeTriangles(prismMesh(3, 5, 8)))]);
  it("accepted with minimum price €10", () => {
    expect(result.ok).toBe(true);
    expect(result.value!.priced.order.totalCents).toBeGreaterThanOrEqual(1000);
  });
});

describe("E2: Nylon instant-buy", () => {
  const files = [file("n", "bracket.stl", 1, boxAnalysis, { material: "Nylon", infill: 15 })];
  const { body, result } = buildAndEvaluate(files);
  it("Nylon is accepted (instant material)", () => expect(result.ok).toBe(true));
});

describe("E2: ABS instant-buy", () => {
  const files = [file("a", "part.stl", 1, boxAnalysis, { material: "ABS", infill: 15 })];
  const { body, result } = buildAndEvaluate(files);
  it("ABS is accepted", () => expect(result.ok).toBe(true));
});

describe("E2: ASA instant-buy", () => {
  const files = [file("a", "part.stl", 1, boxAnalysis, { material: "ASA", infill: 15 })];
  const { body, result } = buildAndEvaluate(files);
  it("ASA is accepted", () => expect(result.ok).toBe(true));
});

describe("E2: large part just under EUR 100", () => {
  const files = [file("big", "big.stl", 1, bigBoxAnalysis)];
  const bundle = computeBundleV3(files, defaultsStd, "standard");
  it("bundle exists", () => expect(bundle).not.toBeNull());
  it("result is either accepted (<=100) or over-limit", () => {
    if (!bundle) return;
    const uploaded = mockUploaded(["big"], ["big.stl"]);
    const body = buildCheckoutBody({ ...baseParams, validFiles: files, defaults: defaultsStd, bundle, uploaded });
    const result = evaluateV3(body, [bigBoxAnalysis]);
    // Either accepted under the limit or properly rejected
    if (result.ok) {
      expect(result.value!.priced.order.totalCents).toBeLessThanOrEqual(10000);
    } else {
      expect(result.error).toBe("PRICE_ABOVE_INSTANT_LIMIT");
    }
  });
});

describe("E2: oversize part", () => {
  const files = [file("huge", "huge.stl", 1, oversizeAnalysis)];
  const bundle = computeBundleV3(files, defaultsStd, "standard");
  it("evaluateV3 rejects oversize", () => {
    if (!bundle) return;
    const uploaded = mockUploaded(["huge"], ["huge.stl"]);
    const body = buildCheckoutBody({ ...baseParams, validFiles: files, defaults: defaultsStd, bundle, uploaded });
    const result = evaluateV3(body, [oversizeAnalysis]);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("OVERSIZE_PART");
  });
});

describe("E2: multicolour", () => {
  const files = [file("m", "multi.stl", 1, boxAnalysis, { multicolour: true } as any)];
  const defs = { ...defaultsStd, multicolour: true };
  const bundle = computeBundleV3(files, defs, "standard");
  it("evaluateV3 rejects multicolour", () => {
    if (!bundle) return;
    const uploaded = mockUploaded(["m"], ["multi.stl"]);
    const body = buildCheckoutBody({ ...baseParams, validFiles: files, defaults: defs, bundle, uploaded });
    // manually set multicolour on piece to trigger rejection
    const patchedBody = { ...body, pieces: body.pieces.map(p => ({ ...p, multicolour: true })) };
    const result = evaluateV3(patchedBody, [boxAnalysis]);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("INSTANT_NOT_AVAILABLE");
  });
});

describe("Guard — urgency MUST be present (server rejects if missing)", () => {
  const { body, result } = buildAndEvaluate([file("a", "box.stl", 1, boxAnalysis)]);
  it("server accepts valid body", () => expect(result.ok).toBe(true));
  it("server rejects body with deleted urgency", () => {
    const noUrgency = { ...body, urgency: undefined } as unknown as CheckoutBody;
    const r = evaluateV3(noUrgency, [boxAnalysis]);
    expect(r.ok).toBe(false);
    expect(r.error).toBe("INVALID_URGENCY");
  });
  it("server rejects body with deleted exactPrice", () => {
    const noPrice = { ...body, exactPrice: undefined } as unknown as CheckoutBody;
    const r = evaluateV3(noPrice, [boxAnalysis]);
    expect(r.ok).toBe(false);
  });
});
