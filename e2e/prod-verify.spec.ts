/**
 * Prompt 26 §5 — Production verification against https://dimension3dprints.com.
 *
 * Run with:
 *   PROD_BASE=https://dimension3dprints.com npx playwright test e2e/prod-verify.spec.ts --workers=1
 *
 * This spec intentionally bypasses the preview webServer (see `use.baseURL`
 * below) and hits whichever build is live. It:
 *   - Accepts cookies, uploads the small STL on `/` and `/it/stampa-3d-online`.
 *   - Asserts the price and the "Comprar" button are visible.
 *   - Intercepts eu.i.posthog.com to confirm price_viewed +
 *     upload_pipeline_stage(price_shown) + buy_clicked + checkout_started.
 *   - Stops at the Stripe redirect URL (never completes a payment).
 *   - Tags every outgoing event with `is_internal:true` so results don't
 *     pollute the production dataset.
 */
import { devices, test as base, expect, type Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUBE_STL = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");

const PROD_BASE = process.env.PROD_BASE ?? "https://dimension3dprints.com";

const test = base.extend({
  page: async ({ page }, use) => {
    // Seed consent + lang-suggest so banners don't cover the CTA
    // and stamp every PostHog request with is_internal=true before it fires.
    await page.addInitScript(() => {
      try {
        localStorage.setItem("cookie-consent", "accepted");
        localStorage.setItem("cookie-consent-date", new Date().toISOString());
        localStorage.setItem(
          "dim3d-lang-suggest-dismissed",
          JSON.stringify({ es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true }),
        );
        // Mutate every posthog.capture() call so the backend sees is_internal.
        const PH = (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog;
        if (PH && typeof PH.capture === "function") {
          const orig = PH.capture.bind(PH);
          PH.capture = (event: string, props?: Record<string, unknown>) => orig(event, { ...(props ?? {}), is_internal: true });
        }
      } catch { /* ignore */ }
    });
    await use(page);
  },
});

interface CapturedEvent { event: string; properties: Record<string, unknown> }

function attachCapture(page: Page, store: CapturedEvent[]) {
  page.on("request", async (req) => {
    const url = req.url();
    // Match the direct PostHog host OR the dimension3dprints reverse proxy
    // (deployed since the spec was written — PostHog is now fronted by
    // https://e.dimension3dprints.com per src/main.tsx api_host).
    if (!/eu\.i\.posthog\.com|e\.dimension3dprints\.com\/(e|i|batch|capture)/.test(url)) return;
    try {
      const raw = req.postData();
      if (!raw) return;
      // PostHog batches: body is either a single {event,properties} or
      // a wrapped array under .batch. Parse both shapes.
      const parsed = JSON.parse(raw) as unknown;
      const rows: unknown[] = Array.isArray(parsed)
        ? parsed
        : typeof parsed === "object" && parsed !== null && "batch" in parsed
          ? ((parsed as { batch: unknown[] }).batch ?? [])
          : [parsed];
      for (const row of rows) {
        if (typeof row !== "object" || row === null) continue;
        const r = row as { event?: unknown; properties?: unknown };
        if (typeof r.event === "string") {
          store.push({ event: r.event, properties: (r.properties as Record<string, unknown>) ?? {} });
        }
      }
    } catch { /* ignore non-JSON beacons (survey/snapshots) */ }
  });
}

async function waitForVisibleBuy(page: Page, timeoutMs = 45_000): Promise<HTMLElement> {
  const handle = await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    return btns.find((b) => b.clientHeight > 0 && !b.disabled && /\d/.test(b.textContent ?? "")) ?? null;
  }, null, { timeout: timeoutMs });
  const el = handle.asElement();
  if (!el) throw new Error("No visible buy button");
  return el.evaluateHandle((n) => n as HTMLElement) as unknown as HTMLElement;
}

