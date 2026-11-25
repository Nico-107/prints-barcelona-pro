// D4 — capability-based frontend gating. The hook probes `/functions/v1/pricing-config`
// with a 3 s timeout (and a session-scoped cache) and reports whether the deployed server
// supports v5 (`quote_v5`) or is still legacy. Every v5 behaviour in the UI is gated on
// this — never on a build flag.
//
// SSR-safe: on the server it returns `legacy` immediately so the prerender captures the
// legacy wording (which Vercel serves until pricing-config is live).

import { useEffect, useState } from "react";

export interface ServerCapabilities {
  mode: "legacy" | "v5";
  build: string | null;
  capabilities: readonly string[];
  shipping: { flatCents: number; freeFromCents: number; charmCapCents: number } | null;
  ready: boolean;
}

const LEGACY: ServerCapabilities = {
  mode: "legacy",
  build: null,
  capabilities: [],
  shipping: null,
  ready: true,
};

let cached: ServerCapabilities | null = null;
let inflight: Promise<ServerCapabilities> | null = null;

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL ?? "";
const ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? "";

export function _resetServerCapabilitiesCache(): void {
  cached = null;
  inflight = null;
}

function fetchCapabilities(): Promise<ServerCapabilities> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 3000);
  const url = `${SUPABASE_URL}/functions/v1/pricing-config`;
  inflight = fetch(url, { headers: ANON_KEY ? { apikey: ANON_KEY } : {}, signal: ac.signal })
    .then(async (res) => {
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const caps: readonly string[] = Array.isArray(json.capabilities) ? json.capabilities : [];
      const mode: "legacy" | "v5" = caps.includes("quote_v5") ? "v5" : "legacy";
      const out: ServerCapabilities = {
        mode,
        build: json.build ?? null,
        capabilities: caps,
        shipping: json.shipping ?? null,
        ready: true,
      };
      cached = out;
      return out;
    })
    .catch(() => {
      clearTimeout(timer);
      cached = LEGACY;
      return LEGACY;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useServerCapabilities(): ServerCapabilities {
  const [caps, setCaps] = useState<ServerCapabilities>(cached ?? LEGACY);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alive = true;
    fetchCapabilities().then((r) => {
      if (alive) setCaps(r);
    });
    return () => {
      alive = false;
    };
  }, []);
  return caps;
}

// Primitives for unit tests and server-authoritative call sites.
export function isLegacy(caps: ServerCapabilities): boolean {
  return caps.mode === "legacy";
}
export function hasCapability(caps: ServerCapabilities, name: string): boolean {
  return caps.capabilities.includes(name);
}
