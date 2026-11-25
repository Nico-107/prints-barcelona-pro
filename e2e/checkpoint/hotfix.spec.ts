import { test, expect } from "@playwright/test";

// e2e for Phase H hotfix items.
//
// These specs run against the preview build. They assert the properties that must hold
// in legacy mode (what the deployed server charges today): a single number across the
// window, no dead-end copy, and no street address in the price window.
//
// The hotfix UI shim is tracked in `src/__checkpoint__/legacy/*` and the real OrderPanel
// is updated incrementally; until the UI reads the shim, each spec is tolerant and only
// enforces the properties that the hotfix locks in (no street address, no refresh copy,
// urgent = next day label).

const PAGES = [
  { path: "/", label: "home ES" },
  { path: "/madrid", label: "madrid (non-local)" },
  { path: "/it/stampa-3d-online", label: "Italian online (non-local)" },
];

for (const p of PAGES) {
  test.describe(`hotfix properties on ${p.label}`, () => {
    test("no street address leaks into the price window / page body", async ({ page }) => {
      await page.goto(p.path, { waitUntil: "domcontentloaded" });
      const body = await page.locator("body").innerText();
      expect(body).not.toContain("Rambla del Brasil");
      expect(body).not.toContain("Parsi");
    });

    test("no 'refresh the page' dead-end copy in the DOM", async ({ page }) => {
      await page.goto(p.path, { waitUntil: "domcontentloaded" });
      const html = await page.content();
      expect(html).not.toContain("Actualiza la página e inténtalo de nuevo");
      expect(html).not.toContain("Aggiorna la pagina e riprova");
    });

    test("urgent-tier label never says 'same day' in the rendered HTML", async ({ page }) => {
      await page.goto(p.path, { waitUntil: "domcontentloaded" });
      const html = await page.content();
      // Spanish homepage includes the ES translations; the string must not appear anywhere.
      expect(html).not.toContain("Mismo día");
      expect(html).not.toContain("Same day");
      expect(html).not.toContain("Stesso giorno");
    });
  });
}

test.describe("hotfix: price window has no pickup address on non-local pages", () => {
  test("/madrid has no 'Recogida' + Barcelona street address combo", async ({ page }) => {
    await page.goto("/madrid", { waitUntil: "domcontentloaded" });
    const body = await page.locator("body").innerText();
    // Madrid is non-local → no pickup should show at all.
    expect(body).not.toContain("Rambla del Brasil");
  });
});
