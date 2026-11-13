import type { BundleEstimateV3 } from "@/lib/estimate";
import { EST } from "@/lib/estimator/core";
import { formatEUR } from "@/lib/formatPrice";
import type { Language } from "@/lib/pathLanguage";

interface PriceBreakdownProps {
  bundle: BundleEstimateV3;
  fulfillment: "pickup" | "shipping" | null;
  t: (key: string) => string;
  language: Language;
}

/**
 * Phase 4.1: visible breakdown above the total.
 *
 * Lines (all engine-derived, never typed):
 *   Pieza 4,02 €            — the raw piece price (baseCents, no min adj)
 *   Pedido mínimo 10 €      — shown only when the minimum kicks in
 *   Suplemento express ...  — when a faster tier is chosen
 *   Envío 5,90 €            — only when fulfilment is shipping
 *   Total                   — bold line, after all adjustments
 *   + helper line explaining the minimum when it applies
 *
 * No accordion: this is always visible per Phase 4.1.
 */
export function PriceBreakdown({ bundle, fulfillment, t, language }: PriceBreakdownProps) {
  const pieceEur = bundle.order.baseCents / 100;
  const minAdjEur = bundle.orderResult.minAdjCents / 100;
  const expressEur = bundle.orderResult.expressCents / 100;
  const setupEur = bundle.orderResult.setupCents / 100;
  const shippingEur = fulfillment === "shipping" ? EST.shippingCents / 100 : 0;
  const totalEur = bundle.orderResult.chargedPrintCents / 100 + shippingEur;
  const isMinimumHit = bundle.orderResult.minAdjCents > 0;

  // Conv 1.2: when the order is at the minimum, the "Piezas" line shows
  // the order price (10 €), not the raw engine piece price (e.g. 4,02 €
  // with a separate "Pedido mínimo" adjustment). The honest total is
  // simply 10 € + shipping, with a one-line helper under the total:
  // "Pedido mínimo 10 € · añade más piezas desde +1 €".
  const piecesEur = isMinimumHit ? pieceEur + minAdjEur : pieceEur;

  return (
    <div className="border-t border-border pt-2 mt-2 text-sm space-y-1" data-price-breakdown>
      <div className="flex justify-between">
        <span>{t("calc.breakdown.pieces")}</span>
        <span className="font-mono">{formatEUR(piecesEur, language)}</span>
      </div>
      {setupEur > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>{t("calc.summary.setup")}</span>
          <span className="font-mono">+{formatEUR(setupEur, language)}</span>
        </div>
      )}
      {expressEur > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>{t("calc.summary.express")}</span>
          <span className="font-mono">+{formatEUR(expressEur, language)}</span>
        </div>
      )}
      {shippingEur > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>{t("calc.summary.shipping")}</span>
          <span className="font-mono">+{formatEUR(shippingEur, language)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold border-t border-border pt-1 text-foreground">
        <span>{t("calc.summary.total")}</span>
        <span className="font-mono">{formatEUR(totalEur, language)}</span>
      </div>
      {isMinimumHit && (
        <p className="text-xs text-muted-foreground pt-1" data-min-helper>
          {t("calc.breakdown.minHelperShort")}
        </p>
      )}
    </div>
  );
}

export default PriceBreakdown;
