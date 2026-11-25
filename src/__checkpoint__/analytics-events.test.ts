import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// A1 — analytics events for every new state and failure. Grep-level check that every
// required event name is registered in src/lib/analyticsEvents.ts.

const REQUIRED_EVENTS = [
  "checkout_failed",
  "price_updated_shown",
  "price_updated_accepted",
  "oversize_shown",
  "scale_applied",
  "units_applied",
  "large_file_upload",
  "unsupported_format",
  "mobile_whatsapp_click",
];

describe("A1 analytics events registered", () => {
  const src = readFileSync("src/lib/analyticsEvents.ts", "utf8");
  for (const name of REQUIRED_EVENTS) {
    it(`${name} is declared`, () => {
      expect(src, `${name} missing`).toContain(name);
    });
  }
});
