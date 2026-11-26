// Loads paid Stripe sessions once per admin view and indexes them by
// metadata.order_id and session id for cross-reference against the orders table.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { StripeSession } from "@/pages/admin/ClientesStripe";

export interface StripeIndex {
  byOrderId: Map<string, StripeSession>;
  bySessionId: Map<string, StripeSession>;
  all: StripeSession[];
  loading: boolean;
  error: string | null;
}

export function useStripeSessions(enabled: boolean): StripeIndex {
  const [state, setState] = useState<StripeIndex>({
    byOrderId: new Map(),
    bySessionId: new Map(),
    all: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        const token = s.session?.access_token;
        if (!token) {
          if (!cancelled) setState((prev) => ({ ...prev, loading: false, error: "no session" }));
          return;
        }
        const res = await fetch("/api/admin/stripe-orders?days=180&limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const t = await res.text();
          if (!cancelled) setState((prev) => ({ ...prev, loading: false, error: `HTTP ${res.status}: ${t.slice(0, 200)}` }));
          return;
        }
        const json = await res.json();
        const sessions: StripeSession[] = json.sessions ?? [];
        const byOrderId = new Map<string, StripeSession>();
        const bySessionId = new Map<string, StripeSession>();
        for (const row of sessions) {
          if (row.order_id) byOrderId.set(row.order_id, row);
          bySessionId.set(row.id, row);
        }
        if (!cancelled) setState({ byOrderId, bySessionId, all: sessions, loading: false, error: null });
      } catch (err: any) {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false, error: err?.message ?? "unknown" }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
