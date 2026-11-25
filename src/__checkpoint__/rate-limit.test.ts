import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, _resetRateLimit } from "../../supabase/functions/_shared/checkout/evaluate";

// S6 — rate limit that cannot trap a buyer. 10/min cap, identical repeats within 10 s
// return cached without counting, Retry-After in ms on throttle.

describe("S6 rateLimit", () => {
  beforeEach(() => _resetRateLimit());

  it("first request always allowed", () => {
    const r = rateLimit("ip:1", "h1", 1480, 1_000);
    expect(r.allowed).toBe(true);
  });

  it("10 distinct requests in a minute are allowed, 11th throttled", () => {
    const base = 100;
    for (let i = 0; i < 10; i++) {
      const r = rateLimit("ip:2", `h${i}`, 1480, base + i * 1000);
      expect(r.allowed, `request ${i}`).toBe(true);
    }
    const r11 = rateLimit("ip:2", "h-last", 1480, base + 20_000);
    expect(r11.allowed).toBe(false);
    expect(r11.retryAfterMs).toBeGreaterThan(0);
  });

  it("identical body within 10 s is cached, does not count against the bucket", () => {
    const base = 1_000;
    for (let i = 0; i < 10; i++) {
      const r = rateLimit("ip:3", "same-body", 1480, base + i * 200);
      expect(r.allowed).toBe(true);
      // After the first, every repeat should be cached.
      if (i > 0) expect(r.cached).toBe(true);
    }
    // A distinct body after 10 s should still be allowed (we only counted 1).
    const r2 = rateLimit("ip:3", "other-body", 1480, base + 12_000);
    expect(r2.allowed).toBe(true);
  });

  it("window resets after 60 s", () => {
    for (let i = 0; i < 10; i++) rateLimit("ip:4", `h${i}`, 1480, i * 1000);
    const throttled = rateLimit("ip:4", "h-new", 1480, 11_000);
    expect(throttled.allowed).toBe(false);
    const after = rateLimit("ip:4", "h-fresh", 1480, 80_000);
    expect(after.allowed).toBe(true);
  });
});
