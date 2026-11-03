import { describe, it, expect } from "vitest";
import { encodeQuoteHash, decodeQuoteHash, buildQuoteLink } from "./quoteLink";

describe("quoteLink", () => {
  it("round-trips a full config", () => {
    const cfg = { material: "PETG", colour: "Red", qty: 3, urgency: "express", scale: 1.5, fileId: "1699999999-part.stl" };
    const hash = encodeQuoteHash(cfg);
    expect(hash.startsWith("#q=")).toBe(true);
    const decoded = decodeQuoteHash(hash);
    expect(decoded).toEqual(cfg);
  });

  it("round-trips without fileId", () => {
    const cfg = { material: "PLA", colour: "", qty: 1, urgency: "standard", scale: 1 };
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
      material: "ABS", colour: "Black", qty: 2, urgency: "urgent", scale: 2,
    });
    expect(url).toMatch(/^https:\/\/example\.com\/it\/stampa-3d-online#q=/);
    const hashOnly = url.slice(url.indexOf("#"));
    const decoded = decodeQuoteHash(hashOnly);
    expect(decoded?.material).toBe("ABS");
    expect(decoded?.scale).toBe(2);
  });

  it("clamps negative / NaN qty and scale", () => {
    // Simulate a tampered payload: encode something invalid and ensure decode clamps
    const bad = encodeQuoteHash({ material: "PLA", colour: "", qty: -5, urgency: "standard", scale: -1 });
    const decoded = decodeQuoteHash(bad);
    expect(decoded?.qty).toBe(1);
    expect(decoded?.scale).toBeGreaterThan(0);
  });
});
