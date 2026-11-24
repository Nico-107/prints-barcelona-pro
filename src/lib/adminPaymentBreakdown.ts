export type PaymentRow = { label: string; cents: number };

export function parseNotesUrgency(notes: string): string | null {
  const m = notes.match(/urgency\s+(\w+)/);
  return m ? m[1] : null;
}

// v3 notes contain legacy "Shipping: EUR x.xx" strings explicitly.
export function parseNotesShippingCents(notes: string): number | null {
  const m = notes.match(/Shipping:\s*EUR\s*([\d.]+)/);
  return m ? Math.round(parseFloat(m[1]) * 100) : null;
}

// v4 notes contain "Promo: D3D10 −10% = −1.21 EUR" (Unicode minus −).
export function parseNotesPromo(notes: string): { code: string; pct: number; discountCents: number } | null {
  const m = notes.match(/Promo:\s*(\S+)\s*[−-](\d+)%\s*=\s*[−-]([\d.]+)\s*EUR/);
  if (!m) return null;
  return { code: m[1], pct: parseInt(m[2]), discountCents: Math.round(parseFloat(m[3]) * 100) };
}

export interface PaymentBreakdownInput {
  totalPaidCents: number;
  piecesTotalCents: number;
  fulfillment: string;
  urgency?: string | null;
  notes?: string | null;
  expressCents?: number | null;
  minAdjCents?: number | null;
  promoDiscountCents?: number | null;
  promoCode?: string | null;
}

/**
 * Returns rows that sum exactly to totalPaidCents.
 * Works for both v3 orders (shipping in notes, no DB columns) and v4 orders (DB columns present).
 * Any unexplained remainder becomes "Envío" (if fulfillment=shipping) or "Otros ajustes".
 */
export function computePaymentRows(input: PaymentBreakdownInput): PaymentRow[] {
  const {
    totalPaidCents,
    piecesTotalCents,
    fulfillment,
    urgency,
    notes,
    expressCents,
    minAdjCents,
    promoDiscountCents,
    promoCode,
  } = input;
  const notesStr = notes ?? "";

  const notesShipping = parseNotesShippingCents(notesStr);
  const notesPromo = parseNotesPromo(notesStr);
  const resolvedUrgency = urgency ?? parseNotesUrgency(notesStr);
  const resolvedPromoDiscount = promoDiscountCents ?? notesPromo?.discountCents ?? 0;
  const resolvedPromoCode = promoCode ?? notesPromo?.code ?? null;

  const rows: PaymentRow[] = [];

  if (piecesTotalCents) rows.push({ label: "Piezas", cents: piecesTotalCents });

  // v3 notes have shipping explicitly; for v4 it will be captured as remainder below.
  if (notesShipping != null) rows.push({ label: "Envío", cents: notesShipping });

  if ((minAdjCents ?? 0) > 0) rows.push({ label: "Ajuste mínimo", cents: minAdjCents! });

  if ((expressCents ?? 0) > 0) {
    rows.push({ label: resolvedUrgency === "urgent" ? "Urgente" : "Express", cents: expressCents! });
  }

  if (resolvedPromoDiscount > 0) {
    const label = resolvedPromoCode ? `Código ${resolvedPromoCode}` : "Descuento";
    rows.push({ label, cents: -resolvedPromoDiscount });
  }

  const rowsSum = rows.reduce((s, r) => s + r.cents, 0);
  const remainder = totalPaidCents - rowsSum;
  if (Math.abs(remainder) > 0) {
    if (notesShipping == null && fulfillment === "shipping" && remainder > 0) {
      rows.push({ label: "Envío", cents: remainder });
    } else {
      rows.push({ label: "Otros ajustes", cents: remainder });
    }
  }

  return rows;
}
