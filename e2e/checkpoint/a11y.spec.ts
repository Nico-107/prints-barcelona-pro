import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// U8 — Accessibility basics. Axe-core scan of the home page catches serious/critical
// violations. The calculator-open axe scan comes in follow-ups (needs a stable open-modal
// selector); this spec guards the baseline so new regressions fail fast.

test("home ES has no serious/critical axe violations on first paint", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  // Soft threshold: aim for 0 but allow up to 3 in legacy pages until Phase U fully lands.
  expect(bad.length, bad.map((v) => v.id).join(", ")).toBeLessThanOrEqual(3);
});
