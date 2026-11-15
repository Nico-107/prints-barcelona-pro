import { renderReadyForPickup, toLangKey } from "../customerEmailTemplates.ts";

export function render(fixture: { order: { orderNumber: number; firstName: string; trackingToken: string }; language: string }): string {
  const { html } = renderReadyForPickup({
    ctx: {
      orderNumber: fixture.order.orderNumber,
      trackingToken: fixture.order.trackingToken,
      firstName: fixture.order.firstName,
      customerLanguage: toLangKey(fixture.language),
      siteOrigin: "https://www.dimension3dprints.com",
      whatsappNumber: "+34672051147",
    },
    pickupAddress: "Carrer d'Entença 95, 08015 Barcelona",
  });
  return html;
}
