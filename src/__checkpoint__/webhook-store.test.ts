import { describe, it, expect } from "vitest";

// O1 — Webhook stores everything. Pure helper: given a `checkout.session.completed`
// payload, produce the row we insert into `orders`.

interface StripeShippingDetails {
  name?: string;
  address?: {
    line1?: string;
    line2?: string;
    postal_code?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface StripeSession {
  id: string;
  amount_total: number;
  currency: string;
  customer_details?: { name?: string | null; email?: string | null; phone?: string | null };
  shipping_details?: StripeShippingDetails;
  collected_information?: { shipping_details?: StripeShippingDetails };
  payment_intent?: string;
  metadata?: Record<string, string | undefined>;
}

export function sessionToOrderRow(sess: StripeSession) {
  const sd = sess.shipping_details ?? sess.collected_information?.shipping_details;
  const md = sess.metadata ?? {};
  return {
    stripe_session_id: sess.id,
    stripe_payment_intent: sess.payment_intent ?? null,
    customer_name: sess.customer_details?.name ?? sd?.name ?? null,
    customer_email: sess.customer_details?.email ?? null,
    customer_phone: sess.customer_details?.phone ?? null,
    shipping_address: sd?.address
      ? {
          name: sd.name ?? null,
          line1: sd.address.line1 ?? null,
          line2: sd.address.line2 ?? null,
          postal_code: sd.address.postal_code ?? null,
          city: sd.address.city ?? null,
          state: sd.address.state ?? null,
          country: sd.address.country ?? null,
        }
      : null,
    total_paid_cents: sess.amount_total,
    currency: sess.currency,
    parts_subtotal_cents: md.parts_subtotal_cents ? Number(md.parts_subtotal_cents) : null,
    shipping_cents: md.shipping_cents ? Number(md.shipping_cents) : null,
    page_group: md.page_group ?? null,
    pickup_location: md.pickup_location ?? null,
    is_test: md.test === "1",
  };
}

describe("O1 webhook → order row", () => {
  it("maps the modern `collected_information.shipping_details` shape", () => {
    const row = sessionToOrderRow({
      id: "cs_test_1",
      amount_total: 1481,
      currency: "eur",
      customer_details: { name: "T", email: "t@e.com", phone: "+34000" },
      collected_information: {
        shipping_details: { name: "T", address: { line1: "Via 1", postal_code: "20121", city: "Milano", country: "IT" } },
      },
      metadata: { page_group: "non_local", test: "1" },
    });
    expect(row.customer_name).toBe("T");
    expect(row.shipping_address?.country).toBe("IT");
    expect(row.is_test).toBe(true);
    expect(row.total_paid_cents).toBe(1481);
    expect(row.page_group).toBe("non_local");
  });

  it("maps the legacy top-level `shipping_details` shape", () => {
    const row = sessionToOrderRow({
      id: "cs_test_2",
      amount_total: 1580,
      currency: "eur",
      customer_details: { name: "A", email: "a@e.com" },
      shipping_details: { name: "A", address: { line1: "C/ A", postal_code: "28001", city: "Madrid", country: "ES" } },
    });
    expect(row.shipping_address?.city).toBe("Madrid");
    expect(row.customer_phone).toBeNull();
  });

  it("missing shipping_details → shipping_address null (pickup orders)", () => {
    const row = sessionToOrderRow({
      id: "cs_pickup_1",
      amount_total: 990,
      currency: "eur",
      customer_details: { name: "P", email: "p@e.com" },
      metadata: { page_group: "local", pickup_location: "bcn" },
    });
    expect(row.shipping_address).toBeNull();
    expect(row.pickup_location).toBe("bcn");
  });
});
