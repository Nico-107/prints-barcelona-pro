/**
 * QA quote-flow + buy-flow tests for Dimension3D.
 * Uploads cube-20mm.stl on representative pages and tests both flows:
 *   - Quote flow: fill email, click Review/Send quote → success message
 *   - Buy flow:   pick fulfillment, click Buy Now → redirect to success
 *   - Silent-fail guards: Buy Now without fulfillment shows error,
 *                         Review without contact shows error
 * Supabase storage, DB insert, and edge function calls are intercepted (mocked).
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

// ─── Static server ─────────────────────────────────────────────────────────────
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

const ERROR_MSGS = {
  es: "Error al subir el archivo",
  de: "Upload fehlgeschlagen",
  fr: "Échec du téléchargement",
  en: "Upload failed",
};

const BUY_SUCCESS_TITLES = {
  es: "¡Pago confirmado",
  ca: "Pagament confirmat",
  en: "Payment confirmed",
  de: "Zahlung bestätigt",
  fr: "Paiement confirmé",
  nl: "Betaling bevestigd",
  it: "Pagamento confermato",
  pt: "Pagamento confirmado",
};

// Contact missing error per language
const CONTACT_MISSING_MSGS = {
  es: "Introduce al menos un método de contacto",
  de: "Bitte gib mindestens eine Kontaktmöglichkeit an",
  fr: "Veuillez indiquer au moins un moyen de contact",
  en: "Please provide at least one contact method",
};

// Fulfillment required error per language
const FULFILLMENT_REQUIRED_MSGS = {
  es: "Selecciona recogida o envío para continuar",
  de: "Bitte wähle Abholung oder Versand",
  fr: "Veuillez choisir retrait ou livraison",
  en: "Please select pickup or shipping to continue",
};

let failures = 0;
function fail(msg) { console.error(`  ✗ ${msg}`); failures++; }
function ok(msg)   { console.log(`  ✓ ${msg}`); }

// ─── Shared mock setup ────────────────────────────────────────────────────────
async function setupCommonMocks(page, { mockFailDB = false, mockCheckoutUrl = null } = {}) {
  // Storage
  await page.route("**/storage/v1/object/**", async route => {
    if (route.request().method() === "POST" || route.request().method() === "PUT") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ Key: `mock-${Date.now()}/cube-20mm.stl` }),
      });
    } else {
      await route.continue();
    }
  });

  // DB insert for quote_requests
  const inserted = { payload: null };
  await page.route("**/rest/v1/quote_requests*", async route => {
    if (route.request().method() === "POST") {
      try { inserted.payload = JSON.parse(route.request().postData() || "{}"); } catch { inserted.payload = {}; }
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

  // send-quote-request edge function
  const emailed = { payload: null };
  await page.route("**/functions/v1/send-quote-request*", async route => {
    try { emailed.payload = JSON.parse(route.request().postData() || "{}"); } catch { emailed.payload = {}; }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, emailId: "mock-email-id" }),
    });
  });

  // price_estimates
  await page.route("**/rest/v1/price_estimates*", async route => {
    await route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
  });

  // send-price-estimate
  await page.route("**/functions/v1/send-price-estimate*", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  // create-instant-checkout — mock so it doesn't cause unexpected navigations in quote tests
  await page.route("**/functions/v1/create-instant-checkout*", async route => {
    const url = mockCheckoutUrl ?? "about:blank";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ checkoutUrl: url }),
    });
  });

  return { inserted, emailed };
}

// ─── Upload file + wait for dialog ────────────────────────────────────────────
async function uploadAndOpenDialog(page) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(STL_PATH);
  const dialog = page.locator('[role="dialog"]:not([aria-hidden="true"])');
  await dialog.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(1000);
  return dialog;
}

