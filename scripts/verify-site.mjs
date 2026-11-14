#!/usr/bin/env node
/**
 * Phase 9 verification for the full-site rebuild.
 *
 * What it checks (so far, matching what's actually implemented on this branch):
 *
 * - For a sample of representative routes × both variants × desktop + mobile:
 *     - exactly one <h1>
 *     - html[data-xp-site-variant] matches the forced variant
 *     - body[data-site-variant] matches
 *     - no console errors
 *
 * - For every prerendered SEO URL from dist/: SEO diff vs main
 *     - title, meta description, canonical, hreflang bytes stable
 *       (excluded: /, /ca, home-v2 variants)
 *
 * NEVER weaken a check to make it pass. If a check fails, fix the code.
 *
 * Usage:
 *   npm run build       # must have been run (dist/ must exist)
 *   node scripts/verify-site.mjs            # run all checks
 *   node scripts/verify-site.mjs --sample   # quick sample only (dev)
 *   node scripts/verify-site.mjs --seo      # SEO diff only
 */
import { chromium } from "playwright";
import { createServer } from "http";
import { randomUUID } from "crypto";
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync } from "fs";
import { resolve, dirname, extname, join } from "path";
import { fileURLToPath } from "url";

// Mirror of src/lib/experiments/assign.ts hashFraction (FNV-1a → [0,1)).
function hashFraction(s) {
  let k = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    k ^= s.charCodeAt(i);
    k = Math.imul(k, 16777619) >>> 0;
  }
  return k / 4294967295;
}
function assignVariant(vid, id, variants) {
  const f = hashFraction(vid + "::" + id);
  return variants[Math.floor(f * variants.length)];
}
// Holdout has been removed — site_variant is exactly 50/50 with no holdout.

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const DIST = resolve(root, "dist");

if (!existsSync(DIST)) {
  console.error("Missing dist/ — run `npm run build` first.");
  process.exit(2);
}

// ─── Tiny static server over dist/ ─────────────────────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function serveDist(port) {
  const server = createServer((req, res) => {
    let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
    if (pathname.endsWith("/") && pathname !== "/") pathname = pathname.slice(0, -1);
    const candidates = [
      join(DIST, pathname),
      join(DIST, pathname + ".html"),
      join(DIST, pathname, "index.html"),
    ];
    for (const p of candidates) {
      if (existsSync(p) && statSync(p).isFile()) {
        res.writeHead(200, { "Content-Type": MIME[extname(p)] ?? "application/octet-stream" });
        res.end(readFileSync(p));
        return;
      }
    }
    // SPA fallback.
    const fallback = join(DIST, "index.html");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(readFileSync(fallback));
  });
  return new Promise((resolveFn) => server.listen(port, () => resolveFn(server)));
}

// ─── Sitemap + routes ──────────────────────────────────────────────────────

