// Preview-renderer adapter for the owner quote-review email.

import { renderOwnerQuoteEmail } from "../ownerEmailTemplates.ts";

export function render(fixture: {
  pieces: Array<{ name: string; quantity: number; material: string; color?: string | null }>;
  order: { orderNumber: number; firstName: string; country: string; totalPaidCents: number };
  language: string;
}): string {
  const total = fixture.order.totalPaidCents * 6; // simulate a bigger quote total
  const { html } = renderOwnerQuoteEmail({
    firstNameOrLocal: fixture.order.firstName,
    customerMessage: "Hi, I'd like 20 of these in TPU 95A. Can you make the wall a bit thicker? Thanks!",
    customerMessageTranslation: "Hola, me gustaría 20 de estas en TPU 95A. ¿Puedes hacer la pared un poco más gruesa? ¡Gracias!",
    customerEmail: `${fixture.order.firstName.toLowerCase()}@example.com`,
    customerPhone: "+39 345 1234567",
    totalCents: total,
    countryCode: fixture.order.country,
    materialSummary: "TPU",
    totalUnits: 20,
    pieces: fixture.pieces.map((p) => ({
      ...p,
      material: "TPU",
      infill: 20, wallLoops: 3, quality: "standard", supports: false,
    })),
    adminOrderUrl: "https://www.dimension3dprints.com/admin?quote=abcdef",
    zipDownloadUrl: "https://project.supabase.co/functions/v1/order-files-zip?quote=abcdef",
    sourcePath: "/it/stampa-3d-online",
    pageLanguage: fixture.language,
  });
  return html;
}
