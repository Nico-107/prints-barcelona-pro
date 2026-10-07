// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import React from "react";
import { OrderPanel } from "./OrderPanel";
import { PartRow } from "./PartRow";
import { DefaultSettings } from "./DefaultSettings";
import { computeBundleV3 } from "@/lib/estimate";
import { PriceBreakdown } from "./PriceBreakdown";
import type { ParsedFile, PartDefaults, MaterialOption } from "@/lib/pricing";
import { analyzeTriangles } from "@/lib/estimator/core";
import { boxMesh } from "@/lib/estimator/fixtures";

const MATERIAL_OPTIONS: MaterialOption[] = [
  { key: "PLA",  label: "PLA",  descriptorKey: "calc.mat.pla.desc"  },
  { key: "PETG", label: "PETG", descriptorKey: "calc.mat.petg.desc" },
  { key: "TPU",  label: "TPU",  descriptorKey: "calc.mat.tpu.desc"  },
  { key: "ABS",  label: "ABS",  descriptorKey: "calc.mat.abs.desc"  },
];

const DEFAULTS: PartDefaults = {
  material: "PLA",
  color: "",
  infill: 15,
  wallLoops: 2,
  multicolour: false,
};

function t(key: string): string { return key; }

const NOOP = () => {};

const BASE_PROPS = {
  defaults: DEFAULTS,
  selectedFileIndex: 0,
  expandedPartId: null,
  onSelectPart: NOOP,
  onExpandPart: NOOP,
  onQtyChange: NOOP,
  onRemove: NOOP,
  onPartSettingsChange: NOOP,
  onResetPartSettings: NOOP,
  onApplyToAll: NOOP,
  fulfillment: null as "pickup" | "shipping" | null,
  fulfillmentAttempted: false,
  onFulfillmentChange: NOOP,
  pickupCity: "Barcelona",
  contactEmail: "",
  contactPhone: "",
  contactTouched: false,
  quoteError: null,
  checkoutError: null,
  oversizedFiles: [],
  onContactEmailChange: NOOP,
  onContactPhoneChange: NOOP,
  advancedMode: false,
  instantBuyEligible: false,
  isCheckingOut: false,
  preUploadDone: true,
  isSubmittingQuote: false,
  showManualReview: false,
  hasSubmitted: false,
  uploadState: "idle" as const,
  onInstantBuy: NOOP,
  onManualReview: NOOP,
  onSubmitQuote: NOOP,
  onWhatsApp: NOOP,
  language: "es",
  t,
  materialOptions: MATERIAL_OPTIONS,
  adminMode: false,
};

const _a40 = analyzeTriangles(boxMesh(40, 40, 40));
const _a30 = analyzeTriangles(boxMesh(30, 30, 30));
const _a50 = analyzeTriangles(boxMesh(50, 50, 50));
const _a35 = analyzeTriangles(boxMesh(35, 35, 35));

// E1 files
const E1_FILES: ParsedFile[] = [
  { id: "a", name: "soporte.stl", sizeBytes: 1000, volumeMm3: _a40.volumeMm3, qty: 2, analysis: _a40, settings: { material: "PETG", infill: 50, wallLoops: 3 } },
  { id: "b", name: "tapa.stl",    sizeBytes: 1000, volumeMm3: _a30.volumeMm3, qty: 1, analysis: _a30, settings: { material: "TPU",  infill: 20, wallLoops: 2 } },
  { id: "c", name: "eje.stl",     sizeBytes: 1000, volumeMm3: _a50.volumeMm3, qty: 4, analysis: _a50, settings: { material: "PLA",  infill: 20, wallLoops: 2 } },
];

// One customized, one default
const MIXED_FILES: ParsedFile[] = [
  { id: "x", name: "custom.stl",  sizeBytes: 500, volumeMm3: _a35.volumeMm3, qty: 1, analysis: _a35, settings: { material: "PETG", infill: 30 } },
  { id: "y", name: "default.stl", sizeBytes: 500, volumeMm3: _a35.volumeMm3, qty: 1, analysis: _a35 },
];

function renderHydrate(element: React.ReactElement): { errors: string[] } {
  const errors: string[] = [];
  const consoleSpy = vi.spyOn(console, "error").mockImplementation((msg: string, ...args: unknown[]) => {
    const str = String(msg) + args.map(String).join(" ");
    errors.push(str);
  });

  const container = document.createElement("div");
  document.body.appendChild(container);

  let html: string;
  try {
    html = renderToString(element);
  } catch (e) {
    errors.push("renderToString threw: " + String(e));
    document.body.removeChild(container);
    consoleSpy.mockRestore();
    return { errors };
  }
  container.innerHTML = html;

  act(() => {
    hydrateRoot(container, element, {
      onRecoverableError(err) {
        errors.push("recoverable: " + String(err));
      },
    });
  });

  document.body.removeChild(container);
  consoleSpy.mockRestore();
  return { errors };
}

