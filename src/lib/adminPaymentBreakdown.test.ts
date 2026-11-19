// Admin panel payment breakdown — rows must always sum exactly to total_paid_cents.
// Fixtures are shaped like real orders #268 (promo) and #273 (urgent + min adj).

import { describe, it, expect } from "vitest";
import {
  computePaymentRows,
  parseNotesUrgency,
  parseNotesShippingCents,
  parseNotesPromo,
} from "./adminPaymentBreakdown";

// ─── Parsing helpers ──────────────────────────────────────────────────────────

describe("parseNotesUrgency", () => {
  it("extracts urgency from v3 notes", () => {
    expect(parseNotesUrgency("Instant checkout v3. Qty 1, urgency standard, fulfillment shipping.")).toBe("standard");
  });
  it("extracts express from v4 notes", () => {
    expect(parseNotesUrgency("Instant checkout v4. Qty 1, urgency express, fulfillment pickup.")).toBe("express");
  });
  it("returns null for non-instant notes", () => {
    expect(parseNotesUrgency("Manual order")).toBeNull();
  });
});

describe("parseNotesShippingCents", () => {
  it("parses shipping from v3 notes", () => {
    expect(parseNotesShippingCents("Precio calculado: EUR 12.10. Shipping: EUR 5.90.")).toBe(590);
  });
  it("returns null when no shipping line", () => {
    expect(parseNotesShippingCents("Instant checkout v4. Precio calculado: EUR 10.89.")).toBeNull();
  });
});

describe("parseNotesPromo", () => {
  it("parses promo from v4 notes with Unicode minus", () => {
    const p = parseNotesPromo("Instant checkout v4. Promo: D3D10 −10% = −1.21 EUR. Precio calculado: EUR 10.89.");
    expect(p).toEqual({ code: "D3D10", pct: 10, discountCents: 121 });
  });
  it("returns null when no promo", () => {
    expect(parseNotesPromo("Instant checkout v4. Precio calculado: EUR 10.89.")).toBeNull();
  });
});

// ─── computePaymentRows ───────────────────────────────────────────────────────

function rowSum(rows: ReturnType<typeof computePaymentRows>): number {
  return rows.reduce((s, r) => s + r.cents, 0);
}

describe("computePaymentRows — rows sum to totalPaidCents", () => {
  it("order #268-shape: DIMENSION11 −10% pickup standard, all from DB columns", () => {
    // 2250 pieces − 225 promo = 2025 total
    const rows = computePaymentRows({
      totalPaidCents: 2025,
      piecesTotalCents: 2250,
      fulfillment: "pickup",
      urgency: "standard",
      promoDiscountCents: 225,
      promoCode: "DIMENSION11",
    });
    expect(rowSum(rows)).toBe(2025);
    expect(rows.some(r => r.label === "Código DIMENSION11")).toBe(true);
    expect(rows.some(r => r.label === "Piezas")).toBe(true);
    expect(rows.every(r => r.label !== "Envío")).toBe(true);
    expect(rows.every(r => r.label !== "Otros ajustes")).toBe(true);
  });

  it("order #273-shape: urgent + min adj, pickup, all from DB columns", () => {
    // 968 pieces + 32 min_adj + 600 urgent = 1600 total
    const rows = computePaymentRows({
      totalPaidCents: 1600,
      piecesTotalCents: 968,
      fulfillment: "pickup",
      urgency: "urgent",
      minAdjCents: 32,
      expressCents: 600,
    });
    expect(rowSum(rows)).toBe(1600);
    expect(rows.some(r => r.label === "Urgente")).toBe(true);
    expect(rows.some(r => r.label === "Ajuste mínimo")).toBe(true);
    expect(rows.every(r => r.label !== "Otros ajustes")).toBe(true);
  });

  it("v3 order: standard, shipping in notes, no DB columns", () => {
    // pieces 1210 + shipping 590 (from notes) = 1800 total
    const rows = computePaymentRows({
      totalPaidCents: 1800,
      piecesTotalCents: 1210,
      fulfillment: "shipping",
      notes: "Instant checkout v3. Qty 1, urgency standard, fulfillment shipping. Precio calculado: EUR 12.10. Shipping: EUR 5.90.",
    });
    expect(rowSum(rows)).toBe(1800);
    expect(rows.some(r => r.label === "Envío" && r.cents === 590)).toBe(true);
    expect(rows.every(r => r.label !== "Otros ajustes")).toBe(true);
  });

  it("v3 order: urgency parsed from notes when DB column is null", () => {
    const rows = computePaymentRows({
      totalPaidCents: 1800,
      piecesTotalCents: 1210,
      fulfillment: "shipping",
      urgency: null,
      notes: "Instant checkout v3. Qty 1, urgency express, fulfillment shipping. Precio calculado: EUR 12.10. Shipping: EUR 5.90.",
    });
    expect(rowSum(rows)).toBe(1800);
    // urgency parsed from notes but express_cents is null — no Express row, just shipping
    expect(rows.every(r => r.label !== "Express")).toBe(true);
  });

  it("v4 shipping order: shipping computed as remainder when not in notes", () => {
    // 990 pieces + 590 shipping = 1580 total; no Shipping: line in v4 notes
    const rows = computePaymentRows({
      totalPaidCents: 1580,
      piecesTotalCents: 990,
      fulfillment: "shipping",
      urgency: "standard",
      notes: "Instant checkout v4. Qty 1, urgency standard, fulfillment shipping. Precio calculado: EUR 9.90.",
    });
    expect(rowSum(rows)).toBe(1580);
    expect(rows.some(r => r.label === "Envío" && r.cents === 590)).toBe(true);
    expect(rows.every(r => r.label !== "Otros ajustes")).toBe(true);
  });

  it("promo parsed from v4 notes when DB columns absent", () => {
    // 1210 pieces − 121 promo = 1089 total
    const rows = computePaymentRows({
      totalPaidCents: 1089,
      piecesTotalCents: 1210,
      fulfillment: "pickup",
      notes: "Instant checkout v4. Qty 1, urgency standard, fulfillment pickup. Promo: D3D10 −10% = −1.21 EUR. Precio calculado: EUR 10.89.",
    });
    expect(rowSum(rows)).toBe(1089);
    expect(rows.some(r => r.label === "Código D3D10" && r.cents === -121)).toBe(true);
    expect(rows.every(r => r.label !== "Otros ajustes")).toBe(true);
  });

  it("unexplained gap → Otros ajustes (non-shipping pickup)", () => {
    const rows = computePaymentRows({
      totalPaidCents: 1600,
      piecesTotalCents: 900,
      fulfillment: "pickup",
    });
    expect(rowSum(rows)).toBe(1600);
    expect(rows.some(r => r.label === "Otros ajustes" && r.cents === 700)).toBe(true);
  });

  it("exact match — no remainder row added", () => {
    const rows = computePaymentRows({
      totalPaidCents: 990,
      piecesTotalCents: 990,
      fulfillment: "pickup",
      urgency: "standard",
    });
    expect(rowSum(rows)).toBe(990);
    expect(rows.length).toBe(1);
    expect(rows[0].label).toBe("Piezas");
  });

  it("express pickup: Express label used (not Urgente)", () => {
    const rows = computePaymentRows({
      totalPaidCents: 1548,
      piecesTotalCents: 990,
      fulfillment: "pickup",
      urgency: "express",
      expressCents: 558,
    });
    expect(rowSum(rows)).toBe(1548);
    expect(rows.some(r => r.label === "Express")).toBe(true);
    expect(rows.every(r => r.label !== "Urgente")).toBe(true);
  });
});
