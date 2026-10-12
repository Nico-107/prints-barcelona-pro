/**
 * QA crawler for Dimension3D – checks R1–R8 on every sitemap route.
 * Usage: node scripts/qa/crawl.mjs
 * Exits 1 if any violations remain.
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { createReadStream } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "../..");
const DIST_DIR = join(ROOT, "dist");
const SCREENSHOTS_DIR = join(ROOT, "qa/screenshots");
const REPORT_PATH = join(ROOT, "docs/qa/report.md");
const SITE_URL = "https://www.dimension3dprints.com";

mkdirSync(SCREENSHOTS_DIR, { recursive: true });
mkdirSync(join(ROOT, "docs/qa"), { recursive: true });

// ─── Route → expected language ────────────────────────────────────────────────
function routeLanguage(path) {
  if (path === "/" || path === "") return "es";
  if (path.startsWith("/ca/") || path === "/ca") return "ca";
  if (path.startsWith("/de/")) return "de";
  if (path.startsWith("/nl/")) return "nl";
  if (path.startsWith("/fr/")) return "fr";
  if (path.startsWith("/it/")) return "it";
  if (path.startsWith("/pt/")) return "pt";
  if (path === "/3d-printing-delivery-paris") return "fr";
  if (path === "/3d-printing-delivery-berlin") return "de";
  if (path === "/3d-printing-delivery-amsterdam") return "nl";
  if (path === "/3d-printing-delivery-milan") return "it";
  if (path === "/3d-printing-delivery-rome") return "it";
  if (path === "/3d-printing-delivery-lisbon") return "pt";
  if (path === "/design-your-3d-part") return "en";
  if (path === "/dissenya-la-teva-peca-3d") return "ca";
  if (
    path === "/mit-3d-drucker-geld-verdienen" ||
    path === "/ist-3d-druck-geschaeft-rentabel" ||
    path === "/kunden-fuer-3d-druck-finden"
  ) return "de";
  if (
    path.startsWith("/3d-printing-") ||
    path.startsWith("/blog") ||
    path === "/maker-guide" ||
    path === "/privacy"
  ) return "en";
  return "es";
}

// ─── Language → html lang attribute ─────────────────────────────────────────
const LANG_TO_HTML = {
  es: "es", ca: "ca", en: "en", fr: "fr-FR", de: "de-DE", nl: "nl-NL", it: "it-IT", pt: "pt-PT",
};
// Also accept variants
const HTML_LANG_MAP = {
  "es": "es", "es-es": "es", "ca": "ca", "en": "en", "en-us": "en", "en-gb": "en",
  "fr": "fr", "fr-fr": "fr", "de": "de", "de-de": "de", "nl": "nl", "nl-nl": "nl",
  "it": "it", "it-it": "it", "pt": "pt", "pt-pt": "pt",
};

// ─── Known foreign UI strings per language ──────────────────────────────────
// If these appear on a page whose expected lang is different, it's R2 violation
const LANGUAGE_MARKERS = {
  es: ["Servicios", "Materiales", "Proyectos", "Subir archivo", "Reseñas", "Cómo funciona", "Inicio"],
  ca: ["Serveis", "Materials", "Projectes", "Pujar arxiu", "Ressenyes"],
  en: ["Services", "Materials", "Projects", "Upload file", "Reviews", "How it works", "Home"],
  fr: ["Services", "Matériaux", "Projets", "Télécharger un fichier", "Avis", "Accueil"],
  de: ["Leistungen", "Materialien", "Projekte", "Datei hochladen", "Kundenbewertungen", "Startseite"],
  nl: ["Diensten", "Materialen", "Projecten", "Bestand uploaden", "Beoordelingen", "Startpagina"],
  it: ["Servizi", "Materiali", "Progetti", "Carica file", "Recensioni", "Home"],
  pt: ["Serviços", "Materiais", "Projetos", "Carregar ficheiro", "Avaliações", "Início"],
};

// ─── Parse sitemap ────────────────────────────────────────────────────────────
function parseSitemap() {
  const xml = readFileSync(join(ROOT, "public/sitemap.xml"), "utf-8");
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((m) => {
    const url = m[1].trim();
    return url.replace(SITE_URL, "");
  });
}

// ─── Static file server ───────────────────────────────────────────────────────
const MIME_TYPES = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".woff": "font/woff", ".ttf": "font/ttf", ".webp": "image/webp",
  ".txt": "text/plain", ".xml": "application/xml",
};

function startServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url.split("?")[0].split("#")[0];
      // Try file directly, then /index.html, then 404.html
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
            const mime = MIME_TYPES[ext] || "application/octet-stream";
            res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-cache" });
            createReadStream(candidate).pipe(res);
            return;
          } catch {
            continue;
          }
        }
      }
      res.writeHead(404);
      res.end("Not found");
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

// ─── Check if a route exists in dist ─────────────────────────────────────────
function routeExists(path) {
  if (path === "/") return existsSync(join(DIST_DIR, "index.html"));
  const clean = path.replace(/\/$/, "");
  return (
    existsSync(join(DIST_DIR, clean + ".html")) ||
    existsSync(join(DIST_DIR, clean, "index.html"))
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const PORT = 7654;
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const LOCALES = ["en-US", "es-ES"];

async function crawl() {
  const routes = parseSitemap();
  console.log(`Found ${routes.length} routes in sitemap`);

  const server = await startServer(PORT);
  console.log(`Serving dist/ on http://127.0.0.1:${PORT}`);

  // Detect Playwright chromium executable
  let executablePath;
  if (existsSync("/opt/pw-browsers/chromium")) {
    const candidates = ["/opt/pw-browsers/chromium/chrome"];
    for (const c of candidates) {
      if (existsSync(c)) { executablePath = c; break; }
    }
  }

  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  const violations = [];

  // Process in batches for performance
  const BATCH_SIZE = 5;
  const combos = [];
  for (const route of routes) {
    for (const locale of LOCALES) {
      for (const vp of VIEWPORTS) {
        combos.push({ route, locale, vp });
      }
    }
  }

  let completed = 0;
  for (let i = 0; i < combos.length; i += BATCH_SIZE) {
    const batch = combos.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(({ route, locale, vp }) => checkPage(browser, route, locale, vp, PORT))
    );
    for (const v of batchResults.flat()) violations.push(v);
    completed += batch.length;
    if (completed % 100 === 0) {
      process.stdout.write(`  ${completed}/${combos.length} checked...\n`);
    }
  }

  await browser.close();
  server.close();

  // Write report
  writeReport(violations, routes);

  if (violations.length > 0) {
    console.error(`\n❌ ${violations.length} violations found. See docs/qa/report.md`);
    process.exit(1);
  } else {
    console.log("\n✅ 0 violations — all checks pass");
  }
}

async function checkPage(browser, route, locale, vp, port) {
  const violations = [];
  const url = `http://127.0.0.1:${port}${route === "/" ? "/" : route}`;
  const expectedLang = routeLanguage(route);
  const vpLabel = vp.name;

  const context = await browser.newContext({
    locale,
    viewport: { width: vp.width, height: vp.height },
  });

  const consoleErrors = [];
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
    if (msg.type() === "warning" && (
      msg.text().includes("Hydration failed") ||
      msg.text().includes("did not match")
    )) consoleErrors.push("HYDRATION: " + msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push("PAGE_ERR: " + err.message));

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1500);

    const context2 = { route, locale, vp: vpLabel };

    // ── R1: html lang matches expected language ─────────────────────────────
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    const normalizedHtmlLang = HTML_LANG_MAP[htmlLang?.toLowerCase()] ?? htmlLang;
    if (normalizedHtmlLang !== expectedLang) {
      violations.push({
        rule: "R1",
        ...context2,
        detail: `html[lang]="${htmlLang}" but expected lang="${expectedLang}"`,
      });
    }

    // ── R2: no foreign UI text in header/footer ─────────────────────────────
    if (vp.name === "desktop") { // only check once per page
      const headerText = await page.evaluate(() => {
        const header = document.querySelector("header");
        return header ? header.innerText : "";
      });
      const footerText = await page.evaluate(() => {
        const footer = document.querySelector("footer");
        return footer ? footer.innerText : "";
      });
      const uiText = (headerText + " " + footerText).toLowerCase();

      for (const [lang, markers] of Object.entries(LANGUAGE_MARKERS)) {
        if (lang === expectedLang) continue;
        // Skip if lang is "en" and expectedLang is "ca" (Catalan uses some English fallbacks)
        if (lang === "en" && (expectedLang === "ca" || expectedLang === "es")) continue;
        // Skip if lang is "es" and expectedLang is "ca" (they share some words)
        if (lang === "es" && expectedLang === "ca") continue;
        for (const marker of markers) {
          if (uiText.includes(marker.toLowerCase())) {
            violations.push({
              rule: "R2",
              ...context2,
              detail: `Foreign text "${marker}" (${lang}) found on ${expectedLang} page`,
            });
            break; // one violation per lang pair per page is enough
          }
        }
      }
    }

    // ── R3: language switcher ────────────────────────────────────────────────
    if (vp.name === "desktop") {
      const switcherInfo = await page.evaluate((expectedLang) => {
        // Try to find the language switcher
        const buttons = Array.from(document.querySelectorAll("header button, header a"));
        const langButtons = buttons.filter(el => {
          const text = el.textContent?.trim().toUpperCase();
          return ["ES", "EN", "CA", "FR", "DE", "NL", "IT", "PT"].includes(text ?? "");
        });
        return langButtons.map(el => ({
          text: el.textContent?.trim(),
          isActive: el.className.includes("bg-primary") || el.className.includes("font-medium"),
        }));
      }, expectedLang);

      if (switcherInfo.length === 0 && !["es", "ca"].includes(expectedLang)) {
        // No switcher visible might be OK for some pages
      } else if (switcherInfo.length > 0) {
        const activeItems = switcherInfo.filter(b => b.isActive);
        const expectedLabel = expectedLang.toUpperCase();
        const hasCorrectActive = activeItems.some(b => b.text?.toUpperCase() === expectedLabel);
        if (!hasCorrectActive) {
          violations.push({
            rule: "R3",
            ...context2,
            detail: `Active switcher item not "${expectedLabel}"; active: ${activeItems.map(b => b.text).join(",")}`,
          });
        }
      }
    }

    // ── R4: button labels ────────────────────────────────────────────────────
    if (vp.name === "desktop") {
      const buttonViolations = await page.evaluate((expectedLang) => {
        const issues = [];
        const allButtons = Array.from(document.querySelectorAll("button, a[role='button'], [class*='btn']"));
        const visibleButtons = allButtons.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight + 200;
        });
        for (const btn of visibleButtons.slice(0, 30)) { // check first 30 visible
          const text = btn.textContent?.trim().replace(/\s+/g, " ") ?? "";
          if (!text) continue;
          if (text.length < 2) {
            issues.push(`Too short: "${text}"`);
          } else if (text.length > 45) {
            issues.push(`Too long (${text.length}): "${text.substring(0, 50)}..."`);
          } else if (text.endsWith(".") || text.endsWith(",")) {
            issues.push(`Ends with punctuation: "${text}"`);
          }
        }
        return issues;
      }, expectedLang);

      for (const issue of buttonViolations.slice(0, 3)) {
        violations.push({ rule: "R4", ...context2, detail: issue });
      }
    }

    // ── R5: internal links ────────────────────────────────────────────────────
    if (vp.name === "desktop" && locale === "en-US") {
      const internalLinks = await page.evaluate((siteUrl) => {
        return Array.from(document.querySelectorAll("a[href]"))
          .map(a => a.getAttribute("href"))
          .filter(href => href && (href.startsWith("/") || href.startsWith(siteUrl)))
          .map(href => href.replace(siteUrl, "").split("?")[0].split("#")[0])
          .filter(href => href && href !== "")
          .slice(0, 50); // check first 50
      }, SITE_URL);

      for (const link of new Set(internalLinks)) {
        if (!routeExists(link)) {
          violations.push({ rule: "R5", ...context2, detail: `Broken link: ${link}` });
        }
      }
    }

    // ── R6: console errors ────────────────────────────────────────────────────
    if (vp.name === "desktop") {
      for (const err of consoleErrors.slice(0, 3)) {
        violations.push({ rule: "R6", ...context2, detail: err.substring(0, 200) });
      }
    }

    // ── R7: layout ────────────────────────────────────────────────────────────
    if (vp.name === "mobile") {
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      if (overflow) {
        violations.push({ rule: "R7", ...context2, detail: "Horizontal overflow at 390px" });
      }
    }

    // ── R8: meta tags ─────────────────────────────────────────────────────────
    if (vp.name === "desktop" && locale === "en-US") {
      const meta = await page.evaluate(() => {
        const title = document.title;
        const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
        const h1s = document.querySelectorAll("h1").length;
        const hreflangs = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'))
          .map(el => ({ lang: el.getAttribute("hreflang"), href: el.getAttribute("href") }));
        return { title, desc, canonical, h1s, hreflangs };
      });

      if (meta.title.length > 60) {
        violations.push({ rule: "R8", ...context2, detail: `Title too long (${meta.title.length}): "${meta.title.substring(0, 70)}"` });
      }
      if (meta.desc.length > 160) {
        violations.push({ rule: "R8", ...context2, detail: `Description too long (${meta.desc.length})` });
      }
      if (!meta.canonical) {
        violations.push({ rule: "R8", ...context2, detail: "Missing canonical" });
      }
      if (meta.h1s === 0) {
        violations.push({ rule: "R8", ...context2, detail: "No H1" });
      } else if (meta.h1s > 1) {
        violations.push({ rule: "R8", ...context2, detail: `Multiple H1s (${meta.h1s})` });
      }
      if (meta.title.includes("2025")) {
        violations.push({ rule: "R8", ...context2, detail: `Title contains "2025"` });
      }
    }

  } catch (err) {
    violations.push({ rule: "R6", route, locale, vp: vpLabel, detail: `Page load error: ${err.message?.substring(0, 100)}` });
  } finally {
    await context.close();
  }

  return violations;
}

function writeReport(violations, routes) {
  const byRule = {};
  for (const v of violations) {
    byRule[v.rule] = (byRule[v.rule] || 0) + 1;
  }

  const lines = [
    "# QA Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Routes checked: ${routes.length} × 2 locales × 2 viewports = ${routes.length * 4} combinations`,
    `Total violations: ${violations.length}`,
    "",
    "## Summary by rule",
    "",
    "| Rule | Count |",
    "|------|-------|",
    ...["R1","R2","R3","R4","R5","R6","R7","R8"].map(r =>
      `| ${r} | ${byRule[r] ?? 0} |`
    ),
    "",
    "## Violations",
    "",
    "| Rule | Route | Viewport | Locale | Detail |",
    "|------|-------|----------|--------|--------|",
    ...violations.map(v =>
      `| ${v.rule} | ${v.route} | ${v.vp} | ${v.locale} | ${v.detail?.replace(/\|/g, "‖")} |`
    ),
  ];

  writeFileSync(REPORT_PATH, lines.join("\n") + "\n", "utf-8");
  console.log(`\nReport written to docs/qa/report.md`);
  console.log("Violations by rule:", byRule);
}

crawl().catch((err) => {
  console.error("Crawler failed:", err);
  process.exit(1);
});
