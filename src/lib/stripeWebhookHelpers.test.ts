import { describe, it, expect } from "vitest";
import { shouldSendConfirmation, buildOrderPaidProps } from "./stripeWebhookHelpers";

describe("shouldSendConfirmation", () => {
  it("returns true when payment_status is pending", () => {
    expect(shouldSendConfirmation("pending")).toBe(true);
  });

  it("returns true when payment_status is null", () => {
    expect(shouldSendConfirmation(null)).toBe(true);
  });

  it("returns true when payment_status is undefined", () => {
    expect(shouldSendConfirmation(undefined)).toBe(true);
  });

  it("returns false when payment_status is paid — prevents duplicate email", () => {
    expect(shouldSendConfirmation("paid")).toBe(false);
  });
});

describe("buildOrderPaidProps", () => {
  const baseSession = {
    amount_total: 2500,
    currency: "eur",
    metadata: {
      order_id: "ord-123",
      order_number: "158",
      fulfillment: "pickup",
      source_path: "/impresion-3d-barcelona",
      materials: "PLA",
      pricing_version: "3",
      part_count: "2",
      utm_source: "google",
    },
    id: "cs_test_abc",
  };

  it("builds correct value from amount_total", () => {
    const props = buildOrderPaidProps(baseSession, null);
    expect(props.value).toBe(25);
  });

  it("includes source_path from metadata", () => {
    const props = buildOrderPaidProps(baseSession, null);
    expect(props.source_path).toBe("/impresion-3d-barcelona");
  });

  it("includes utm_source from metadata", () => {
    const props = buildOrderPaidProps(baseSession, null);
    expect(props.utm_source).toBe("google");
  });

  it("does NOT throw when pricingVersion=3 and order.pieces is a valid array", () => {
    const order = {
      pieces: [
        { quality: "standard", supports: true, material: "PLA" },
        { quality: "standard", supports: false, material: "PETG" },
      ],
    };
    expect(() => buildOrderPaidProps(baseSession, order)).not.toThrow();
    const props = buildOrderPaidProps(baseSession, order);
    expect(props.quality).toBe("standard");
    expect(props.supports).toBe("mixed");
  });

  it("does NOT throw when pricingVersion=3 and order is null (was the crash root cause)", () => {
    expect(() => buildOrderPaidProps(baseSession, null)).not.toThrow();
  });

  it("sets is_mixed=false for single material", () => {
    const props = buildOrderPaidProps(baseSession, null);
    expect(props.is_mixed).toBe(false);
  });

  it("sets is_mixed=true for mixed materials", () => {
    const session = {
      ...baseSession,
      metadata: { ...baseSession.metadata, materials: "PLA,PETG" },
    };
    const props = buildOrderPaidProps(session, null);
    expect(props.is_mixed).toBe(true);
  });

  it("omits pricing_version when not in metadata", () => {
    const session = { amount_total: 1000, currency: "eur", metadata: {} };
    const props = buildOrderPaidProps(session, null);
    expect("pricing_version" in props).toBe(false);
  });
});
