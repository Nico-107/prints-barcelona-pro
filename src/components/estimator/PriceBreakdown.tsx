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
 * Visible price breakdown above the total.
 *
 * Invariant: the visible rows always add up to the Total row.
 *   Piezas                 = raw parts cost  (baseCents − minAdjCents, pre-minimum, pre-urgency)
 *   Ajuste a pedido mínimo = baseCents − rawTotalCents, shown only when > 0
 *   Preparación del pedido = setupCents, shown only when > 0
 *   Suplemento express     = expressCents, shown only when > 0
 *   Envío                  = shippingCents, shown only when fulfilment = shipping
 *   Total                  = chargedPrintCents + shippingCents
 *
 * sum(visible rows) === Total holds for every engine state because
 * chargedPrintCents = baseCents + expressCents and
 * baseCents = (baseCents − minAdjCents) + minAdjCents.
 */
export function PriceBreakdown({ bundle, fulfillment, t, language }: PriceBreakdownProps) {
  const baseCents = bundle.order.baseCents;
  const minAdjCents = bundle.orderResult.minAdjCents;
  const expressCents = bundle.orderResult.expressCents;
  const setupCents = bundle.orderResult.setupCents;
  const shippingCents = fulfillment === "shipping" ? EST.shippingCents : 0;

  // rawPartsCents is the honest parts cost pre-minimum. It CAN equal
  // baseCents (no minimum applied) or be less (minimum applied and an
  // explicit adjustment row appears to make the math visible).
  const rawPartsCents = baseCents - minAdjCents;
  const totalCents = bundle.orderResult.chargedPrintCents + shippingCents;
  const isMinimumHit = minAdjCents > 0;

  return (
    <div className="border-t border-border pt-2 mt-2 text-sm space-y-1" data-price-breakdown>
      <div className="flex justify-between">
        <span>{t("calc.breakdown.pieces")}</span>
        <span className="font-mono">{formatEUR(rawPartsCents / 100, language)}</span>
      </div>
      {isMinimumHit && (
        <div className="flex justify-between text-muted-foreground">
          <span>{t("calc.summary.minAdjust")}</span>
          <span className="font-mono">+{formatEUR(minAdjCents / 100, language)}</span>
        </div>
      )}
      {setupCents > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>{t("calc.summary.setup")}</span>
          <span className="font-mono">+{formatEUR(setupCents / 100, language)}</span>
        </div>
      )}
      {expressCents > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>{t("calc.summary.express")}</span>
          <span className="font-mono">+{formatEUR(expressCents / 100, language)}</span>
        </div>
      )}
      {shippingCents > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>{t("calc.summary.shipping")}</span>
          <span className="font-mono">+{formatEUR(shippingCents / 100, language)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold border-t border-border pt-1 text-foreground">
        <span>{t("calc.summary.total")}</span>
        <span className="font-mono">{formatEUR(totalCents / 100, language)}</span>
      </div>
      {isMinimumHit && rawPartsCents < 1000 && (
        <p className="text-xs text-muted-foreground pt-1" data-min-helper>
          {t("calc.breakdown.minHelperShort")
            .replace("{parts}", formatEUR(rawPartsCents / 100, language))}
        </p>
      )}
    </div>
  );
}

export default PriceBreakdown;
