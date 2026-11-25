import { describe, it, expect } from "vitest";
import { classifyPath } from "@/config/pageGroups";

// F7 / T5 — price claims per page group. Local pages: "Desde 9,90 €". Non-local pages
// (v5 mode): "Desde 14,90 € con envío incluido · envío gratis desde 30 €". SSR renders
// the v5 text; the client swaps to the legacy wording if the server is still legacy.

function priceClaim(path: string, serverMode: "legacy" | "v5"): string {
  const group = classifyPath(path).group;
  if (group === "local") return "Desde 9,90 €";
  if (serverMode === "v5") return "Desde 14,90 € con envío incluido · envío gratis desde 30 €";
  return "Desde 9,90 € + 5,90 € de envío";
}

describe("F7 / T5 price claims", () => {
  it("local pages always show the 9,90 claim", () => {
    expect(priceClaim("/", "legacy")).toBe("Desde 9,90 €");
    expect(priceClaim("/", "v5")).toBe("Desde 9,90 €");
    expect(priceClaim("/impresion-3d-sevilla", "v5")).toBe("Desde 9,90 €");
  });

  it("non-local v5 shows the delivered claim", () => {
    expect(priceClaim("/madrid", "v5")).toBe("Desde 14,90 € con envío incluido · envío gratis desde 30 €");
  });

  it("non-local legacy falls back to the plain breakdown", () => {
    expect(priceClaim("/madrid", "legacy")).toBe("Desde 9,90 € + 5,90 € de envío");
  });
});
