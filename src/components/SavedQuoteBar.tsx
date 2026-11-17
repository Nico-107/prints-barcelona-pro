import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { loadSavedQuote, clearSavedQuote, type SavedQuoteEntry } from "@/lib/savedQuoteStore";
import { capture } from "@/lib/analytics";
import { formatEUR } from "@/lib/formatPrice";
import type { Language } from "@/lib/pathLanguage";

interface SavedQuoteBarProps {
  language: Language;
  t: (key: string) => string;
  /** Called when the visitor clicks "Resume" — receives the saved entry. */
  onResume: (entry: SavedQuoteEntry) => void;
  /** Don't show the bar when the estimator already has files loaded. */
  hasFiles: boolean;
}

export function SavedQuoteBar({ language, t, onResume, hasFiles }: SavedQuoteBarProps) {
  const [entry, setEntry] = useState<SavedQuoteEntry | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (hasFiles) return;
    loadSavedQuote().then(setEntry);
  }, [hasFiles]);

  useEffect(() => {
    if (entry && !hasFiles && !dismissed) {
      capture("saved_quote_bar_shown", {
        total: entry.total,
        file_name: entry.fileName ?? undefined,
      });
    }
  // Fire once per mount when the entry appears
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!entry]);

  if (!entry || dismissed || hasFiles) return null;

  const fileName = entry.fileName ?? "…";
  const price = formatEUR(entry.total, language);
  const text = t("calc.savedBar.text")
    .replace("{file}", fileName)
    .replace("{price}", price);

  const handleResume = () => {
    capture("saved_quote_bar_clicked", { action: "resume" });
    onResume(entry);
  };

  const handleDismiss = () => {
    capture("saved_quote_bar_clicked", { action: "dismiss" });
    clearSavedQuote();
    setDismissed(true);
  };

  return (
    <div className="max-w-xl mx-auto mb-4 rounded-xl bg-accent/10 border border-accent/25 px-4 py-3 flex items-center gap-3 text-sm">
      <span className="flex-1 text-foreground truncate">{text}</span>
      <button
        type="button"
        onClick={handleResume}
        className="shrink-0 font-semibold text-accent hover:underline whitespace-nowrap"
      >
        {t("calc.savedBar.resume")}
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={handleDismiss}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
