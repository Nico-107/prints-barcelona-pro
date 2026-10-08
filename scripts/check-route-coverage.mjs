// Validates that every literal <Route path> in App.tsx is either prerendered
// or covered by an explicit vercel.json rewrite, and that the catch-all
// rewrite has been removed. Also verifies dist/404.html exists and is noindex.
//
// Checks:
//   1. No literal route (except "*") is un-prerendered AND un-rewritten.
//   2. vercel.json has no "/(.*)" catch-all rewrite source.
//   3. dist/404.html exists and contains a noindex robots meta tag.

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const APP_TSX   = resolve(root, "src/App.tsx");
const VERCEL    = resolve(root, "vercel.json");
const DIST      = resolve(root, "dist");

// ── parse App.tsx for literal <Route path="..."> values ─────────────────────

const appSrc = readFileSync(APP_TSX, "utf-8");
// Match path="..." that contain a literal string (not an expression).
const routeRe = /path="([^"]+)"/g;
const paths = [];
let m;
while ((m = routeRe.exec(appSrc)) !== null) {
  paths.push(m[1]);
}

// ── parse vercel.json ────────────────────────────────────────────────────────

const vercelConfig = JSON.parse(readFileSync(VERCEL, "utf-8"));
const rewriteSources = (vercelConfig.rewrites ?? []).map((r) => r.source);

// Convert a vercel rewrite source pattern to a JS RegExp.
// Segments ":param" → "[^/]+"   ":param*" → ".+"
function sourceToRegex(src) {
  const segments = src.split("/");
  const reSegments = segments.map((seg) => {
    if (!seg) return "";
    if (/^:[a-zA-Z0-9_]+\*$/.test(seg)) return ".+";
    if (/^:[a-zA-Z0-9_]+$/.test(seg)) return "[^/]+";
    return seg.replace(/[-.*+?^${}()|[\]\\]/g, "\\$&");
  });
  return new RegExp(`^${reSegments.join("/")}$`);
}

const rewritePatterns = rewriteSources.map((s) => ({
  source: s,
  re: sourceToRegex(s),
}));

function isCoveredByRewrite(path) {
  // Replace :param with a test value for matching
  const testPath = path.replace(/:[a-zA-Z0-9_]+/g, "test-value");
  return rewritePatterns.some(({ re }) => re.test(testPath));
}

function isPrerendered(path) {
  if (path === "/") return existsSync(resolve(DIST, "index.html"));
  const file = resolve(DIST, path.replace(/^\//, ""), "index.html");
  return existsSync(file);
}

// ── run checks ───────────────────────────────────────────────────────────────

let errors = 0;

// Check 1: every literal route is prerendered or covered by a rewrite
for (const path of paths) {
  if (path === "*") continue;
  const isDynamic = path.includes(":");
  if (isDynamic) {
    if (!isCoveredByRewrite(path)) {
      console.error(`[check-route-coverage] FAIL (check 1): dynamic route not in vercel.json rewrites: ${path}`);
      errors++;
    }
  } else {
    if (!isPrerendered(path) && !isCoveredByRewrite(path)) {
      console.error(`[check-route-coverage] FAIL (check 1): route not prerendered and not in rewrites: ${path}`);
      errors++;
    }
  }
}

// Check 2: no catch-all rewrite
if (rewriteSources.some((s) => s === "/(.*)")) {
  console.error('[check-route-coverage] FAIL (check 2): vercel.json still has a "/(.*)" catch-all rewrite — remove it.');
  errors++;
}

// Check 3: dist/404.html exists and has noindex
const html404 = resolve(DIST, "404.html");
if (!existsSync(html404)) {
  console.error("[check-route-coverage] FAIL (check 3): dist/404.html is missing.");
  errors++;
} else {
  const content = readFileSync(html404, "utf-8");
  if (!/name="robots"[^>]*content="[^"]*noindex/i.test(content)) {
    console.error("[check-route-coverage] FAIL (check 3): dist/404.html exists but lacks noindex robots meta.");
    errors++;
  }
}

if (errors > 0) {
  console.error(`[check-route-coverage] ${errors} error(s). Fix them before shipping.`);
  process.exit(1);
}

console.log(`[check-route-coverage] OK: ${paths.length - 1} routes checked (excl. *), vercel.json clean, dist/404.html present with noindex.`);
