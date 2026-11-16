#!/usr/bin/env node
// Smoke-test the production build against a vite preview server.
// Walks /, /track, /pedido/test-token, /presupuesto/test-token and /admin,
// recording any uncaught console errors or page crashes. Run after
// `npm run build` with `npx vite preview --port 4173` already running.

import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const ROUTES = ["/", "/track", "/pedido/test-token", "/presupuesto/test-token", "/admin"];

const browser = await chromium.launch();
const results = [];

for (const path of ROUTES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  const pageErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text().slice(0, 300)); });
  page.on("pageerror", (err) => { pageErrors.push(String(err).slice(0, 400)); });
  let status = null;
  try {
    const resp = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 20_000 });
    status = resp?.status() ?? null;
    // Give the SPA a moment to render past Suspense + run initial effects.
    await page.waitForTimeout(1500);
  } catch (err) {
    pageErrors.push(`[navigation] ${err instanceof Error ? err.message : String(err)}`);
  }
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const hasVisibleContent = bodyText.trim().length > 20;
  results.push({ path, status, errors, pageErrors, hasVisibleContent, bodyPreview: bodyText.replace(/\s+/g, " ").slice(0, 160) });
  await context.close();
}
await browser.close();

for (const r of results) {
  console.log("────────────────────────────────────────");
  console.log(`${r.path}  status=${r.status}  visibleContent=${r.hasVisibleContent}`);
  console.log(`  body: ${r.bodyPreview}`);
  if (r.pageErrors.length) {
    console.log(`  pageerror (${r.pageErrors.length}):`);
    r.pageErrors.forEach((e) => console.log(`    ! ${e}`));
  }
  if (r.errors.length) {
    console.log(`  console.error (${r.errors.length}):`);
    r.errors.slice(0, 8).forEach((e) => console.log(`    - ${e}`));
    if (r.errors.length > 8) console.log(`    … ${r.errors.length - 8} more`);
  }
}

const hardFail = results.some((r) => r.pageErrors.length > 0 || !r.hasVisibleContent);
process.exit(hardFail ? 1 : 0);
