import { Send, CreditCard, MessageCircle, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedFile, PartSettings, PartDefaults, MaterialOption, BundleEstimateV2 } from "@/lib/pricing";
import { effectivePartSettings, isPartCustomized, INSTANT_MATERIALS } from "@/lib/pricing";
import { PICKUP_ADDRESS } from "@/config/cities";
import { PartRow } from "./PartRow";
import { GOOGLE_RATING, formatRating } from "@/data/rating";

const FAST_PICKUP_MATERIALS = ["PLA", "PETG", "TPU"];
const SHIPPING_SURCHARGE = 6;

interface OrderPanelProps {
  // Parts
  parsedFiles: ParsedFile[];
  validFiles: ParsedFile[];
  bundle: BundleEstimateV2 | null;
  defaults: PartDefaults;

  // Part interactions
  selectedFileIndex: number;
  expandedPartId: string | null;
  onSelectPart: (idx: number) => void;
  onExpandPart: (id: string | null) => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onPartSettingsChange: (id: string, settings: PartSettings) => void;
  onResetPartSettings: (id: string) => void;
  onApplyToAll: (id: string) => void;

  // Fulfillment
  fulfillment: "pickup" | "shipping" | null;
  fulfillmentAttempted: boolean;
  onFulfillmentChange: (v: "pickup" | "shipping") => void;
  pickupCity: string;

  // Contact form
  contactEmail: string;
  contactPhone: string;
  quoteError: string | null;
  checkoutError: string | null;
  oversizedFiles: ParsedFile[];
  onContactEmailChange: (v: string) => void;
  onContactPhoneChange: (v: string) => void;

  // State
  advancedMode: boolean;
  instantBuyEligible: boolean;
  isCheckingOut: boolean;
  preUploadDone: boolean;
  isSubmittingQuote: boolean;
  showManualReview: boolean;
  hasSubmitted: boolean;
  uploadState: "idle" | "uploading" | "slow" | "done" | "failed";

  // Callbacks
  onInstantBuy: () => void;
  onManualReview: () => void;
  onSubmitQuote: () => void;
  onWhatsApp: () => void;

  // i18n
  language: string;
  t: (key: string) => string;
  materialOptions: MaterialOption[];

  adminMode: boolean;
}

