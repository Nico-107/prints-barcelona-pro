/**
 * Owner-editable UX thresholds for the checkout modal.
 * Change these values to tune when the "full-width review" button appears.
 */

export const REVIEW_EMPHASIS = {
  /** Print subtotal in EUR above which the review button becomes full-width */
  minTotalEur: 60,
} as const;

/**
 * Materials that always trigger the full-width review button regardless of price.
 * These are materials where customers often have technical questions.
 */
export const REVIEW_EMPHASIS_MATERIALS: string[] = ["Nylon", "TPU"];

/**
 * Part dimension threshold in mm above which the review button becomes full-width.
 * Parts larger than this often need print-orientation or support advice.
 */
export const REVIEW_EMPHASIS_MAX_DIM_MM = 200;

/**
 * Quantity per part above which the review button becomes full-width.
 * High quantities often benefit from a quick sanity check before printing.
 */
export const REVIEW_EMPHASIS_MIN_QTY = 20;
