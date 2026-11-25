import { test, expect } from "@playwright/test";

// P9 — large file handling. No dead end on 60 / 160 MB files. Full in-page generation +
// chunked upload is heavy; this smoke only checks that the dead-end copy is gone and the
// upload surface is still reachable at the home page.

test("home ES does not contain the '50 MB → send a link' dead-end copy", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const html = await page.content();
  expect(html).not.toContain("El archivo supera los 50 MB");
});

test("file formats list on home mentions STL and 3MF", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const html = await page.content();
  expect(html).toMatch(/STL/);
  expect(html).toMatch(/3MF/);
});
