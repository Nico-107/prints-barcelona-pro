import { describe, it, expect } from "vitest";
import { colourToPreview } from "./colourMap";
import { COLOUR_OPTIONS } from "./ColourPicker";

// ─── All COLOUR_OPTIONS named keys ──────────────────────────────────────────

describe("colourToPreview — named COLOUR_OPTIONS keys", () => {
  for (const { key, hex } of COLOUR_OPTIONS) {
    if (key === "Transparent") continue; // handled separately
    it(`key "${key}" returns correct hex`, () => {
      const p = colourToPreview(key);
      expect(p.hex).toBeTruthy();
      expect(p.opacity).toBe(1);
    });
  }

  it("Silver has metalness 0.6, roughness 0.35", () => {
    const p = colourToPreview("Silver");
    expect(p.metalness).toBe(0.6);
    expect(p.roughness).toBe(0.35);
  });

  it("Gold has metalness 0.6, roughness 0.35", () => {
    const p = colourToPreview("Gold");
    expect(p.metalness).toBe(0.6);
    expect(p.roughness).toBe(0.35);
  });

  it("White has metalness 0, roughness 0.55", () => {
    const p = colourToPreview("White");
    expect(p.metalness).toBe(0);
    expect(p.roughness).toBe(0.55);
  });
});

describe("colourToPreview — Transparent", () => {
  it("returns light blue-grey hex with opacity 0.45", () => {
    const p = colourToPreview("Transparent");
    expect(p.hex).toBe("#B0C4DE");
    expect(p.opacity).toBe(0.45);
    expect(p.metalness).toBe(0);
    expect(p.roughness).toBe(0.55);
  });
});

describe("colourToPreview — hex forms", () => {
  it("#RGB shorthand", () => {
    const p = colourToPreview("#F0F");
    expect(p.hex).toBe("#F0F");
    expect(p.opacity).toBe(1);
    expect(p.metalness).toBe(0);
  });

  it("#RRGGBB full form", () => {
    const p = colourToPreview("#FF69B4");
    expect(p.hex).toBe("#FF69B4");
    expect(p.opacity).toBe(1);
    expect(p.metalness).toBe(0);
  });

  it("#000000 black hex", () => {
    const p = colourToPreview("#000000");
    expect(p.hex).toBe("#000000");
  });

  it("#FFFFFF white hex", () => {
    const p = colourToPreview("#FFFFFF");
    expect(p.hex).toBe("#FFFFFF");
  });
});

describe("colourToPreview — multilingual words", () => {
  const cases: [string, string][] = [
    // Spanish
    ["rojo", "#FF0000"],
    ["azul", "#0000FF"],
    ["verde", "#00AA00"],
    ["negro", "#111111"],
    ["blanco", "#F0F0F0"],
    ["gris", "#808080"],
    ["amarillo", "#FFD700"],
    ["naranja", "#FF8C00"],
    ["morado", "#800080"],
    ["rosa", "#FF69B4"],
    ["marron", "#8B4513"],
    // Catalan
    ["vermell", "#FF0000"],
    ["blau", "#0000FF"],
    ["verd", "#00AA00"],
    ["negre", "#111111"],
    ["blanc", "#F0F0F0"],
    ["groc", "#FFD700"],
    ["taronja", "#FF8C00"],
    ["lila", "#800080"],
    // English
    ["red", "#FF0000"],
    ["blue", "#0000FF"],
    ["green", "#00AA00"],
    ["black", "#111111"],
    ["white", "#F0F0F0"],
    ["grey", "#808080"],
    ["gray", "#808080"],
    ["yellow", "#FFD700"],
    ["orange", "#FF8C00"],
    ["purple", "#800080"],
    ["pink", "#FF69B4"],
    ["brown", "#8B4513"],
    // Metallic words
    ["dorado", "#FFD700"],
    ["gold", "#FFD700"],
    ["plateado", "#C0C0C0"],
    ["silver", "#C0C0C0"],
  ];

  for (const [word, expectedHex] of cases) {
    it(`"${word}" → ${expectedHex}`, () => {
      const p = colourToPreview(word);
      expect(p.hex).toBe(expectedHex);
    });
  }

  it("dorado/gold has metalness 0.6", () => {
    expect(colourToPreview("dorado").metalness).toBe(0.6);
    expect(colourToPreview("gold").metalness).toBe(0.6);
  });

  it("plateado/silver has metalness 0.6", () => {
    expect(colourToPreview("plateado").metalness).toBe(0.6);
    expect(colourToPreview("silver").metalness).toBe(0.6);
  });
});

describe("colourToPreview — fallbacks", () => {
  it("empty string → neutral grey #D0D0D0", () => {
    const p = colourToPreview("");
    expect(p.hex).toBe("#D0D0D0");
  });

  it("undefined → neutral grey #D0D0D0", () => {
    const p = colourToPreview(undefined);
    expect(p.hex).toBe("#D0D0D0");
  });

  it('"Any" → neutral grey #D0D0D0', () => {
    const p = colourToPreview("Any");
    expect(p.hex).toBe("#D0D0D0");
  });

  it("garbage text → neutral grey #D0D0D0, never throws", () => {
    expect(() => colourToPreview("thisIsGarbage!!!")).not.toThrow();
    const p = colourToPreview("thisIsGarbage!!!");
    expect(p.hex).toBe("#D0D0D0");
  });

  it("random unicode → neutral grey, never throws", () => {
    expect(() => colourToPreview("🌈🦄")).not.toThrow();
    const p = colourToPreview("🌈🦄");
    expect(p.hex).toBe("#D0D0D0");
  });
});
