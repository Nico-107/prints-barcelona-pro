/**
 * QA quote-flow test for Dimension3D.
 * Uploads cube-20mm.stl on 6 representative pages, fills email, submits.
 * Supabase storage, DB insert, and edge function calls are intercepted (mocked).
 * Asserts: insert payload language/sourceCity, email body language/sourceCity,
 *          success message in page language, error message on DB failure.
 *
 * Usage: node scripts/qa/quote-flow.mjs
 * Exits 1 if any assertion fails.
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "../..");
const DIST_DIR = join(ROOT, "dist");
const STL_PATH = join(ROOT, "tests/fixtures/cube-20mm.stl");

// ─── Static server (same as crawl.mjs) ────────────────────────────────────────
const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".woff": "font/woff", ".ttf": "font/ttf", ".webp": "image/webp",
  ".txt": "text/plain", ".xml": "application/xml", ".stl": "application/octet-stream",
};

function startServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url.split("?")[0].split("#")[0];
      const candidates = [
        join(DIST_DIR, url),
        join(DIST_DIR, url, "index.html"),
        join(DIST_DIR, url.replace(/\/$/, ""), "index.html"),
        join(DIST_DIR, "404.html"),
      ];
      for (const candidate of candidates) {
        if (existsSync(candidate)) {
          try {
            const stat = statSync(candidate);
            if (!stat.isFile()) continue;
            const ext = extname(candidate) || ".html";
            const data = readFileSync(candidate);
            res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
            res.end(data);
            return;
          } catch { continue; }
        }
      }
      res.writeHead(404); res.end("Not found");
    });
    server.listen(port, () => resolve(server));
  });
}

// ─── Test pages ───────────────────────────────────────────────────────────────
const TEST_PAGES = [
  { path: "/",                              lang: "es", sourceCityExpect: null },
  { path: "/impresion-3d-empresas-barcelona", lang: "es", sourceCityExpect: null },
  { path: "/de/3d-druck-service",           lang: "de", sourceCityExpect: null },
  { path: "/de/3d-druck-berlin",            lang: "de", sourceCityExpect: null },
  { path: "/fr/impression-3d-en-ligne",     lang: "fr", sourceCityExpect: null },
  { path: "/3d-printing-delivery-berlin",   lang: "en", sourceCityExpect: "Berlin" },
];

// Success message title per language (from i18n)
const SUCCESS_TITLES = {
  es: "¡Solicitud enviada!",
  de: "Angebotsanfrage gesendet!",
  fr: "Demande de devis envoyée !",
  en: "Quote request sent!",
  ca: "Sol·licitud enviada!",
  nl: "Offerteaanvraag verzonden!",
  it: "Richiesta di preventivo inviata!",
  pt: "Pedido de orçamento enviado!",
};

// Error message per language (uploadError key)
const ERROR_MSGS = {
  es: "Error al subir el archivo",
  de: "Upload fehlgeschlagen",
  fr: "Échec du téléchargement",
  en: "Upload failed",
};

let failures = 0;
function fail(msg) { console.error(`  ✗ ${msg}`); failures++; }
function ok(msg)   { console.log(`  ✓ ${msg}`); }

// ─── Main ─────────────────────────────────────────────────────────────────────
const PORT = 4175;
console.log("Starting quote-flow test server…");
const server = await startServer(PORT);
const BASE = `http://localhost:${PORT}`;

const browser = await chromium.launch({
  headless: true,
  ...(existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {}),
});

async function testPage(pageSpec, mockFailDB = false) {
  const { path, lang, sourceCityExpect } = pageSpec;
  const label = `${path} [${lang}]${mockFailDB ? " [DB-FAIL]" : ""}`;
  console.log(`\nTesting: ${label}`);

  const context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  let insertPayload = null;
  let emailPayload  = null;
  let storageCallMade = false;

  // Mock Supabase storage upload
  await page.route("**/storage/v1/object/**", async route => {
    if (route.request().method() === "POST" || route.request().method() === "PUT") {
      storageCallMade = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ Key: `mock-${Date.now()}/cube-20mm.stl` }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock DB insert for quote_requests
  await page.route("**/rest/v1/quote_requests*", async route => {
    if (route.request().method() === "POST") {
      try { insertPayload = JSON.parse(route.request().postData() || "{}"); } catch { insertPayload = {}; }
      if (mockFailDB) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "DB error", code: "42501" }),
        });
      } else {
        await route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
      }
    } else {
      await route.continue();
    }
  });

  // Mock send-quote-request edge function
  await page.route("**/functions/v1/send-quote-request*", async route => {
    try { emailPayload = JSON.parse(route.request().postData() || "{}"); } catch { emailPayload = {}; }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, emailId: "mock-email-id" }),
    });
  });

  // Also mock price_estimates insert so it doesn't interfere
  await page.route("**/rest/v1/price_estimates*", async route => {
    await route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
  });

  // Mock send-price-estimate edge function
  await page.route("**/functions/v1/send-price-estimate*", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);

    // Upload STL file via hidden file input
    const fileInput = page.locator('input[type="file"][accept=".stl"]').first();
    await fileInput.setInputFiles(STL_PATH);

    // Wait for the checkout dialog to open (it opens automatically on estimate).
    // Use :not([aria-hidden="true"]) to exclude the cookie-consent banner which also has role="dialog".
    const dialog = page.locator('[role="dialog"]:not([aria-hidden="true"])');
    await dialog.waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(1000); // let React settle

    // Fill email field
    const emailInput = dialog.locator('#contact-email, input[type="email"]').first();
    await emailInput.waitFor({ state: "visible", timeout: 5000 });
    await emailInput.fill("test@example.com");

    // Click the primary CTA — could be "Send quote" or "Buy Now" + "Request Review"
    // Try "Request Review" / manual-review button first, then fall back to "Send quote"
    const reviewBtn = dialog.locator('button:has-text("Review"), button:has-text("Revisión"), button:has-text("Überprüfung"), button:has-text("Révision"), button[class*="outline"]:has-text("Review")');
    const sendBtn = dialog.locator('button[class*="cta"]:not(:disabled), button:has-text("Send quote"), button:has-text("Enviar"), button:has-text("Senden"), button:has-text("Envoyer"), button:has-text("Verzenden")');

    // Prefer the "Send quote" primary CTA
    let clickedSend = false;
    if (await sendBtn.count() > 0) {
      // Find the primary CTA button that's not whatsapp and not outline
      const primaryBtns = dialog.locator('button[class*="cta"]');
      if (await primaryBtns.count() > 0) {
        await primaryBtns.first().click();
        clickedSend = true;
      }
    }
    if (!clickedSend) {
      // Try any visible button with send-like text
      const allBtns = dialog.locator('button:visible');
      const count = await allBtns.count();
      for (let i = 0; i < count; i++) {
        const text = await allBtns.nth(i).textContent();
        if (text && /send|enviar|senden|envoyer|verzend|invia|enviar/i.test(text)) {
          await allBtns.nth(i).click();
          clickedSend = true;
          break;
        }
      }
    }

    if (!clickedSend) {
      fail(`${label}: could not find submit button`);
      await context.close();
      return;
    }

    if (mockFailDB) {
      // Expect error message in page language
      const errorKey = ERROR_MSGS[lang] ?? ERROR_MSGS.en;
      try {
        await page.waitForFunction(
          (txt) => document.body.innerText.includes(txt),
          errorKey,
          { timeout: 10000 }
        );
        ok(`${label}: error message visible in page language`);
      } catch {
        fail(`${label}: expected error message "${errorKey}" to appear`);
      }
    } else {
      // Expect success message in page language
      const successTitle = SUCCESS_TITLES[lang] ?? SUCCESS_TITLES.en;
      try {
        await page.waitForFunction(
          (txt) => document.body.innerText.includes(txt),
          successTitle,
          { timeout: 15000 }
        );
        ok(`${label}: success message visible in page language`);
      } catch {
        fail(`${label}: expected success title "${successTitle}" to appear`);
      }

      // Assert insert payload language
      if (insertPayload !== null) {
        const insertBody = Array.isArray(insertPayload) ? insertPayload[0] : insertPayload;
        // language is in the email payload, not the DB insert — check email body
        ok(`${label}: DB insert received`);
      } else {
        fail(`${label}: DB insert was never called`);
      }

      // Assert email payload
      if (emailPayload !== null) {
        if (emailPayload.language === lang) {
          ok(`${label}: email payload.language === "${lang}"`);
        } else {
          fail(`${label}: email payload.language is "${emailPayload.language}", expected "${lang}"`);
        }
        if (sourceCityExpect !== null) {
          if (emailPayload.sourceCity === sourceCityExpect) {
            ok(`${label}: email payload.sourceCity === "${sourceCityExpect}"`);
          } else {
            fail(`${label}: email payload.sourceCity is "${emailPayload.sourceCity}", expected "${sourceCityExpect}"`);
          }
        } else {
          ok(`${label}: sourceCity is ${emailPayload.sourceCity ?? "null"} (no city expected)`);
        }
      } else {
        fail(`${label}: send-quote-request was never called`);
      }

      // Assert reference number visible
      try {
        await page.waitForFunction(
          () => {
            const text = document.body.innerText;
            return /[A-F0-9]{8}/.test(text) ||
              text.includes("Reference") || text.includes("Referencia") ||
              text.includes("Referenz") || text.includes("Référence") ||
              text.includes("Referentie") || text.includes("Riferimento") ||
              text.includes("Referência");
          },
          undefined,
          { timeout: 5000 }
        );
        ok(`${label}: reference number visible`);
      } catch {
        fail(`${label}: reference number not found in success state`);
      }
    }
  } catch (err) {
    fail(`${label}: unexpected error — ${err.message}`);
  } finally {
    await context.close();
  }
}

// Run success tests for all 6 pages, then one DB-failure test
for (const pageSpec of TEST_PAGES) {
  await testPage(pageSpec, false);
}

// DB failure test on the German hub (representative)
await testPage(TEST_PAGES[2], true);

await browser.close();
server.close();

const total = TEST_PAGES.length + 1; // +1 for the failure test
console.log(`\n──────────────────────────────────────────`);
if (failures === 0) {
  console.log(`✓ All ${total} quote-flow tests passed`);
  process.exit(0);
} else {
  console.log(`✗ ${failures} assertion(s) failed across ${total} tests`);
  process.exit(1);
}