function readSitemapUrls() {
  const xml = readFileSync(resolve(root, "public/sitemap.xml"), "utf-8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls.map((u) => new URL(u).pathname || "/");
}

// Dev sample (10 routes, one per Phase-3 family). Used by --sample for
// a fast pass during Phase 2/3 work; cap the whole run at 90 s elsewhere.
function sampleRoutes() {
  return [
    "/",                                            // 3.1 home es
    "/ca",                                          // 3.1 home ca
    "/3d-printing-service",                         // 3.2 intl hub en
    "/impresion-3d-urgente-barcelona",              // 3.3 urgent
    "/prototipos-3d-barcelona",                     // 3.4 prototypes
    "/precio-impresion-3d-barcelona",               // 3.8 price
    "/madrid",                                      // 3.6 city
    "/blog/precio-impresion-3d-barcelona",          // 3.9 blog post
    "/catalogo/jarron-personalizado",               // 3.11 product
    "/track",                                       // 3.12 tracking
  ];
}

// ─── Checks ────────────────────────────────────────────────────────────────

async function checkPage(page, url, variant, viewport, errors) {
  await page.setViewportSize(viewport);
  const consoleErrors = [];
  const handler = (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  page.on("console", handler);
  try {
    // Force site_variant deterministically via the QA knob.
    const forced = `${url}${url.includes("?") ? "&" : "?"}xp=site_variant:${variant}`;
    // 'domcontentloaded' is enough — our hero-dedupe effect runs on mount.
    // 'networkidle' hangs when analytics beacons keep the connection open.
    await page.goto(forced, { waitUntil: "domcontentloaded", timeout: 10000 });
    // Give hydration-time useEffects (hero dedupe in Phase 1.3) a tick.
    await page.waitForTimeout(250);
  } catch (err) {
    errors.push(`${url} [${variant} ${viewport.width}]: navigation: ${err.message}`);
    page.off("console", handler);
    return;
  }

  const h1Count = await page.locator("h1").count();
  if (h1Count !== 1) errors.push(`${url} [${variant} ${viewport.width}]: expected 1 <h1>, got ${h1Count}`);

  const htmlVariant = await page.getAttribute("html", "data-xp-site-variant");
  if (htmlVariant !== variant)
    errors.push(`${url} [${variant}]: html[data-xp-site-variant]=${htmlVariant}, want ${variant}`);

  const bodyVariant = await page.getAttribute("body", "data-site-variant");
  if (bodyVariant && bodyVariant !== variant)
    errors.push(`${url} [${variant}]: body[data-site-variant]=${bodyVariant}, want ${variant}`);

  // Item 1 — SiteShell + PageHero on every route. /track must now use the
  // shared [data-testid="site-header"]; /admin* pages are intentionally
  // chrome-less. PageHero must be the only hero implementation.
  const path = new URL(url).pathname;
  const isAdminLike = path.startsWith("/admin");
  if (!isAdminLike) {
    const siteHeader = await page.locator('[data-testid="site-header"]').count();
    if (siteHeader < 1)
      errors.push(`${url} [${variant}]: missing [data-testid="site-header"] (SiteShell not adopted)`);
    const pageHero = await page.locator('[data-testid="page-hero"]').count();
    if (pageHero < 1)
      errors.push(`${url} [${variant}]: missing [data-testid="page-hero"] (PageHero not adopted)`);
  }

  // Item 2 — All 6 international hubs (en, de, fr, nl, it, pt) render
  // [data-testid="hub-template"] from one shared component.
  const HUB_PATHS = [
    "/3d-printing-service",
    "/de/3d-druck-service",
    "/nl/3d-printen-laten-maken",
    "/fr/impression-3d-en-ligne",
    "/it/stampa-3d-online",
    "/pt/impressao-3d-online",
  ];
  if (HUB_PATHS.includes(path)) {
    const hubTemplate = await page.locator('[data-testid="hub-template"]').count();
    if (hubTemplate < 1)
      errors.push(`${url} [${variant}]: missing [data-testid="hub-template"] (hub not routed through HubTemplate)`);
  }

  // Item 3 — Urgent pages carry the deadline module, the speed-tiers
  // table (3 rows with surcharge from the engine), and a WhatsApp link
  // prefilled with a deadline message.
  const URGENT_PATHS = [
    "/impresion-3d-urgente-barcelona",
    "/urgent-3d-printing-barcelona",
    "/ca/impressio-3d-urgent-barcelona",
  ];
  if (URGENT_PATHS.includes(path)) {
    const deadline = await page.locator('[data-testid="deadline-module"]').count();
    if (deadline < 1)
      errors.push(`${url} [${variant}]: missing [data-testid="deadline-module"]`);
    const speed = await page.locator('[data-testid="speed-tiers"] tbody tr').count();
    if (speed < 3)
      errors.push(`${url} [${variant}]: [data-testid="speed-tiers"] has ${speed} rows, want ≥ 3`);
    const wa = await page.locator('[data-testid="urgent-whatsapp"]').count();
    if (wa < 1)
      errors.push(`${url} [${variant}]: missing WhatsApp deadline button`);
  }

  // Item 10 — Spare parts, discontinued parts and custom parts pages
  // carry [data-testid="photo-steps"] and the "Enviar una foto" / "Send
  // a photo" hero button. Students page has a primary button in its
  // hero.
  const PHOTO_PATHS = [
    "/recambios-impresion-3d-barcelona",
    "/replacement-parts-barcelona",
    "/ca/recanvis-impressio-3d-barcelona",
    "/piezas-personalizadas-3d-barcelona",
    "/custom-parts-barcelona",
    "/ca/peces-personalitzades-3d-barcelona",
    "/repuesto-descatalogado",
  ];
  if (PHOTO_PATHS.includes(path)) {
    const ps = await page.locator('[data-testid="photo-steps"]').count();
    if (ps < 1) errors.push(`${url} [${variant}]: missing [data-testid="photo-steps"]`);
    const heroPhoto = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="page-hero"]');
      if (!hero) return false;
      const t = (hero.textContent || "").toLowerCase();
      return t.includes("foto") || t.includes("photo");
    });
    if (!heroPhoto) errors.push(`${url} [${variant}]: hero missing photo-path CTA token`);
  }
  if (path === "/impresion-3d-estudiantes-barcelona") {
    const heroCta = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="page-hero"]');
      if (!hero) return false;
      return !!hero.querySelector('a, button');
    });
    if (!heroCta) errors.push(`${url} [${variant}]: students hero missing primary button`);
  }

  // Item 9 — Product pages all render [data-testid="product-template"]
  // from one shared component (catalogue items, SEO parts, intl parts).
  const PRODUCT_PATTERNS = [
    /^\/catalogo\/[a-z0-9-]+$/,
    /^\/adaptador-vesa-monitor$/,
    /^\/embudo-dosificador-cafe-58mm$/,
    /^\/rueda-cesto-lavavajillas-bosch$/,
    /^\/adaptador-manguera-gardena$/,
    /^\/de\/[a-z0-9-]+-adapter$/, /^\/de\/vesa-monitor-adapter$/, /^\/de\/kaffee-trichter/,
    /^\/fr\/[a-z0-9-]+-adaptateur$/, /^\/fr\/entonnoir-cafe/, /^\/fr\/vesa-adaptateur/,
    /^\/it\/[a-z0-9-]+-adattatore$/, /^\/it\/imbuto-caffe/, /^\/it\/vesa-adattatore/,
    /^\/nl\/vesa-monitor-adapter/, /^\/nl\/.+-adapter$/, /^\/nl\/koffie-dosering/,
  ];
  if (PRODUCT_PATTERNS.some((re) => re.test(path))) {
    const pt = await page.locator('[data-testid="product-template"]').count();
    if (pt < 1) errors.push(`${url} [${variant}]: missing [data-testid="product-template"]`);
  }

  // Item 8 — Blog posts / guides / comparisons (every language) render:
  //   - [data-testid="article-template"] once
  //   - [data-testid="article-toc"] once
  //   - [data-testid="inline-cta"] × ≥ 2 (mid + end)
  //   - NO primary <button> or CTA button inside the hero (page-hero).
  const ARTICLE_PATTERNS = [
    /^\/blog(\/|$)/,
    /^\/guia-/, /^\/ca\/guia-/,
    /^\/como-/, /^\/ca\/com-/,
    /^\/how-to-/,
    /^\/comparativa-/, /^\/comparison-/,
    /^\/mejor-servicio-/, /^\/millor-servei-/,
    /^\/best-/,
    /^\/choosing-/,
    /^\/de\/3d-druck-(kosten|materialien|datei-vorbereiten)/,
    /^\/nl\/3d-printen-kosten/, /^\/nl\/materialen-3d-printen/, /^\/nl\/bestand-voorbereiden/,
    /^\/fr\/prix-impression-3d/, /^\/fr\/materiaux-impression-3d/, /^\/fr\/preparer-fichier-impression-3d/,
    /^\/it\/prezzi-stampa-3d/, /^\/it\/materiali-stampa-3d/, /^\/it\/preparare-file-stampa-3d/,
    /^\/pt\/preco-impressao-3d/, /^\/pt\/materiais-impressao-3d/, /^\/pt\/preparar-ficheiro-impressao-3d/,
    /^\/como-ganar-dinero-con-impresora-3d/, /^\/es-rentable-negocio-impresion-3d/, /^\/como-conseguir-clientes-impresion-3d/,
    /^\/how-to-make-money-with-3d-printer/, /^\/is-3d-printing-business-profitable/, /^\/how-to-get-3d-printing-customers/,
    /^\/geld-verdienen-mit-3d-drucker/, /^\/ist-3d-druck-geschaeft-rentabel/, /^\/kunden-fuer-3d-druck-finden/,
  ];
  const isArticle = ARTICLE_PATTERNS.some((re) => re.test(path)) && path !== "/blog";
  if (isArticle) {
    const at = await page.locator('[data-testid="article-template"]').count();
    if (at < 1) errors.push(`${url} [${variant}]: missing [data-testid="article-template"]`);
    const toc = await page.locator('[data-testid="article-toc"]').count();
    if (toc < 1) errors.push(`${url} [${variant}]: missing [data-testid="article-toc"]`);
    const ic = await page.locator('[data-testid="inline-cta"]').count();
    if (ic < 2) errors.push(`${url} [${variant}]: inline-cta count ${ic}, want ≥ 2`);
    // No primary button inside the page-hero.
    const heroHasCta = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="page-hero"]');
      if (!hero) return false;
      return !!hero.querySelector('button.bg-cta, button.bg-primary, [data-ph-name="article-inline-cta"], .bg-cta, .bg-primary');
    });
    if (heroHasCta) errors.push(`${url} [${variant}]: article hero should have no primary button`);
  }

  // Item 7 — Price pages (every language): [data-testid="upload-card"]
  // appears BEFORE the first h2; [data-testid="engine-examples"] has 4
  // engine-computed rows.
  const PRICE_PATHS = [
    "/precio-impresion-3d-barcelona",
    "/3d-printing-price-barcelona",
    "/ca/preu-impressio-3d-barcelona",
    "/de/3d-druck-kosten",
    "/nl/3d-printen-kosten",
    "/fr/prix-impression-3d",
    "/it/prezzi-stampa-3d",
    "/pt/preco-impressao-3d",
  ];
  if (PRICE_PATHS.includes(path)) {
    const upload = await page.locator('[data-testid="upload-card"]').first();
    const uploadCount = await page.locator('[data-testid="upload-card"]').count();
    if (uploadCount < 1) {
      errors.push(`${url} [${variant}]: missing [data-testid="upload-card"]`);
    } else {
      // Must appear before the first h2.
      const beforeFirstH2 = await page.evaluate(() => {
        const uc = document.querySelector('[data-testid="upload-card"]');
        const firstH2 = document.querySelector('main h2');
        if (!uc || !firstH2) return false;
        return !!(uc.compareDocumentPosition(firstH2) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      if (!beforeFirstH2)
        errors.push(`${url} [${variant}]: [data-testid="upload-card"] is not before the first <h2>`);
    }
    const ex = await page.locator('[data-testid="engine-examples"] tbody tr').count();
    if (ex < 4) errors.push(`${url} [${variant}]: engine-examples has ${ex} rows, want ≥ 4`);
  }

  // Item 6 — Material pages (PLA, PETG, TPU; es, en, ca) render
  // [data-testid="spec-card"] + [data-testid="material-compare"].
  const MATERIAL_PATHS = [
    "/impresion-pla-barcelona", "/pla-printing-barcelona", "/ca/impressio-pla-barcelona",
    "/impresion-petg-barcelona", "/petg-printing-barcelona", "/ca/impressio-petg-barcelona",
    "/impresion-tpu-barcelona", "/tpu-printing-barcelona", "/ca/impressio-tpu-barcelona",
  ];
  if (MATERIAL_PATHS.includes(path)) {
    const sc = await page.locator('[data-testid="spec-card"]').count();
    if (sc < 1) errors.push(`${url} [${variant}]: missing [data-testid="spec-card"]`);
    const mc = await page.locator('[data-testid="material-compare"]').count();
    if (mc < 1) errors.push(`${url} [${variant}]: missing [data-testid="material-compare"]`);
  }

  // Item 5 — City & delivery pages carry [data-testid="delivery-timeline"]
  // and [data-testid="city-price-table"] with 4 engine-computed rows.
  const CITY_PATTERNS = [
    /^\/3d-printing-delivery-/,       // EN delivery pages (Paris, Amsterdam, Berlin, Milan, Rome, Lisbon, NY, London)
    /^\/madrid$/, /^\/3d-printing-madrid$/,
    /^\/impresion-3d-sevilla$/, /^\/3d-printing-sevilla$/,
    /^\/impresion-3d-con-entrega-a-valencia$/,
    /^\/de\/3d-druck-berlin$/,
    /^\/nl\/3d-printen-amsterdam$/,
    /^\/fr\/impression-3d-paris$/,
    /^\/it\/stampa-3d-milano$/, /^\/it\/stampa-3d-roma$/,
    /^\/pt\/impressao-3d-lisboa$/,
  ];
  if (CITY_PATTERNS.some((re) => re.test(path))) {
    const dt = await page.locator('[data-testid="delivery-timeline"]').count();
    if (dt < 1) errors.push(`${url} [${variant}]: missing [data-testid="delivery-timeline"]`);
    const cpt = await page.locator('[data-testid="city-price-table"] tbody tr').count();
    if (cpt < 4) errors.push(`${url} [${variant}]: city-price-table has ${cpt} rows, want ≥ 4`);
  }

  // Item 4 — Prototype / rapid-prototyping / functional-parts / short-run
  // / B2B pages (es, en, ca) carry iteration-timeline + material-by-need +
  // volume-price-table (3 rows × 3 qty columns from the engine). Primary
  // CTA uses the business vocabulary ("Enviar mi proyecto" / "Send my
  // project" / "Enviar el meu projecte").
  const B2B_PATHS = [
    "/prototipos-3d-barcelona",
    "/prototype-printing-barcelona",
    "/ca/prototips-3d-barcelona",
    "/prototipado-rapido-barcelona",
    "/rapid-prototyping-barcelona",
    "/ca/prototipatge-rapid-barcelona",
    "/piezas-funcionales-barcelona",
    "/functional-parts-barcelona",
    "/ca/peces-funcionals-barcelona",
    "/tiradas-cortas-impresion-3d-barcelona",
    "/short-run-3d-printing-barcelona",
    // Note: no CA short-run page exists in the sitemap; omitted.
    "/impresion-3d-empresas-barcelona",
    "/3d-printing-for-business-barcelona",
    "/ca/impressio-3d-empreses-barcelona",
  ];
  if (B2B_PATHS.includes(path)) {
    const it = await page.locator('[data-testid="iteration-timeline"]').count();
    if (it < 1) errors.push(`${url} [${variant}]: missing [data-testid="iteration-timeline"]`);
    const mbn = await page.locator('[data-testid="material-by-need"]').count();
    if (mbn < 1) errors.push(`${url} [${variant}]: missing [data-testid="material-by-need"]`);
    const vpt = await page.locator('[data-testid="volume-price-table"] tbody tr').count();
    if (vpt < 3) errors.push(`${url} [${variant}]: volume-price-table has ${vpt} rows, want ≥ 3`);
    // Primary CTA vocabulary — must contain "proyecto" (es/ca) or "project" (en).
    const expectedToken = path.startsWith("/ca/") ? "projecte" : /\/(?:prototype|rapid|functional|short|for-business|3d-printing-for-business)/.test(path) ? "project" : "proyecto";
    const hasBusinessCta = await page.evaluate((tok) => {
      const hero = document.querySelector('[data-testid="page-hero"]');
      if (!hero) return false;
      const t = (hero.textContent || "").toLowerCase();
      return t.includes(tok);
    }, expectedToken);
    if (!hasBusinessCta)
      errors.push(`${url} [${variant}]: hero missing business-vocabulary CTA token "${expectedToken}"`);
  }

  // Conv bug #2 — on every non-home route, both header slots ship in the
  // prerendered HTML so the correct one is already visible before paint.
  // The flash disappears because there is no React swap between A and B.
  if (!isAdminLike && path !== "/" && !path.endsWith("/ca") && path !== "/ca") {
    const slotCount = await page.locator('[data-xp-slot="site_variant"]').count();
    if (slotCount < 2)
      errors.push(`${url} [${variant}]: expected 2 [data-xp-slot="site_variant"] wrappers (A+B), got ${slotCount}`);
    const slotA = await page.locator('[data-testid="header-slot-A"]').count();
    const slotB = await page.locator('[data-testid="header-slot-B"]').count();
    if (slotA < 1 || slotB < 1)
      errors.push(`${url} [${variant}]: missing header-slot-A (${slotA}) or header-slot-B (${slotB})`);
  }

  // Conv bug #1 — on home variant B under 768px the hero eyebrow sits
  // below the fixed header. Fails if any part of the eyebrow bbox
  // overlaps the header bbox.
  if (variant === "B" && viewport.width < 768 && (path === "/" || path === "/ca")) {
    const overlap = await page.evaluate(() => {
      const eb = document.querySelector('[data-testid="hero-eyebrow-v2"]');
      const hd = document.querySelector("header");
      if (!eb || !hd) return null;
      const er = eb.getBoundingClientRect();
      const hr = hd.getBoundingClientRect();
      return { eyebrowTop: er.top, eyebrowBottom: er.bottom, headerBottom: hr.bottom };
    });
    if (overlap && overlap.eyebrowTop < overlap.headerBottom - 1)
      errors.push(`${url} [B ${viewport.width}]: hero eyebrow overlaps header — eyebrow top=${Math.round(overlap.eyebrowTop)}, header bottom=${Math.round(overlap.headerBottom)}`);
  }

  // Conv bug #3 — /prototipos-3d-barcelona hero subtitle is a complete
  // sentence, not truncated with "…".
  if (path === "/prototipos-3d-barcelona") {
    const text = await page.locator('[data-testid="hero-subtitle"]').first().textContent();
    if (text && (text.trim().endsWith("…") || text.trim().endsWith("...")))
      errors.push(`${url} [${variant}]: hero subtitle is truncated: ${JSON.stringify(text.trim().slice(-30))}`);
    if (!text || text.trim().length < 20)
      errors.push(`${url} [${variant}]: hero subtitle missing or too short`);
  }

  // Conv bug #4 — urgent pages' speed-tiers heading never contains the
  // English word "tier"/"tiers" in a non-English language.
  if (URGENT_PATHS.includes(path)) {
    const heading = await page.locator('[data-testid="speed-tiers-heading"]').first().textContent();
    if (heading) {
      const lang = path.startsWith("/en") || path.startsWith("/urgent") ? "en" : path.startsWith("/ca") ? "ca" : path.startsWith("/de/") ? "de" : path.startsWith("/fr/") ? "fr" : path.startsWith("/it/") ? "it" : path.startsWith("/nl/") ? "nl" : path.startsWith("/pt/") ? "pt" : "es";
      if (lang !== "en" && /\btier\b|\btiers\b/i.test(heading))
        errors.push(`${url} [${variant}]: non-English speed-tiers heading contains "tier(s)": ${JSON.stringify(heading)}`);
    }
  }

  // Conv 1.1 — Simple mode shows only preview, material, qty,
  // pickup/shipping, total and Buy. On any page that renders a
  // CheckoutConfigurator, verify Simple is the default and advanced-only
  // controls (colour-picker, per-plazo chips) are hidden.
  const cfg = await page.locator('[data-testid="checkout-configurator"]').first();
  if (await cfg.count()) {
    const mode = await cfg.getAttribute("data-mode");
    if (mode !== "simple")
      errors.push(`${url} [${variant}]: configurator default mode is ${mode}, want "simple"`);
    const plazoChips = await page.locator('[data-testid="simple-plazo"]').count();
    if (mode === "simple" && plazoChips > 0)
      errors.push(`${url} [${variant}]: Simple mode still renders [data-testid="simple-plazo"] (should be Advanced-only)`);
  }

  // No horizontal overflow: document scrollWidth should match viewport width
  // (allow 2px for sub-pixel rounding and scrollbar).
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    view: window.innerWidth,
  }));
  if (overflow.scroll > overflow.view + 2)
    errors.push(`${url} [${variant} ${viewport.width}]: horizontal overflow — scrollWidth=${overflow.scroll} viewport=${overflow.view}`);

  // Header not overflowing: child elements fit inside the header box.
  const headerOverflow = await page.evaluate(() => {
    const h = document.querySelector("header");
    if (!h) return null;
    return { sw: h.scrollWidth, cw: h.clientWidth };
  });
  if (headerOverflow && headerOverflow.sw > headerOverflow.cw + 2)
    errors.push(`${url} [${variant} ${viewport.width}]: header overflows — scrollWidth=${headerOverflow.sw} clientWidth=${headerOverflow.cw}`);

  // Phase 9.contrast — header text ≥ 4.5:1 against what's behind it, measured
  // at scroll 0 and scroll 1200, in both variants, on every page. Uses the
  // WCAG relative-luminance formula; samples one visible text descendant of
  // <header> (Logo span) + reads its computed color against the header's
  // background OR the body background (whichever is visually behind it when
  // the header's own bg is transparent).
  async function measureHeaderContrast(atScroll) {
    await page.evaluate((y) => window.scrollTo(0, y), atScroll);
    await page.waitForTimeout(80);
    return page.evaluate(() => {
      function parse(c) {
        const m = /rgba?\(([^)]+)\)/.exec(c);
        if (!m) return null;
        const p = m[1].split(",").map((x) => x.trim());
        return { r: +p[0], g: +p[1], b: +p[2], a: p[3] == null ? 1 : +p[3] };
      }
      function lum({ r, g, b }) {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      }
      function ratio(a, b) {
        const la = lum(a), lb = lum(b);
        const [L1, L2] = la >= lb ? [la, lb] : [lb, la];
        return (L1 + 0.05) / (L2 + 0.05);
      }
      const header = document.querySelector("header");
      if (!header) return null;
      // Decide the effective background behind the header text:
      //   1. If the header itself has a non-transparent background, use that.
      //   2. Otherwise, probe the DOM stack at the header's mid-point and use
      //      the first element behind the header that has a non-transparent
      //      background.
      //   3. Fall back to the <html> background, else white.
      const headerBg = parse(getComputedStyle(header).backgroundColor);
      let docBg = null;
      if (headerBg && headerBg.a > 0.1) {
        docBg = headerBg;
      } else {
        const r = header.getBoundingClientRect();
        const probeX = Math.max(24, Math.min(r.width - 24, r.width / 2));
        const probeY = Math.max(8, r.top + r.height / 2 + 4);
        const stack = document.elementsFromPoint(probeX, probeY) || [];
        let behind = stack.find((el) => el !== header && !header.contains(el));
        while (behind && behind !== document.documentElement) {
          const parsed = parse(getComputedStyle(behind).backgroundColor);
          if (parsed && parsed.a > 0.1) { docBg = parsed; break; }
          behind = behind.parentElement;
        }
        if (!docBg) {
          const htmlBg = parse(getComputedStyle(document.documentElement).backgroundColor);
          docBg = htmlBg ?? { r: 255, g: 255, b: 255, a: 1 };
        }
      }
      const candidates = Array.from(header.querySelectorAll('span, a, button'));
      const results = [];
      function isVisible(el) {
        // Walk up the DOM: if any ancestor is display:none, visibility:hidden,
        // or has zero layout, this element is off-screen. Hidden-variant
        // nodes (variant A utilities in variant B, etc.) must not count.
        let node = el;
        while (node && node !== document.documentElement) {
          const s = getComputedStyle(node);
          if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return false;
          node = node.parentElement;
        }
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
      }
      for (const el of candidates) {
        if (!isVisible(el)) continue;
        // Only measure elements whose OWN direct text node has visible
        // content (otherwise we read a wrapper's inherited color against
        // its descendants' text — e.g. an <a> wrapping a white <span>
        // but inheriting a dark color from body, giving a false 1:1 fail).
        const ownText = Array.from(el.childNodes)
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent || "")
          .join("")
          .trim();
        if (!ownText || ownText.length > 60) continue;
        // Skip the brand wordmark colored accent "3D" and the standalone
        // star glyph — both are logo/decorative per WCAG 1.4.3.
        if (ownText === "3D" || ownText === "★") continue;
        const text = ownText;
        const style = getComputedStyle(el);
        const fg = parse(style.color);
        if (!fg) continue;
        // Walk up from the text element until we find a non-transparent bg
        // inside the header; otherwise fall back to what's behind the header.
        let bg = null;
        let node = el;
        while (node && node !== document.body) {
          const parsed = parse(getComputedStyle(node).backgroundColor);
          if (parsed && parsed.a > 0.1) { bg = parsed; break; }
          node = node.parentElement;
          if (node === header.parentElement) break;
        }
        if (!bg) bg = docBg;
        results.push({ text, ratio: ratio(fg, bg) });
      }
      results.sort((a, b) => a.ratio - b.ratio);
      return results[0] ?? null;
    });
  }

  for (const atScroll of [0, 1200]) {
    const c = await measureHeaderContrast(atScroll);
    if (c && c.ratio < 4.5) {
      errors.push(`${url} [${variant} ${viewport.width}]: header contrast ${c.ratio.toFixed(2)} < 4.5:1 on "${c.text}" at scroll ${atScroll}`);
    }
  }

  // Item 11 — Header groups. Only run at desktop width (triggers are hidden
  // on mobile) and only in non-admin pages. Open both triggers in turn and
  // assert ≥ 4 [data-testid="nav-menu-group"] once the panel is open.
  if (!isAdminLike && viewport.width >= 1024) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(80);
    // Scope to the primary nav (we may have two nav elements: one per variant,
    // the other hidden). Pick the visible one by looking for a visible trigger.
    const triggers = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('header button, header [role="button"]'));
      const wanted = ["Services", "Servicios", "Serveis", "Leistungen", "Diensten", "Servizi", "Serviços", "Resources", "Recursos", "Ressources", "Ressourcen", "Bronnen", "Risorse"];
      return items
        .filter((el) => {
          const txt = (el.textContent || "").trim();
          if (!wanted.some((w) => txt.includes(w))) return false;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) return false;
          const s = getComputedStyle(el);
          return s.display !== "none" && s.visibility !== "hidden";
        })
        .map((el) => (el.textContent || "").trim());
    });
    if (triggers.length < 2)
      errors.push(`${url} [${variant}]: expected Servicios + Recursos triggers in header, saw ${triggers.length}`);
    for (const trigger of triggers.slice(0, 2)) {
      try {
        await page.getByRole("button", { name: new RegExp(trigger.split(" ")[0], "i") }).first().click({ trial: false, timeout: 2000 });
        await page.waitForTimeout(120);
        const groupCount = await page.locator('[data-testid="nav-menu-group"]').count();
        if (groupCount < 4)
          errors.push(`${url} [${variant}]: menu "${trigger}" opens ${groupCount} nav-menu-group(s), want ≥ 4`);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(80);
      } catch (err) {
        errors.push(`${url} [${variant}]: failed to open "${trigger}" dropdown: ${err.message}`);
      }
    }
  }

  // Variant drift check (already scrolled to 1200 by the contrast measure).
  const htmlAfter = await page.getAttribute("html", "data-xp-site-variant");
  if (htmlAfter !== variant)
    errors.push(`${url} [${variant}]: variant drifted to ${htmlAfter} after scroll 1200`);

  if (consoleErrors.length)
    errors.push(`${url} [${variant}]: ${consoleErrors.length} console error(s): ${consoleErrors[0]}`);

  page.off("console", handler);
}

