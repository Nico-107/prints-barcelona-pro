import { renderDelivered, toLangKey } from "../customerEmailTemplates.ts";

export function render(fixture: { order: { orderNumber: number; firstName: string; trackingToken: string }; language: string }): string {
  const { html } = renderDelivered({
    ctx: {
      orderNumber: fixture.order.orderNumber,
      trackingToken: fixture.order.trackingToken,
      firstName: fixture.order.firstName,
      customerLanguage: toLangKey(fixture.language),
      siteOrigin: "https://www.dimension3dprints.com",
      whatsappNumber: "+34672051147",
    },
  });
  return html;
}
