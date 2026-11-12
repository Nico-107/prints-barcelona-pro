import { describe, it, expect } from "vitest";
import { EST } from "./core";

function matPrice(key: string): { g: string; h: string } {
  const m = EST.materials[key];
  if (!m) throw new Error(`Unknown material: ${key}`);
  const g = (EST.plasticEurPerG * m.priceMult).toFixed(3).replace(".", ",");
  const h = (EST.timeTiers[0].eurPerH * m.priceMult).toFixed(2).replace(".", ",");
  return { g, h };
}

describe("materials table prices match engine constants", () => {
  it("PLA: 0,055 €/g + 4,95 €/h", () => {
    const { g, h } = matPrice("PLA");
    expect(g).toBe("0,055");
    expect(h).toBe("4,95");
  });

  it("PETG: 0,061 €/g + 5,45 €/h", () => {
    const { g, h } = matPrice("PETG");
    expect(g).toBe("0,061");
    expect(h).toBe("5,45");
  });

  it("ABS: 0,072 €/g + 6,44 €/h", () => {
    const { g, h } = matPrice("ABS");
    expect(g).toBe("0,072");
    expect(h).toBe("6,44");
  });

  it("TPU: 0,072 €/g + 6,44 €/h", () => {
    const { g, h } = matPrice("TPU");
    expect(g).toBe("0,072");
    expect(h).toBe("6,44");
  });

  it("Nylon: 0,077 €/g + 6,93 €/h", () => {
    const { g, h } = matPrice("Nylon");
    expect(g).toBe("0,077");
    expect(h).toBe("6,93");
  });
});
