import { describe, it, expect } from "vitest";
import { toCsv, suggestParcel, GENERIC_PACKLINK_HEADERS } from "@/config/packlinkCsv";

describe("O8 Packlink CSV + parcel suggestion", () => {
  it("CSV header matches the documented generic headers", () => {
    const csv = toCsv([]);
    expect(csv.split("\n")[0]).toBe(GENERIC_PACKLINK_HEADERS.join(","));
  });

  it("postcode keeps leading zeros via quoting", () => {
    const csv = toCsv([
      {
        reference: "287",
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        phone: "+34000000000",
        country: "ES",
        postcode: "08001",
        city: "Barcelona",
        street: "Plaza",
        number: "1",
        lengthCm: 20,
        widthCm: 15,
        heightCm: 10,
        weightKg: 0.5,
      },
    ]);
    expect(csv).toContain(`"08001"`);
  });

  it("weight uses dot as decimal separator", () => {
    const csv = toCsv([
      {
        reference: "1",
        firstName: "A",
        lastName: "B",
        email: "",
        phone: "",
        country: "ES",
        postcode: "08001",
        city: "B",
        street: "s",
        number: "1",
        lengthCm: 10,
        widthCm: 10,
        heightCm: 10,
        weightKg: 1.5,
      },
    ]);
    expect(csv).toContain(",1.5,");
    expect(csv).not.toContain(",1,5,");
  });

  it("parcel suggestion adds 20mm padding, rounds up to cm, weight +15% +150g rounded up 0.1kg", () => {
    const p = suggestParcel([{ grams: 120, qty: 2, bboxMm: [100, 50, 30] }]);
    expect(p.lengthCm).toBe(12); // 100 + 20 = 120mm → 12cm
    expect(p.widthCm).toBe(7);
    expect(p.heightCm).toBe(5);
    // 240g × 1.15 + 150 = 426g → 0.5 kg (rounded up to 0.1 kg)
    expect(p.weightKg).toBe(0.5);
  });
});