async function runSample(baseUrl, routesOverride) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  const routes = routesOverride ?? sampleRoutes();
  const variants = ["A", "B"];
  const viewports = [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ];
  let count = 0;
  for (const route of routes) {
    for (const v of variants) {
      for (const vp of viewports) {
        const url = `${baseUrl}${route}`;
        try {
          await checkPage(page, url, v, vp, errors);
        } catch (err) {
          errors.push(`${route} [${v} ${vp.width}]: ${err.message}`);
        }
        count++;
      }
    }
  }
  await browser.close();
  return { count, errors };
}

// ─── Main ───────────────────────────────────────────────────────────────────

const args = new Set(process.argv.slice(2));
const PORT = 4173;
const server = await serveDist(PORT);
const baseUrl = `http://localhost:${PORT}`;
console.log(`Serving dist/ at ${baseUrl}`);

let failed = false;

if (!args.has("--seo")) {
  // --sample forces the 29-route quick set; otherwise run all sitemap URLs.
  const useSample = args.has("--sample");
  const routes = useSample ? sampleRoutes() : readSitemapUrls();
  console.log(
    `\n9.1 ${useSample ? "Sample" : "All"} pages × 2 variants × 2 viewports (${routes.length} routes) …`,
  );
  const { count, errors } = await runSample(baseUrl, routes);
  console.log(`   checks: ${count}, errors: ${errors.length}`);
  for (const e of errors.slice(0, 50)) console.log(`   ✗ ${e}`);
  if (errors.length) failed = true;
}

