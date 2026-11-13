/**
 * Phase 2.3: RelatedLinks — short grid of same-language related pages.
 *
 * Shown at the end of articles, service pages and material pages.
 */
import { Link } from "react-router-dom";

export interface RelatedLink { href: string; label: string; blurb?: string }

export function RelatedLinks({ heading, items }: { heading: string; items: RelatedLink[] }) {
  return (
    <section aria-label={heading} className="py-ds-section-y md:py-ds-section-y-md">
      <div className="container px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">{heading}</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                to={it.href}
                className="block rounded-ds-md border border-ds-line p-4 shadow-ds-card hover:shadow-ds-elevated transition-shadow"
              >
                <div className="font-semibold">{it.label}</div>
                {it.blurb && <div className="text-sm text-ds-text-muted mt-1">{it.blurb}</div>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