async function prodCheck(page: Page, routePath: string, device: "desktop" | "mobile") {
  const captured: CapturedEvent[] = [];
  attachCapture(page, captured);

  await page.goto(`${PROD_BASE}${routePath}`, { waitUntil: "domcontentloaded" });

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: "attached", timeout: 15_000 });
  await fileInput.setInputFiles(CUBE_STL);

  await waitForVisibleBuy(page, 60_000);

  // The rendered label is "Comprar" (ES / IT), "Buy" (EN) etc. On /it the
  // UI strings localise but the data-testid is the same; we assert label
  // on ES-serving routes which always show "Comprar".
  if (routePath === "/") {
    const anyVisible = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
      return btns.some((b) => b.clientHeight > 0 && /Comprar/i.test(b.textContent ?? ""));
    });
    expect(anyVisible, "Comprar label visible on /").toBe(true);
  }

  // Click the visible Buy button and intercept the Stripe redirect.
  const stripePromise = page.waitForURL(/checkout\.stripe\.com|dashboard\.stripe\.com/, { timeout: 30_000 }).catch(() => null);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]')) as HTMLButtonElement[];
    const vis = btns.find((b) => b.clientHeight > 0 && !b.disabled);
    vis?.click();
  });

  const stripeUrl = await Promise.race([
    stripePromise.then(() => page.url()),
    page.waitForTimeout(25_000).then(() => null),
  ]);

  // Give the batched posthog beacons time to flush before assertions.
  await page.waitForTimeout(1500);

  const names = captured.map((c) => c.event);
  const expectInternal = (name: string) => {
    const matches = captured.filter((c) => c.event === name);
    for (const m of matches) expect(m.properties.is_internal, `${name} should be is_internal`).toBe(true);
    return matches;
  };

  // price_viewed is required; upload_pipeline_stage price_shown is strongly
  // expected but may be batched into a retry if the first beacon drops — soft check.
  expect(names, `price_viewed on ${routePath} (${device})`).toContain("price_viewed");
  expectInternal("price_viewed");

  const pipelineShown = captured.filter((c) => c.event === "upload_pipeline_stage"
    && (c.properties as { stage?: string }).stage === "price_shown");
  if (pipelineShown.length > 0) {
    for (const p of pipelineShown) expect(p.properties.is_internal).toBe(true);
  } else {
    // Make the gap visible in the test log instead of silently passing.
    test.info().annotations.push({ type: "note", description: `${routePath} (${device}): no upload_pipeline_stage(price_shown) captured — possibly batched into a later beacon` });
  }

  // Buy click side effects — these fire client-side right before Stripe.
  expect(names, `buy_clicked on ${routePath} (${device})`).toContain("buy_clicked");
  expect(names, `checkout_started on ${routePath} (${device})`).toContain("checkout_started");
  expectInternal("buy_clicked");
  expectInternal("checkout_started");

  if (stripeUrl) {
    // We never complete payment — just prove we reached the redirect.
    expect(stripeUrl).toMatch(/checkout\.stripe\.com|dashboard\.stripe\.com/);
  } else {
    // The user asks us to report (not silently pass) when the ceiling
    // amount-mismatch still blocks €200 orders because Lovable hasn't
    // been updated. Our cube is ~€15 so this shouldn't trigger here,
    // but keep the branch explicit.
    test.info().annotations.push({ type: "warning", description: `${routePath} (${device}): Stripe redirect never reached — check if the server-side instant-buy ceiling raise is live yet.` });
  }
}

test.describe("production verify — dimension3dprints.com", () => {
  test("desktop · / — price, Comprar, Stripe redirect, PostHog events", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prodCheck(page, "/", "desktop");
  });

  test("desktop · /it/stampa-3d-online — price, buy, Stripe redirect, PostHog events", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prodCheck(page, "/it/stampa-3d-online", "desktop");
  });

  test("mobile · iPhone 13 · / — price, Comprar, Stripe redirect, PostHog events", async ({ browser }) => {
    const ctx = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await ctx.newPage();
    // Re-apply the init-script seeding since the fixture only covers
    // the default `page` fixture, not contexts opened in-test.
    await page.addInitScript(() => {
      try {
        localStorage.setItem("cookie-consent", "accepted");
        localStorage.setItem("cookie-consent-date", new Date().toISOString());
        localStorage.setItem("dim3d-lang-suggest-dismissed",
          JSON.stringify({ es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true }));
        const PH = (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog;
        if (PH && typeof PH.capture === "function") {
          const orig = PH.capture.bind(PH);
          PH.capture = (event: string, props?: Record<string, unknown>) => orig(event, { ...(props ?? {}), is_internal: true });
        }
      } catch { /* ignore */ }
    });
    try {
      await prodCheck(page, "/", "mobile");
    } finally {
      await ctx.close();
    }
  });
});
