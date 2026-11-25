import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// A3 — $exception events carry message + stack. The PostHog config lives in src/main.tsx.

describe("A3 exceptions", () => {
  const mainTsx = readFileSync("src/main.tsx", "utf8");
  it("PostHog is initialized with capture_exceptions: true", () => {
    expect(mainTsx).toMatch(/capture_exceptions\s*:\s*true/);
  });
});
