import { describe, it, expect } from "vitest";
import { serverParity } from "./legacy/serverParity";

// H4 — no PRICE_MISMATCH possible against the deployed server.
// The UI must compute the deployed-server price before Buy and route to one of three outcomes:
// match (±2 cents), adjust (server up to 1.3× shown), or review (> 1.3× shown).

describe("hotfix-server-parity: 3-way decision", () => {
  it("exact match (within 2 cents)", () => {
    const r = serverParity(1480, 1480);
    expect(r.kind).toBe("match");
  });

  it("match tolerance ±2 cents", () => {
    expect(serverParity(1480, 1481).kind).toBe("match");
    expect(serverParity(1480, 1478).kind).toBe("match");
  });

  it("server higher but within 1.3× → adjust to server price", () => {
    const r = serverParity(1000, 1200); // 1.2×
    expect(r.kind).toBe("adjust");
    if (r.kind === "adjust") {
      expect(r.totalCents).toBe(1200);
      expect(r.shownCents).toBe(1000);
    }
  });

  it("server far higher than shown → review path", () => {
    const r = serverParity(990, 9790); // ~9.9× overpriced
    expect(r.kind).toBe("review");
    if (r.kind === "review") {
      expect(r.shownCents).toBe(990);
      expect(r.rawCents).toBe(9790);
    }
  });

  it("server lower than shown → adjust down (customer pays less)", () => {
    const r = serverParity(1580, 1490);
    expect(r.kind).toBe("adjust");
    if (r.kind === "adjust") {
      expect(r.totalCents).toBe(1490);
      expect(r.shownCents).toBe(1580);
    }
  });

  it("at the 1.3× boundary → adjust (not review)", () => {
    const r = serverParity(1000, 1300);
    expect(r.kind).toBe("adjust");
  });

  it("just above 1.3× → review", () => {
    const r = serverParity(1000, 1301);
    expect(r.kind).toBe("review");
  });
});
