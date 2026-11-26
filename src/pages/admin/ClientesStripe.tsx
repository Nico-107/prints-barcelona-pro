// Clientes Stripe tab — paid Stripe checkout sessions from the last 180 days,
// loaded from the Vercel API (/api/admin/stripe-orders). Supabase JWT required.

import { useEffect, useState } from "react";
import { Loader2, ExternalLink, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface StripeSession {
  id: string;
  created: number;
  amount_total: number | null;
  currency: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, unknown> | null;
  shipping_name: string | null;
  order_id: string | null;
  order_number: string | null;
  quote_id: string | null;
  source_path: string | null;
  page_language: string | null;
  fulfillment: string | null;
  payment_link: string;
  session_link: string;
  livemode: boolean;
  metadata: Record<string, string>;
}

function formatAmount(cents: number | null, currency: string | null): string {
  if (cents == null) return "—";
  const v = cents / 100;
  const cur = (currency ?? "EUR").toUpperCase();
  return v.toLocaleString("es-ES", { style: "currency", currency: cur });
}

function formatAddress(addr: Record<string, unknown> | null): string {
  if (!addr) return "—";
  const parts = [addr["line1"], addr["line2"], addr["postal_code"], addr["city"], addr["state"], addr["country"]]
    .filter((v) => typeof v === "string" && (v as string).trim() !== "") as string[];
  return parts.join(", ") || "—";
}

export default function ClientesStripe({ matchedOrderIds }: { matchedOrderIds: Set<string> }) {
  const [sessions, setSessions] = useState<StripeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: s } = await supabase.auth.getSession();
        const token = s.session?.access_token;
        if (!token) {
          setError("No hay sesión activa.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/admin/stripe-orders?days=180&limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const t = await res.text();
          setError(`HTTP ${res.status}: ${t.slice(0, 200)}`);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setSessions(json.sessions ?? []);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "unknown");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando pedidos de Stripe…
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <p className="font-semibold mb-1">No se pudo cargar</p>
        <p>{error}</p>
      </div>
    );
  }
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Users className="w-10 h-10 mb-3 opacity-30" />
        <p className="font-medium">Sin pedidos Stripe pagados en 180 días</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-sm">
          {sessions.length} pedidos Stripe pagados · últimos 180 días
        </h2>
        <p className="text-xs text-slate-500">
          Fila sombreada = sin pedido en la base de datos
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left">
              {["Fecha", "Nombre", "Email", "Teléfono", "Importe", "Dirección", "Order", "Pago"].map((h) => (
                <th key={h} className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => {
              const orphan = !(s.order_id && matchedOrderIds.has(s.order_id));
              return (
                <tr key={s.id} className={orphan ? "bg-amber-50" : ""}>
                  <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(s.created * 1000).toLocaleString("es-ES", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-3 py-2 text-slate-800 whitespace-nowrap">{s.customer_name ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{s.customer_email ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{s.customer_phone ?? "—"}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">{formatAmount(s.amount_total, s.currency)}</td>
                  <td className="px-3 py-2 text-slate-600 max-w-[320px] truncate" title={formatAddress(s.shipping_address)}>
                    {s.fulfillment === "pickup" ? "🇪🇸 Recogida" : formatAddress(s.shipping_address)}
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {s.order_id ? (
                      matchedOrderIds.has(s.order_id) ? (
                        <a href={`/admin?order=${encodeURIComponent(s.order_id)}`} className="text-amber-700 hover:underline">
                          #{s.order_number ?? s.order_id.slice(0, 8)}
                        </a>
                      ) : (
                        <span className="text-amber-700" title={s.order_id}>#{s.order_number ?? s.order_id.slice(0, 8)} (sin DB)</span>
                      )
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <a href={s.payment_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-amber-600">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Stripe
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
