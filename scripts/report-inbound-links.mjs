// Reports, for each tracked URL, how many OTHER prerendered pages link to it
// via a plain <a href>. Report only — not part of the build chain.
// Usage: node scripts/report-inbound-links.mjs

import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");
const BASE = "https://www.dimension3dprints.com";

const TRACKED = [
  "/precio-impresion-3d-barcelona",
  "/piezas-funcionales-barcelona",
  "/piezas-personalizadas-3d-barcelona",
  "/custom-parts-barcelona",
  "/impresion-tpu-barcelona",
  "/pla-printing-barcelona",
  "/petg-printing-barcelona",
  "/ca/impressio-pla-barcelona",
  "/3d-file-checker",
  "/comprovador-arxiu-3d",
  "/blog/prototipos-rapidos-piezas-funcionales-barcelona",
  "/repuesto-descatalogado",
  "/ca/miniatures-3d-barcelona",
  "/3d-printing-delivery-london",
  "/3d-printing-delivery-lisbon",
  "/3d-printing-materials-comparison",
  "/3d-printing-turnaround-comparison",
  "/mit-3d-drucker-geld-verdienen",
];

function discoverRoutes(distDir) {
  const routes = ["/"];
  function walk(dir, prefix) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(resolve(dir, e.name), `${prefix}/${e.name}`);
      else if (e.name === "index.html") routes.push(prefix);
    }
  }
  for (const e of readdirSync(distDir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(resolve(distDir, e.name), `/${e.name}`);
  }
  return routes;
}

const routes = discoverRoutes(DIST);

// Build a map: target route → Set of source routes linking to it
const inbound = new Map(TRACKED.map((t) => [t, new Set()]));

for (const route of routes) {
  const file = route === "/"
    ? resolve(DIST, "index.html")
    : resolve(DIST, route.replace(/^\//, ""), "index.html");
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf-8");

  // Match <a href="/path"> and <a href="https://www.dimension3dprints.com/path">
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    // Normalise absolute URL to relative
    if (href.startsWith(BASE)) href = href.slice(BASE.length) || "/";
    // Strip query/hash
    href = href.split(/[?#]/)[0];
    // Strip trailing slash (except /)
    if (href !== "/" && href.endsWith("/")) href = href.slice(0, -1);

    if (inbound.has(href) && href !== route) {
      inbound.get(href).add(route);
    }
  }
}

const COL1 = 52;
const COL2 = 6;
console.log("\nInbound links report (prerendered pages only)\n");
console.log("URL".padEnd(COL1) + "COUNT".padStart(COL2) + "  STATUS");
console.log("─".repeat(COL1 + COL2 + 10));

for (const target of TRACKED) {
  const srcs = inbound.get(target);
  const count = srcs.size;
  const status = count >= 4 ? "✓" : `✗ need ${4 - count} more`;
  console.log(target.padEnd(COL1) + String(count).padStart(COL2) + "  " + status);
}

const below4 = TRACKED.filter((t) => inbound.get(t).size < 4);
console.log(`\n${below4.length} URL(s) below 4 inbound links.\n`);