describe("Hydration: OrderPanel — empty cart", () => {
  it("no recoverable errors or hydration mismatches", () => {
    const { errors } = renderHydrate(
      <OrderPanel
        {...BASE_PROPS}
        parsedFiles={[]}
        validFiles={[]}
        bundle={null}
      />
    );
    const hydrationErrors = errors.filter(e =>
      e.includes("Hydration") || e.includes("did not match") || e.includes("recoverable")
    );
    expect(hydrationErrors).toHaveLength(0);
  });
});

describe("Hydration: OrderPanel — E1 three-part order", () => {
  it("no recoverable errors or hydration mismatches", () => {
    const validFiles = E1_FILES;
    const bundle = computeBundleV3(validFiles, DEFAULTS, "standard");
    expect(bundle).not.toBeNull();

    const { errors } = renderHydrate(
      <OrderPanel
        {...BASE_PROPS}
        parsedFiles={E1_FILES}
        validFiles={validFiles}
        bundle={bundle!}
        instantBuyEligible={true}
        fulfillment="pickup"
      />
    );
    const hydrationErrors = errors.filter(e =>
      e.includes("Hydration") || e.includes("did not match") || e.includes("recoverable")
    );
    expect(hydrationErrors).toHaveLength(0);
  });
});

describe("Hydration: OrderPanel — one customized, one default", () => {
  it("no recoverable errors or hydration mismatches", () => {
    const validFiles = MIXED_FILES;
    const bundle = computeBundleV3(validFiles, DEFAULTS, "standard");
    expect(bundle).not.toBeNull();

    const { errors } = renderHydrate(
      <OrderPanel
        {...BASE_PROPS}
        parsedFiles={MIXED_FILES}
        validFiles={validFiles}
        bundle={bundle!}
      />
    );
    const hydrationErrors = errors.filter(e =>
      e.includes("Hydration") || e.includes("did not match") || e.includes("recoverable")
    );
    expect(hydrationErrors).toHaveLength(0);
  });
});

describe("Hydration: DefaultSettings", () => {
  it("renders and hydrates without errors", () => {
    const element = (
      <DefaultSettings
        materialKey="PLA"
        colorPref=""
        infillPct={15}
        wallLoops={2}
        multicolour={false}
        urgency="standard"
        advancedMode={false}
        t={t}
        materialOptions={MATERIAL_OPTIONS}
        onMaterialChange={NOOP}
        onColorChange={NOOP}
        onInfillChange={NOOP}
        onWallLoopsChange={NOOP}
        onMulticolourChange={NOOP}
        onUrgencyChange={NOOP}
        onAdvancedModeChange={NOOP}
      />
    );

    const { errors } = renderHydrate(element);
    const hydrationErrors = errors.filter(e =>
      e.includes("Hydration") || e.includes("did not match") || e.includes("recoverable")
    );
    expect(hydrationErrors).toHaveLength(0);
  });
});

// ─── section='actions' / section='form' tests ────────────────────────────────

function mountPanel(element: React.ReactElement): HTMLDivElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  act(() => { createRoot(container).render(element); });
  return container;
}

describe("OrderPanel section prop", () => {
  const validFiles = E1_FILES;
  const bundle = computeBundleV3(E1_FILES, DEFAULTS, "standard")!;

  it("section='actions' renders primary button and NOT contact fields", () => {
    const container = mountPanel(
      <OrderPanel
        {...BASE_PROPS}
        parsedFiles={E1_FILES}
        validFiles={validFiles}
        bundle={bundle}
        instantBuyEligible={false}
        section="actions"
      />
    );
    const html = container.innerHTML;
    // Primary button (Send quote) should be present
    expect(html).toContain("calc.contact.submit");
    // Contact fields (email/phone inputs) should NOT be in actions section
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector('input[type="tel"]')).toBeNull();
  });

  it("section='actions' with instantBuyEligible renders Buy Now button", () => {
    const container = mountPanel(
      <OrderPanel
        {...BASE_PROPS}
        parsedFiles={E1_FILES}
        validFiles={validFiles}
        bundle={bundle}
        instantBuyEligible={true}
        fulfillment="pickup"
        section="actions"
        instantTotalPrice={12.50}
      />
    );
    const html = container.innerHTML;
    expect(html).toContain("calc.instantBuy.buyNow");
    expect(container.querySelector('input[type="email"]')).toBeNull();
  });

  it("section='form' renders contact fields and NOT the primary action button", () => {
    const container = mountPanel(
      <OrderPanel
        {...BASE_PROPS}
        parsedFiles={E1_FILES}
        validFiles={validFiles}
        bundle={bundle}
        instantBuyEligible={false}
        fulfillment="pickup"
        section="form"
      />
    );
    const html = container.innerHTML;
    // Contact fields present
    expect(html).toContain("calc.contact.email");
    // Action buttons NOT present
    expect(html).not.toContain("calc.contact.submit");
    expect(html).not.toContain("calc.instantBuy.buyNow");
  });

  it("default (section='all') renders both contact fields and primary button", () => {
    const container = mountPanel(
      <OrderPanel
        {...BASE_PROPS}
        parsedFiles={E1_FILES}
        validFiles={validFiles}
        bundle={bundle}
        instantBuyEligible={false}
        fulfillment="pickup"
      />
    );
    const html = container.innerHTML;
    expect(html).toContain("calc.contact.email");
    expect(html).toContain("calc.contact.submit");
  });
});

