// H6 / F1: page-group classifier — single source of truth.
// MASTER_PROMPT D-3: pickup only on specific pages; everywhere else is non-local (ship only).
// Barcelona pickup: `/`, `/ca/` (and any homepage variant), any path whose slug contains
// `barcelona` (any language), `/impresion-3d-cerca-de-mi`, `/sobre-nosotros`, `/about`.
// Sevilla pickup: `/impresion-3d-sevilla`, `/3d-printing-sevilla`.

export type PageGroup = "local" | "non_local";
export type PickupLocation = "bcn" | "sevilla" | null;

export interface PageGroupResult {
  group: PageGroup;
  pickupLocation: PickupLocation;
}

const SEVILLA_PATHS = new Set<string>([
  "/impresion-3d-sevilla",
  "/3d-printing-sevilla",
]);

const BARCELONA_EXTRAS = new Set<string>([
  "/impresion-3d-cerca-de-mi",
  "/sobre-nosotros",
  "/about",
]);

function normalise(pathname: string): string {
  if (!pathname) return "/";
  // Strip trailing slash (unless root), drop query/hash.
  let p = pathname.split("#")[0].split("?")[0];
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

function isHomepage(p: string): boolean {
  if (p === "/" || p === "") return true;
  // Language prefixes with no further path: /ca, /en, /de, /fr, /it, /nl, /pt, (es implicit)
  return /^\/(?:ca|en|de|fr|it|nl|pt)$/.test(p);
}

export function classifyPath(pathname: string): PageGroupResult {
  const p = normalise(pathname);
  if (SEVILLA_PATHS.has(p)) return { group: "local", pickupLocation: "sevilla" };
  if (isHomepage(p)) return { group: "local", pickupLocation: "bcn" };
  if (BARCELONA_EXTRAS.has(p)) return { group: "local", pickupLocation: "bcn" };
  // "barcelona" in the slug, any language
  if (/\bbarcelona\b/i.test(p)) return { group: "local", pickupLocation: "bcn" };
  return { group: "non_local", pickupLocation: null };
}

export function isLocalPage(pathname: string): boolean {
  return classifyPath(pathname).group === "local";
}

export function pickupLocationFor(pathname: string): PickupLocation {
  return classifyPath(pathname).pickupLocation;
}
