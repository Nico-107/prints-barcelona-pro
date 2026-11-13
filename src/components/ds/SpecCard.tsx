/**
 * Phase 2.3 + 3.7: SpecCard for material pages.
 *
 * Fields: best for, not for, temperature limit, flexibility, rate.
 * Rate comes from the engine (never typed).
 */
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export interface SpecCardProps {
  material: string;
  bestFor: ReactNode;
  notFor: ReactNode;
  tempLimit: string;
  flexibility: string;
  /** Pre-formatted price per unit (from the estimator, not typed). */
  rate: string;
}

export function SpecCard({ material, bestFor, notFor, tempLimit, flexibility, rate }: SpecCardProps) {
  return (
    <Card className="p-6 shadow-ds-card rounded-ds-md">
      <div className="font-mono text-xs uppercase tracking-wider text-ds-text-muted mb-3">
        {material}
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-semibold">Best for</dt>
          <dd>{bestFor}</dd>
        </div>
        <div>
          <dt className="font-semibold">Not for</dt>
          <dd>{notFor}</dd>
        </div>
        <div>
          <dt className="font-semibold">Temperature limit</dt>
          <dd>{tempLimit}</dd>
        </div>
        <div>
          <dt className="font-semibold">Flexibility</dt>
          <dd>{flexibility}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="font-semibold">Rate</dt>
          <dd className="font-mono">{rate}</dd>
        </div>
      </dl>
    </Card>
  );
}
