import { Send, CreditCard, MessageCircle, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedFile, PartSettings, PartDefaults, MaterialOption } from "@/lib/pricing";
import { effectivePartSettings, isPartCustomized } from "@/lib/pricing";
import type { BundleEstimateV3 } from "@/lib/estimate";
import { EST } from "@/lib/estimator/core";
import { PICKUP_ADDRESS } from "@/config/cities";
import { PartRow } from "./PartRow";
import { ContactFields } from "./ContactFields";
import { PriceBreakdown } from "./PriceBreakdown";
import { GOOGLE_RATING, formatRating } from "@/data/rating";
import { formatEUR } from "@/lib/formatPrice";
import type { Language } from "@/lib/pathLanguage";

const FAST_PICKUP_MATERIALS = ["PLA", "PETG", "TPU"];

interface OrderPanelProps {
  // Parts
  parsedFiles: ParsedFile[];
  validFiles: ParsedFile[];
  bundle: BundleEstimateV3 | null;
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
  contactTouched: boolean;
  quoteError: string | null;
  checkoutError: string | null;
  oversizedFiles: ParsedFile[];
  onContactEmailChange: (v: string) => void;
  onContactPhoneChange: (v: string) => void;

  // State
  hideParts?: boolean;
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

  /** Which section to render. Default 'all' preserves the original full layout. */
  section?: 'all' | 'form' | 'actions';

  /** When section='actions', show quote-only reason when applicable */
  anyMulticolour?: boolean;
  instantTotalPrice?: number | null;