// ─── Quote-flow test (fills email, clicks Review or Send quote) ───────────────
async function testPage(pageSpec, mockFailDB = false) {
  const { path, lang, sourceCityExpect } = pageSpec;
  const label = `${path} [${lang}]${mockFailDB ? " [DB-FAIL]" : ""}`;
  console.log(`\nTesting: ${label}`);

  const context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const { inserted, emailed } = await setupCommonMocks(page, { mockFailDB });

  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);

    const dialog = await uploadAndOpenDialog(page);

    // Fill email field
    const emailInput = dialog.locator('#contact-email, input[type="email"]').first();
    await emailInput.waitFor({ state: "visible", timeout: 5000 });
    await emailInput.fill("test@example.com");

    // Button click strategy for quote flow:
    //   1. Prefer the Review/Manual-review button — works in both buy-flow and quote-flow
    //      (it submits a quote without needing fulfillment selection).
    //   2. Fall back to primary CTA (Send quote in quote-only flow).
    //   3. Last resort: any send-like text.
    const REVIEW_RE = /Que lo revise|Have our team|Unser Team soll|Que notre équipe|Que el nostre|Laat ons team|Che il nostro|Que a nossa|review it first|Prüfen|Revisión gratis|Revisió gratis|Free review|Kostenlose Prüfung|Révision gratuite|Gratis beoordeling|Revisione gratuita|Revisão gratuita|Dateiprüfung|revisem|file review|revisamos|bestandscontrole/i;

    let clickedSend = false;
    const allBtns = dialog.locator('button:visible');
    const count = await allBtns.count();

    // Pass 1: Review button
    for (let i = 0; i < count && !clickedSend; i++) {
      const text = (await allBtns.nth(i).textContent() ?? "");
      if (REVIEW_RE.test(text)) {
        await allBtns.nth(i).click();
        clickedSend = true;
      }
    }

    // Pass 2: primary CTA (visible only — hidden slots from experiments must be skipped)
    if (!clickedSend) {
      const primaryBtns = dialog.locator('button[class*="cta"]:visible');
      if (await primaryBtns.count() > 0) {
        await primaryBtns.first().click();
        clickedSend = true;
      }
    }

    // Pass 3: send-like text
    if (!clickedSend) {
      for (let i = 0; i < count && !clickedSend; i++) {
        const text = await allBtns.nth(i).textContent();
        if (text && /send|enviar|senden|envoyer|verzend|invia/i.test(text)) {
          await allBtns.nth(i).click();
          clickedSend = true;
        }
      }
    }

    if (!clickedSend) {
      fail(`${label}: could not find submit button`);
      await context.close();
      return;
    }

    if (mockFailDB) {
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

      if (inserted.payload !== null) {
        ok(`${label}: DB insert received`);
      } else {
        fail(`${label}: DB insert was never called`);
      }

      if (emailed.payload !== null) {
        if (emailed.payload.language === lang) {
          ok(`${label}: email payload.language === "${lang}"`);
        } else {
          fail(`${label}: email payload.language is "${emailed.payload.language}", expected "${lang}"`);
        }
        if (sourceCityExpect !== null) {
          if (emailed.payload.sourceCity === sourceCityExpect) {
            ok(`${label}: email payload.sourceCity === "${sourceCityExpect}"`);
          } else {
            fail(`${label}: email payload.sourceCity is "${emailed.payload.sourceCity}", expected "${sourceCityExpect}"`);
          }
        } else {
          ok(`${label}: sourceCity is ${emailed.payload.sourceCity ?? "null"} (no city expected)`);
        }
      } else {
        fail(`${label}: send-quote-request was never called`);
      }

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

// ─── Helper: click the VISIBLE instance of a data-testid element ──────────────
// The checkout dialog renders actionSlot twice (desktop left column + mobile bar).
// Only one is visible at a time depending on viewport. This helper finds it.
async function clickVisible(dialog, testId) {
  const loc = dialog.locator(`[data-testid="${testId}"]`);
  const count = await loc.count();
  for (let i = 0; i < count; i++) {
    const el = loc.nth(i);
    if (await el.isVisible()) {
      await el.click();
      return true;
    }
  }
  throw new Error(`No visible element with data-testid="${testId}" found (${count} total)`);
}

// ─── Helper: wait until the visible Buy Now button is enabled ─────────────────
async function waitForBuyNowEnabled(dialog, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const loc = dialog.locator('[data-testid="buy-now-btn"]');
    const count = await loc.count();
    for (let i = 0; i < count; i++) {
      const el = loc.nth(i);
      if (await el.isVisible() && await el.isEnabled()) {
        return el;
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Buy Now button never became enabled within timeout');
}

// ─── Buy-flow test: pick fulfillment → Buy Now → redirect to success ──────────
async function testBuyFlowSuccess(path, lang, fulfillment, viewport) {
  const label = `BUY ${path} [${lang}] [${fulfillment}] [${viewport.width}px]`;
  console.log(`\nTesting: ${label}`);

  const context = await browser.newContext({ locale: "en-US", viewport });
  const page = await context.newPage();

  await setupCommonMocks(page, {
    mockCheckoutUrl: `${BASE}${path}?checkout=success`,
  });

  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);

    const dialog = await uploadAndOpenDialog(page);

    // Pick fulfillment using the compact picker (data-testid scoped to dialog)
    const fulfillmentTestId = fulfillment === "pickup" ? "compact-fulfillment-pickup" : "compact-fulfillment-shipping";
    await clickVisible(dialog, fulfillmentTestId);
    ok(`${label}: picked fulfillment "${fulfillment}"`);

    // Wait for Buy Now to become enabled (preUploadDone=true after mock upload resolves)
    const buyBtn = await waitForBuyNowEnabled(dialog);
    await buyBtn.click();
    ok(`${label}: clicked Buy Now`);

    // Wait for redirect to success URL
    await page.waitForURL(`**checkout=success**`, { timeout: 10000 });
    ok(`${label}: redirected to checkout=success URL`);

    // Wait for success banner (language-aware)
    const successTxt = BUY_SUCCESS_TITLES[lang] ?? BUY_SUCCESS_TITLES.en;
    await page.waitForFunction(
      (txt) => document.body.innerText.includes(txt),
      successTxt,
      { timeout: 5000 }
    );
    ok(`${label}: success banner visible ("${successTxt}")`);
  } catch (err) {
    fail(`${label}: ${err.message}`);
  } finally {
    await context.close();
  }
}

// ─── Silent-fail guard: Buy Now without fulfillment must show error ────────────
async function testBuyNoFulfillmentShowsError(path, lang) {
  const label = `BUY-NO-FULFILLMENT ${path} [${lang}]`;
  console.log(`\nTesting: ${label}`);

  const context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await setupCommonMocks(page);

  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);

    const dialog = await uploadAndOpenDialog(page);

    // Wait for Buy Now to be enabled, then click it WITHOUT picking fulfillment
    const buyBtn = await waitForBuyNowEnabled(dialog);
    await buyBtn.click();

    // Expect the fulfillment-required error to appear in the actions bar (not silently fail)
    try {
      await page.waitForFunction(
        () => {
          const text = document.body.innerText;
          return text.includes("Selecciona recogida") ||
            text.includes("select pickup") || text.includes("Select pickup") ||
            text.includes("Abholung") || text.includes("retrait") || text.includes("Retrait") ||
            text.includes("para continuar") || text.includes("to continue") ||
            text.includes("zum Fortfahren") || text.includes("pour continuer");
        },
        { timeout: 5000 }
      );
      ok(`${label}: fulfillment-required error visible — Buy Now did not fail silently`);
    } catch {
      fail(`${label}: Buy Now failed silently — no fulfillment error appeared`);
    }
  } catch (err) {
    fail(`${label}: ${err.message}`);
  } finally {
    await context.close();
  }
}

