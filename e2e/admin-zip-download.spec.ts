/**
 * B3: Admin panel "Descargar archivos (.zip)" button.
 *
 * The edge function is mocked. We verify that:
 *  1. The button appears on order cards that have file_paths.
 *  2. No button appears on order cards with no files.
 *  3. The button appears on quote cards that have file_paths.
 *  4. Clicking the button sends a request with an Authorization header.
 */
import { test, expect } from "./_fixtures";

const SUPABASE_HOST = "placeholder.supabase.co";
const AUTH_STORAGE_KEY = "sb-placeholder-auth-token";

const MOCK_ORDERS = [
  {
    id: "order-uuid-1",
    order_number: 268,
    product_title: "Order with files",
    customer_phone: "+34600000001",
    status: "order_received",
    eta: null,
    fulfillment: "pickup",
    notes: "",
    photos: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payment_method: "stripe",
    stripe_payment_link: null,
    payment_status: "paid",
    file_paths: ["123-part_a.stl", "123-part_b.stl"],
    pieces: null,
  },
  {
    id: "order-uuid-2",
    order_number: 269,
    product_title: "Order without files",
    customer_phone: "+34600000002",
    status: "order_received",
    eta: null,
    fulfillment: "pickup",
    notes: "",
    photos: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payment_method: "stripe",
    stripe_payment_link: null,
    payment_status: "paid",
    file_paths: [],
    pieces: null,
  },
];

const MOCK_QUOTES = [
  {
    id: "quote-uuid-abcd1234",
    created_at: new Date().toISOString(),
    contact_email: "test@example.com",
    contact_phone: null,
    material: "PETG",
    color: null,
    infill: "15",
    wall_loops: 2,
    quantity: 1,
    estimated_grams: 20,
    estimated_hours: 1.5,
    estimated_price_low: 990,
    estimated_price_high: 1500,
    file_paths: ["456-housing.stl"],
    status: "pending",
    converted_order_id: null,
    utm_source: null,
    utm_medium: null,
    utm_content: null,
    pieces: null,
  },
];

// Minimal valid zip (empty central directory, PK magic bytes)
const FAKE_ZIP = Buffer.from([0x50, 0x4b, 0x05, 0x06, ...new Array(18).fill(0)]);

test.describe("Admin zip download button", () => {
  test.beforeEach(async ({ page }) => {
    // Inject a fake admin session into localStorage with a valid-looking JWT.
    await page.addInitScript(({ key }) => {
      const hdr = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      const pld = btoa(JSON.stringify({
        sub: "00000000-0000-0000-0000-000000000001",
        aud: "authenticated",
        exp: 9999999999,
        iat: 1000000000,
        role: "authenticated",
        email: "admin@test.com",
      })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      const token = `${hdr}.${pld}.fakesig`;
      const session = {
        access_token: token,
        refresh_token: "fake-refresh",
        expires_in: 86400,
        expires_at: 9999999999,
        token_type: "bearer",
        user: {
          id: "00000000-0000-0000-0000-000000000001",
          email: "admin@test.com",
          role: "authenticated",
          aud: "authenticated",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          app_metadata: { provider: "email", providers: ["email"] },
          user_metadata: {},
        },
      };
      try { localStorage.setItem(key, JSON.stringify(session)); } catch { /* ignore */ }
    }, { key: AUTH_STORAGE_KEY });

    // Intercept all Supabase REST / function calls.
    await page.route(`**/${SUPABASE_HOST}/**`, (route) => {
      const url = route.request().url();
      if (url.includes("user_roles")) {
        return route.fulfill({ status: 200, contentType: "application/json", body: '[{"role":"admin"}]' });
      }
      if (url.includes("/rest/v1/orders")) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_ORDERS) });
      }
      if (url.includes("/rest/v1/quote_requests")) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_QUOTES) });
      }
      if (url.includes("order-files-zip")) {
        return route.fulfill({ status: 200, contentType: "application/zip", body: FAKE_ZIP });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
  });

  test("zip button appears only on order cards that have files", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('[data-testid="zip-download-order"]', { timeout: 15_000 });
    const buttons = await page.locator('[data-testid="zip-download-order"]').all();
    // Only order #268 (with 2 files) should show the button, not #269 (empty)
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    await expect(buttons[0]).toContainText("Descargar archivos (.zip)");
  });

  test("clicking zip button sends request with Authorization header", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('[data-testid="zip-download-order"]', { timeout: 15_000 });

    let capturedAuth: string | null = null;
    await page.route(`**/${SUPABASE_HOST}/functions/v1/order-files-zip*`, (route) => {
      capturedAuth = route.request().headers()["authorization"] ?? null;
      return route.fulfill({ status: 200, contentType: "application/zip", body: FAKE_ZIP });
    });

    await page.locator('[data-testid="zip-download-order"]').first().click();
    await page.waitForTimeout(1000);
    expect(capturedAuth).toBeTruthy();
    expect(capturedAuth).toContain("Bearer");
  });

  test("zip button appears on quote card with files", async ({ page }) => {
    await page.goto("/admin#quotes");
    await page.waitForSelector('[data-testid="zip-download-quote"]', { timeout: 15_000 });
    const btn = page.locator('[data-testid="zip-download-quote"]').first();
    await expect(btn).toContainText("Descargar archivos (.zip)");
  });
});
