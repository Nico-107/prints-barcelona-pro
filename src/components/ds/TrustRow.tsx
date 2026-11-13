/**
 * Phase 2.3 + 3.5: TrustRow — true facts only.
 *
 * Replaces the generic "Local en Barcelona · Entregas Rápidas · Materiales
 * de Calidad · Pedidos a Medida" chip row on ~50 service pages. Items are
 * passed in by the caller; each must be a verifiable fact.
 */
import type { ReactNode } from "react";

export interface TrustRowItem {
  icon?: ReactNode;
  label: string;
  /** Short qualifier, e.g. "250+" alongside "pedidos". */
  value?: string;
}

export function TrustRow({ items }: { items: TrustRowItem[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ds-text-muted">
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-2">
          {it.icon}
          {it.value && <span className="font-semibold text-foreground">{it.value}</span>}
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