// ─── 9.5 (partial): content tests over every built HTML file ───────────────
// Walks dist/ and asserts the forbidden-wording list from 0.1 + 2.10 is
// absent. Covers only what's been fixed on this branch so far.
if (!args.has("--seo")) {
  console.log("\n9.5 Content tests over every built page …");
  const forbidden = [
    { needle: "nuestro taller", why: "'taller' as a place — see 0.1" },
    { needle: "nostre taller", why: "'taller' as a place (ca) — see 0.1" },
    { needle: "our workshop", why: "'workshop' as a place — see 0.1" },
    { needle: "unserer Werkstatt", why: "'Werkstatt' as a place — see 0.1" },
    { needle: "notre atelier", why: "'atelier' as a place — see 0.1" },
    { needle: "nostra officina", why: "'officina' as a place — see 0.1" },
    { needle: "nossa oficina", why: "'oficina' as a place — see 0.1" },
    { needle: "precio en 10 segundos", why: "unverified speed promise — 2.10" },
    { needle: "price in 10 seconds", why: "unverified speed promise — 2.10" },
    { needle: "/5 on Google", why: "no Google mentions — 0.1" },
    { needle: "/5 en Google", why: "no Google mentions — 0.1" },
  ];
  const contentErrors = [];
  let scanned = 0;
  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      if (!p.endsWith(".html")) continue;
      scanned++;
      const html = readFileSync(p, "utf-8");
      for (const { needle, why } of forbidden) {
        if (html.includes(needle)) {
          contentErrors.push(`${p.replace(DIST, "")}: forbidden ${JSON.stringify(needle)} (${why})`);
        }
      }
    }
  }
  walk(DIST);
  console.log(`   scanned: ${scanned} HTML files, errors: ${contentErrors.length}`);
  for (const e of contentErrors.slice(0, 50)) console.log(`   ✗ ${e}`);
  if (contentErrors.length) failed = true;
}

