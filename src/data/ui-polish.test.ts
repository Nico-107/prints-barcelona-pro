/**
 * Section E verification tests for the ui-polish branch.
 * These tests confirm that:
 * - Only real reviews (from REVIEWS) appear in the codebase.
 * - The /de redirect exists in vercel.json.
 * - i18n files have the new header.menu keys.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { REVIEWS } from "./reviews";

const ROOT = join(__dirname, "../../");
const DIST = join(ROOT, "dist");
const VERCEL_JSON = join(ROOT, "vercel.json");

/** Scan every HTML file in a directory tree and return its text content. */
function readBuiltPages(): { path: string; html: string }[] {
  const results: { path: string; html: string }[] = [];
  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === "index.html") {
        results.push({ path: full, html: readFileSync(full, "utf-8") });
      }
    }
  }
  if (existsSync(DIST)) walk(DIST);
  return results;
}

describe("Reviews: only real names appear in built pages", () => {
  const REAL_NAMES = REVIEWS.map((r) => r.name);
  const FABRICATED = ["Lukas M.", "Isabelle R.", "Max S.", "Anna K."];

  it("REVIEWS contains exactly 4 real reviewers", () => {
    expect(REAL_NAMES).toEqual(["Sara Dospassos", "Kirill Gromskiy", "Yasser Chyoukha", "Filip Copaescu"]);
  });

  it("no built HTML page contains fabricated reviewer names", () => {
    const pages = readBuiltPages();
    expect(pages.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const { path, html } of pages) {
      for (const name of FABRICATED) {
        if (html.includes(name)) {
          hits.push(`${path}: found "${name}"`);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});

describe("Vercel: language-root redirects present", () => {
  it("/de redirects to the German hub", () => {
    const cfg = JSON.parse(readFileSync(VERCEL_JSON, "utf-8")) as {
      redirects?: { source: string; destination: string }[];
    };
    const deRedirect = cfg.redirects?.find((r) => r.source === "/de");
    expect(deRedirect).toBeDefined();
    expect(deRedirect?.destination).toContain("/de/");
  });

  it("all 6 language roots have redirects", () => {
    const cfg = JSON.parse(readFileSync(VERCEL_JSON, "utf-8")) as {
      redirects?: { source: string }[];
    };
    const sources = cfg.redirects?.map((r) => r.source) ?? [];
    for (const lang of ["/en", "/de", "/fr", "/it", "/nl", "/pt"]) {
      expect(sources).toContain(lang);
    }
  });
});

describe("i18n: header.menu keys present in all languages", () => {
  const I18N_DIR = join(ROOT, "src/i18n");
  const LANGS = ["es", "ca", "en", "de", "fr", "it", "nl", "pt"];

  it("header.menu.open and header.menu.close exist in every language file", () => {
    for (const lang of LANGS) {
      const src = readFileSync(join(I18N_DIR, `${lang}.ts`), "utf-8");
      expect(src, `${lang}.ts missing header.menu.open`).toContain('"header.menu.open"');
      expect(src, `${lang}.ts missing header.menu.close`).toContain('"header.menu.close"');
    }
  });

  it("none of the language files contain hardcoded Spanish menu aria-labels (Abrir menú) in Header.tsx", () => {
    const headerSrc = readFileSync(join(ROOT, "src/components/Header.tsx"), "utf-8");
    expect(headerSrc).not.toContain('"Abrir menú"');
    expect(headerSrc).not.toContain('"Cerrar menú"');
  });
});

describe("ES and CA home pages show reviews in the correct language", () => {
  it("ES home page contains Kirill's Spanish review excerpt", () => {
    const html = readFileSync(join(DIST, "index.html"), "utf-8");
    expect(html).toContain("Fue rápido");
  });

  it("CA home page contains Kirill's Catalan review excerpt", () => {
    const html = readFileSync(join(DIST, "ca/index.html"), "utf-8");
    expect(html).toContain("Va ser ràpid");
  });
});
