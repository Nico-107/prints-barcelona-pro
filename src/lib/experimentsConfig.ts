/**
 * Thin shim kept for backwards compat and for scripts that parse this file.
 * Source of truth is src/lib/experiments/registry.ts.
 */

import { REGISTRY, expDatasetKey } from './experiments/registry';

export const EXPERIMENTS = Object.fromEntries(
  REGISTRY.map(exp => [
    exp.id,
    {
      attr: expDatasetKey(exp.id),
      layer: exp.layer,
      variants: exp.variants,
      enabled: exp.enabled,
      langs: exp.langs ?? [],
      startedOn: exp.startedOn,
      minDays: exp.minDays,
      maxDays: exp.maxDays,
    },
  ]),
) as Record<string, {
  attr: string;
  layer: string;
  variants: string[];
  enabled: boolean;
  langs: string[];
  startedOn: string;
  minDays: number;
  maxDays: number;
}>;

export type ExperimentId = keyof typeof EXPERIMENTS;
