import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PricingVersion = 3 | 4;

export interface PublicPromoCode {
  code: string;
  pct: number;
  ends_at: string;
}

export interface PricingProbe {
  version: PricingVersion;
  /** Active public promo code, or null when none / v3. */
  publicCode: PublicPromoCode | null;
}

const SESSION_KEY = 'dim3d_pricing_probe';

function parseSession(): PricingProbe | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<PricingProbe>;
    if (p.version !== 3 && p.version !== 4) return null;
    return { version: p.version, publicCode: p.publicCode ?? null };
  } catch { return null; }
}

/** Probe once per session; default v3 until the probe resolves. */
export function usePricingProbe(): PricingProbe {
  const [probe, setProbe] = useState<PricingProbe>(() => parseSession() ?? { version: 3, publicCode: null });

  useEffect(() => {
    if (parseSession()) return; // already cached

    supabase.functions.invoke('create-instant-checkout', { body: { probe: true } })
      .then(({ data }) => {
        const d = data as { pricing_version?: number; public_code?: PublicPromoCode | null } | null;
        const version: PricingVersion = d?.pricing_version === 4 ? 4 : 3;
        const publicCode: PublicPromoCode | null = (version === 4 && d?.public_code?.code) ? {
          code: String(d.public_code.code),
          pct: Number(d.public_code.pct),
          ends_at: String(d.public_code.ends_at),
        } : null;
        const result: PricingProbe = { version, publicCode };
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(result)); } catch { /* ignore */ }
        setProbe(result);
      })
      .catch(() => { /* stay on v3 */ });
  }, []);

  return probe;
}

/** Thin convenience wrapper — returns just the version number. */
export function usePricingVersion(): PricingVersion {
  return usePricingProbe().version;
}

/** Compute free-shipping threshold in cents for the given pricing version. */
export function freeShippingThresholdCents(version: PricingVersion): number {
  return version === 4 ? 9990 : 10000;
}
