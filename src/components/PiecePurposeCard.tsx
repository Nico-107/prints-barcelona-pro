/**
 * PiecePurposeCard — Prompt 1 Part E.
 *
 * Shown on the ?checkout=success thank-you page: one question, one click,
 * no typing. Captures `piece_purpose_answered` with { purpose, order_number,
 * value_eur } so we can segment post-purchase behaviour (repeat likelihood,
 * cohort cost, LTV) by use case. Doesn't block anything else on the page —
 * it's a bottom sheet the user can dismiss at any time.
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";
import { useLanguage } from "@/contexts/LanguageContext";

export type PiecePurposeKey =
  | "repair"
  | "personal_project"
  | "business"
  | "gift_or_decor"
  | "other";

const CHOICES: Array<{ key: PiecePurposeKey; i18nKey: string }> = [
  { key: "repair",           i18nKey: "piece.purpose.repair"            },
  { key: "personal_project", i18nKey: "piece.purpose.personal_project"  },
  { key: "business",         i18nKey: "piece.purpose.business"          },
  { key: "gift_or_decor",    i18nKey: "piece.purpose.gift_or_decor"     },
  { key: "other",            i18nKey: "piece.purpose.other"             },
];

/** Keyed by orderNumber (or 'no-order' sentinel) so each paid order only
 *  asks once; a refresh shouldn't re-ask. */
function answeredKey(orderNumber: string | null): string {
  return `dim3d-piece-purpose-${orderNumber ?? "no-order"}`;
}

function hasAnswered(orderNumber: string | null): boolean {
  try { return !!localStorage.getItem(answeredKey(orderNumber)); } catch { return false; }
}

function markAnswered(orderNumber: string | null): void {
  try { localStorage.setItem(answeredKey(orderNumber), "1"); } catch { /* ignore */ }
}

interface PiecePurposeCardProps {
  orderNumber: string | null;
  valueEur?: number;
}

export function PiecePurposeCard({ orderNumber, valueEur }: PiecePurposeCardProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [thanked, setThanked] = useState(false);

  useEffect(() => {
    if (hasAnswered(orderNumber)) return;
    setOpen(true);
  }, [orderNumber]);

  if (!open) return null;

  const handlePick = (key: PiecePurposeKey) => {
    capture("piece_purpose_answered", {
      purpose: key,
      order_number: orderNumber ?? undefined,
      value_eur: valueEur,
    });
    markAnswered(orderNumber);
    setThanked(true);
    // Close after ~1.8s so the user sees the "Thanks!" confirmation but it
    // doesn't linger blocking anything.
    window.setTimeout(() => setOpen(false), 1800);
  };

  return (
    <div
      role="dialog"
      aria-label={t("piece.purpose.title")}
      data-testid="piece-purpose-card"
      className="fixed bottom-0 left-0 right-0 z-[55] bg-background border-t border-border shadow-xl animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="container max-w-lg px-4 py-4">
        {thanked ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{t("piece.purpose.thanks")}</p>
            <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{t("piece.purpose.title")}</p>
              <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => setOpen(false)} aria-label="close">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHOICES.map(({ key, i18nKey }) => (
                <button
                  key={key}
                  type="button"
                  data-purpose={key}
                  onClick={() => handlePick(key)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary hover:bg-accent/10 hover:border-accent transition-colors"
                >
                  {t(i18nKey)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
