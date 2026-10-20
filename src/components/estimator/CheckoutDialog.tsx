import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  leftSlot: React.ReactNode;
  rightSlot: React.ReactNode;
  /** Actions slot: pinned below viewer on desktop, sticky bottom bar on mobile */
  actionSlot?: React.ReactNode;
}

/**
 * Presentational shell for the full-screen checkout dialog.
 *
 * Desktop (≥1024px): two columns — left (viewer+parts+actionSlot pinned), right (scrolls).
 * Mobile (<1024px): single-column layout:
 *   - header (shrink-0, always visible)
 *   - one scroll container for leftSlot + rightSlot (no nested scroll areas)
 *   - sticky footer for actionSlot
 * Uses 100dvh with a 100vh fallback so in-app browsers with toolbars work correctly.
 */
export function CheckoutDialog({ open, onOpenChange, title, closeLabel, leftSlot, rightSlot, actionSlot }: CheckoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          "p-0 gap-0 overflow-hidden flex flex-col",
          // Desktop: constrained modal
          "lg:w-[min(1200px,96vw)] lg:h-[min(92dvh,920px)] lg:rounded-2xl lg:max-w-none",
          // Mobile: full-screen, no rounded corners, use dvh with vh fallback
          "max-lg:inset-0 max-lg:rounded-none max-lg:fixed max-lg:translate-x-0 max-lg:translate-y-0",
          "max-lg:w-screen max-lg:[height:100dvh] max-lg:[height:100vh]",
          "[&>button.absolute]:hidden",
        ].join(" ")}
        style={{ maxWidth: "none" }}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* ── Header — always at top on both breakpoints ── */}
        <div className="shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-border bg-background z-10">
          <h2 className="font-bold text-base text-foreground">{title}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={closeLabel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Desktop: two-column layout ── */}
        <div className="hidden lg:flex flex-1 min-h-0 overflow-x-hidden">
          {/* Left column: viewer + parts + pinned actions */}
          <div className="lg:flex lg:flex-col lg:w-[45%] shrink-0 border-r border-border">
            <div className="flex-1 min-h-0 flex flex-col">
              {leftSlot}
            </div>
            {actionSlot && (
              <div className="shrink-0 border-t border-border p-4 bg-background">
                {actionSlot}
              </div>
            )}
          </div>

          {/* Right column: configurator + form (scrolls) */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="flex-1 px-5 py-4 overflow-y-auto overscroll-contain min-h-0">
              {rightSlot}
            </div>
          </div>
        </div>

        {/* ── Mobile: single scroll body + sticky footer ── */}
        <div className="lg:hidden flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* One scroll container for everything — no nested scroll areas */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {leftSlot}
            <div className="px-5 py-4">
              {rightSlot}
            </div>
          </div>

          {/* Sticky footer — actionSlot always visible */}
          {actionSlot && (
            <div
              className="shrink-0 border-t border-border p-4 bg-background"
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
