// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import React from "react";
import { OrderPanel } from "./OrderPanel";
import { PartRow } from "./PartRow";
import { DefaultSettings } from "./DefaultSettings";
import { computeBundleV2 } from "@/lib/pricing";
import type { ParsedFile, PartDefaults, MaterialOption } from "@/lib/pricing";

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

// E1 files
const E1_FILES: ParsedFile[] = [
  { id: "a", name: "soporte.stl", sizeBytes: 1000, volumeMm3: 30000, qty: 2, settings: { material: "PETG", infill: 50, wallLoops: 3 } },
  { id: "b", name: "tapa.stl",    sizeBytes: 1000, volumeMm3: 15000, qty: 1, settings: { material: "TPU",  infill: 20, wallLoops: 2 } },
  { id: "c", name: "eje.stl",     sizeBytes: 1000, volumeMm3: 40000, qty: 4, settings: { material: "PLA",  infill: 20, wallLoops: 2 } },
];

// One customized, one default
const MIXED_FILES: ParsedFile[] = [
  { id: "x", name: "custom.stl", sizeBytes: 500, volumeMm3: 20000, qty: 1, settings: { material: "PETG", infill: 30 } },
  { id: "y", name: "default.stl", sizeBytes: 500, volumeMm3: 20000, qty: 1 },
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
    const bundle = computeBundleV2(validFiles, DEFAULTS, "standard");
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
    const bundle = computeBundleV2(validFiles, DEFAULTS, "standard");
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
