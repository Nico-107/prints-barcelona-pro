import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { BundleEstimateV3 } from "@/lib/estimate";
import { EST } from "@/lib/estimator/core";

interface PriceBreakdownProps {
  bundle: BundleEstimateV3;
  fulfillment: "pickup" | "shipping" | null;
  t: (key: string) => string;
}

export function PriceBreakdown({ bundle, fulfillment, t }: PriceBreakdownProps) {
  const [open, setOpen] = useState(false);

  const totalSupportsGrams = bundle.estimates.reduce((s, e) => s + e.supportCm3 * 1.05, 0);
  const hasSupports = totalSupportsGrams >= 0.5;
  const hoursRange = `~${bundle.totalHours.toFixed(1)}`;

  return (
    <div className="border-t border-border pt-2">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v); } }}
        className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        aria-expanded={open}
      >
        <span className="font-medium">{t("calc.why.title")}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>{t("calc.why.plastic").replace("{grams}", bundle.totalGrams.toFixed(1))}</span>
          </div>
          {hasSupports && (
            <div className="flex justify-between pl-3">
              <span>{t("calc.why.supports").replace("{grams}", totalSupportsGrams.toFixed(1))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t("calc.why.time").replace("{hours}", hoursRange)}</span>
          </div>
          {bundle.orderResult.setupCents > 0 && (
            <div className="flex justify-between">
              <span>{t("calc.summary.setup")}</span>
              <span>€{(bundle.orderResult.setupCents / 100).toFixed(2)}</span>
            </div>
          )}
          {bundle.orderResult.minAdjCents > 0 && (
            <div className="flex justify-between">
              <span>{t("calc.summary.minAdjust")}</span>
              <span>+€{(bundle.orderResult.minAdjCents / 100).toFixed(2)}</span>
            </div>
          )}
          {bundle.order.baseCents <= EST.minimumEur * 100 && (
            <p className="text-xs text-muted-foreground/70 italic">{t("calc.why.minNote")}</p>
          )}
          {bundle.orderResult.expressCents > 0 && (
            <div className="flex justify-between">
              <span>{t("calc.summary.express")}</span>
              <span>+€{(bundle.orderResult.expressCents / 100).toFixed(2)}</span>
            </div>
          )}
          {fulfillment === "shipping" && (
            <div className="flex justify-between">
              <span>{t("calc.summary.shipping")}</span>
              <span>+€{(EST.shippingCents / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-border pt-1 text-foreground">
            <span>{t("calc.summary.total")}</span>
            <span>
              €{(bundle.orderResult.chargedPrintCents / 100 + (fulfillment === "shipping" ? EST.shippingCents / 100 : 0)).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground/70 pt-1 italic">{t("calc.why.note")}</p>
        </div>
      )}
    </div>
  );
}

export default PriceBreakdown;
