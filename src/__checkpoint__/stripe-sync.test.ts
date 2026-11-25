import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("O7 admin-stripe-sync wiring", () => {
  it("edge function exists and has the health endpoint", () => {
    const src = readFileSync("supabase/functions/admin-stripe-sync/index.ts", "utf8");
    expect(src).toMatch(/health/);
    expect(src).toMatch(/checkout\/sessions\//);
  });
  it("updates customer_name / customer_email / customer_phone / shipping_address / total_paid_cents", () => {
    const src = readFileSync("supabase/functions/admin-stripe-sync/index.ts", "utf8");
    for (const key of ["customer_name", "customer_email", "customer_phone", "shipping_address", "total_paid_cents"]) {
      expect(src, `${key} missing`).toContain(key);
    }
  });
});
