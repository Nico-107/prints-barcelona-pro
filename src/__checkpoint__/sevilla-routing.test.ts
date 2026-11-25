import { describe, it, expect } from "vitest";
import { pickupLocationFor } from "@/config/pageGroups";
import { recipientsFor, SEVILLA_RECIPIENTS } from "../../supabase/functions/_shared/recipients";

// F4 — Sevilla routing. Sevilla pickup orders go to Daniel's inbox in addition to Nico's;
// admin surfaces a "Sevilla (Daniel)" badge and the confirmation email carries the Sevilla
// pickup address.

describe("F4 Sevilla routing", () => {
  it("/impresion-3d-sevilla classifies as Sevilla pickup", () => {
    expect(pickupLocationFor("/impresion-3d-sevilla")).toBe("sevilla");
    expect(pickupLocationFor("/3d-printing-sevilla")).toBe("sevilla");
  });

  it("Sevilla recipients include Daniel's inbox", () => {
    const recipients = recipientsFor("sevilla");
    expect(recipients).toContain(SEVILLA_RECIPIENTS[0]);
  });

  it("non-Sevilla orders do not include Daniel's inbox", () => {
    const recipients = recipientsFor("bcn");
    expect(recipients).not.toContain(SEVILLA_RECIPIENTS[0]);
  });

  it("both Nico inboxes always included", () => {
    const recipients = recipientsFor(null);
    expect(recipients).toContain("011107miko@gmail.com");
    expect(recipients).toContain("dimension3dprintsbcn@gmail.com");
  });
});