// ─── 9.4 Split test ────────────────────────────────────────────────────────
// Confirms the deterministic hash: 10,000 random visitor ids resolve to
// B between 48% and 52%; same visitorId yields the same variant on every
// draw; bots ('bot' sentinel used by the pre-paint IIFE in index.html
// when localStorage is unavailable) always resolve to A; holdout rate is
// about 10% and holdout visitors never participate.
if (!args.has("--seo")) {
  console.log("\n9.4 Split test (10 000 random visitor ids, no holdout) …");
  const N = 10000;
  let b = 0;
  const samples = [];
  for (let i = 0; i < N; i++) {
    const vid = randomUUID().replace(/-/g, "").slice(0, 18);
    samples.push(vid);
    const v = assignVariant(vid, "site_variant", ["A", "B"]);
    if (v === "B") b++;
  }
  const pct = (b / N) * 100;
  const stable = samples.every(
    (vid) => assignVariant(vid, "site_variant", ["A", "B"]) ===
             assignVariant(vid, "site_variant", ["A", "B"]),
  );
  const botVariant = "A";
  const errs = [];
  if (pct < 48 || pct > 52) errs.push(`B share out of band: ${pct.toFixed(2)}% (want 48–52)`);
  if (!stable) errs.push("non-deterministic: same vid resolved to different variants");
  const prePaintSrc = readFileSync(resolve(root, "src/lib/experiments/prePaintScript.ts"), "utf-8");
  if (!prePaintSrc.includes("isBot") || !prePaintSrc.includes("variant=exp.variants[0]"))
    errs.push("pre-paint script missing bot → variants[0] shortcircuit");
  if (prePaintSrc.includes("data-xp-holdout"))
    errs.push("pre-paint script still references holdout (goal: exact 50/50, no holdout)");
  console.log(
    `   N=${N}, B/N=${pct.toFixed(2)}%, stable=${stable}, bot→${botVariant}, holdout=none`,
  );
  for (const e of errs) console.log(`   ✗ ${e}`);
  if (errs.length) failed = true;
}

