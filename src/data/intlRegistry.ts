// Central registry of all international page content.
// Import from this file in App.tsx, entry-server.tsx, and prerender.mjs.
import type { IntlHubContent, IntlCityContent, IntlGuideContent, IntlPartContent } from "@/data/intlTypes";
import { DE_HUB, DE_CITIES, DE_GUIDES } from "@/data/intlContent_de";
import { IT_PAGES, PT_PAGES } from "@/data/intlContent_it_pt";
import { NL_PAGES, FR_PAGES } from "@/data/intlContent_nl_fr";
import { ALL_INTL_PARTS } from "@/data/intlPartPages";

export const INTL_HUBS: IntlHubContent[] = [
  DE_HUB,
  NL_PAGES.hub,
  FR_PAGES.hub,
  IT_PAGES.hub,
  PT_PAGES.hub,
];

export const INTL_CITIES: IntlCityContent[] = [
  ...DE_CITIES,
  ...NL_PAGES.cities,
  ...FR_PAGES.cities,
  ...IT_PAGES.cities,
  ...PT_PAGES.cities,
];

export const INTL_GUIDES: IntlGuideContent[] = [
  ...DE_GUIDES,
  ...NL_PAGES.guides,
  ...FR_PAGES.guides,
  ...IT_PAGES.guides,
  ...PT_PAGES.guides,
];

export const INTL_PARTS: IntlPartContent[] = ALL_INTL_PARTS;

// All intl slugs — used by prerender.mjs to add to the routes list
export const ALL_INTL_SLUGS: string[] = [
  ...INTL_HUBS.map((h) => h.slug),
  ...INTL_CITIES.map((c) => c.slug),
  ...INTL_GUIDES.map((g) => g.slug),
  ...INTL_PARTS.map((p) => p.slug),
];