  /** Ref to pass to the compact fulfillment picker for focus on blocked Buy Now */
  fulfillmentPickerRef?: React.RefObject<HTMLDivElement>;
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
  contactTouched,
  quoteError,
  checkoutError,
  oversizedFiles,
  onContactEmailChange,
  onContactPhoneChange,
  hideParts = false,
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
  section = 'all',
  anyMulticolour = false,
  instantTotalPrice: instantTotalPriceProp,
  fulfillmentPickerRef,
}: OrderPanelProps) {
  const lang = language as Language;
  const costByFileId: Record<string, number> = {};
  if (bundle) {
    validFiles.forEach((f, i) => {
      const costCents = bundle.orderResult.parts[i]?.costCents ?? 0;
      costByFileId[f.id] = costCents;
    });
  }

  const allFastPickup = validFiles.every(f => {
    const mat = effectivePartSettings(f, defaults).material;
    return FAST_PICKUP_MATERIALS.includes(mat);
  });

  const instantEligibleMaterials = validFiles.every(f => {
    const mat = effectivePartSettings(f, defaults).material;
    return !!EST.materials[mat]?.instant;
  });

  const anyMulticolourLocal = validFiles.some(f => effectivePartSettings(f, defaults).multicolour);
  const effectiveAnyMulticolour = anyMulticolour || anyMulticolourLocal;

  const uniqueMats = [...new Set(validFiles.map(f => effectivePartSettings(f, defaults).material))];
  const isMixedMaterials = uniqueMats.length > 1;

  const chargedPrint = bundle ? bundle.orderResult.chargedPrintCents / 100 : 0;
  const shippingFee = fulfillment === "shipping" ? EST.shippingCents / 100 : 0;
  const instantTotalPrice = instantTotalPriceProp !== undefined
    ? instantTotalPriceProp
    : (instantBuyEligible ? chargedPrint + shippingFee : null);

  const disabled = isCheckingOut || isSubmittingQuote;

  if (parsedFiles.length === 0 || !bundle) return null;

  // Buy Now button label — "from {price}" before selection, exact after
  const buyNowLabel = (() => {
    if (isCheckingOut) return null;
    const basePrice = chargedPrint; // print total without shipping
    if (fulfillment === null) {
      return t("calc.instantBuy.buyNow.from").replace("{price}", formatEUR(basePrice, lang));
    }
    const total = instantTotalPrice ?? basePrice;
    return t("calc.instantBuy.buyNow").replace("{price}", formatEUR(total, lang));
  })();

  // Shipping fee formatted
  const shippingFormatted = formatEUR(EST.shippingCents / 100, lang);

  // ── 'actions' section only ─────────────────────────────────────────────────
  if (section === 'actions') {
    const showQuoteOnlyWhy = !adminMode && !instantBuyEligible &&
      (bundle.orderResult.chargedPrintCents > EST.instantMaxCents || effectiveAnyMulticolour);

    const displayPrice = instantBuyEligible && instantTotalPrice !== null
      ? formatEUR(instantTotalPrice, lang)
      : formatEUR(bundle.total, lang);

    // Single action error: checkout beats quote (Buy Now context > Review context)
    const actionError = checkoutError && instantBuyEligible && !showManualReview
      ? checkoutError
      : quoteError
      ? quoteError
      : null;

    return (
      <div className="space-y-3">
        {/* Total + shipping sub-line */}
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold">{t("calc.summary.total")}</span>
            <span className="text-xl font-bold">{displayPrice}</span>
          </div>
          {fulfillment === "shipping" && (
            <p className="text-xs text-muted-foreground text-right">
              {t("calc.summary.shipping")} +{shippingFormatted}
            </p>
          )}
          {fulfillment === "pickup" && (
            <p className="text-xs text-muted-foreground text-right">{t("calc.fulfillment.free")}</p>
          )}
        </div>

        {/* Quote-only reason */}
        {showQuoteOnlyWhy && (
          <p className="text-xs text-muted-foreground">{t("calc.actions.quoteOnlyWhy")}</p>
        )}

        {/* Single action error — at most one message */}
        {actionError && <p className="text-xs text-destructive" role="alert">{actionError}</p>}

        {!adminMode && (
          <div className="space-y-2">
            {instantBuyEligible && !showManualReview ? (
              <>
                {/* Compact fulfillment picker — visible next to Buy Now on all screen sizes */}
                <div
                  className="flex gap-2"
                  data-testid="compact-fulfillment-picker"
                  ref={fulfillmentPickerRef}
                  tabIndex={-1}
                >
                  <button
                    type="button"
                    data-testid="compact-fulfillment-pickup"
                    onClick={() => onFulfillmentChange("pickup")}
                    disabled={isCheckingOut}
                    className={`flex-1 text-center rounded-lg border px-2 py-2 text-xs transition-colors disabled:opacity-60 whitespace-nowrap ${
                      fulfillment === "pickup"
                        ? "border-accent bg-accent/8 text-foreground font-medium"
                        : "border-input bg-background text-foreground hover:border-accent/60"
                    }`}
                  >
                    {t("calc.instantBuy.fulfillment.pickup.short")}
                  </button>
                  <button
                    type="button"
                    data-testid="compact-fulfillment-shipping"
                    onClick={() => onFulfillmentChange("shipping")}
                    disabled={isCheckingOut}
                    className={`flex-1 text-center rounded-lg border px-2 py-2 text-xs transition-colors disabled:opacity-60 whitespace-nowrap ${
                      fulfillment === "shipping"
                        ? "border-accent bg-accent/8 text-foreground font-medium"
                        : "border-input bg-background text-foreground hover:border-accent/60"
                    }`}
                  >
                    {t("calc.instantBuy.fulfillment.shipping.short").replace("{price}", shippingFormatted)}
                  </button>
                </div>
                {fulfillmentAttempted && fulfillment === null && (
                  <p className="text-xs text-destructive" role="alert">{t("calc.instantBuy.fulfillment.required")}</p>
                )}
                {/* Primary: Buy Now */}
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full gap-2"
                  data-testid="buy-now-btn"
                  onClick={onInstantBuy}
                  disabled={isCheckingOut || !preUploadDone}
                >
                  {isCheckingOut
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{t("calc.contact.submitting")}</>
                    : <><CreditCard className="w-4 h-4" />{buyNowLabel}</>
                  }
                </Button>
                {/* Trust line */}
                <p className="text-[11px] text-center text-muted-foreground leading-tight">
                  {t("calc.trust.promise")}
                </p>
                <p className="text-[11px] text-center text-muted-foreground leading-tight">
                  {t("calc.trust.secureWith")} {t("calc.trust.methods")}
                </p>
                {/* Secondary row: Review + WhatsApp side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs border-accent text-accent hover:bg-accent/10 hover:border-accent"
                    onClick={onManualReview}
                    disabled={isCheckingOut}
                  >
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span className="min-w-0">{t("calc.instantBuy.manualReview.short")}</span>
                  </Button>
                  <Button
                    variant="whatsapp-outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={onWhatsApp}
                    disabled={isCheckingOut}
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="min-w-0">{t("calc.result.whatsapp.short")}</span>
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">{t("calc.instantBuy.reviewHint")}</p>
              </>
            ) : (
              <>
                {/* Primary: Send quote */}
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
                {/* Secondary: WhatsApp */}
                <Button
                  variant="whatsapp-outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={onWhatsApp}
                  disabled={isSubmittingQuote}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("calc.result.whatsapp.short")}
                </Button>
              </>
            )}
          </div>
        )}

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
      </div>
    );
  }

  // ── 'form' + 'all' ─────────────────────────────────────────────────────────
  const renderForm = section === 'all' || section === 'form';
  const renderActions = section === 'all';

  return (
    <div className="space-y-4">
      {/* Parts list */}
      {!hideParts && (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("calc.parts.title").replace("{count}", String(parsedFiles.length))}
          </p>
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
                  language={lang}
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
        </>
      )}

      {/* Order summary */}
      {renderForm && bundle && (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 space-y-1 text-sm">
          {bundle.orderResult.setupCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("calc.summary.setup")}</span>
              <span>{formatEUR(bundle.orderResult.setupCents / 100, lang)}</span>
            </div>
          )}
          {bundle.orderResult.minAdjCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("calc.summary.minAdjust")}</span>
              <span>+{formatEUR(bundle.orderResult.minAdjCents / 100, lang)}</span>
            </div>
          )}
          {bundle.orderResult.expressCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("calc.summary.express")}</span>
              <span>+{formatEUR(bundle.orderResult.expressCents / 100, lang)}</span>
            </div>
          )}
          {fulfillment === "shipping" && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("calc.summary.shipping")}</span>
              <span>+{shippingFormatted}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
            <span>{t("calc.summary.total")}</span>
            <span>
              {instantBuyEligible && instantTotalPrice !== null
                ? formatEUR(instantTotalPrice, lang)
                : formatEUR(bundle.total, lang)}
            </span>
          </div>
        </div>
      )}

      {/* Why this price? */}
      {renderForm && bundle && <PriceBreakdown bundle={bundle} fulfillment={fulfillment} t={t} language={lang} />}

      {/* Notes */}
      {renderForm && !instantEligibleMaterials && !effectiveAnyMulticolour && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          {t("calc.mixed.note")}
        </p>
      )}

      {renderForm && bundle.supportHeavy && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          {t("calc.overhang.note")}
        </p>
      )}

      {renderForm && effectiveAnyMulticolour && (
        <p className="text-xs text-accent bg-accent/8 border border-accent/25 rounded-lg px-3 py-2">
          {t("calc.multicolour.note")}
        </p>
      )}

      {renderForm && !adminMode && (
        <>
          {/* Fulfillment */}
          <div className="space-y-2">
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
              <span className="text-muted-foreground text-xs ml-1">+{shippingFormatted}</span>
            </button>

            {/* Fulfillment error only shown here in form, NOT also in actions */}
            {section === 'all' && fulfillmentAttempted && fulfillment === null && (
              <p className="text-xs text-destructive" role="alert">{t("calc.instantBuy.fulfillment.required")}</p>
            )}

            {fulfillment === "pickup" && allFastPickup && (
              <p className="text-xs text-muted-foreground">
                {t("calc.instantBuy.fulfillment.fastPickup").replace("{city}", pickupCity)}
              </p>
            )}
          </div>

          {/* Contact fields */}
          <ContactFields
            email={contactEmail}
            phone={contactPhone}
            touched={contactTouched}
            disabled={disabled}
            t={t}
            onEmailChange={onContactEmailChange}
            onPhoneChange={onContactPhoneChange}
          />
          {/* Errors only in section='all'; section='form' defers to 'actions' bar */}
          {section === 'all' && quoteError && <p className="text-xs text-destructive" role="alert">{quoteError}</p>}
          {section === 'all' && checkoutError && instantBuyEligible && !showManualReview && (
            <p className="text-xs text-destructive" role="alert">{checkoutError}</p>
          )}
          {oversizedFiles.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              {t("calc.notice.tooLargeToUpload")}
            </p>
          )}
        </>
      )}

      {/* Actions (only in 'all' mode) */}
      {renderActions && !adminMode && (
        <>
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
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{t("calc.contact.submitting")}</>
                    : <><CreditCard className="w-4 h-4" />{buyNowLabel}</>
                  }
                </Button>
                {/* Trust line */}
                <p className="text-[11px] text-center text-muted-foreground leading-tight">
                  {t("calc.trust.promise")}
                </p>
                <p className="text-[11px] text-center text-muted-foreground leading-tight">
                  {t("calc.trust.secureWith")} {t("calc.trust.methods")}
                </p>
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
