import { describe, it, expect } from "vitest";
import { OWNER_RECIPIENTS, SEVILLA_RECIPIENTS, recipientsFor, SENDER } from "../../supabase/functions/_shared/recipients";

// O2 / D-8 — owner order email. Both inboxes always; Sevilla pickup adds Daniel. Sender
// uses the verified Resend domain.

describe("O2 recipients", () => {
  it("OWNER_RECIPIENTS covers both Nico inboxes", () => {
    expect(OWNER_RECIPIENTS).toContain("011107miko@gmail.com");
    expect(OWNER_RECIPIENTS).toContain("dimension3dprintsbcn@gmail.com");
  });
  it("SEVILLA_RECIPIENTS contains Daniel", () => {
    expect(SEVILLA_RECIPIENTS).toContain("3d.kayda@gmail.com");
  });
  it("recipientsFor('sevilla') union is Nico + Daniel", () => {
    const r = recipientsFor("sevilla");
    expect(new Set(r)).toEqual(new Set(["011107miko@gmail.com", "dimension3dprintsbcn@gmail.com", "3d.kayda@gmail.com"]));
  });
  it("sender uses verified Resend domain", () => {
    expect(SENDER).toContain("noreply@dimension3dprints.com");
  });
});

// Subject format: 🧾 Pedido #287 · 14,81 € · 🇪🇸 Envío · Estándar (sale vie 27 nov) · {nombre}
export function orderSubject(args: { orderNumber: number; totalPaidEur: number; countryFlag: string; mode: "Envío" | "Recogida"; urgencyLabel: string; shipByLabel: string; customerName?: string | null; urgent?: boolean }): string {
  const name = args.customerName ? ` · ${args.customerName}` : "";
  const prefix = args.urgent ? "⚡ URGENTE · " : "🧾 ";
  const parts = [
    `${prefix}Pedido #${args.orderNumber}`,
    `${args.totalPaidEur.toFixed(2).replace(".", ",")} €`,
    `${args.countryFlag} ${args.mode}`,
    `${args.urgencyLabel} (sale ${args.shipByLabel})`,
  ];
  return parts.join(" · ") + name;
}

describe("O2 subject format", () => {
  it("renders the full subject with flag + urgency + ship date", () => {
    const s = orderSubject({ orderNumber: 287, totalPaidEur: 14.81, countryFlag: "🇪🇸", mode: "Envío", urgencyLabel: "Estándar", shipByLabel: "vie 27 nov", customerName: "Ana García" });
    expect(s).toContain("🧾");
    expect(s).toContain("Pedido #287");
    expect(s).toContain("14,81 €");
    expect(s).toContain("🇪🇸 Envío");
    expect(s).toContain("Ana García");
  });
  it("urgent orders get the ⚡ prefix", () => {
    const s = orderSubject({ orderNumber: 300, totalPaidEur: 50, countryFlag: "🇪🇸", mode: "Recogida", urgencyLabel: "Al día siguiente", shipByLabel: "mañana", urgent: true });
    expect(s.startsWith("⚡ URGENTE")).toBe(true);
  });
});
