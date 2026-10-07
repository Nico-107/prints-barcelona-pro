import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  leftSlot: React.ReactNode;
  rightSlot: React.ReactNode;
}

/**
 * Presentational shell for the full-screen checkout dialog.
 * No logic lives here — StlEstimator composes all content and passes it as slots.
 *
 * Desktop (≥1024px): two columns, only right scrolls.
 * Mobile (<1024px): single column, sticky bottom bar with close button.
 */
export function CheckoutDialog({ open, onOpenChange, title, closeLabel, leftSlot, rightSlot }: CheckoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          /* sizing */
          "p-0 gap-0 overflow-hidden flex flex-col",
          /* desktop: large centred dialog */
          "lg:w-[min(1200px,96vw)] lg:h-[min(92dvh,920px)] lg:rounded-2xl lg:max-w-none",
          /* mobile: full-screen sheet */
          "max-lg:inset-0 max-lg:h-[100dvh] max-lg:w-screen max-lg:rounded-none max-lg:fixed max-lg:translate-x-0 max-lg:translate-y-0",
          /* hide the Radix close button — we have our own */
          "[&>button.absolute]:hidden",
        ].join(" ")}
        /* Override default Radix sizing to allow our custom sizes */
        style={{ maxWidth: "none" }}
      >
        {/* Hidden accessible title */}
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Body — desktop: two columns; mobile: single column */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-x-hidden">
          {/* LEFT column — viewer + parts (desktop only, fixed; mobile: hidden or compact) */}
          <div className="hidden lg:flex lg:flex-col lg:w-[45%] shrink-0 border-r border-border overflow-y-auto overscroll-contain">
            {leftSlot}
          </div>

          {/* RIGHT column — configurator + price + actions (scrolls on desktop) */}
          <div className="flex-1 min-w-0 overflow-y-auto overscroll-contain flex flex-col">
            {/* Mobile: viewer at top (compact, collapsible) */}
            <div className="lg:hidden border-b border-border">
              {leftSlot}
            </div>

            {/* Header row with title and close button */}
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

            {/* Right column scrollable content */}
            <div className="flex-1 px-5 py-4 overflow-y-auto overscroll-contain">
              {rightSlot}
            </div>

            {/* Mobile sticky bottom — the primary button is inside rightSlot;
                but we add a safe-area spacer so content is not under the home bar */}
            <div className="shrink-0 h-[env(safe-area-inset-bottom)] lg:hidden" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckoutDialog;
