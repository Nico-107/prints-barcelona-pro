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
 * Desktop (≥1024px): left column = scrolling top (viewer+chips) + actionSlot pinned at bottom.
 * Mobile (<1024px): actionSlot is a sticky bottom bar; rightSlot scrolls above it.
 */
export function CheckoutDialog({ open, onOpenChange, title, closeLabel, leftSlot, rightSlot, actionSlot }: CheckoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          "p-0 gap-0 overflow-hidden flex flex-col",
          "lg:w-[min(1200px,96vw)] lg:h-[min(92dvh,920px)] lg:rounded-2xl lg:max-w-none",
          "max-lg:inset-0 max-lg:h-[100dvh] max-lg:w-screen max-lg:rounded-none max-lg:fixed max-lg:translate-x-0 max-lg:translate-y-0",
          "[&>button.absolute]:hidden",
        ].join(" ")}
        style={{ maxWidth: "none" }}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-x-hidden">
          {/* LEFT column — desktop only: viewer/parts flex-col + pinned actionSlot */}
          <div className="hidden lg:flex lg:flex-col lg:w-[45%] shrink-0 border-r border-border">
            {/* Content: viewer + parts list + add-files, grows to fill space */}
            <div className="flex-1 min-h-0 flex flex-col">
              {leftSlot}
            </div>
            {/* Pinned actions at bottom of left column */}
            {actionSlot && (
              <div className="shrink-0 border-t border-border p-4 bg-background">
                {actionSlot}
              </div>
            )}
          </div>

          {/* RIGHT column — configurator + form (scrolls) */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Mobile: viewer at top */}
            <div className="lg:hidden border-b border-border">
              {leftSlot}
            </div>

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
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

            {/* Scrollable right content */}
            <div className="flex-1 px-5 py-4 overflow-y-auto overscroll-contain min-h-0">
              {rightSlot}
            </div>

            {/* Mobile sticky bottom bar */}
            {actionSlot && (
              <div className="lg:hidden shrink-0 border-t border-border p-4 bg-background" style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}>
                {actionSlot}
              </div>
            )}

            {/* Safe area spacer when no actionSlot on mobile */}
            {!actionSlot && (
              <div className="shrink-0 h-[env(safe-area-inset-bottom)] lg:hidden" />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckoutDialog;
