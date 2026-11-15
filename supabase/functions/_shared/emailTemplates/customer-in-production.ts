import { renderInProduction, toLangKey } from "../customerEmailTemplates.ts";

export function render(fixture: {
  order: { orderNumber: number; firstName: string; trackingToken: string; etaIso: string };
  language: string;
}): string {
  const { html } = renderInProduction({
    ctx: {
      orderNumber: fixture.order.orderNumber,
      trackingToken: fixture.order.trackingToken,
      firstName: fixture.order.firstName,
      customerLanguage: toLangKey(fixture.language),
      siteOrigin: "https://www.dimension3dprints.com",
      whatsappNumber: "+34672051147",
    },
    etaIso: fixture.order.etaIso,
  });
  return html;
}
