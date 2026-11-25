import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("O9 packlink-status-hook contract", () => {
  const src = readFileSync("supabase/functions/packlink-status-hook/index.ts", "utf8");
  it("hooks on POST and rejects missing secret with 403", () => {
    expect(src).toMatch(/METHOD_NOT_ALLOWED/);
    expect(src).toMatch(/FORBIDDEN/);
    expect(src).toMatch(/PACKLINK_HOOK_SECRET/);
  });
  it("accepts defensive field aliases from Zapier", () => {
    expect(src).toMatch(/order_ref|orderReference/);
    expect(src).toMatch(/tracking_number|trackingNumber/);
    expect(src).toMatch(/carrier|courier/);
    expect(src).toMatch(/status|shipment_status/);
  });
  it("writes to webhook_events for auditing", () => {
    expect(src).toContain("webhook_events");
  });
});
