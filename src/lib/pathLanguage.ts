/**
 * Derive the page language from a URL path, deterministically.
 * Single source of truth imported by both LanguageContext.tsx (client) and
 * entry-server.tsx (SSR).  Must never reference browser APIs.
 *
 * Rule priority (first match wins):
 *  1. Explicit language-prefixed paths (/ca/, /de/, /nl/, /fr/, /it/, /pt/)
 *  2. Individual hard-coded routes (German maker guides, EN delivery pages, etc.)
 *  3. English-pattern prefixes (/3d-printing-*, /blog, /maker-guide, /privacy)
 *  4. Catalan design-page variant
 *  5. Default → es
 */

export type Language = "es" | "en" | "ca" | "fr" | "de" | "nl" | "it" | "pt";

export function pathLanguage(path: string): Language {
  // 1. Language-prefixed routes
  if (path.startsWith("/ca/") || path === "/ca") return "ca";
  if (path.startsWith("/de/")) return "de";
  if (path.startsWith("/nl/")) return "nl";
  if (path.startsWith("/fr/")) return "fr";
  if (path.startsWith("/it/")) return "it";
  if (path.startsWith("/pt/")) return "pt";

  // 2. Individual hard-coded FR city delivery page (Paris page is in French)
  if (path === "/3d-printing-delivery-paris") return "fr";
  // Other /3d-printing-delivery-* pages (berlin, amsterdam, milan, rome, lisbon)
  // are EN-language pages with a native-language callout section — fall through to rule 6

  // 3. Catalan design-request page
  if (path === "/dissenya-la-teva-peca-3d") return "ca";

  // 4. Design-request / file-checker EN pages
  if (path === "/design-your-3d-part" || path === "/3d-file-checker") return "en";

  // 4b. Catalan file-checker page
  if (path === "/comprovador-arxiu-3d") return "ca";

  // 5. German maker guides (slugs with German words, no /de/ prefix)
  if (
    path === "/mit-3d-drucker-geld-verdienen" ||
    path === "/ist-3d-druck-geschaeft-rentabel" ||
    path === "/kunden-fuer-3d-druck-finden"
  ) return "de";

  // 6. English-prefix patterns
  if (
    path.startsWith("/3d-printing-") ||
    path === "/maker-guide" ||
    path === "/privacy"
  ) return "en";

  // 7. English landing pages with non-/3d-printing- prefixes
  if (
    path.startsWith("/custom-parts-") ||
    path.startsWith("/prototype-printing-") ||
    path.startsWith("/urgent-3d-printing-") ||
    path.startsWith("/replacement-parts-") ||
    path.startsWith("/pla-printing-") ||
    path.startsWith("/petg-printing-") ||
    path.startsWith("/tpu-printing-") ||
    path.startsWith("/miniatures-") ||
    path.startsWith("/rapid-prototyping-") ||
    path.startsWith("/functional-parts-") ||
    path.startsWith("/best-3d-printing-") ||
    path.startsWith("/short-run-3d-printing-") ||
    path.startsWith("/how-to-") ||
    path.startsWith("/is-3d-printing-")
  ) return "en";

  // 8. Default: Spanish (blog posts are Spanish-language even with /blog prefix)
  return "es";
}