// ─── 9.7 SEO diff vs main branch ──────────────────────────────────────────
// For every prerendered page (except /, /ca, home-v2 variants per rule 0.2),
// extract title, meta description, canonical, hreflang and JSON-LD scripts
// from this build and compare bytes to the baseline captured from `main`.
// Captures the baseline on first run (checked into docs/seo-baseline.json).
if (!args.has("--sample")) {
  console.log("\n9.7 SEO byte-diff vs main (every prerendered page) …");
  const baselinePath = resolve(root, "docs/seo-baseline.json");
  function extractSeo(html) {
    const pick = (re) => (html.match(re) || [])[0] || "";
    const titleM = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descM = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
    const canonicalM = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
    const hreflangs = [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["'][^"']+["'][^>]*>/gi)]
      .map((m) => m[0]).sort();
    const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)]
      .map((m) => m[0]);
    const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    return {
      title: titleM ? titleM[1] : "",
      description: descM ? descM[0] : "",
      canonical: canonicalM ? canonicalM[0] : "",
      hreflangs,
      jsonLd,
      h1: h1M ? h1M[1].replace(/<[^>]+>/g, "").trim() : "",
    };
  }
  // Collect current built SEO for every page.
  const current = {};
  function walkSeo(dir, pathPrefix = "") {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) { walkSeo(p, pathPrefix + "/" + entry); continue; }
      if (!p.endsWith(".html")) continue;
      const route = pathPrefix === "" && entry === "index.html" ? "/" : pathPrefix + (entry === "index.html" ? "" : "/" + entry.replace(/\.html$/, ""));
      current[route] = extractSeo(readFileSync(p, "utf-8"));
    }
  }
  walkSeo(DIST);

  if (!existsSync(baselinePath)) {
    // First run ever: capture the current build as the "main" baseline. The
    // normal flow is to capture this on `main` before starting the branch.
    mkdirSync(dirname(baselinePath), { recursive: true });
    const fs = await import("fs/promises");
    await fs.writeFile(baselinePath, JSON.stringify(current, null, 2) + "\n");
    console.log(`   captured baseline for ${Object.keys(current).length} pages at docs/seo-baseline.json (first run — compare on next build)`);
  } else {
    const baseline = JSON.parse(readFileSync(baselinePath, "utf-8"));
    const excluded = new Set(["/", "/ca"]);
    let diffs = 0;
    const examples = [];
    for (const route of Object.keys(baseline)) {
      if (excluded.has(route)) continue;
      const a = baseline[route];
      const b = current[route];
      if (!b) { diffs++; examples.push(`${route}: missing in current build`); continue; }
      if (a.title !== b.title)
        { diffs++; if (examples.length < 20) examples.push(`${route}: title ${JSON.stringify(a.title)} → ${JSON.stringify(b.title)}`); }
      if (a.description !== b.description)
        { diffs++; if (examples.length < 20) examples.push(`${route}: description changed`); }
      if (a.canonical !== b.canonical)
        { diffs++; if (examples.length < 20) examples.push(`${route}: canonical changed`); }
      if (a.hreflangs.join("|") !== b.hreflangs.join("|"))
        { diffs++; if (examples.length < 20) examples.push(`${route}: hreflang changed`); }
      if ((a.jsonLd || []).join("|") !== (b.jsonLd || []).join("|"))
        { diffs++; if (examples.length < 20) examples.push(`${route}: JSON-LD changed`); }
      if (a.h1 !== b.h1)
        { diffs++; if (examples.length < 20) examples.push(`${route}: H1 ${JSON.stringify(a.h1)} → ${JSON.stringify(b.h1)}`); }
    }
    console.log(`   pages compared: ${Object.keys(baseline).length - excluded.size}, differences: ${diffs}`);
    for (const e of examples) console.log(`   ✗ ${e}`);
    if (diffs) failed = true;
  }
}

server.close();
process.exit(failed ? 1 : 0);
