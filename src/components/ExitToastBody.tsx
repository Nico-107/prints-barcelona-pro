/**
 * ExitToastBody — body of the mobile-dismiss sonner toast.
 *
 * Prompt 1 Part D: the inline toast was previously ending on a chip tap that
 * fired `exit_reason` (never read by any PostHog query; the chips also sat
 * below a primary CTA + three exit options, so users dismissed the toast
 * before noticing them). This component swaps the toast content from
 * "recover / exits / chips" to "reward code reveal" on tap, so answering a
 * reason actually produces something the visitor keeps — and fires
 * `exit_reason_answered` with { reason, price_eur_bucket, device_type }.
 */

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { capture } from "@/lib/analytics";

export type ExitReasonKey =
  | "price"
  | "shipping"
  | "comparing"
  | "material"
  | "review"
  | "other";

interface ExitToastBodyProps {
  toastId: string | number;
  priceStr: string;
  ship: string;
  sureLabel: string;
  backLabel: string;
  saveQuoteLabel: string;
  copyLinkLabel: string;
  reasonPrompt: string;
  rewardTitle: string;
  rewardCodeLabel: string;
  copyCodeLabel: string;
  copiedCodeLabel: string;
  waHref: string;
  reasons: Array<{ key: ExitReasonKey; label: string }>;
  priceBucket?: string;
  deviceType: "mobile" | "tablet" | "desktop";
  rewardCode: string;
  onRecover: () => void;
  onSaveQuote: () => void;
  onCopyLink: () => void;
}

export function ExitToastBody(props: ExitToastBodyProps) {
  const [phase, setPhase] = useState<"chips" | "reward">("chips");
  const [codeCopied, setCodeCopied] = useState(false);

  const handleChip = (key: ExitReasonKey) => {
    capture("exit_reason_answered", {
      reason: key,
      price_eur_bucket: props.priceBucket,
      device_type: props.deviceType,
    });
    setPhase("reward");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(props.rewardCode);
      setCodeCopied(true);
    } catch {
      // clipboard unavailable — show the code visually, user can type it
      setCodeCopied(false);
    }
  };

  if (phase === "reward") {
    return (
      <div
        data-testid="exit-popup"
        role="status"
        className="rounded-lg border border-border bg-background shadow-lg p-4 min-w-[300px] max-w-sm space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-sm">{props.rewardTitle}</p>
          <button
            type="button"
            data-testid="exit-popup-dismiss"
            onClick={() => sonnerToast.dismiss(props.toastId)}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground text-sm leading-none px-1"
          >
            ✕
          </button>
        </div>
        <div
          data-testid="exit-popup-reward"
          className="rounded-md border border-dashed border-accent bg-accent/5 px-3 py-2 text-center"
        >
          <p className="font-mono text-base font-semibold tracking-wider text-foreground">
            {props.rewardCode}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{props.rewardCodeLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="w-full rounded-md border border-input text-sm px-3 py-2 text-foreground hover:bg-muted/50"
        >
          {codeCopied ? props.copiedCodeLabel : props.copyCodeLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="exit-popup"
      role="status"
      className="rounded-lg border border-border bg-background shadow-lg p-4 min-w-[300px] max-w-sm space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm">
            {props.priceStr} · {props.ship}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{props.sureLabel}</p>
        </div>
        <button
          type="button"
          data-testid="exit-popup-dismiss"
          onClick={() => sonnerToast.dismiss(props.toastId)}
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground text-sm leading-none px-1"
        >
          ✕
        </button>
      </div>
      {/* Reasons promoted ABOVE the recover CTA — Part D cause fix. */}
      <div data-testid="exit-popup-reasons">
        <p className="text-[11px] text-muted-foreground mb-1">{props.reasonPrompt}</p>
        <div className="flex flex-wrap gap-1.5">
          {props.reasons.map((r) => (
            <button
              key={r.key}
              type="button"
              data-reason={r.key}
              onClick={() => handleChip(r.key)}
              className="text-[11px] rounded-full border border-input bg-background px-2.5 py-1 text-foreground hover:bg-muted/50"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        data-testid="exit-popup-back"
        onClick={() => {
          props.onRecover();
          sonnerToast.dismiss(props.toastId);
        }}
        className="w-full rounded-md bg-cta text-cta-foreground text-sm font-semibold px-3 py-2 shadow-sm hover:bg-cta/90"
      >
        {props.backLabel}
      </button>
      <div className="grid grid-cols-3 gap-2 text-[11px]" data-testid="exit-popup-exits">
        <a
          href={props.waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            capture("exit_popup_action" as any, { action: "whatsapp" });
            sonnerToast.dismiss(props.toastId);
          }}
          className="flex items-center justify-center gap-1 rounded-md border border-input px-2 py-1.5 text-foreground hover:bg-muted/50"
          data-ph-name="exit-wa"
        >
          <MessageCircle className="w-3 h-3" /> WhatsApp
        </a>
        <button
          type="button"
          onClick={() => {
            props.onSaveQuote();
            sonnerToast.dismiss(props.toastId);
          }}
          className="flex items-center justify-center gap-1 rounded-md border border-input px-2 py-1.5 text-foreground hover:bg-muted/50"
          data-ph-name="exit-save-quote"
        >
          <Send className="w-3 h-3" /> {props.saveQuoteLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            props.onCopyLink();
            capture("exit_popup_action" as any, { action: "copy_link" });
          }}
          className="flex items-center justify-center gap-1 rounded-md border border-input px-2 py-1.5 text-foreground hover:bg-muted/50"
          data-ph-name="exit-copy-link"
        >
          {props.copyLinkLabel}
        </button>
      </div>
    </div>
  );
}
