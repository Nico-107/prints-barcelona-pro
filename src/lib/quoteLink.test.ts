import { describe, it, expect } from "vitest";
import { encodeQuoteHash, decodeQuoteHash, buildQuoteLink } from "./quoteLink";

describe("quoteLink", () => {
  it("round-trips a full config", () => {
    const cfg = { material: "PETG", colour: "Red", qty: 3, urgency: "express", fileId: "1699999999-part.stl" };
    const hash = encodeQuoteHash(cfg);
    expect(hash.startsWith("#q=")).toBe(true);
    const decoded = decodeQuoteHash(hash);
    expect(decoded).toEqual(cfg);
  });

  it("round-trips without fileId", () => {
    const cfg = { material: "PLA", colour: "", qty: 1, urgency: "standard" };
    const decoded = decodeQuoteHash(encodeQuoteHash(cfg));
    expect(decoded).toEqual({ ...cfg, fileId: null });
  });

  it("returns null for empty / malformed hashes", () => {
    expect(decodeQuoteHash("")).toBeNull();
    expect(decodeQuoteHash("#foo=bar")).toBeNull();
    expect(decodeQuoteHash("#q=not-base64!!!")).toBeNull();
  });

  it("builds a full shareable URL", () => {
    const url = buildQuoteLink("https://example.com", "/it/stampa-3d-online", {
      material: "ABS", colour: "Black", qty: 2, urgency: "urgent",
    });
    expect(url).toMatch(/^https:\/\/example\.com\/it\/stampa-3d-online#q=/);
    const hashOnly = url.slice(url.indexOf("#"));
    const decoded = decodeQuoteHash(hashOnly);
    expect(decoded?.material).toBe("ABS");
    expect(decoded?.urgency).toBe("urgent");
  });

  it("clamps negative / NaN qty", () => {
    const bad = encodeQuoteHash({ material: "PLA", colour: "", qty: -5, urgency: "standard" });
    const decoded = decodeQuoteHash(bad);
    expect(decoded?.qty).toBe(1);
  });

  it("legacy payload with 's' (scale) still decodes, scale ignored", () => {
    // Manually craft a payload matching the old shape with s=2
    const legacyPayload = { m: "PLA", c: "Black", q: 1, u: "standard", s: 2, f: null };
    const json = JSON.stringify(legacyPayload);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64url = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const hash = `#q=${b64url}`;
    const decoded = decodeQuoteHash(hash);
    expect(decoded).toEqual({ material: "PLA", colour: "Black", qty: 1, urgency: "standard", fileId: null });
  });
});
