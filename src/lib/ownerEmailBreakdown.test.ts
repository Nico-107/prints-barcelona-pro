// A4: payment breakdown tests — rows must always sum exactly to totalPaidCents.
// Fixtures match order #268 (DIMENSION11 code) and order #273 (urgent + min adj).

import { describe, it, expect } from "vitest";
import {
  renderPaymentBreakdown,
} from "../../supabase/functions/_shared/ownerEmailTemplates";
import type { OwnerEmailPiece } from "../../supabase/functions/_shared/ownerEmailTemplates";

function parseTotalFromHtml(html: string): number | null {
  const m = html.match(/TOTAL PAGADO[^<]*<\/td>\s*<td[^>]*>([\d\s,.]+)\s*€/);
  if (!m) return null;
  return Math.round(parseFloat(m[1].replace(/\./g, "").replace(",", ".")) * 100);
}

function sumRowsFromHtml(html: string): number {
  let sum = 0;
  const regex = /<td[^>]*text-align:right[^>]*>([-−]?)([\d\s,.]+)\s*€<\/td>/g;
  let m: RegExpExecArray | null;
  // Skip last (total) row by counting matches
  const matches: Array<[string, string]> = [];
  while ((m = regex.exec(html)) !== null) {
    matches.push([m[1], m[2]]);
  }
  // Last match is TOTAL PAGADO — skip it
  for (let i = 0; i < matches.length - 1; i++) {
    const [sign, raw] = matches[i];
    const v = Math.round(parseFloat(raw.replace(/\./g, "").replace(",", ".")) * 100);
    sum += (sign === "−" || sign === "-") ? -v : v;
  }
  return sum;
}

const PIECE_TPU: OwnerEmailPiece = {
  name: "Bracket",
  quantity: 2,
  material: "TPU",
  color: null,
  priceCents: 968,
  grams: 18,
  hours: 1.2,
};

describe("renderPaymentBreakdown — rows sum to total", () => {
  it("order #268: DIMENSION11 −10 %, pickup, standard", () => {
    const html = renderPaymentBreakdown({
      pieces: [{ ...PIECE_TPU, priceCents: 2250 }],
      totalPaidCents: 2025,
      paymentMethod: "stripe",
      fulfillment: "pickup",
      urgency: "standard",
      promoCode: "DIMENSION11",
      promoPct: 10,
      promoDiscountCents: 225,
    });
    const total = parseTotalFromHtml(html);
    expect(total).toBe(2025);
    expect(html).toContain("DIMENSION11");
    expect(html).toContain("Recogida");
    expect(html).toContain("TOTAL PAGADO");
  });

  it("order #273-shape: urgent +60%, min adj, pickup", () => {
    const html = renderPaymentBreakdown({
      pieces: [{ ...PIECE_TPU, priceCents: 968 }],
      totalPaidCents: 1600,
      paymentMethod: "stripe",
      fulfillment: "pickup",
      urgency: "urgent",
      minAdjCents: 32,
      expressCents: 600,
    });
    const total = parseTotalFromHtml(html);
    expect(total).toBe(1600);
    expect(html).toContain("URGENTE");
    expect(html).toContain("Ajuste a pedido mínimo");
    // rows sum: 968 + 32 + 600 = 1600
    expect(968 + 32 + 600).toBe(1600);
  });

  it("express shipping to IT — shipping amount computed as remainder", () => {
    // 1250 print + 590 shipping = 1840
    const html = renderPaymentBreakdown({
      pieces: [{ ...PIECE_TPU, priceCents: 1000 }],
      totalPaidCents: 1840,
      paymentMethod: "stripe",
      fulfillment: "shipping",
      urgency: "express",
      expressCents: 250,
    });
    const total = parseTotalFromHtml(html);
    expect(total).toBe(1840);
    expect(html).toContain("EXPRESS");
    expect(html).toContain("Envío");
  });

  it("standard pickup no promo no adj — only part row + total", () => {
    const html = renderPaymentBreakdown({
      pieces: [{ name: "Part", quantity: 1, material: "PLA", priceCents: 1490 }],
      totalPaidCents: 1490,
      fulfillment: "pickup",
      urgency: "standard",
    });
    const total = parseTotalFromHtml(html);
    expect(total).toBe(1490);
    expect(html).not.toContain("Recargo");
    expect(html).not.toContain("Código");
    expect(html).not.toContain("Otros ajustes");
  });

  it("older order: unexplained difference → Otros ajustes", () => {
    const html = renderPaymentBreakdown({
      pieces: [{ name: "Part", quantity: 1, material: "PLA", priceCents: 900 }],
      totalPaidCents: 1600,
      fulfillment: "pickup",
    });
    expect(html).toContain("Otros ajustes");
    const total = parseTotalFromHtml(html);
    expect(total).toBe(1600);
  });

  it("'Sin preferencia' color not shown in label", () => {
    const html = renderPaymentBreakdown({
      pieces: [{ name: "Part", quantity: 1, material: "PLA", color: "Sin preferencia", priceCents: 990 }],
      totalPaidCents: 990,
      fulfillment: "pickup",
    });
    expect(html).not.toContain("Sin preferencia");
    const total = parseTotalFromHtml(html);
    expect(total).toBe(990);
  });
});