// ─── calc.why.minNote component test (T5 from spec) ──────────────────────────

describe("PriceBreakdown: calc.why.minNote visibility", () => {
  it("shows calc.why.minNote for a small order at the €10 minimum", () => {
    // Small order: a box(5,5,5) costs well under €10 — baseCents hits the minimum
    const smallAnalysis = analyzeTriangles(boxMesh(5, 5, 5));
    const smallFile: ParsedFile = { id: "s", name: "s.stl", sizeBytes: 100, volumeMm3: smallAnalysis.volumeMm3, qty: 1, analysis: smallAnalysis };
    const bundle = computeBundleV3([smallFile], DEFAULTS, "standard")!;
    expect(bundle.order.baseCents).toBeLessThanOrEqual(1000);

    const container = mountPanel(
      <PriceBreakdown bundle={bundle} fulfillment="pickup" t={t} />
    );
    // Expand the accordion to reveal the breakdown details
    const expandBtn = container.querySelector("button[aria-expanded]") as HTMLButtonElement;
    act(() => { expandBtn.click(); });
    expect(container.innerHTML).toContain("calc.why.minNote");
    expect(container.innerHTML).not.toContain("calc.summary.setup");
  });

  it("does not show calc.why.minNote for an order well above €10", () => {
    // Large order: box(100,100,100) costs well above €10
    const bigAnalysis = analyzeTriangles(boxMesh(100, 100, 100));
    const bigFile: ParsedFile = { id: "b", name: "b.stl", sizeBytes: 100, volumeMm3: bigAnalysis.volumeMm3, qty: 1, analysis: bigAnalysis };
    const bundle = computeBundleV3([bigFile], DEFAULTS, "standard")!;
    expect(bundle.order.baseCents).toBeGreaterThan(1000);

    const container = mountPanel(
      <PriceBreakdown bundle={bundle} fulfillment="pickup" t={t} />
    );
    expect(container.innerHTML).not.toContain("calc.why.minNote");
    expect(container.innerHTML).not.toContain("calc.summary.setup");
  });
});

// ─── Price unchanged after polish (CHANGE 5 must not affect price) ───────────

describe("computeBundleV3 price invariant after polish", () => {
  it("single-part box(40) at PLA standard = €10.00 (minimum)", () => {
    const a = analyzeTriangles(boxMesh(40, 40, 40));
    const f: ParsedFile = { id: "x", name: "x.stl", sizeBytes: 100, volumeMm3: a.volumeMm3, qty: 1, analysis: a };
    const bundle = computeBundleV3([f], DEFAULTS, "standard")!;
    expect(bundle.order.totalCents).toBe(1000);
  });

  it("three-part order T4 total = €93.50", () => {
    const mkFile2 = (id: string, gSz: number, mat: string, qty: number): ParsedFile => {
      const a = analyzeTriangles(boxMesh(gSz, gSz, gSz));
      return { id, name: `${id}.stl`, sizeBytes: 100, volumeMm3: a.volumeMm3, qty, analysis: a, settings: { material: mat } };
    };
    const files: ParsedFile[] = [
      mkFile2("a", 100, "PLA",  1),
      mkFile2("b",  50, "PETG", 2),
      mkFile2("c",  30, "PLA",  1),
    ];
    const bundle = computeBundleV3(files, { ...DEFAULTS, material: "PLA" }, "standard")!;
    expect(bundle.order.totalCents).toBe(9350);
  });
});

describe("Hydration: PartRow", () => {
  it("renders and hydrates without errors", () => {
    const part: ParsedFile = {
      id: "p1", name: "test.stl", sizeBytes: 1000, volumeMm3: 20000, qty: 2,
      settings: { material: "PETG", infill: 50 },
    };
    const element = (
      <PartRow
        part={part}
        effectiveMaterial="PETG"
        effectiveColor=""
        effectiveInfill={50}
        effectiveWallLoops={2}
        costCents={500}
        isSelected={false}
        isCustomized={true}
        isExpanded={false}
        advancedMode={false}
        t={t}
        language="es"
        materialOptions={MATERIAL_OPTIONS}
        onSelect={NOOP}
        onQtyChange={NOOP}
        onRemove={NOOP}
        onToggleExpand={NOOP}
        onSettingsChange={NOOP}
        onResetSettings={NOOP}
        onApplyToAll={NOOP}
      />
    );
    const { errors } = renderHydrate(element);
    const hydrationErrors = errors.filter(e =>
      e.includes("Hydration") || e.includes("did not match") || e.includes("recoverable")
    );
    expect(hydrationErrors).toHaveLength(0);
  });
});