// ─── Silent-fail guard: Review without contact must show error ─────────────────
async function testReviewNoContactShowsError(path, lang) {
  const label = `REVIEW-NO-CONTACT ${path} [${lang}]`;
  console.log(`\nTesting: ${label}`);

  const context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await setupCommonMocks(page);

  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);

    const dialog = await uploadAndOpenDialog(page);

    // Do NOT fill email — leave contact fields empty

    // Find and click the Review button (outline secondary button)
    const REVIEW_RE = /Que lo revise|Have our team|Unser Team soll|Que notre équipe|Que el nostre|Laat ons team|Che il nostro|Que a nossa|review it first|Prüfen|Revisión gratis|Revisió gratis|Free review|Kostenlose Prüfung|Révision gratuite|Gratis beoordeling|Revisione gratuita|Revisão gratuita|Dateiprüfung|revisem|file review|revisamos|bestandscontrole/i;
    const allBtns = dialog.locator('button:visible');
    const count = await allBtns.count();
    let clickedReview = false;
    for (let i = 0; i < count && !clickedReview; i++) {
      const text = (await allBtns.nth(i).textContent() ?? "");
      if (REVIEW_RE.test(text)) {
        await allBtns.nth(i).click();
        clickedReview = true;
      }
    }

    if (!clickedReview) {
      // No Review button means this page is quote-only — test Send quote without contact
      const primaryBtns = dialog.locator('button[class*="cta"]:visible');
      if (await primaryBtns.count() > 0) {
        await primaryBtns.first().click();
        clickedReview = true;
      }
    }

    if (!clickedReview) {
      fail(`${label}: could not find Review or Send quote button`);
      await context.close();
      return;
    }

    // Expect a contact-required error to appear
    try {
      await page.waitForFunction(
        () => {
          const text = document.body.innerText;
          return text.includes("al menos un método") ||
            text.includes("at least one contact") ||
            text.includes("mindestens eine Kontakt") ||
            text.includes("au moins un moyen") ||
            text.includes("mètode de contacte") ||
            text.includes("contactmogelijkheid") ||
            text.includes("almeno un metodo") ||
            text.includes("pelo menos um contacto");
        },
        { timeout: 5000 }
      );
      ok(`${label}: contact-required error visible — Review did not fail silently`);
    } catch {
      fail(`${label}: Review failed silently — no contact error appeared`);
    }
  } catch (err) {
    fail(`${label}: ${err.message}`);
  } finally {
    await context.close();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const PORT = 4175;
console.log("Starting quote-flow test server…");
const server = await startServer(PORT);
const BASE = `http://localhost:${PORT}`;

const browser = await chromium.launch({
  headless: true,
  ...(existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {}),
});

// ── 1. Quote-flow: all 6 pages succeed ───────────────────────────────────────
console.log("\n═══ QUOTE-FLOW TESTS ═══");
for (const pageSpec of TEST_PAGES) {
  await testPage(pageSpec, false);
}

// ── 2. Quote-flow: DB-failure test ────────────────────────────────────────────
await testPage(TEST_PAGES[2], true);

// ── 3. Buy-flow: pickup on desktop, shipping on mobile ────────────────────────
console.log("\n═══ BUY-FLOW TESTS ═══");
await testBuyFlowSuccess("/", "es", "pickup",   { width: 1280, height: 900 });
await testBuyFlowSuccess("/", "es", "shipping", { width: 390,  height: 844 });

// ── 4. Silent-fail guards ──────────────────────────────────────────────────────
console.log("\n═══ SILENT-FAIL GUARD TESTS ═══");
await testBuyNoFulfillmentShowsError("/", "es");
await testReviewNoContactShowsError("/", "es");

await browser.close();
server.close();

const total = TEST_PAGES.length + 1 + 2 + 2; // quote(6) + db-fail(1) + buy(2) + silent-fail(2)
console.log(`\n──────────────────────────────────────────`);
if (failures === 0) {
  console.log(`✓ All ${total} quote-flow + buy-flow tests passed`);
  process.exit(0);
} else {
  console.log(`✗ ${failures} assertion(s) failed across ${total} tests`);
  process.exit(1);
}
