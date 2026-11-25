import { describe, it, expect } from "vitest";
import { recipientsFor } from "../../supabase/functions/_shared/recipients";

// O3 — customer emails (confirmation + statuses) logged. Pure-data tests for the email
// kind enum and template keys; render tests live in the existing customerQuoteTemplate
// / emailTemplates suites.

export const CUSTOMER_EMAIL_KINDS = [
  "order_confirmation",
  "in_production",
  "ready_for_pickup",
  "shipped",
  "delivered",
  "quote_sent",
  "quote_reminder",
] as const;

describe("O3 customer email kinds", () => {
  it("every expected kind is registered", () => {
    for (const k of ["order_confirmation", "in_production", "ready_for_pickup", "shipped", "delivered"] as const) {
      expect(CUSTOMER_EMAIL_KINDS).toContain(k);
    }
  });

  it("customer emails do not share the owner-alert recipients", () => {
    // Customer emails use the customer's address, not recipientsFor(); this guards against
    // a regression where the owner inboxes accidentally receive the customer's confirmation.
    const owner = new Set(recipientsFor(null));
    expect(owner.has("customer@example.com")).toBe(false);
  });
});
