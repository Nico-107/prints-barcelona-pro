import { renderOrderConfirmed } from "../customerEmailTemplates.ts";
import { toLangKey } from "../customerEmailTemplates.ts";

export function render(fixture: {
  pieces: Array<{ name: string; quantity: number; material: string; color?: string | null; priceCents?: number | null }>;
  order: {
    orderNumber: number;
    totalPaidCents: number;
    firstName: string;
    fulfillment: "pickup" | "shipping";
    trackingToken: string;
    shipByIso: string;
  };
  language: string;
}): string {
  const { html } = renderOrderConfirmed({
    ctx: {
      orderNumber: fixture.order.orderNumber,
      trackingToken: fixture.order.trackingToken,
      firstName: fixture.order.firstName,
      customerLanguage: toLangKey(fixture.language),
      siteOrigin: "https://www.dimension3dprints.com",
      whatsappNumber: "+34672051147",
    },
    pieces: fixture.pieces,
    totalPaidCents: fixture.order.totalPaidCents,
    fulfillment: fixture.order.fulfillment,
    shipByIso: fixture.order.shipByIso,
    pickupReadyIso: null,
  });
  return html;
}
