import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PricingVersion = 3 | 4;

const SESSION_KEY = 'dim3d_pricing_version';

/** Probe once per session; default v3 until the probe resolves. */
export function usePricingVersion(): PricingVersion {
  const [version, setVersion] = useState<PricingVersion>(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached === '4') return 4;
    } catch { /* SSR */ }
    return 3;
  });

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached === '4' || cached === '3') return; // already resolved
    } catch { /* ignore */ }

    supabase.functions.invoke('create-instant-checkout', { body: { probe: true } })
      .then(({ data }) => {
        const v: PricingVersion = (data as { pricing_version?: number })?.pricing_version === 4 ? 4 : 3;
        try { sessionStorage.setItem(SESSION_KEY, String(v)); } catch { /* ignore */ }
        setVersion(v);
      })
      .catch(() => { /* stay on v3 */ });
  }, []);

  return version;
}

/** Compute free-shipping threshold in cents for the given pricing version. */
export function freeShippingThresholdCents(version: PricingVersion): number {
  return version === 4 ? 9990 : 10000;
}
