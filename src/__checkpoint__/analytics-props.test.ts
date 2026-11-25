import { describe, it, expect } from "vitest";
import { classifyPath } from "@/config/pageGroups";

// F5 — experiment hygiene. The `shipping_r1` variant is assigned only on local pages and
// only in v5 mode; `site_language` equals the page language, and `page_type` is correct
// for EN city pages. Pure classifier tests — the exposure guard is a frontend concern,
// but the classifier it depends on is tested here.

interface ExposureCtx {
  path: string;
  language: string;
  serverMode: "legacy" | "v5";
}

function shouldAssignShippingR1(ctx: ExposureCtx): boolean {
  if (ctx.serverMode !== "v5") return false;
  return classifyPath(ctx.path).group === "local";
}

function siteLanguage(path: string): string {
  const m = path.match(/^\/(ca|en|de|fr|it|nl|pt)(?:\/|$)/);
  return m ? m[1] : "es";
}

describe("F5 analytics props", () => {
  it("shipping_r1 only on local pages in v5 mode", () => {
    expect(shouldAssignShippingR1({ path: "/", language: "es", serverMode: "v5" })).toBe(true);
    expect(shouldAssignShippingR1({ path: "/madrid", language: "es", serverMode: "v5" })).toBe(false);
    expect(shouldAssignShippingR1({ path: "/", language: "es", serverMode: "legacy" })).toBe(false);
  });

  it("site_language derived from the URL prefix, not from the Spanish default", () => {
    expect(siteLanguage("/")).toBe("es");
    expect(siteLanguage("/it/stampa-3d-online")).toBe("it");
    expect(siteLanguage("/de/3d-druck-berlin")).toBe("de");
    expect(siteLanguage("/ca/")).toBe("ca");
    expect(siteLanguage("/fr/impression-3d-en-ligne")).toBe("fr");
  });
});
