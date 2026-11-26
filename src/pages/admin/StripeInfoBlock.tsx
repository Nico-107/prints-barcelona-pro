import { ExternalLink } from "lucide-react";
import type { StripeSession } from "./ClientesStripe";

function formatAmount(cents: number | null, currency: string | null): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: (currency ?? "EUR").toUpperCase() });
}

function formatAddress(addr: Record<string, unknown> | null): string {
  if (!addr) return "—";
  const parts = [addr["line1"], addr["line2"], addr["postal_code"], addr["city"], addr["state"], addr["country"]]
    .filter((v) => typeof v === "string" && (v as string).trim() !== "") as string[];
  return parts.join(", ") || "—";
}

export default function StripeInfoBlock({ session }: { session: StripeSession | undefined }) {
  if (!session) return null;
  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-semibold text-slate-500 uppercase tracking-wide text-[10px]">Stripe</span>
        <a href={session.payment_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-600 hover:text-amber-600">
          <ExternalLink className="w-3 h-3" />
          Ver pago
        </a>
      </div>
      <div className="grid gap-0.5">
        <div><span className="text-slate-400">Cliente:</span> {session.customer_name ?? "—"}</div>
        <div><span className="text-slate-400">Email:</span> {session.customer_email ?? "—"}</div>
        <div><span className="text-slate-400">Teléfono:</span> {session.customer_phone ?? "—"}</div>
        <div><span className="text-slate-400">Dirección:</span> {session.fulfillment === "pickup" ? "🇪🇸 Recogida" : formatAddress(session.shipping_address)}</div>
        <div><span className="text-slate-400">Pagado:</span> {formatAmount(session.amount_total, session.currency)}</div>
      </div>
    </div>
  );
}
