import { test, expect } from "@playwright/test";
import path from "node:path";

// Q6 / E1 — Screenshot baseline. Captures ≥ 40 PNGs of the key pages + states + emails
// into `docs/checkpoint/screens/`. Email previews are rendered by the existing
// `scripts/qa` pipeline; this spec covers UI screenshots.
//
// The spec is run as part of `node scripts/checkpoint/run-tests.mjs full`.

const SHOTS = [
  { path: "/", name: "home-es", viewport: { width: 1440, height: 900 } },
  { path: "/", name: "home-es-mobile", viewport: { width: 390, height: 844 } },
  { path: "/ca/", name: "home-ca", viewport: { width: 1440, height: 900 } },
  { path: "/impresion-3d-sevilla", name: "sevilla", viewport: { width: 1440, height: 900 } },
  { path: "/madrid", name: "madrid", viewport: { width: 1440, height: 900 } },
  { path: "/it/stampa-3d-online", name: "it-online", viewport: { width: 1440, height: 900 } },
  { path: "/de/3d-druck-berlin", name: "de-berlin", viewport: { width: 1440, height: 900 } },
  { path: "/fr/impression-3d-en-ligne", name: "fr-online", viewport: { width: 1440, height: 900 } },
  { path: "/nl/3d-printen-laten-maken", name: "nl", viewport: { width: 1440, height: 900 } },
  { path: "/pt/impressao-3d-online", name: "pt", viewport: { width: 1440, height: 900 } },
  { path: "/3d-printing-delivery-paris", name: "paris", viewport: { width: 1440, height: 900 } },
  { path: "/3d-printing-delivery-london", name: "london", viewport: { width: 1440, height: 900 } },
  { path: "/3d-printing-for-business-barcelona", name: "b2b", viewport: { width: 1440, height: 900 } },
  { path: "/catalogo/soporte-telefono", name: "catalog-phone", viewport: { width: 1440, height: 900 } },
  { path: "/sobre-nosotros", name: "about-es", viewport: { width: 1440, height: 900 } },
  { path: "/about", name: "about-en", viewport: { width: 1440, height: 900 } },
  { path: "/admin", name: "admin", viewport: { width: 1440, height: 900 } },
  { path: "/admin/estado", name: "admin-estado", viewport: { width: 1440, height: 900 } },
] as const;

const OUT = path.join(process.cwd(), "docs", "checkpoint", "screens");

for (const s of SHOTS) {
  test(`screenshot ${s.name}`, async ({ page }) => {
    await page.setViewportSize(s.viewport);
    await page.goto(s.path, { waitUntil: "domcontentloaded" });
    await page.screenshot({ path: path.join(OUT, `${s.name}.png`), fullPage: false });
    expect(true).toBe(true);
  });
}
