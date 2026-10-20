/**
 * Playwright smoke-test: cookie-consent returning visitors trigger lazy-recorder.js.
 *
 * Checks:
 *   1. Visitor with cookie-consent=accepted in localStorage → recorder requested.
 *   2. Visitor with no consent stored → recorder NOT requested.
 *
 * Usage: node scripts/qa/replay-check.mjs
 * Requires: npm run build first.
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '../..');
const DIST_DIR = join(ROOT, 'dist');

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.webp': 'image/webp', '.txt': 'text/plain', '.xml': 'application/xml',
};

if (!existsSync(DIST_DIR)) {
  console.error('SKIP: dist/ not found — run npm run build first');
  process.exit(0);
}

function startServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url.split('?')[0].split('#')[0];
      const candidates = [
        join(DIST_DIR, url),
        join(DIST_DIR, url, 'index.html'),
        join(DIST_DIR, url.replace(/\/$/, ''), 'index.html'),
        join(DIST_DIR, 'index.html'),
      ];
      for (const c of candidates) {
        if (existsSync(c) && !c.endsWith('/')) {
          const ext = extname(c) || '.html';
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
          res.end(readFileSync(c));
          return;
        }
      }
      res.writeHead(404); res.end('not found');
    });
    server.listen(port, () => resolve(server));
  });
}

const PORT = 8765;
const BASE = `http://localhost:${PORT}`;

const server = await startServer(PORT);
let passed = 0;
let failed = 0;

function ok(msg) { console.log(`  PASS  ${msg}`); passed++; }
function fail(msg) { console.error(`  FAIL  ${msg}`); failed++; }

// Shared PostHog mock — returns sessionRecording config to trigger recorder load.
async function mockPostHog(context) {
  // /decide/ — legacy endpoint (some PH versions use this)
  await context.route('**/decide*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      config: {},
      sessionRecording: { endpoint: '/s/', recorderVersion: 'v2' },
      featureFlags: {},
      errorsWhileComputingFlags: false,
    }),
  }));
  // /flags/ — newer endpoint used by PH ≥ 1.3x
  await context.route('**/flags/*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      sessionRecording: { endpoint: '/s/', recorderVersion: 'v2' },
      featureFlags: {},
      errorsWhileComputingFlags: false,
    }),
  }));
  // /array/*/config — covers both eu.i.posthog.com AND eu-assets.i.posthog.com
  await context.route(/posthog\.com\/array\/[^/]+\/config/, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      token: 'test',
      supportedCompression: [],
      sessionRecording: { endpoint: '/s/', recorderVersion: 'v2' },
    }),
  }));
  // Stub all other posthog asset requests (exception-autocapture, dead-clicks, etc.)
  await context.route(/posthog\.com\/static\//, route => route.fulfill({
    status: 200, contentType: 'application/javascript', body: '/* stub */',
  }));
  // Stub the recorder itself so it doesn't fail with a network error
  await context.route(/lazy.?recorder|recorder.*\.js/, route => route.fulfill({
    status: 200, contentType: 'application/javascript', body: '/* stub */',
  }));
}

const browser = await chromium.launch({ headless: true });

// ── Case 1: accepted consent → recorder requested ─────────────────────────────
{
  const context = await browser.newContext();
  await mockPostHog(context);

  // Inject localStorage before page scripts run
  await context.addInitScript(() => {
    localStorage.setItem('cookie-consent', 'accepted');
  });

  let recorderRequested = false;
  context.on('request', req => {
    if (/lazy.?recorder|recorder.*\.js/.test(req.url())) recorderRequested = true;
  });

  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  recorderRequested
    ? ok('accepted consent → lazy-recorder.js requested')
    : fail('accepted consent → lazy-recorder.js NOT requested (fix not working)');

  await context.close();
}

// ── Case 2: no consent → recorder NOT requested ───────────────────────────────
{
  const context = await browser.newContext();
  await mockPostHog(context);
  // No localStorage setup — fresh visitor

  let recorderRequested = false;
  context.on('request', req => {
    if (/lazy.?recorder|recorder.*\.js/.test(req.url())) recorderRequested = true;
  });

  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  !recorderRequested
    ? ok('no consent → lazy-recorder.js NOT requested')
    : fail('no consent → lazy-recorder.js WAS requested (unexpected)');

  await context.close();
}

await browser.close();
server.close();

console.log(`\nreplay-check: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
