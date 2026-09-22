// Single source of truth for the Google reviews rating shown across the site.
// Update the two values when the rating changes; anywhere that pulls from here
// stays in sync automatically.
export const GOOGLE_RATING = {
  value: 4.8,
  count: 16,
} as const;
