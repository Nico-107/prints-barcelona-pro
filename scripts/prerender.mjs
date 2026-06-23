// Prerender all SEO routes to static HTML after vite build + vite --ssr build.
// Usage: node scripts/prerender.mjs
// Run via: npm run build:ssg

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load the SSR bundle produced by `vite build --ssr`.
const { render, ALL_PAGES } = await import(
  resolve(root, "dist-ssr/entry-server.js")
);

// The client build output (already has __CITY_NAME__ / __GEO_REGION__ replaced
// by the city-html-tokens Vite plugin).
const template = readFileSync(resolve(root, "dist/index.html"), "utf-8");

const routes = ["/", "/track", ...ALL_PAGES.map((p) => p.slug)];

let ok = 0;
let fail = 0;

for (const route of routes) {
  try {
    const { html, helmetContext } = render(route);
    const { helmet } = helmetContext;

    // Collect all head tags produced by react-helmet-async.
    const headTags = [
      helmet.title?.toString() ?? "",
      helmet.priority?.toString() ?? "",
      helmet.meta?.toString() ?? "",
      helmet.link?.toString() ?? "",
      helmet.script?.toString() ?? "",
    ]
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n    ");

    // Apply html-level attributes (e.g. lang="en").
    const htmlAttrs = helmet.htmlAttributes?.toString() ?? "";

    let output = template
      // Inject SSR'd body HTML.
      .replace("<!--app-html-->", html)
      // Inject helmet head tags.
      .replace("<!--app-head-->", headTags)
      // Mark root div so main.tsx knows to use hydrateRoot.
      .replace('<div id="root"', `<div id="root" data-prerendered="${route}"`);

    // Override the html lang attribute.
    if (htmlAttrs) {
      output = output.replace('<html lang="es">', `<html ${htmlAttrs}>`);
    }

    const filePath =
      route === "/"
        ? resolve(root, "dist/index.html")
        : resolve(root, "dist", route.replace(/^\//, ""), "index.html");

    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, output, "utf-8");
    console.log(`  ✓  ${route}`);
    ok++;
  } catch (err) {
    console.error(`  ✗  ${route}: ${err.message}`);
    fail++;
  }
}

console.log(`\nPrerender complete: ${ok} succeeded, ${fail} failed.`);
if (fail > 0) process.exit(1);
