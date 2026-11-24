/**
 * "What stopped you?" micro-survey — 4.6 redesign.
 *
 * Shown when the estimate modal closes without buying, once per visitor,
 * only if the price was on screen for ≥5 s.
 *
 * Chips fire exit_reason. In v4, after a chip tap offer a 20 % personal
 * code via issue-promo-code. In v3, end after chip with a thank-you.
 * No beforeunload. No shortcuts that set the shown flag without an event.
 */

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const SHOWN_KEY = "dim3d-exit-survey-shown";
const LEAD_KEY  = "dim3d-lead-submitted";

export function hasExitSurveyBeenShown(): boolean {
  try { return !!localStorage.getItem(SHOWN_KEY); } catch { return false; }
}

export function markExitSurveyShown(): void {
  try { localStorage.setItem(SHOWN_KEY, "1"); } catch {}
}

export function markLeadSubmitted(): void {
  try { localStorage.setItem(LEAD_KEY, "1"); } catch {}
}

export function hasLeadBeenSubmitted(): boolean {
  try { return !!localStorage.getItem(LEAD_KEY); } catch { return false; }
}

/**
 * Prompt 1 Part D: the six one-tap reasons. Keys must match the union in
 * analyticsEvents.ts (exit_reason_answered.reason).
 */
type ReasonKey = "price" | "shipping" | "comparing" | "material" | "review" | "other";
const CHIPS: Array<{ key: Exclude<ReasonKey, "other">; i18nKey: string }> = [
  { key: "price",     i18nKey: "exit.reason.price_high" },
  { key: "shipping",  i18nKey: "exit.reason.shipping"   },
  { key: "comparing", i18nKey: "exit.reason.comparing"  },
  { key: "material",  i18nKey: "exit.reason.material"   },
  { key: "review",    i18nKey: "exit.reason.review"     },
];

interface ExitReasonCardProps {
  priceBucket?: string;
  /** 3 or 4 — controls whether to offer a promo code after the chip. */
  pricingVersion: number;
  /** Called when the visitor clicks "Volver al pedido" (reopens the modal). */
  onReturnToOrder: () => void;
  onClose: () => void;
  /** Current quote link — passed to issue-promo-code and save-quote. */
  quoteLink?: string;
  /** Current total — for save-quote. */
  total?: number;
}

export function ExitReasonCard({ priceBucket, pricingVersion, onReturnToOrder, onClose, quoteLink, total }: ExitReasonCardProps) {
  const { t, language } = useLanguage();
  const [phase, setPhase] = useState<"chips" | "other_text" | "code_offer" | "done">("chips");
  const [sendFailed, setSendFailed] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const device = typeof window !== "undefined" && window.innerWidth < 640 ? "mobile" : "desktop";
  const country = typeof navigator !== "undefined"
    ? (navigator.language?.split("-")[1]?.toUpperCase() ?? null)
    : null;

  const deviceType: "mobile" | "tablet" | "desktop" =
    typeof window !== "undefined"
      ? window.innerWidth < 640
        ? "mobile"
        : window.innerWidth < 1024
        ? "tablet"
        : "desktop"
      : "desktop";

  const fireReason = (key: ReasonKey, text?: string) => {
    markExitSurveyShown();
    capture("exit_reason_answered", {
      reason: key,
      price_eur_bucket: priceBucket,
      device_type: deviceType,
    });
    // Keep the legacy exit_reason event for 1 release so the existing
    // PostHog view keeps counting answers; new dashboards read
    // exit_reason_answered instead.
    capture("exit_reason", {
      reason: key,
      price_eur_bucket: priceBucket,
      device,
      country,
      ...(text ? { text } : {}),
    });
  };

  const handleChip = (key: Exclude<ReasonKey, "other">) => {
    fireReason(key);
    setPhase(pricingVersion >= 4 ? "code_offer" : "done");
  };

  const handleOtherChip = () => {
    markExitSurveyShown();
    setPhase("other_text");
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fireReason("other", otherText.trim() || undefined);
    setPhase(pricingVersion >= 4 ? "code_offer" : "done");
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setSendFailed(false);
    try {
      capture("exit_code_requested", { email_domain: email.split("@")[1] });
      const { error: invokeErr } = await supabase.functions.invoke("issue-promo-code", {
        body: { kind: "exit", email: email.trim(), language, quoteLink: quoteLink ?? "" },
      });
      if (invokeErr) {
        console.warn("[ExitReasonCard] issue-promo-code error:", invokeErr);
        setSendFailed(true);
        return;
      }
      // Fire-and-forget: also save the quote so the visitor can resume
      if (quoteLink && total) {
        supabase.functions.invoke("save-quote", {
          body: { email: email.trim(), quoteLink, total, language },
        }).catch(() => {});
      }
      setPhase("done");
    } catch (err) {
      console.warn("[ExitReasonCard] issue-promo-code network error:", err);
      setSendFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label={t("survey.exit.title")}
      className="fixed bottom-0 left-0 right-0 z-[55] bg-background border-t border-border shadow-xl animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="container max-w-lg px-4 py-4">
        {phase === "done" ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground">{t("survey.exit.offerCode.sent")}</p>
            <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : phase === "code_offer" ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{t("survey.exit.offerCode.title")}</p>
              <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCodeSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setSendFailed(false); }}
                placeholder={t("survey.exit.offerCode.email")}
                data-ph-mask
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" variant="cta" size="sm" disabled={!email.trim() || sending}>
                {t("survey.exit.offerCode.cta")}
              </Button>
            </form>
            {sendFailed && (
              <p className="text-xs text-destructive mt-1">{t("survey.exit.offerCode.error")}</p>
            )}
          </>
        ) : phase === "other_text" ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{t("survey.exit.offerCode.other")}</p>
              <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleOtherSubmit} className="flex gap-2">
              <input
                type="text"
                value={otherText}
                onChange={e => setOtherText(e.target.value)}
                placeholder="…"
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="sm" variant="outline">OK</Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2" data-testid="exit-not-sent">
              {t("survey.exit.notSent")}
            </p>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{t("survey.exit.title")}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { onReturnToOrder(); onClose(); }}
                  className="text-xs text-accent font-medium hover:underline mr-2 whitespace-nowrap"
                >
                  {t("survey.exit.returnToOrder")}
                </button>
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map(({ key, i18nKey }) => (
                <button
                  key={key}
                  onClick={() => handleChip(key)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary hover:bg-accent/10 hover:border-accent transition-colors"
                >
                  {t(i18nKey)}
                </button>
              ))}
              <button
                onClick={handleOtherChip}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary hover:bg-accent/10 hover:border-accent transition-colors"
              >
                {t("exit.reason.other")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
