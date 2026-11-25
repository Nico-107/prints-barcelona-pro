import { describe, it, expect } from "vitest";
import { classifyPath, isLocalPage, pickupLocationFor } from "@/config/pageGroups";

// H6 / F1: page-group classifier. Barcelona pickup on "local" pages, Sevilla on its two
// landing pages, no pickup anywhere else.

describe("page-groups: local vs non_local classification", () => {
  it("homepage ES → BCN pickup", () => {
    const r = classifyPath("/");
    expect(r.group).toBe("local");
    expect(r.pickupLocation).toBe("bcn");
  });

  it("homepage CA → BCN pickup", () => {
    expect(classifyPath("/ca").pickupLocation).toBe("bcn");
    expect(classifyPath("/ca/").pickupLocation).toBe("bcn");
  });

  it("homepage EN/DE/FR/IT/NL/PT → BCN pickup (local via homepage)", () => {
    for (const lang of ["en", "de", "fr", "it", "nl", "pt"]) {
      expect(classifyPath(`/${lang}`).pickupLocation).toBe("bcn");
    }
  });

  it("Sevilla ES page → Sevilla pickup", () => {
    const r = classifyPath("/impresion-3d-sevilla");
    expect(r.group).toBe("local");
    expect(r.pickupLocation).toBe("sevilla");
  });

  it("Sevilla EN page → Sevilla pickup", () => {
    const r = classifyPath("/3d-printing-sevilla");
    expect(r.pickupLocation).toBe("sevilla");
  });

  it("any URL whose slug contains 'barcelona' → BCN pickup", () => {
    expect(pickupLocationFor("/3d-printing-barcelona")).toBe("bcn");
    expect(pickupLocationFor("/impresion-3d-barcelona")).toBe("bcn");
    expect(pickupLocationFor("/impresion-3d-urgente-barcelona")).toBe("bcn");
    expect(pickupLocationFor("/it/stampa-3d-barcelona")).toBe("bcn");
  });

  it("/impresion-3d-cerca-de-mi, /sobre-nosotros, /about → BCN pickup", () => {
    expect(pickupLocationFor("/impresion-3d-cerca-de-mi")).toBe("bcn");
    expect(pickupLocationFor("/sobre-nosotros")).toBe("bcn");
    expect(pickupLocationFor("/about")).toBe("bcn");
  });

  it("delivery / international pages → non_local, no pickup", () => {
    const nonLocal = [
      "/madrid",
      "/impresion-3d-con-entrega-a-valencia",
      "/impresion-3d-online",
      "/3d-printing-service",
      "/3d-printing-delivery-paris",
      "/3d-printing-delivery-london",
      "/it/stampa-3d-online",
      "/it/stampa-3d-milano",
      "/de/3d-druck-service",
      "/de/3d-druck-berlin",
      "/fr/impression-3d-en-ligne",
      "/nl/3d-printen-laten-maken",
      "/pt/impressao-3d-online",
      "/catalogo/soporte-telefono",
    ];
    for (const p of nonLocal) {
      const r = classifyPath(p);
      expect(r.group).toBe("non_local");
      expect(r.pickupLocation).toBe(null);
      expect(isLocalPage(p)).toBe(false);
    }
  });

  it("trailing slashes do not change the answer", () => {
    expect(classifyPath("/impresion-3d-sevilla/").pickupLocation).toBe("sevilla");
    expect(classifyPath("/madrid/").pickupLocation).toBe(null);
  });

  it("query/hash are stripped", () => {
    expect(classifyPath("/impresion-3d-sevilla?x=1").pickupLocation).toBe("sevilla");
    expect(classifyPath("/madrid#foo").group).toBe("non_local");
  });
});
