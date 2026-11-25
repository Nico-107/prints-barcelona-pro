// S1 — Pure server-side checkout evaluation. The Deno `create-instant-checkout/index.ts`
// imports this module and only handles HTTP, storage, Stripe and DB calls on top.
// Node tests import it directly (via a relative path) so client and server logic are
// exercised by the same test suite.

import {
  estimatePart,
  priceOrder,
  type MeshAnalysis,
  type PartEstimate,
  type QualityKey,
  EST,
} from "../pricing/engine.ts";
import { deliveryV5, type Fulfillment, DEFAULT_SHIPPING } from "../pricing/shipping.ts";
import { plateFit } from "../pricing/plateFit.ts";

export interface Piece {
  name: string;
  quantity: number;
  path: string;
  material: string;
  infill: number;
  wallLoops: number;
  quality: QualityKey;
  supports: boolean;
  orientation: "auto" | number;
  scale?: number;
  color?: string | null;
}

export interface ClientQuote {
  partsSubtotalCents: number;
  shippingCents: number;
  totalCents: number;
  pricingVersion: number;
}

export interface EvaluateBody {
  pricingVersion: 5;
  urgency: "standard" | "express" | "urgent";
  fulfillment: Fulfillment;
  pageGroup: "local" | "non_local";
  variant?: "A" | "B";
  promoCode?: string;
  isTest?: boolean;
  pieces: Piece[];
  clientQuote?: ClientQuote;
}

export type EvaluateError =
  | "INVALID_VERSION"
  | "INVALID_PIECES"
  | "OVERSIZE_PART"
  | "PRICE_UPDATED"
  | "INVALID_PROMO"
  | "RATE_LIMITED";

export interface EvaluateResult {
  ok: boolean;
  error?: EvaluateError;
  reason?: string;
  quote?: {
    partsSubtotalCents: number;
    shippingCents: number;
    totalCents: number;
    discountedPartsCents: number;
    promoPct: number;
    promoDiscountCents: number;
  };
  // Present when server pricing differs from the client's shown total.
  priceUpdated?: { from: number; to: number };
}

const PROMO_CODES: Record<string, { pct: number }> = {
  DIMENSION11: { pct: 10 },
};

function pricePieces(body: EvaluateBody, analyses: MeshAnalysis[]): { estimates: PartEstimate[]; partsSubtotalCents: number; reasons: string[] } {
  const estimates = body.pieces.map((p, i) => {
    const analysis = analyses[i];
    return estimatePart(analysis, {
      material: p.material,
      infillPct: p.infill,
      wallLoops: p.wallLoops,
      quality: p.quality,
      supports: p.supports,
      orientation: p.orientation,
    });
  });
  const order = priceOrder(
    body.pieces.map((p, i) => ({ name: p.name, quantity: p.quantity, material: p.material, estimate: estimates[i] })),
    body.urgency,
    { v4: true },
  );
  return { estimates, partsSubtotalCents: order.totalCents, reasons: order.reasons };
}

export function evaluateCheckout(body: EvaluateBody, analyses: MeshAnalysis[]): EvaluateResult {
  if (body.pricingVersion !== 5) return { ok: false, error: "INVALID_VERSION" };
  if (!Array.isArray(body.pieces) || body.pieces.length === 0) return { ok: false, error: "INVALID_PIECES" };
  if (analyses.length !== body.pieces.length) return { ok: false, error: "INVALID_PIECES" };
  if (body.promoCode !== undefined && (typeof body.promoCode !== "string" || body.promoCode.length > 32)) {
    return { ok: false, error: "INVALID_PROMO" };
  }
  const { partsSubtotalCents, reasons } = pricePieces(body, analyses);
  if (reasons.some((r) => r.startsWith("oversize"))) return { ok: false, error: "OVERSIZE_PART" };

  const promo = body.promoCode ? PROMO_CODES[body.promoCode.toUpperCase()] : undefined;
  const promoPct = promo?.pct ?? 0;
  const promoDiscountCents = promo ? Math.round(partsSubtotalCents * promo.pct / 100) : 0;
  const discountedPartsCents = Math.max(0, partsSubtotalCents - promoDiscountCents);

  const delivery = deliveryV5(
    {
      partsSubtotalCents,
      discountedPartsCents,
      fulfillment: body.fulfillment,
      pageGroup: body.pageGroup,
      variant: body.variant,
    },
    DEFAULT_SHIPPING,
  );

  const quote = {
    partsSubtotalCents,
    shippingCents: delivery.shippingCents,
    totalCents: delivery.totalCents,
    discountedPartsCents,
    promoPct,
    promoDiscountCents,
  };

  if (body.clientQuote) {
    const diff = quote.totalCents - body.clientQuote.totalCents;
    if (Math.abs(diff) <= 2) return { ok: true, quote };
    if (diff < 0) return { ok: true, quote };
    return {
      ok: false,
      error: "PRICE_UPDATED",
      quote,
      priceUpdated: { from: body.clientQuote.totalCents, to: quote.totalCents },
    };
  }
  return { ok: true, quote };
}

