import { useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  leftSlot: React.ReactNode;
  rightSlot: React.ReactNode;
  /** Pinned summary slot — sits at the bottom of the right column on desktop,
   *  and as a sticky footer on mobile. */
  actionSlot?: React.ReactNode;
  /** Optional file name rendered next to the title (conv-27 §bug 10). */
  fileName?: string | null;
}

/**
 * Presentational shell for the full-screen checkout dialog.
 *
 * Desktop (≥1024px): two columns — left viewer ≈60%, right config ≈40%, with
 * the pinned summary at the bottom of the right column.
 * Mobile (<1024px): single-column, sticky footer for actionSlot.
 *
 * Side effect: while open, sets `data-modal-open="true"` on <html> so the
 * global CSS can hide floating widgets (WhatsApp float, launch-offer banner,
 * exit popup) — conv-27 §bug 7.
 */
export function CheckoutDialog({ open, onOpenChange, title, closeLabel, leftSlot, rightSlot, actionSlot, fileName }: CheckoutDialogProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      document.documentElement.setAttribute("data-modal-open", "true");
    } else {
      document.documentElement.removeAttribute("data-modal-open");
    }
    return () => { document.documentElement.removeAttribute("data-modal-open"); };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          "p-0 gap-0 overflow-hidden flex flex-col border-slate-200 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]",
          // Desktop: 1320×860, rounded-xl
          "lg:w-[min(1320px,94vw)] lg:h-[min(860px,92vh)] lg:rounded-xl lg:max-w-none",
          // Mobile: full-screen
          "max-lg:inset-0 max-lg:rounded-none max-lg:fixed max-lg:translate-x-0 max-lg:translate-y-0",
          "max-lg:w-screen max-lg:[height:100dvh] max-lg:[height:100vh]",
          "[&>button.absolute]:hidden",
        ].join(" ")}
        style={{ maxWidth: "none" }}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 bg-white z-10">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="font-semibold text-base text-slate-900 shrink-0">{title}</h2>
            {fileName && (
              <span className="text-sm text-slate-500 truncate" data-testid="modal-filename">{fileName}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label={closeLabel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop: 60/40 split */}
        <div className="hidden lg:flex flex-1 min-h-0 overflow-x-hidden">
          {/* Left column: viewer (≈60%), full height */}
          <div className="lg:flex lg:flex-col lg:w-[60%] shrink-0 border-r border-slate-200 bg-slate-50">
            <div className="flex-1 min-h-0 flex flex-col">
              {leftSlot}
            </div>
          </div>

          {/* Right column: scrolling config + pinned summary */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white">
            <div className="flex-1 px-5 py-4 overflow-y-auto overscroll-contain min-h-0">
              {rightSlot}
            </div>
            {actionSlot && (
              <div className="shrink-0 border-t border-slate-200 p-4 bg-white">
                {actionSlot}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: single scroll body + sticky footer */}
        <div className="lg:hidden flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {leftSlot}
            <div className="px-5 py-4">
              {rightSlot}
            </div>
          </div>
          {actionSlot && (
            <div
              className="shrink-0 border-t border-slate-200 p-4 bg-white"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
            >
              {actionSlot}
            </div>
          )}
          {!actionSlot && (
            <div className="shrink-0" style={{ height: "env(safe-area-inset-bottom)" }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckoutDialog;
