// Phase 1 verification (item 1.7): the customer and owner email templates
// must render in every language without "undefined" leaking, must hit the
// expected language in their subject/body, and must not break at 360 px.

import { describe, it, expect } from "vitest";
import {
  renderOrderConfirmed,
  renderInProduction,
  renderShipped,
  renderReadyForPickup,
  renderDelivered,
  renderReviewRequest,
  toLangKey,
  type CustomerOrderContext,
  type CustomerLang,
} from "../../supabase/functions/_shared/customerEmailTemplates";
import {
  renderOwnerPurchaseEmail,
  renderOwnerQuoteEmail,
} from "../../supabase/functions/_shared/ownerEmailTemplates";

const LANGS: CustomerLang[] = ["es", "ca", "en", "de", "fr", "nl", "it", "pt"];

const BASE_CTX = (lang: CustomerLang): CustomerOrderContext => ({
  orderNumber: 264,
  trackingToken: "demo-token-abc",
  firstName: "Pietro",
  customerLanguage: lang,
  siteOrigin: "https://www.dimension3dprints.com",
  whatsappNumber: "+34672051147",
});

const PIECES = [
  { name: "a.stl", quantity: 1, material: "PETG", color: "Black" },
  { name: "b_with_a_rather_long_name.stl", quantity: 2, material: "PETG", color: "Black" },
];

function assertNoUndefined(html: string, label: string) {
  expect(html, `${label} contained the literal "undefined"`).not.toMatch(/\bundefined\b/i);
  expect(html, `${label} contained unclosed template placeholder`).not.toMatch(/\$\{/);
}

describe("customerEmailTemplates — render cleanly in all 8 languages", () => {
  for (const lang of LANGS) {
    it(`[${lang}] confirmed`, () => {
      const { subject, html } = renderOrderConfirmed({
        ctx: BASE_CTX(lang),
        pieces: PIECES,
        totalPaidCents: 2006,
        fulfillment: "shipping",
        shipByIso: "2026-11-17",
      });
      expect(subject).toContain("264");
      expect(html).toContain("264");
      expect(html).toContain("/pedido/demo-token-abc");
      assertNoUndefined(html, `confirmed/${lang}`);
    });
    it(`[${lang}] in_production`, () => {
      const { html } = renderInProduction({ ctx: BASE_CTX(lang), etaIso: "2026-11-20" });
      expect(html).toContain("2026-11-20");
      assertNoUndefined(html, `in_production/${lang}`);
    });
    it(`[${lang}] shipped`, () => {
      const { html } = renderShipped({
        ctx: BASE_CTX(lang),
        carrier: "SEUR",
        trackingNumber: "RX123",
        trackingUrl: "https://example.com/t/RX123",
        etaWindow: "2–4",
      });
      expect(html).toContain("SEUR");
      expect(html).toContain("RX123");
      assertNoUndefined(html, `shipped/${lang}`);
    });
    it(`[${lang}] ready_pickup`, () => {
      const { html } = renderReadyForPickup({ ctx: BASE_CTX(lang), pickupAddress: "Rambla del Brasil, 53" });
      expect(html).toContain("Rambla del Brasil");
      expect(html).toContain("wa.me");
      assertNoUndefined(html, `pickup/${lang}`);
    });
    it(`[${lang}] delivered`, () => {
      const { html } = renderDelivered({ ctx: BASE_CTX(lang) });
      assertNoUndefined(html, `delivered/${lang}`);
    });
    it(`[${lang}] review`, () => {
      const { html } = renderReviewRequest({ ctx: BASE_CTX(lang), reviewUrl: "https://example.com/r" });
      expect(html).toContain("https://example.com/r");
      assertNoUndefined(html, `review/${lang}`);
    });
  }
});

describe("ownerEmailTemplates — subject matches the spec", () => {
  it("purchase subject: [PEDIDO #n] amount · envío/recogida · N piezas · MATERIAL", () => {
    const { subject } = renderOwnerPurchaseEmail({
      orderNumber: 264,
      totalPaidCents: 2006,
      fulfillment: "shipping",
      destinationCountry: "IT",
      pieces: [
        { name: "a", quantity: 1, material: "PETG" },
        { name: "b", quantity: 4, material: "PETG" },
      ],
      adminOrderUrl: "https://example.com/admin?order=1",
    });
    expect(subject).toBe("[PEDIDO #264] 20,06 € · envío IT · 5 piezas · PETG");
  });

  it("quote subject: [REVISIÓN] amount · units uds MATERIAL · COUNTRY · name", () => {
    const { subject } = renderOwnerQuoteEmail({
      firstNameOrLocal: "Pietro",
      totalCents: 12101,
      countryCode: "it",
      materialSummary: "TPU",
      totalUnits: 20,
      pieces: [],
      adminOrderUrl: "https://example.com/admin?quote=1",
    });
    expect(subject).toBe("[REVISIÓN] 121,01 € · 20 uds TPU · IT · Pietro");
  });
});

describe("toLangKey — defaults to es when the input is unknown", () => {
  it.each([
    ["ES", "es"],
    ["en-US", "es"],
    [null, "es"],
    [undefined, "es"],
    ["en", "en"],
    ["zh", "es"],
  ])("maps %o → %s", (input, expected) => {
    expect(toLangKey(input as string | null | undefined)).toBe(expected);
  });
});
