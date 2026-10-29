/**
 * Owner-editable UX thresholds for the checkout modal.
 * owner prefers small review button (v5.23) — emphasis is permanently disabled.
 * Set minTotalEur to a high value so the full-width review button never shows.
 */

export const REVIEW_EMPHASIS = {
  /** Print subtotal in EUR above which the review button becomes full-width */
  minTotalEur: 10_000, // effectively disabled — owner prefers small side-by-side buttons
} as const;

/**
 * Materials that always trigger the full-width review button regardless of price.
 * These are materials where customers often have technical questions.
 */
export const REVIEW_EMPHASIS_MATERIALS: string[] = []; // disabled in v5.23

/**
 * Part dimension threshold in mm above which the review button becomes full-width.
 * Parts larger than this often need print-orientation or support advice.
 */
export const REVIEW_EMPHASIS_MAX_DIM_MM = 10_000; // disabled in v5.23

/**
 * Quantity per part above which the review button becomes full-width.
 * High quantities often benefit from a quick sanity check before printing.
 */
export const REVIEW_EMPHASIS_MIN_QTY = 10_000; // disabled in v5.23
