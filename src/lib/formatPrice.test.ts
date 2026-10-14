import { describe, it, expect } from "vitest";
import { formatEUR } from "./formatPrice";

describe("formatEUR", () => {
  it('es gives "10,00 €"', () => {
    expect(formatEUR(10, "es").replace(/ /g, " ")).toBe("10,00 €");
  });
  it('en gives "€10.00"', () => {
    expect(formatEUR(10, "en").replace(/ /g, " ")).toBe("€10.00");
  });
});
