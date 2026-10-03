// Single source of truth for the Google reviews rating shown across the site.
// Update the two values when the rating changes; anywhere that pulls from here
// stays in sync automatically.
export const GOOGLE_RATING = {
  value: 4.8,
  count: 17,
} as const;

/** Returns the rating formatted for the given language's decimal convention. */
export function formatRating(language: string): string {
  const s = GOOGLE_RATING.value.toFixed(1);
  return language === "en" ? s : s.replace(".", ",");
}