export function OrderPanel({
  parsedFiles,
  validFiles,
  bundle,
  defaults,
  selectedFileIndex,
  expandedPartId,
  onSelectPart,
  onExpandPart,
  onQtyChange,
  onRemove,
  onPartSettingsChange,
  onResetPartSettings,
  onApplyToAll,
  fulfillment,
  fulfillmentAttempted,
  onFulfillmentChange,
  pickupCity,
  contactEmail,
  contactPhone,
  quoteError,
  checkoutError,
  oversizedFiles,
  onContactEmailChange,
  onContactPhoneChange,
  advancedMode,
  instantBuyEligible,
  isCheckingOut,
  preUploadDone,
  isSubmittingQuote,
  showManualReview,
  hasSubmitted,
  uploadState,
  onInstantBuy,
  onManualReview,
  onSubmitQuote,
  onWhatsApp,
  language,
  t,
  materialOptions,
  adminMode,
}: OrderPanelProps) {
  // Build a map from validFile id → costCents from the bundle's orderResult
  const costByFileId: Record<string, number> = {};
  if (bundle) {
    validFiles.forEach((f, i) => {
      const costCents = bundle.orderResult.parts[i]?.costCents ?? 0;
      costByFileId[f.id] = costCents;
    });
  }

  // Check if every valid part's effective material is in FAST_PICKUP_MATERIALS
  const allFastPickup = validFiles.every(f => {
    const mat = effectivePartSettings(f, defaults).material;
    return FAST_PICKUP_MATERIALS.includes(mat);
  });

  // Check if every valid part's effective material is in INSTANT_MATERIALS
  const instantEligibleMaterials = validFiles.every(f => {
    const mat = effectivePartSettings(f, defaults).material;
    return INSTANT_MATERIALS.includes(mat);
  });

  // Check if any part has multicolour
  const anyMulticolour = validFiles.some(f => effectivePartSettings(f, defaults).multicolour);

  // Unique materials for display
  const uniqueMats = [...new Set(validFiles.map(f => effectivePartSettings(f, defaults).material))];
  const isMixedMaterials = uniqueMats.length > 1;

  // Effective instant display price
  const chargedPrint = bundle ? bundle.orderResult.chargedPrintCents / 100 : 0;
  const shippingFee = fulfillment === "shipping" ? SHIPPING_SURCHARGE : 0;
  const instantTotalPrice = instantBuyEligible ? chargedPrint + shippingFee : null;

  const disabled = isCheckingOut || isSubmittingQuote;

  if (parsedFiles.length === 0 || !bundle) return null;

  return (
    <div className="space-y-4">
      {/* Parts list title */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t("calc.parts.title").replace("{count}", String(parsedFiles.length))}
      </p>

      {/* Part rows */}
      <div className="space-y-2">
        {parsedFiles.map(f => {
          const vIdx = validFiles.indexOf(f);
          const eff = effectivePartSettings(f, defaults);
          const customized = isPartCustomized(f);
          const viewableIdx = validFiles.filter(v => !!v.file).indexOf(f);

          return (
            <PartRow
              key={f.id}
              part={f}
              effectiveMaterial={eff.material}
              effectiveColor={eff.color}
              effectiveInfill={eff.infill}
              effectiveWallLoops={eff.wallLoops}
              costCents={costByFileId[f.id] ?? 0}
              isSelected={viewableIdx !== -1 && viewableIdx === selectedFileIndex}
              isCustomized={customized}
              isExpanded={expandedPartId === f.id}
              advancedMode={advancedMode}
              disabled={disabled}
              t={t}
              language={language}
              materialOptions={materialOptions}
              onSelect={() => {
                if (viewableIdx !== -1) onSelectPart(viewableIdx);
              }}
              onQtyChange={qty => onQtyChange(f.id, qty)}
              onRemove={() => onRemove(f.id)}
              onToggleExpand={() => onExpandPart(expandedPartId === f.id ? null : f.id)}
              onSettingsChange={s => onPartSettingsChange(f.id, s)}
              onResetSettings={() => onResetPartSettings(f.id)}
              onApplyToAll={() => onApplyToAll(f.id)}
            />
          );
        })}
      </div>

      {/* Order summary (C4) */}
      {bundle && (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 space-y-1 text-sm">
          {/* Part lines are shown in the rows above; here we show order-level lines */}
          <div className="flex justify-between text-muted-foreground">
            <span>{t("calc.summary.setup")}</span>
            <span>€{(bundle.orderResult.setupCents / 100).toFixed(2)}</span>
          </div>
          {bundle.orderResult.minAdjCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("calc.summary.minAdjust")}</span>
              <span>+€{(bundle.orderResult.minAdjCents / 100).toFixed(2)}</span>
            </div>
          )}
          {bundle.orderResult.expressCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("calc.summary.express")}</span>
              <span>+€{(bundle.orderResult.expressCents / 100).toFixed(2)}</span>
            </div>
          )}
          {fulfillment === "shipping" && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("calc.summary.shipping")}</span>
              <span>+€{SHIPPING_SURCHARGE.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
            <span>{t("calc.summary.total")}</span>
            <span>
              €{instantBuyEligible && instantTotalPrice !== null
                ? instantTotalPrice.toFixed(2)
                : bundle.total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Mixed materials note (C7) */}
      {!instantEligibleMaterials && !anyMulticolour && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          {t("calc.mixed.note")}
        </p>
      )}

      {/* Overhang note */}
      {bundle.supportHeavy && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          {t("calc.overhang.note")}
        </p>
      )}

      {/* Multicolour note */}
      {anyMulticolour && (
        <p className="text-xs text-accent bg-accent/8 border border-accent/25 rounded-lg px-3 py-2">
          {t("calc.multicolour.note")}
        </p>
      )}

      {!adminMode && (
        <>
          {/* Fulfillment (C5) */}
          <div className="space-y-2">
            {/* Pickup option */}
            <button
              type="button"
              onClick={() => { onFulfillmentChange("pickup"); }}
              disabled={disabled}
              className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors disabled:opacity-60 ${
                fulfillment === "pickup"
                  ? "border-accent bg-accent/8 text-foreground"
                  : "border-input bg-background text-foreground hover:border-accent/60"
              }`}
            >
              <span className="font-medium">
                {t("calc.fulfillment.pickupAddress").replace("{address}", PICKUP_ADDRESS.full)}
              </span>
              <span className="text-muted-foreground text-xs ml-1">
                — {t("calc.fulfillment.free")} · {t("calc.fulfillment.byAppointment")}
              </span>
            </button>

            {/* Shipping option */}
            <button
              type="button"
              onClick={() => { onFulfillmentChange("shipping"); }}
              disabled={disabled}
              className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors disabled:opacity-60 ${
                fulfillment === "shipping"
                  ? "border-accent bg-accent/8 text-foreground"
                  : "border-input bg-background text-foreground hover:border-accent/60"
              }`}
            >
              {t("calc.instantBuy.fulfillment.shipping")}
              <span className="text-muted-foreground text-xs ml-1">+€{SHIPPING_SURCHARGE.toFixed(2)}</span>
            </button>

            {fulfillmentAttempted && fulfillment === null && (
              <p className="text-xs text-destructive">{t("calc.instantBuy.fulfillment.required")}</p>
            )}

            {fulfillment === "pickup" && allFastPickup && (
              <p className="text-xs text-muted-foreground">
                {t("calc.instantBuy.fulfillment.fastPickup").replace("{city}", pickupCity)}
              </p>
            )}
          </div>

          {/* Contact inputs */}
          <div className="space-y-2">
            <input
              type="email"
              value={contactEmail}
              onChange={e => onContactEmailChange(e.target.value)}
              placeholder={t("calc.contact.email")}
              disabled={disabled}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={e => onContactPhoneChange(e.target.value)}
              placeholder={t("calc.contact.phone")}
              disabled={disabled}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            {quoteError && <p className="text-xs text-destructive">{quoteError}</p>}
            {checkoutError && instantBuyEligible && !showManualReview && (
              <p className="text-xs text-destructive">{checkoutError}</p>
            )}
            {oversizedFiles.length > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                {t("calc.notice.tooLargeToUpload")}
              </p>
            )}
          </div>

          {/* Buttons (C6) */}
          <div className="space-y-2">
            {instantBuyEligible && !showManualReview ? (
              <>
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full gap-2"
                  onClick={onInstantBuy}
                  disabled={isCheckingOut || !preUploadDone}
                >
                  {isCheckingOut
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Paying…</>
                    : <><CreditCard className="w-4 h-4" />{t("calc.instantBuy.buyNow").replace("{price}", instantTotalPrice?.toFixed(2) ?? "")}</>
                  }
                </Button>
                <div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 text-xs border-accent text-accent hover:bg-accent/10 hover:border-accent"
                    onClick={onManualReview}
                    disabled={isCheckingOut}
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    {t("calc.instantBuy.manualReview")}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    {t("calc.instantBuy.reviewHint")}
                  </p>
                </div>
                <Button
                  variant="whatsapp-outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={onWhatsApp}
                  disabled={isCheckingOut}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("calc.result.whatsapp")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full gap-2"
                  onClick={onSubmitQuote}
                  disabled={isSubmittingQuote}
                >
                  {isSubmittingQuote
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{t("calc.contact.submitting")}</>
                    : <><Send className="w-4 h-4" />{t("calc.contact.submit")}</>
                  }
                </Button>
                <Button
                  variant="whatsapp-outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={onWhatsApp}
                  disabled={isSubmittingQuote}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("calc.result.whatsapp")}
                </Button>
              </>
            )}
          </div>

          {/* Upload status */}
          {hasSubmitted && uploadState !== "idle" && (
            <div className="flex items-center gap-1.5 text-xs">
              {(uploadState === "uploading" || uploadState === "slow") && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {uploadState === "slow" ? t("calc.upload.status.slow") : t("calc.upload.status.uploading")}
                  </span>
                </>
              )}
              {uploadState === "done" && (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-whatsapp shrink-0" />
                  <span className="text-muted-foreground">{t("calc.upload.status.done")}</span>
                </>
              )}
              {uploadState === "failed" && (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-muted-foreground">{t("calc.upload.status.failed")}</span>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrderPanel;
