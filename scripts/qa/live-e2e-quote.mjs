/**
 * Live E2E test: submit one real quote from /de/3d-druck-service
 * with real Supabase (real DB insert + real email send).
 */
import { chromium } from "playwright";
import { fileURLToPath } from "url";

const STL_PATH = fileURLToPath(new URL("../../tests/fixtures/cube-20mm.stl", import.meta.url));
const BASE = "http://localhost:5174";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

const networkLog = [];
page.on("response", resp => {
  const url = resp.url();
  if (url.includes("/rest/v1/quote_requests") || url.includes("/functions/v1/send-quote-request") || url.includes("/storage/v1/object")) {
    const entry = `${resp.status()} ${resp.request().method()} ${url.replace(/https?:\/\/[^/]+/, "<supabase>")}`;
    networkLog.push(entry);
    console.log(`[NET] ${entry}`);
  }
});

const consoleErrors = [];
page.on("console", msg => {
  if (msg.type() === "error" || (msg.type() === "log" && msg.text().toLowerCase().includes("error"))) {
    consoleErrors.push(msg.text());
    if (!msg.text().includes("ERR_NAME_NOT_RESOLVED") && !msg.text().includes("GoTrueClient")) {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text().slice(0, 200)}`);
    }
  }
});

try {
  console.log("Navigating to /de/3d-druck-service...");
  await page.goto(`${BASE}/de/3d-druck-service`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  // Dismiss cookie consent via JS
  const dismissed = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(
      b => b.textContent?.trim() === "Akzeptieren" || b.textContent?.trim() === "Accept"
    );
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (dismissed) { console.log("Dismissed cookie consent."); await page.waitForTimeout(500); }

  // Scroll to calculator
  await page.evaluate(() => {
    const el = document.getElementById("calculator");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await page.waitForTimeout(500);

  console.log("Uploading STL file...");
  const fileInput = page.locator('input[type="file"][accept=".stl"]').first();
  await fileInput.setInputFiles(STL_PATH);

  console.log("Waiting for estimate dialog...");
  const dialog = page.locator('[role="dialog"]:not([aria-hidden="true"])');
  await dialog.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(1500);

  console.log("Scrolling to email input and filling...");
  // Scroll to #contact-email inside the dialog's scrollable area
  await page.evaluate(() => {
    const el = document.querySelector('#contact-email');
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await page.waitForTimeout(300);

  // Use Playwright fill (properly triggers React synthetic events)
  const emailInput = page.locator('#contact-email').first();
  await emailInput.waitFor({ state: "visible", timeout: 10000 });
  await emailInput.fill("011107miko@gmail.com");

  // Fill notes textarea if present
  const notesArea = page.locator('[role="dialog"]:not([aria-hidden="true"]) textarea').first();
  if (await notesArea.count() > 0) {
    await notesArea.fill("QA TEST, ignore");
  }
  await page.waitForTimeout(300);

  // Debug: list dialog buttons
  const btnList = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
    if (!dlg) return "NO DIALOG";
    return [...dlg.querySelectorAll("button")].map(b => `"${b.textContent?.trim().slice(0, 30)}" (disabled=${b.disabled})`).join(" | ");
  });
  console.log("Dialog buttons:", btnList);

  console.log("Clicking submit button...");
  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
    if (!dlg) return;
    const btns = [...dlg.querySelectorAll("button")].filter(b => !b.disabled);
    const sendBtn = btns.find(b => /senden|send|enviar|invia|envoyer|verzend/i.test(b.textContent ?? ""));
    if (sendBtn) sendBtn.click();
    else if (btns.length > 0) btns[0].click();
  });

  console.log("Waiting for result (15 s)...");
  let resultText = "";
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes("Angebotsanfrage gesendet!") ||
            document.body.innerText.includes("Upload fehlgeschlagen"),
      undefined,
      { timeout: 15000 }
    );
    resultText = await page.evaluate(() => document.body.innerText.includes("Angebotsanfrage gesendet!") ? "SUCCESS" : "ERROR");
  } catch {
    resultText = "TIMEOUT (no success/error message within 15 s)";
  }
  console.log(`Result: ${resultText}`);

  await page.waitForTimeout(3000);

} catch (err) {
  console.error(`Live test error: ${err.message}`);
} finally {
  await browser.close();
}

console.log("\n── Network log ─────────────────────────────────────");
if (networkLog.length) networkLog.forEach(e => console.log(" ", e));
else console.log("  (no Supabase network calls captured — DNS may not be reachable from headless browser)");

console.log("\n── Console errors ───────────────────────────────────");
const filteredErrors = consoleErrors.filter(e => !e.includes("ERR_NAME_NOT_RESOLVED") && !e.includes("GoTrueClient"));
if (filteredErrors.length) filteredErrors.forEach(e => console.log(" ", e.slice(0, 200)));
else console.log("  (none)");

console.log("\nNote: customer confirmation email (Step 7) arrives only after Lovable redeploy of send-quote-request.");
console.log("AFTER MERGE: REDEPLOY send-quote-request IN LOVABLE");
