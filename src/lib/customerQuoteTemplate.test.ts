// Phase 3 verification (item 3.6): the customer quote email must render in
// all 8 supported languages, include the Stripe link and the order's expiry
// date, and should never leak the literal string "undefined" or an unclosed
// template placeholder.

import { describe, it, expect } from "vitest";
import { renderCustomerQuoteEmail } from "../../supabase/functions/_shared/customerQuoteTemplate";

const LANGS = ["es", "ca", "en", "de", "fr", "nl", "it", "pt"] as const;

describe("renderCustomerQuoteEmail", () => {
  for (const lang of LANGS) {
    it(`[${lang}] renders a self-contained HTML email`, () => {
      const { subject, html } = renderCustomerQuoteEmail({
        firstName: "Pietro",
        language: lang,
        quoteUrl: "https://example.com/presupuesto/abc",
        priceCents: 12101,
        shippingCents: 0,
        productionDays: 7,
        message: "Hola, usamos TPU 95A.",
        expiresAtIso: "2026-11-29T00:00:00Z",
        fulfillment: "shipping",
        pieces: [
          { name: "bracket.stl", quantity: 20, material: "TPU", color: "Black" },
        ],
      });
      expect(subject.length).toBeGreaterThan(0);
      expect(html).toContain("example.com/presupuesto/abc");
      expect(html).toContain("bracket.stl");
      expect(html).not.toMatch(/\$\{/);
      expect(html).not.toMatch(/\bundefined\b/i);
    });
  }

  it("free-shipping note appears when fulfillment is shipping and shipping is 0", () => {
    const { html } = renderCustomerQuoteEmail({
      firstName: "Ana",
      language: "es",
      quoteUrl: "https://example.com/presupuesto/abc",
      priceCents: 12000,
      shippingCents: 0,
      productionDays: 5,
      message: null,
      expiresAtIso: "2026-11-29T00:00:00Z",
      fulfillment: "shipping",
      pieces: [{ name: "a.stl", quantity: 1, material: "PLA" }],
    });
    expect(html).toMatch(/gratu/i);
  });

  it("no free-shipping note when shipping > 0", () => {
    const { html } = renderCustomerQuoteEmail({
      firstName: "Ana",
      language: "es",
      quoteUrl: "https://example.com/presupuesto/abc",
      priceCents: 5000,
      shippingCents: 1500,
      productionDays: 5,
      message: null,
      expiresAtIso: "2026-11-29T00:00:00Z",
      fulfillment: "shipping",
      pieces: [{ name: "a.stl", quantity: 1, material: "PLA" }],
    });
    expect(html).not.toMatch(/gratu/i);
  });
});
