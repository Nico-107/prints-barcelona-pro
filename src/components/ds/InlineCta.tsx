/**
 * Phase 2.3 + 3.9: InlineCta card used mid-article and at the end.
 *
 * One primary action (file upload), one secondary (WhatsApp). No green
 * buttons; no fake urgency.
 */
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface InlineCtaProps {
  eyebrow?: string;
  heading: string;
  body?: ReactNode;
  primary: { label: string; onClick?: () => void; href?: string };
  secondary?: { label: string; href: string };
}

export function InlineCta({ eyebrow, heading, body, primary, secondary }: InlineCtaProps) {
  return (
    <aside className="my-10 rounded-ds-lg bg-ds-surface border border-ds-line p-6 md:p-8 shadow-ds-card">
      {eyebrow && (
        <div className="font-mono text-xs uppercase tracking-wider text-ds-text-muted mb-2">
          {eyebrow}
        </div>
      )}
      <h3 className="text-xl md:text-2xl font-semibold mb-2">{heading}</h3>
      {body && <p className="mb-4 text-ds-text-muted">{body}</p>}
      <div className="flex flex-wrap gap-3">
        {primary.href ? (
          <Button asChild size="lg"><a href={primary.href}>{primary.label}</a></Button>
        ) : (
          <Button size="lg" onClick={primary.onClick}>{primary.label}</Button>
        )}
        {secondary && (
          <Button asChild variant="outline" size="lg">
            <a href={secondary.href} rel="noopener noreferrer">{secondary.label}</a>
          </Button>
        )}
      </div>
    </aside>
  );
}
