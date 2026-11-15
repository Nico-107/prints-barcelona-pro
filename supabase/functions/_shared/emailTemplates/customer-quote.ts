import { renderCustomerQuoteEmail } from "../customerQuoteTemplate.ts";

export function render(fixture: {
  order: { orderNumber: number; firstName: string; trackingToken: string };
  language: string;
}): string {
  const { html } = renderCustomerQuoteEmail({
    firstName: fixture.order.firstName,
    language: fixture.language,
    quoteUrl: `https://www.dimension3dprints.com/presupuesto/${fixture.order.trackingToken}`,
    priceCents: 12101,
    shippingCents: 0,
    productionDays: 7,
    message: "Pared 3 mm · relleno 25 % · TPU 95A.",
    expiresAtIso: new Date(Date.now() + 14 * 24 * 3600_000).toISOString(),
    fulfillment: "shipping",
    pieces: [
      { name: "bracket_left_v2.stl", quantity: 20, material: "TPU", color: "Black" },
    ],
  });
  return html;
}
