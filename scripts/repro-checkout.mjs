// One-shot reproducer: load prod, upload small cube, click Buy now, capture the
// POST to create-instant-checkout and its response. No PostHog assertions — we
// just want the raw request + response the live site makes.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUBE = path.resolve(__dirname, "../qa/fixtures/small-cube.stl");
const BASE = process.env.PROD_BASE ?? "https://dimension3dprints.com";
const ROUTE = process.env.ROUTE ?? "/";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.addInitScript(() => {
  try {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    localStorage.setItem(
      "dim3d-lang-suggest-dismissed",
      JSON.stringify({ es: true, ca: true, en: true, de: true, fr: true, nl: true, it: true, pt: true }),
    );
  } catch {}
});

const checkoutRequests = [];
page.on("request", (req) => {
  if (/create-instant-checkout/.test(req.url())) {
    const body = req.postData();
    checkoutRequests.push({ url: req.url(), body });
    console.log("\n=== REQUEST ===");
    console.log("URL:", req.url());
    if (body) {
      try {
        const parsed = JSON.parse(body);
        const trimmed = { ...parsed };
        if (typeof trimmed.preview_png === "string") trimmed.preview_png = `[png base64, ${trimmed.preview_png.length} chars]`;
        console.log("Body JSON:", JSON.stringify(trimmed, null, 2));
      } catch {
        console.log("Body (raw, first 4KB):", body.slice(0, 4000));
      }
    }
  }
});
page.on("response", async (res) => {
  const u = res.url();
  if (/create-instant-checkout/.test(u)) {
    let text = "";
    try { text = await res.text(); } catch {}
    console.log(`\n=== RESPONSE for ${u} ===`);
    console.log(`HTTP ${res.status()} ${res.statusText()}`);
    console.log("Headers:", JSON.stringify(Object.fromEntries(Object.entries(res.headers()).filter(([k]) => /content|cors|access/i.test(k))), null, 2));
    console.log("Body:", text.slice(0, 2000));
  }
});

console.log(`Loading ${BASE}${ROUTE}`);
await page.goto(`${BASE}${ROUTE}`, { waitUntil: "domcontentloaded", timeout: 60000 });

const fileInput = page.locator('input[type="file"]').first();
await fileInput.waitFor({ state: "attached", timeout: 30000 });
await fileInput.setInputFiles(CUBE);
console.log("Uploaded fixture:", CUBE);

// Wait for Buy button + price
await page.waitForFunction(() => {
  const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]'));
  return btns.some((b) => b.clientHeight > 0 && !b.disabled && /\d/.test(b.textContent ?? ""));
}, null, { timeout: 60000 });
console.log("Buy button ready");

// Click
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('[data-testid="buy-now-btn"]'));
  const vis = btns.find((b) => b.clientHeight > 0 && !b.disabled);
  vis?.click();
});
console.log("Clicked Buy");

// Wait up to 25s for stripe redirect OR for the error modal
const outcome = await Promise.race([
  page.waitForURL(/checkout\.stripe\.com/, { timeout: 25000 }).then(() => "stripe"),
  page.waitForTimeout(25000).then(() => "none"),
]);
console.log(`\nOutcome: ${outcome}`);
console.log(`Final URL: ${page.url()}`);

if (checkoutRequests.length === 0) {
  console.log("\nNo create-instant-checkout request was observed!");
} else {
  for (const r of checkoutRequests) {
    console.log("\n=== REQUEST ===");
    console.log("URL:", r.url);
    console.log("Body (first 4KB):", (r.body ?? "").slice(0, 4000));
  }
}

await browser.close();
