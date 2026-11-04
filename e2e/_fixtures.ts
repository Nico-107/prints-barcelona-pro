/**
 * Shared Playwright test fixture (Prompt 26 §4).
 *
 * Pre-seeds localStorage so the cookie-consent banner and the
 * LanguageSuggestionBar are already dismissed before the first paint.
 * Both banners race with the specs' initial clicks and were the single
 * biggest source of flake in prior runs.
 *
 * Keys mirror the production implementation:
 *   - cookie-consent / cookie-consent-date → src/components/CookieConsentBanner.tsx
 *   - dim3d-lang-suggest-dismissed          → src/components/LanguageSuggestionBar.tsx
 *
 * Every e2e spec should import from here instead of `@playwright/test` so
 * the beforeEach fires once per test.
 */
import { test as base, expect } from "@playwright/test";

type SharedFixtures = Record<string, never>;

export const test = base.extend<SharedFixtures>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("cookie-consent", "accepted");
        localStorage.setItem("cookie-consent-date", new Date().toISOString());
        localStorage.setItem(
          "dim3d-lang-suggest-dismissed",
          JSON.stringify({ es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true }),
        );
      } catch { /* ignore quota errors */ }
    });
    await use(page);
  },
});

export { expect };
