// Preview-renderer adapter for the owner purchase email.
// Fixture type is defined in scripts/render-email-previews.ts.

import { renderOwnerPurchaseEmail } from "../ownerEmailTemplates.ts";

export function render(fixture: {
  pieces: Array<{ name: string; quantity: number; material: string; color?: string | null; priceCents?: number | null }>;
  order: {
    orderNumber: number;
    totalPaidCents: number;
    firstName: string;
    city: string;
    country: string;
    fulfillment: "pickup" | "shipping";
    trackingToken: string;
    shipByIso: string;
  };
  language: string;
}): string {
  // Owner emails stay in Spanish regardless of the customer language.
  const { html } = renderOwnerPurchaseEmail({
    orderNumber: fixture.order.orderNumber,
    totalPaidCents: fixture.order.totalPaidCents,
    paymentMethod: "stripe",
    customerName: `${fixture.order.firstName} Rossi`,
    customerEmail: `${fixture.order.firstName.toLowerCase()}@example.com`,
    customerPhone: "+39 345 1234567",
    fulfillment: fixture.order.fulfillment,
    destinationCountry: fixture.order.country,
    destinationCity: fixture.order.city,
    shippingAddress: fixture.order.fulfillment === "shipping" ? {
      line1: "Via Portuense 100",
      postal_code: "00054",
      city: fixture.order.city,
      country: fixture.order.country,
    } : null,
    shipByIso: fixture.order.shipByIso,
    pieces: fixture.pieces.map((p, i) => ({
      ...p,
      infill: 15, wallLoops: 2, quality: "standard", supports: i === 0, grams: 12 + i * 4, hours: 0.5 + i * 0.2,
    })),
    uploadedNotPurchased: [
      { name: "experimento_1.stl", signedUrl: null },
    ],
    adminOrderUrl: `https://www.dimension3dprints.com/admin?order=${fixture.order.trackingToken}`,
    zipDownloadUrl: `https://project.supabase.co/functions/v1/order-files-zip?order_number=${fixture.order.orderNumber}`,
    sourcePath: "/it/stampa-3d-online",
    pageLanguage: fixture.language,
  });
  return html;
}
