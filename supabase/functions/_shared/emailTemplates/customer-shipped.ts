import { renderShipped, toLangKey } from "../customerEmailTemplates.ts";

export function render(fixture: {
  order: { orderNumber: number; firstName: string; trackingToken: string; carrier: string | null; trackingNumber: string | null; trackingUrl: string | null };
  language: string;
}): string {
  const { html } = renderShipped({
    ctx: {
      orderNumber: fixture.order.orderNumber,
      trackingToken: fixture.order.trackingToken,
      firstName: fixture.order.firstName,
      customerLanguage: toLangKey(fixture.language),
      siteOrigin: "https://www.dimension3dprints.com",
      whatsappNumber: "+34672051147",
    },
    carrier: fixture.order.carrier ?? "SEUR",
    trackingNumber: fixture.order.trackingNumber ?? "RX123456789IT",
    trackingUrl: fixture.order.trackingUrl ?? "https://www.seur.com/livetracking?tracking=RX123456789IT",
    etaWindow: "2–4 días",
  });
  return html;
}