// S5 — server oversize gate (rotation-aware fit from plateFit.ts).
export function checkOversize(tris: Float32Array, scale = 1): { fits: boolean; scaleToFit: number } {
  if (scale !== 1) {
    const scaled = new Float32Array(tris.length);
    for (let i = 0; i < tris.length; i++) scaled[i] = tris[i] * scale;
    const r = plateFit(scaled);
    return { fits: r.fits, scaleToFit: r.scaleToFit };
  }
  const r = plateFit(tris);
  return { fits: r.fits, scaleToFit: r.scaleToFit };
}

// S3 — verified client summary. For heavy files the server trusts the client's
// analysis_summary only when every cheap invariant checks out.
export interface AnalysisSummary {
  sha256: string;
  triangles: number;
  bbox: [number, number, number];
  unionVolumeMm3: number;
  shellVolumesAbs: number[]; // |signed volume| per shell, mm³
  class: "clean" | "disjoint" | "overlapping" | "open" | "mixed";
}

export function verifyClientSummary(summary: AnalysisSummary, storedSha256: string, storedBytes: number): { ok: boolean; reason?: string } {
  if (summary.sha256 !== storedSha256) return { ok: false, reason: "sha-mismatch" };
  if (!Array.isArray(summary.shellVolumesAbs) || summary.shellVolumesAbs.length === 0) return { ok: false, reason: "no-shells" };
  const sumAbs = summary.shellVolumesAbs.reduce((a, v) => a + v, 0);
  const maxAbs = summary.shellVolumesAbs.reduce((a, v) => Math.max(a, v), 0);
  if (!(maxAbs <= summary.unionVolumeMm3 + 1e-3)) return { ok: false, reason: "union<max-shell" };
  if (!(summary.unionVolumeMm3 <= sumAbs + 1e-3)) return { ok: false, reason: "union>sum-shells" };
  const bboxVol = summary.bbox.reduce((a, d) => a * Math.max(d, 1e-9), 1);
  if (summary.unionVolumeMm3 > bboxVol * 1.01) return { ok: false, reason: "union>bbox" };
  if (summary.triangles <= 0 || summary.triangles > 10_000_000) return { ok: false, reason: "tri-count" };
  void storedBytes;
  return { ok: true };
}

// S6 — rate limit with Retry-After. 10 requests per minute per key. Identical repeats
// within 10 s return the cached result without counting.
const buckets = new Map<string, { count: number; resetAt: number }>();
const lastRepeat = new Map<string, { bodyHash: string; resultTotal: number; at: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const REPEAT_MS = 10_000;

export function rateLimit(key: string, bodyHash: string, resultTotalCents: number, now: number = Date.now()): { allowed: boolean; retryAfterMs?: number; cached?: boolean } {
  const prev = lastRepeat.get(key);
  if (prev && prev.bodyHash === bodyHash && now - prev.at < REPEAT_MS) {
    return { allowed: true, cached: true };
  }
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    lastRepeat.set(key, { bodyHash, resultTotal: resultTotalCents, at: now });
    return { allowed: true };
  }
  if (b.count >= MAX_PER_WINDOW) {
    return { allowed: false, retryAfterMs: b.resetAt - now };
  }
  b.count++;
  lastRepeat.set(key, { bodyHash, resultTotal: resultTotalCents, at: now });
  return { allowed: true };
}

export function _resetRateLimit() {
  buckets.clear();
  lastRepeat.clear();
}

// S4 — Stripe line items. One per piece + shipping line + express surcharge.
export interface StripeLine {
  name: string;
  amountCents: number;
}

export function stripeLines(body: EvaluateBody, quote: { partsSubtotalCents: number; shippingCents: number; discountedPartsCents: number; promoDiscountCents: number; promoPct: number }, language = "es"): StripeLine[] {
  const lines: StripeLine[] = [];
  for (const p of body.pieces) {
    const base = Math.floor(quote.discountedPartsCents / body.pieces.length);
    lines.push({ name: `${p.name} — ${p.material}`.slice(0, 120), amountCents: base });
  }
  // residual absorbed into last line
  const sum = lines.reduce((a, l) => a + l.amountCents, 0);
  if (lines.length > 0) lines[lines.length - 1].amountCents += quote.discountedPartsCents - sum;
  if (quote.shippingCents > 0) {
    const label =
      body.pageGroup === "non_local"
        ? language === "it"
          ? "Spedizione (inclusa)"
          : "Envío (incluido)"
        : language === "it"
          ? "Spedizione"
          : "Envío";
    lines.push({ name: label, amountCents: quote.shippingCents });
  } else if (body.fulfillment === "shipping" && quote.partsSubtotalCents >= DEFAULT_SHIPPING.freeFromCents) {
    lines.push({ name: language === "it" ? "Spedizione gratuita" : "Envío gratis", amountCents: 0 });
  }
  return lines;
}

export const MAX_CHARGE_CENTS = 20590;
export { EST };

// S7 — Prompt 1 server parts. ph_did and ph_sid are forwarded to Stripe's success/cancel
// URLs and stored in the session metadata so PostHog can join server-side orders with the
// originating browser session. Also redirect create-stripe-payment-link to
// `https://www.dimension3dprints.com/track` (handled in that function's index.ts).
export function appendPostHogParams(url: string, phDid: string | null, phSid: string | null): string {
  const u = new URL(url);
  if (phDid) u.searchParams.set("ph_did", phDid);
  if (phSid) u.searchParams.set("ph_sid", phSid);
  return u.toString();
}

