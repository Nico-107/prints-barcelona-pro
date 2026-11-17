import { useState } from "react";
import { X } from "lucide-react";
import { computeBundleV3 } from "@/lib/estimate";
import { EST } from "@/lib/estimator/core";
import type { ParsedFile, PartDefaults } from "@/lib/pricing";
import type { QualityKey } from "@/lib/estimator/core";
import { formatEUR } from "@/lib/formatPrice";
import type { Language } from "@/lib/pathLanguage";
import { capture } from "@/lib/analytics";
import { PICKUP_ADDRESS } from "@/config/cities";
import { supabaseAnon } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

interface LowerPricePanelProps {
  parsedFiles: ParsedFile[];
  defaults: PartDefaults;
  urgency: "standard" | "express" | "urgent";
  fulfillment: "pickup" | "shipping" | null;
  shippingOnly: boolean;
  pricingVersion: 3 | 4;
  currentTotal: number;
  language: Language;
  t: (key: string) => string;
  onApply: (patch: Partial<{ infillPct: number; quality: QualityKey; fulfillment: "pickup" | "shipping"; urgency: "standard" | "express" | "urgent" }>) => void;
  onClose: () => void;
}

interface Option {
  key: string;
  label: string;
  saving: number;
  patch: Partial<{ infillPct: number; quality: QualityKey; fulfillment: "pickup" | "shipping"; urgency: "standard" | "express" | "urgent" }>;
}

function computeTotal(parsedFiles: ParsedFile[], defaults: PartDefaults, urgency: string, pricingVersion: 3 | 4): number {
  const b = computeBundleV3(parsedFiles, defaults, urgency, { v4: pricingVersion === 4 });
  return b ? b.orderResult.chargedPrintCents / 100 : 0;
}

export function LowerPricePanel({
  parsedFiles,
  defaults,
  urgency,
  fulfillment,
  shippingOnly,
  pricingVersion,
  currentTotal,
  language,
  t,
  onApply,
  onClose,
}: LowerPricePanelProps) {
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetEmail, setBudgetEmail] = useState("");
  const [budgetSent, setBudgetSent] = useState(false);
  const [budgetSending, setBudgetSending] = useState(false);

  // Compute options
  const options: Option[] = [];

  // 10% infill option
  if (defaults.infill > 10) {
    const newDefaults = { ...defaults, infill: 10 };
    const newTotal = computeTotal(parsedFiles, newDefaults, urgency, pricingVersion);
    const saving = currentTotal - newTotal;
    if (saving > 0.009) {
      options.push({
        key: "infill10",
        label: t("calc.lowerPrice.infill10"),
        saving,
        patch: { infillPct: 10 },
      });
    }
  }

  // Fast quality option
  if (defaults.quality !== "fast") {
    const newDefaults = { ...defaults, quality: "fast" as QualityKey };
    const newTotal = computeTotal(parsedFiles, newDefaults, urgency, pricingVersion);
    const saving = currentTotal - newTotal;
    if (saving > 0.009) {
      options.push({
        key: "fastQuality",
        label: t("calc.lowerPrice.fastQuality"),
        saving,
        patch: { quality: "fast" as QualityKey },
      });
    }
  }

  // Pickup option (only if currently on shipping and pickup is allowed)
  if (fulfillment === "shipping" && !shippingOnly) {
    const saving = EST.shippingCents / 100;
    options.push({
      key: "pickup",
      label: t("calc.lowerPrice.pickup").replace("{city}", PICKUP_ADDRESS.city),
      saving,
      patch: { fulfillment: "pickup" as const },
    });
  }

  // Standard urgency option
  if (urgency !== "standard") {
    const newTotal = computeTotal(parsedFiles, defaults, "standard", pricingVersion);
    const saving = currentTotal - newTotal;
    if (saving > 0.009) {
      options.push({
        key: "standardUrgency",
        label: t("calc.lowerPrice.standardUrgency"),
        saving,
        patch: { urgency: "standard" as const },
      });
    }
  }

  const handleApply = (opt: Option) => {
    capture("lower_price_option_applied", { option: opt.key, saving_eur: opt.saving });
    onApply(opt.patch);
    onClose();
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount.trim() || !budgetEmail.trim() || budgetSending) return;
    setBudgetSending(true);
    try {
      const payload: TablesInsert<"quote_requests"> = {
        contact_email: budgetEmail.trim(),
        material: defaults.material,
        infill: String(defaults.infill),
        wall_loops: defaults.wallLoops,
        urgency,
        quantity: parsedFiles.filter(f => !f.parseError).reduce((s, f) => s + f.qty, 0) || 1,
        estimated_grams: 0,
        estimated_hours: 0,
        estimated_price_low: currentTotal,
        estimated_price_high: currentTotal,
        status: "pending",
        pieces: [{ note: `[PRESUPUESTO MÁXIMO: ${budgetAmount.trim()} €]` }] as import("@/integrations/supabase/types").Json,
      };
      await supabaseAnon.from("quote_requests").insert(payload);
      capture("budget_sent", { amount_eur: parseFloat(budgetAmount) || 0, email_domain: budgetEmail.split("@")[1] });
      setBudgetSent(true);
    } catch (err) {
      console.warn("[LowerPricePanel] budget submit failed:", err);
    } finally {
      setBudgetSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 mt-3 relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-sm font-semibold text-foreground mb-3">{t("calc.lowerPrice.title")}</p>

      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleApply(opt)}
            className="flex items-center justify-between w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-background hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-foreground">{opt.label}</span>
            <span className="text-accent font-semibold ml-3 shrink-0">
              −{formatEUR(opt.saving, language)}
            </span>
          </button>
        ))}

        {/* "Dime tu presupuesto" row */}
        {!budgetOpen && !budgetSent && (
          <button
            type="button"
            onClick={() => setBudgetOpen(true)}
            className="flex items-center justify-between w-full rounded-lg border border-dashed border-border px-3 py-2.5 text-sm bg-background hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-muted-foreground">{t("calc.lowerPrice.budget.cta")}</span>
          </button>
        )}

        {budgetOpen && !budgetSent && (
          <form onSubmit={handleBudgetSubmit} className="flex flex-col gap-2 mt-1">
            <input
              type="text"
              inputMode="decimal"
              value={budgetAmount}
              onChange={e => setBudgetAmount(e.target.value)}
              placeholder={t("calc.lowerPrice.budget.placeholder")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="email"
              value={budgetEmail}
              onChange={e => setBudgetEmail(e.target.value)}
              placeholder={t("calc.lowerPrice.budget.email")}
              data-ph-mask
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={budgetSending || !budgetAmount.trim() || !budgetEmail.trim()}
              className="w-full h-9 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {t("calc.lowerPrice.budget.send")}
            </button>
          </form>
        )}

        {budgetSent && (
          <p className="text-sm text-muted-foreground px-1">{t("calc.lowerPrice.budget.sent")}</p>
        )}
      </div>
    </div>
  );
}
