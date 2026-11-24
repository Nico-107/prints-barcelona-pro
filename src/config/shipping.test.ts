/**
 * Prompt 3 — the critical test. Across every page group, shipping mode,
 * fulfillment choice and discount state, the total shown next to Buy MUST
 * equal the total Stripe charges (= parts subtotal + shipping line). If
 * these two drift the user gets the exact surprise that killed 20 of 22
 * under-€15 clicks.
 *
 * 12 cases chosen to cover:
 *   - pickup vs shipping
 *   - variant A (delivered) vs variant B (upfront) vs non-local
 *   - under €30 vs over €30
 *   - plain vs DIMENSION11 (11% off, applied to parts subtotal only)
 */

import { describe, it, expect } from 'vitest';
import {
  finalTotalCents,
  shippingLineCents,
  type ShippingMode,
  type FulfillmentChoice,
  type PageGroup,
} from './shipping';

/** DIMENSION11 = 11% off parts subtotal; shipping is NEVER discounted. */
function applyDimension11(partsCents: number, code: string | null): number {
  if (code !== 'DIMENSION11') return partsCents;
  const discounted = Math.round(partsCents * (1 - 0.11));
  return Math.max(discounted, 0);
}

interface Case {
  name: string;
  partsCents: number;
  promo: string | null;
  pageGroup: PageGroup;
  shippingMode: ShippingMode;
  fulfillment: FulfillmentChoice;
  /** Explicit expected total in cents so the test fails loud if anything
   *  drifts, not just if the two sides agree with each other. */
  expectedTotalCents: number;
}

const CASES: Case[] = [
  // 1-4: NON-LOCAL (always delivered pricing, no pickup option)
  { name: 'non-local €9.90 shipping (delivered)',             partsCents:  990, promo: null,           pageGroup: 'non_local', shippingMode: 'delivered', fulfillment: 'shipping', expectedTotalCents: 1490 },
  { name: 'non-local €34.90 shipping (free)',                 partsCents: 3490, promo: null,           pageGroup: 'non_local', shippingMode: 'delivered', fulfillment: 'shipping', expectedTotalCents: 3490 },
  { name: 'non-local €9.90 shipping + DIMENSION11 (under 30)',partsCents:  990, promo: 'DIMENSION11',  pageGroup: 'non_local', shippingMode: 'delivered', fulfillment: 'shipping', expectedTotalCents: 1390 /* 881 + 490 = 1371 → charm 1390, capped at 3090 */ },
  { name: 'non-local €34.90 shipping + DIMENSION11',          partsCents: 3490, promo: 'DIMENSION11',  pageGroup: 'non_local', shippingMode: 'delivered', fulfillment: 'shipping', expectedTotalCents: 3106 /* parts 3106; still ≥ 3000 → free shipping */ },

  // 5-8: LOCAL variant A (delivered) — includes pickup fallback
  { name: 'local A €9.90 pickup (free)',                      partsCents:  990, promo: null,           pageGroup: 'local',     shippingMode: 'delivered', fulfillment: 'pickup',   expectedTotalCents:  990 },
  { name: 'local A €9.90 shipping (delivered)',               partsCents:  990, promo: null,           pageGroup: 'local',     shippingMode: 'delivered', fulfillment: 'shipping', expectedTotalCents: 1490 },
  { name: 'local A €34.90 shipping (free)',                   partsCents: 3490, promo: null,           pageGroup: 'local',     shippingMode: 'delivered', fulfillment: 'shipping', expectedTotalCents: 3490 },
  { name: 'local A €34.90 pickup + DIMENSION11',              partsCents: 3490, promo: 'DIMENSION11',  pageGroup: 'local',     shippingMode: 'delivered', fulfillment: 'pickup',   expectedTotalCents: 3106 },

  // 9-12: LOCAL variant B (upfront) — explicit "parts + shipping" split
  { name: 'local B €9.90 shipping (upfront)',                 partsCents:  990, promo: null,           pageGroup: 'local',     shippingMode: 'upfront',   fulfillment: 'shipping', expectedTotalCents: 1480 /* 990 + 490 */ },
  { name: 'local B €34.90 shipping (free, upfront)',          partsCents: 3490, promo: null,           pageGroup: 'local',     shippingMode: 'upfront',   fulfillment: 'shipping', expectedTotalCents: 3490 },
  { name: 'local B €9.90 pickup (upfront)',                   partsCents:  990, promo: null,           pageGroup: 'local',     shippingMode: 'upfront',   fulfillment: 'pickup',   expectedTotalCents:  990 },
  { name: 'local B €9.90 shipping + DIMENSION11 (upfront)',   partsCents:  990, promo: 'DIMENSION11',  pageGroup: 'local',     shippingMode: 'upfront',   fulfillment: 'shipping', expectedTotalCents: 1371 /* 881 + 490 */ },
];

function fmt(c: number): string {
  return '€' + (c / 100).toFixed(2);
}

describe('Prompt 3 — Buy total == Stripe total (12 cases)', () => {
  const rows: Array<{ case: string; buyTotal: string; partsAfter: string; shipping: string; stripeTotal: string; expected: string; ok: string }> = [];

  for (const c of CASES) {
    it(c.name, () => {
      const partsAfterPromo = applyDimension11(c.partsCents, c.promo);
      const args = {
        partsSubtotalCents: partsAfterPromo,
        pageGroup: c.pageGroup,
        shippingMode: c.shippingMode,
        fulfillment: c.fulfillment,
      } as const;
      const buyTotal = finalTotalCents(args);
      const shipLine = shippingLineCents(args);
      const stripeTotal = partsAfterPromo + shipLine;

      rows.push({
        case: c.name,
        buyTotal: fmt(buyTotal),
        partsAfter: fmt(partsAfterPromo),
        shipping: fmt(shipLine),
        stripeTotal: fmt(stripeTotal),
        expected: fmt(c.expectedTotalCents),
        ok: buyTotal === stripeTotal && buyTotal === c.expectedTotalCents ? '✓' : '✗',
      });

      expect(buyTotal, `Buy total mismatch for "${c.name}"`).toBe(c.expectedTotalCents);
      expect(stripeTotal, `Stripe total ≠ Buy total for "${c.name}"`).toBe(buyTotal);
    });
  }

  it('prints a human table of every case', () => {
    const pad = (s: string, n: number) => s.padEnd(n, ' ');
    const widths = [55, 10, 12, 10, 12, 10, 3];
    console.log('\nPrompt 3 — checkout consistency table');
    console.log(['case', 'buy', 'parts (post-promo)', 'shipping', 'stripe', 'expected', 'ok']
      .map((h, i) => pad(h, widths[i])).join(' | '));
    console.log(widths.map(w => '-'.repeat(w)).join('-+-'));
    for (const r of rows) {
      console.log([
        r.case, r.buyTotal, r.partsAfter, r.shipping, r.stripeTotal, r.expected, r.ok,
      ].map((c, i) => pad(c, widths[i])).join(' | '));
    }
  });
});
