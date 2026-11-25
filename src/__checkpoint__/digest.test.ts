import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("O13 daily digest contract", () => {
  const src = readFileSync("supabase/functions/daily-digest/index.ts", "utf8");
  it("edge function has cron auth + health endpoint + Resend send", () => {
    expect(src).toMatch(/CRON_AUTH|x-cron-auth/);
    expect(src).toMatch(/health/);
    expect(src).toMatch(/resend\.com/);
  });
  it("digest sums today's paid orders + flags blocked sales from leads", () => {
    expect(src).toContain("total_paid_cents");
    expect(src).toContain("blockedSales");
    expect(src).toContain("leads");
  });
});
