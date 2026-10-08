// Validates dist/sitemap.xml against the set of prerendered routes in dist/.
// Fails the build if:
//   1. A sitemap URL is not prerendered (stale entry).
//   2. A duplicate <loc> exists.
//   3. Any <loc> does not start with the canonical base URL.
//   4. A prerendered, indexable route that is not on the exclusion list is missing from the sitemap.

import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const BASE_URL = "https://www.dimension3dprints.com";
const SITEMAP = resolve(root, "dist/sitemap.xml");
const DIST = resolve(root, "dist");

// Routes that are prerendered but intentionally excluded from the sitemap.
// /creator, /privacy, /lemon → noindex meta tag
// /track → utility page, policy decision
const SITEMAP_EXCLUSIONS = new Set(["/creator", "/privacy", "/lemon", "/track"]);

// ── helpers ─────────────────────────────────────────────────────────────────

function readSitemapLocs(xml) {
  const locs = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1].trim());
  return locs;
}

function discoverPrerenderedRoutes(distDir) {
  const routes = [];
  function walk(dir, prefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(resolve(dir, entry.name), `${prefix}/${entry.name}`);
      } else if (entry.name === "index.html") {
        routes.push(prefix || "/");
      }
    }
  }
  // dist/index.html → "/"
  if (existsSync(resolve(distDir, "index.html"))) routes.push("/");
  for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      walk(resolve(distDir, entry.name), `/${entry.name}`);
    }
  }
  return routes;
}

function isNoindex(route) {
  const path = route === "/"
    ? resolve(DIST, "index.html")
    : resolve(DIST, route.replace(/^\//, ""), "index.html");
  if (!existsSync(path)) return false;
  const html = readFileSync(path, "utf-8");
  return /name="robots"[^>]*content="[^"]*noindex/i.test(html);
}

// ── main ────────────────────────────────────────────────────────────────────

if (!existsSync(SITEMAP)) {
  console.error("[check-sitemap] dist/sitemap.xml not found — run build first.");
  process.exit(1);
}

const xml = readFileSync(SITEMAP, "utf-8");
const locs = readSitemapLocs(xml);
const prerendered = new Set(discoverPrerenderedRoutes(DIST));

let errors = 0;

// Check 3: all <loc> start with BASE_URL
for (const loc of locs) {
  if (!loc.startsWith(BASE_URL + "/") && loc !== BASE_URL) {
    console.error(`[check-sitemap] FAIL (check 3): <loc> does not start with ${BASE_URL}: ${loc}`);
    errors++;
  }
}

// Check 2: no duplicate <loc>
const seen = new Map();
for (const loc of locs) {
  seen.set(loc, (seen.get(loc) ?? 0) + 1);
}
for (const [loc, count] of seen) {
  if (count > 1) {
    console.error(`[check-sitemap] FAIL (check 2): duplicate <loc> (×${count}): ${loc}`);
    errors++;
  }
}

// Strip base URL to get route, normalise trailing slash for /ca/
function locToRoute(loc) {
  let r = loc.slice(BASE_URL.length);
  if (r === "") r = "/";
  // Normalise /ca/ → /ca
  if (r !== "/" && r.endsWith("/")) r = r.slice(0, -1);
  return r;
}

const sitemapRoutes = new Set(locs.map(locToRoute));

// Check 1: every sitemap URL must be prerendered
for (const route of sitemapRoutes) {
  if (!prerendered.has(route)) {
    console.error(`[check-sitemap] FAIL (check 1): sitemap URL not prerendered: ${route}`);
    errors++;
  }
}

// Check 4: every prerendered, indexable, non-excluded route must be in the sitemap
for (const route of prerendered) {
  if (SITEMAP_EXCLUSIONS.has(route)) continue;
  if (isNoindex(route)) continue;
  if (!sitemapRoutes.has(route)) {
    console.error(`[check-sitemap] FAIL (check 4): prerendered indexable route missing from sitemap: ${route}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`[check-sitemap] ${errors} error(s) found. Fix them before shipping.`);
  process.exit(1);
}

console.log(`[check-sitemap] OK: ${locs.length} sitemap URLs, ${prerendered.size} prerendered routes — all checks passed.`);
