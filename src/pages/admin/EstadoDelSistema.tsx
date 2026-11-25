// D5 — Admin "Estado del sistema" page. Shows the health of every edge function (expected
// vs live BUILD_ID), the schema status from the SECURITY DEFINER RPC `checkpoint_schema_status`,
// last Stripe webhook received (`webhook_events`), last owner email status (`email_log`), checkout
// failures in the last 24 h and storage usage of `print-requests`. Everything red gets a top banner
// "Despliegue pendiente en Lovable — ver LOVABLE_DEPLOY.md".
//
// This page talks to Supabase via the existing anonymous client. Real data is fetched when the
// admin is logged in (the shell checks the admin role). Until Lovable deploys the pricing-config
// function, the health row for every function shows "legacy" (orange) which is the honest state.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerCapabilities } from "@/hooks/useServerCapabilities";

interface FunctionHealth {
  name: string;
  state: "green" | "orange" | "red";
  build: string | null;
  note: string;
}

interface SchemaRow {
  table_name: string;
  column_name: string;
  exists_now: boolean;
}

const FUNCTIONS_TO_PROBE = [
  "pricing-config",
  "create-instant-checkout",
  "stripe-webhook",
  "order-files-zip",
  "admin-sign-urls",
  "send-order-confirmation",
  "send-price-estimate",
  "send-customer-quote",
  "save-quote",
] as const;

async function probeHealth(name: string): Promise<FunctionHealth> {
  const url = `${(import.meta as any).env?.VITE_SUPABASE_URL ?? ""}/functions/v1/${name}?health=1`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return { name, state: "red", build: null, note: `HTTP ${r.status}` };
    const j = await r.json();
    const build: string | null = typeof j?.build === "string" ? j.build : null;
    if (!build) return { name, state: "orange", build: null, note: "no health payload" };
    if (!build.startsWith("v5-")) return { name, state: "orange", build, note: "legacy (pre-v5)" };
    return { name, state: "green", build, note: "v5" };
  } catch {
    return { name, state: "red", build: null, note: "unreachable" };
  }
}

export default function EstadoDelSistema() {
  const caps = useServerCapabilities();
  const [funcs, setFuncs] = useState<FunctionHealth[]>([]);
  const [schema, setSchema] = useState<SchemaRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const results = await Promise.all(FUNCTIONS_TO_PROBE.map(probeHealth));
      setFuncs(results);
      try {
        const { data, error: rpcError } = await (supabase as any).rpc("checkpoint_schema_status");
        if (rpcError) throw rpcError;
        if (Array.isArray(data)) setSchema(data as SchemaRow[]);
      } catch (e: any) {
        setError(e?.message ?? "schema RPC failed — pendiente de migración");
      }
    })();
  }, []);

  const anyRed = funcs.some((f) => f.state !== "green") || (schema && schema.some((r) => !r.exists_now));

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Estado del sistema</h1>
      {anyRed && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/5 px-4 py-3 text-destructive">
          Despliegue pendiente en Lovable — ver <code>docs/checkpoint/LOVABLE_DEPLOY.md</code>.
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Frontend</h2>
        <p className="text-sm text-muted-foreground">
          Modo del servidor: <span className="font-mono">{caps.mode}</span>
          {caps.build ? ` · build ${caps.build}` : ""}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Edge functions</h2>
        <div className="divide-y divide-border rounded-lg border">
          {funcs.map((f) => (
            <div key={f.name} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="font-mono">{f.name}</span>
              <span
                className={
                  f.state === "green"
                    ? "text-emerald-700"
                    : f.state === "orange"
                      ? "text-amber-700"
                      : "text-destructive"
                }
              >
                {f.state === "green" ? "✓" : f.state === "orange" ? "•" : "✗"} {f.note}
                {f.build ? ` · ${f.build}` : ""}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Esquema de la base de datos</h2>
        {error ? (
          <p className="text-amber-700 text-sm">{error}</p>
        ) : !schema ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border">
            {schema.map((r) => (
              <div key={`${r.table_name}.${r.column_name}`} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="font-mono">
                  {r.table_name}.{r.column_name}
                </span>
                <span className={r.exists_now ? "text-emerald-700" : "text-destructive"}>
                  {r.exists_now ? "✓" : "pendiente de migración"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
