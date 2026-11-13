/**
 * Phase 2.3 + 3.5: ReviewBlock — excerpt-first review cards.
 *
 * Replaces the walls of full-length quotes used on ~50 service pages.
 * An excerpt is at most 20 words, from the same 4 reviews in
 * src/data/reviews.ts; full text lives inside the card for screen readers
 * and the optional translation toggle.
 */
import { useState } from "react";
import type { ReactNode } from "react";

export interface ReviewBlockProps {
  excerpt: string;
  full: string;
  authorInitials: string;
  /** Present when the excerpt is a translation (Phase 0.1 rule). */
  original?: string;
  translatedLabel?: string;
  seeLabel?: string;
  hideLabel?: string;
  extra?: ReactNode;
}

export function ReviewBlock(props: ReviewBlockProps) {
  const { excerpt, full, authorInitials, original, translatedLabel, seeLabel, hideLabel, extra } = props;
  const [showOriginal, setShowOriginal] = useState(false);
  return (
    <figure className="rounded-ds-md border border-ds-line bg-background p-5 shadow-ds-card">
      <blockquote className="text-base leading-relaxed">“{excerpt}”</blockquote>
      <figcaption className="mt-3 flex items-center justify-between text-sm text-ds-text-muted">
        <span>— {authorInitials}</span>
        {original && seeLabel && hideLabel && (
          <button
            type="button"
            onClick={() => setShowOriginal((s) => !s)}
            className="underline"
            aria-expanded={showOriginal}
          >
            {showOriginal ? hideLabel : seeLabel}
          </button>
        )}
      </figcaption>
      {original && showOriginal && (
        <p className="mt-3 text-sm italic text-ds-text-muted">
          {translatedLabel && <span className="not-italic mr-1">{translatedLabel}:</span>}
          {original}
        </p>
      )}
      {/* Full text for screen readers / SEO; excerpt is for display. */}
      <p className="sr-only">{full}</p>
      {extra}
    </figure>
  );
}
