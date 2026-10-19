/**
 * "What stopped you?" micro-survey.
 *
 * Shown as a non-blocking bottom card after the estimate modal is closed
 * without a lead, when:
 *   - The modal was open for ≥5s (measured by the caller via `modalOpenMs`).
 *   - Not yet shown this visitor (localStorage flag, wrapped in try/catch).
 *   - No lead has been submitted in this session.
 *
 * Replaces the exit-intent popup when triggered (both can't show together).
 */

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";

const SHOWN_KEY = "dim3d-exit-survey-shown";
const LEAD_KEY  = "dim3d-lead-submitted";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

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

const REASONS: Array<{ key: string; i18nKey: string }> = [
  { key: "price",    i18nKey: "survey.exit.reason.price"    },
  { key: "shipping", i18nKey: "survey.exit.reason.shipping" },
  { key: "material", i18nKey: "survey.exit.reason.material" },
  { key: "talk",     i18nKey: "survey.exit.reason.talk"     },
  { key: "browsing", i18nKey: "survey.exit.reason.browsing" },
];

interface ExitReasonCardProps {
  priceBucket?: string;
  onClose: () => void;
}

export function ExitReasonCard({ priceBucket, onClose }: ExitReasonCardProps) {
  const { t, language } = useLanguage();
  const [chosen, setChosen] = useState<string | null>(null);

  const handleReason = (key: string) => {
    setChosen(key);
    markExitSurveyShown();
    capture("exit_reason", {
      reason: key,
      price_eur_bucket: priceBucket,
    });
  };

  const handleOther = () => {
    setChosen("other");
    markExitSurveyShown();
    capture("exit_reason", {
      reason: "other",
      price_eur_bucket: priceBucket,
    });
  };

  const whatsappMsg =
    language === "ca" ? "Hola, m'agradaria parlar sobre un pressupost." :
    language === "es" ? "Hola, me gustaría hablar con alguien sobre mi presupuesto." :
    "Hi, I'd like to talk to someone about my quote.";

  return (
    <div
      role="dialog"
      aria-label={t("survey.exit.title")}
      className="fixed bottom-0 left-0 right-0 z-[55] bg-background border-t border-border shadow-xl animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="container max-w-lg px-4 py-4">
        {chosen ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">{t("survey.exit.thanks")}</p>
            {chosen === "talk" && (
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-whatsapp font-medium hover:underline"
                onClick={() => capture("whatsapp_from_modal", { source: "exit_survey" })}
              >
                <MessageCircle className="w-4 h-4" />
                {t("survey.exit.whatsapp")}
              </a>
            )}
            <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{t("survey.exit.title")}</p>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {REASONS.map(({ key, i18nKey }) => (
                <button
                  key={key}
                  onClick={() => handleReason(key)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary hover:bg-accent/10 hover:border-accent transition-colors"
                >
                  {t(i18nKey)}
                </button>
              ))}
              <button
                onClick={handleOther}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary hover:bg-accent/10 hover:border-accent transition-colors"
              >
                {t("survey.exit.reason.other")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
