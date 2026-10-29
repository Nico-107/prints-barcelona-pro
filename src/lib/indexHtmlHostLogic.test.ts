/**
 * STEP 4.4: Tests for index.html host-detection inline script.
 * Extracts the script logic to pure TS so it can run in Vitest (no DOM needed).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Pure function equivalent of the inline script
function runHostScript(hostname: string): { redirect?: string; noindex?: boolean } {
  const result: { redirect?: string; noindex?: boolean } = {};
  const lovable =
    hostname.endsWith(".lovable.app") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovable.dev");
  if (lovable) {
    result.redirect = "https://www.dimension3dprints.com/test?q=1";
    return result;
  }
  const main =
    hostname === "www.dimension3dprints.com" ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";
  if (!main) {
    result.noindex = true;
  }
  return result;
}

describe("index.html host-detection script", () => {
  it("redirects .lovable.app domains", () => {
    const r = runHostScript("myproject.lovable.app");
    expect(r.redirect).toBeDefined();
    expect(r.noindex).toBeUndefined();
  });

  it("redirects .lovableproject.com domains", () => {
    const r = runHostScript("foo.lovableproject.com");
    expect(r.redirect).toBeDefined();
  });

  it("redirects .lovable.dev domains", () => {
    const r = runHostScript("bar.lovable.dev");
    expect(r.redirect).toBeDefined();
  });

  it("does nothing for main domain", () => {
    const r = runHostScript("www.dimension3dprints.com");
    expect(r.redirect).toBeUndefined();
    expect(r.noindex).toBeUndefined();
  });

  it("does nothing for localhost", () => {
    const r = runHostScript("localhost");
    expect(r.redirect).toBeUndefined();
    expect(r.noindex).toBeUndefined();
  });

  it("adds noindex for Vercel preview without redirect", () => {
    const r = runHostScript("prints-abc123.vercel.app");
    expect(r.noindex).toBe(true);
    expect(r.redirect).toBeUndefined();
  });

  it("adds noindex for other unknown hosts", () => {
    const r = runHostScript("prints-barcelona-pro.netlify.app");
    expect(r.noindex).toBe(true);
    expect(r.redirect).toBeUndefined();
  });
});
