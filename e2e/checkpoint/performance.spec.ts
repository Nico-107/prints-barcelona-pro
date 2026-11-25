import { test, expect } from "@playwright/test";

// P12 — performance budgets. The real matrix (time-to-price per fixture × page) lives in
// `matrix.spec.ts`. This spec only guards the hard budgets at a smoke level so the
// published build never regresses silently.

test("homepage renders without long main-thread tasks on load", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const longTasks = await page.evaluate(() =>
    new Promise<number>((resolve) => {
      const observed: number[] = [];
      let fallback: ReturnType<typeof setTimeout> | null = null;
      try {
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) observed.push(entry.duration);
        });
        po.observe({ entryTypes: ["longtask"] });
      } catch {
        resolve(0);
        return;
      }
      fallback = setTimeout(() => resolve(Math.max(0, ...observed)), 2000);
    }),
  );
  // Soft budget: no single long task over 500 ms on an idle homepage.
  expect(longTasks).toBeLessThan(500);
});

test("large files landing — placeholder (matrix drives the real measurements)", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(await page.title()).toBeTruthy();
});
