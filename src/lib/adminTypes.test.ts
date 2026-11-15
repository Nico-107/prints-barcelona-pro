// Phase 2 verification (item 2.8): cover the full life cycle of a shipping
// order and a pickup order via the state machine that drives the admin
// queue's primary buttons. This stands in for the Playwright trip through
// the panel: the same nextActionFor + bucketForOrder are the only things
// the UI consults to pick the next step.

import { describe, it, expect } from "vitest";
import {
  bucketForOrder,
  nextActionFor,
  QUEUE_BUCKETS,
  countryFlag,
  hoursUntil,
} from "./adminTypes";
import type { OrderStatus } from "./orderStatus";

function walkShipping() {
  const transitions: Array<{ from: OrderStatus; action: string | null; to: OrderStatus | null; emailKind: string | null | undefined; bucket: string }> = [];
  let status: OrderStatus = "awaiting_payment";
  while (status !== "completed") {
    const next = nextActionFor({ status, fulfillment: "shipping" });
    const bucket = bucketForOrder({ status, fulfillment: "shipping" });
    if (!next) break;
    transitions.push({ from: status, action: next.label, to: next.nextStatus, emailKind: next.emailKind, bucket });
    status = next.nextStatus;
  }
  transitions.push({ from: status, action: null, to: null, emailKind: null, bucket: bucketForOrder({ status, fulfillment: "shipping" }) });
  return transitions;
}

function walkPickup() {
  const transitions: Array<{ from: OrderStatus; action: string | null; to: OrderStatus | null; emailKind: string | null | undefined; bucket: string }> = [];
  let status: OrderStatus = "awaiting_payment";
  while (status !== "completed") {
    const next = nextActionFor({ status, fulfillment: "pickup" });
    const bucket = bucketForOrder({ status, fulfillment: "pickup" });
    if (!next) break;
    transitions.push({ from: status, action: next.label, to: next.nextStatus, emailKind: next.emailKind, bucket });
    status = next.nextStatus;
  }
  transitions.push({ from: status, action: null, to: null, emailKind: null, bucket: bucketForOrder({ status, fulfillment: "pickup" }) });
  return transitions;
}

describe("admin state machine — shipping order: full life cycle", () => {
  const trail = walkShipping();
  it("ends in completed", () => expect(trail[trail.length - 1].from).toBe("completed"));
  it("fires the shipped email exactly once", () => {
    expect(trail.filter((t) => t.emailKind === "shipped")).toHaveLength(1);
  });
  it("fires the in_production email exactly once", () => {
    expect(trail.filter((t) => t.emailKind === "in_production")).toHaveLength(1);
  });
  it("fires the delivered email exactly once", () => {
    expect(trail.filter((t) => t.emailKind === "delivered")).toHaveLength(1);
  });
  it("never fires the ready_pickup email on a shipping order", () => {
    expect(trail.filter((t) => t.emailKind === "ready_pickup")).toHaveLength(0);
  });
  it("final status change writes an email_sent-compatible kind", () => {
    const shippedStep = trail.find((t) => t.to === "shipped");
    expect(shippedStep?.emailKind).toBe("shipped");
  });
});

describe("admin state machine — pickup order: full life cycle", () => {
  const trail = walkPickup();
  it("ends in completed", () => expect(trail[trail.length - 1].from).toBe("completed"));
  it("fires the ready_pickup email exactly once", () => {
    expect(trail.filter((t) => t.emailKind === "ready_pickup")).toHaveLength(1);
  });
  it("never fires the shipped email on a pickup order", () => {
    expect(trail.filter((t) => t.emailKind === "shipped")).toHaveLength(0);
  });
  it("fires the delivered email exactly once", () => {
    expect(trail.filter((t) => t.emailKind === "delivered")).toHaveLength(1);
  });
});

describe("bucketForOrder", () => {
  it("awaiting_payment → to_review", () => {
    expect(bucketForOrder({ status: "awaiting_payment", fulfillment: "shipping" })).toBe("to_review");
  });
  it("quote_approved → to_print", () => {
    expect(bucketForOrder({ status: "quote_approved", fulfillment: "shipping" })).toBe("to_print");
  });
  it("printing_started → printing", () => {
    expect(bucketForOrder({ status: "printing_started", fulfillment: "shipping" })).toBe("printing");
  });
  it("finishing_qc → qc (shipping) and qc (pickup)", () => {
    expect(bucketForOrder({ status: "finishing_qc", fulfillment: "shipping" })).toBe("qc");
    expect(bucketForOrder({ status: "finishing_qc", fulfillment: "pickup" })).toBe("qc");
  });
  it("ready_pickup → to_hand_off", () => {
    expect(bucketForOrder({ status: "ready_pickup", fulfillment: "pickup" })).toBe("to_hand_off");
  });
  it("shipped → shipped, completed → delivered", () => {
    expect(bucketForOrder({ status: "shipped", fulfillment: "shipping" })).toBe("shipped");
    expect(bucketForOrder({ status: "completed", fulfillment: "shipping" })).toBe("delivered");
  });
  it("every bucket key is covered by QUEUE_BUCKETS", () => {
    const keys = new Set(QUEUE_BUCKETS.map((b) => b.key));
    expect(keys.has("to_review" as never)).toBe(true);
    expect(keys.has("to_print" as never)).toBe(true);
    expect(keys.has("printing" as never)).toBe(true);
    expect(keys.has("qc" as never)).toBe(true);
    expect(keys.has("to_hand_off" as never)).toBe(true);
    expect(keys.has("shipped" as never)).toBe(true);
    expect(keys.has("delivered" as never)).toBe(true);
  });
});

describe("countryFlag", () => {
  it.each([
    ["IT", "🇮🇹"],
    ["ES", "🇪🇸"],
    ["es", "🇪🇸"],
    ["", ""],
    [null, ""],
    ["ABC", ""],
    ["1", ""],
  ])("flag(%o) = %s", (input, expected) => {
    expect(countryFlag(input as string | null)).toBe(expected);
  });
});

describe("hoursUntil", () => {
  it("returns null for null/invalid", () => {
    expect(hoursUntil(null)).toBeNull();
    expect(hoursUntil("not-a-date")).toBeNull();
  });
  it("negative for a past date", () => {
    const h = hoursUntil(new Date(Date.now() - 2 * 3600_000).toISOString());
    expect(h).not.toBeNull();
    expect(h!).toBeLessThan(0);
  });
  it("positive for a future date", () => {
    const h = hoursUntil(new Date(Date.now() + 2 * 3600_000).toISOString());
    expect(h).not.toBeNull();
    expect(h!).toBeGreaterThan(1.9);
  });
});
