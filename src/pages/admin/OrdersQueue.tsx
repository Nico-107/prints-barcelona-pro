// Phase 2 items 2.1, 2.2, 2.3, 2.4 — the owner's new orders workbench.
//
// Lives at /admin/queue. A drop-in replacement for the flat "Orders" tab in
// the legacy admin: the old page keeps working while the new flow matures.
//
// 2.1 Filter tabs with counts, highlight overdue, default view hides
//     anything already delivered.
// 2.2 Each order renders as a card with one primary "next step" button and a
//     10-second undo banner. Pressing it writes the status change AND
//     triggers the matching customer email through send-order-status.
// 2.3 Opening a card reveals a drawer with the full customer block, pieces,
//     event timeline, internal + customer notes.
// 2.4 Manual shipping block: carrier select, tracking number, tracking URL
//     built from a per-carrier template (editable). Saving sets the order to
//     shipped and sends the shipped email.

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, ExternalLink, Package, Truck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OrderStatus } from "@/lib/orderStatus";
import {
  QUEUE_BUCKETS,
  bucketForOrder,
  nextActionFor,
  countryFlag,
  hoursUntil,
  type AdminOrder,
  type NextAction,
  type QueueBucket,
} from "@/lib/adminTypes";

// Per-carrier tracking URL templates. {n} is replaced by the tracking number.
// Owner can override in the shipping block — this is only the default.
const CARRIERS: Array<{ id: string; label: string; urlTemplate: string }> = [
  { id: "Correos",         label: "Correos",         urlTemplate: "https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number={n}" },
  { id: "Correos Express", label: "Correos Express", urlTemplate: "https://www.correosexpress.com/web/correosexpress/envio?codEnvio={n}" },
  { id: "SEUR",            label: "SEUR",            urlTemplate: "https://www.seur.com/livetracking?tracking={n}" },
  { id: "GLS",             label: "GLS",             urlTemplate: "https://gls-group.eu/track/{n}" },
  { id: "UPS",             label: "UPS",             urlTemplate: "https://www.ups.com/track?tracknum={n}" },
  { id: "DHL",             label: "DHL",             urlTemplate: "https://www.dhl.com/en/express/tracking.html?AWB={n}" },
  { id: "InPost",          label: "InPost",          urlTemplate: "https://inpost.pl/sledzenie-przesylek?number={n}" },
  { id: "MRW",             label: "MRW",             urlTemplate: "https://www.mrw.es/seguimiento_envios/MRW_seguimiento.asp?enviament={n}" },
  { id: "Otro",            label: "Otro",            urlTemplate: "" },
];

type UndoState = {
  order: AdminOrder;
  action: NextAction;
  snapshot: Pick<AdminOrder, "status" | "shipped_at" | "carrier" | "tracking_number" | "tracking_url" | "delivered_at">;
  deadlineAt: number;
  commit: (() => Promise<void>) | null;
} | null;

export default function OrdersQueue() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeBucket, setActiveBucket] = useState<QueueBucket | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [undo, setUndo] = useState<UndoState>(null);
  const [events, setEvents] = useState<Array<{ id: string; kind: string; status: string | null; message: string | null; created_at: string; visible_to_customer: boolean }>>([]);
  const undoTimerRef = useRef<number | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("eta", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    setLoading(false);
    if (error) { toast({ title: "No he podido cargar los pedidos", description: error.message, variant: "destructive" }); return; }
    setOrders((data ?? []) as unknown as AdminOrder[]);
  };
  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: 0 };
    QUEUE_BUCKETS.forEach((b) => { out[b.key] = 0; });
    for (const o of orders) {
      if (o.status === "completed") continue; // default view hides completed
      out.all += 1;
      out[bucketForOrder(o)] = (out[bucketForOrder(o)] ?? 0) + 1;
    }
    return out;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const base = orders.filter((o) => activeBucket === "all" ? o.status !== "completed" : bucketForOrder(o) === activeBucket);
    // Oldest ship-by first; items without eta go to the end.
    return base.sort((a, b) => {
      if (!a.eta && !b.eta) return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (!a.eta) return 1;
      if (!b.eta) return -1;
      return new Date(a.eta).getTime() - new Date(b.eta).getTime();
    });
  }, [orders, activeBucket]);

  const selected = selectedId ? orders.find((o) => o.id === selectedId) ?? null : null;

  // Load events whenever the selected order changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedId) { setEvents([]); return; }
      const { data, error } = await supabase
        .from("order_events")
        .select("id, kind, status, message, created_at, visible_to_customer")
        .eq("order_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        setEvents([]);
        return;
      }
      setEvents((data ?? []) as typeof events);
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const clearUndo = () => {
    if (undoTimerRef.current) { window.clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
    setUndo(null);
  };

  const beginAction = (o: AdminOrder, action: NextAction) => {
    const snapshot = {
      status: o.status,
      shipped_at: o.shipped_at ?? null,
      carrier: o.carrier ?? null,
      tracking_number: o.tracking_number ?? null,
      tracking_url: o.tracking_url ?? null,
      delivered_at: o.delivered_at ?? null,
    };
    const commit = async () => {
      const patch: Record<string, unknown> = { status: action.nextStatus };
      if (action.nextStatus === "shipped")   patch.shipped_at   = new Date().toISOString();
      if (action.nextStatus === "completed") patch.delivered_at = new Date().toISOString();
      const { error } = await supabase.from("orders").update(patch).eq("id", o.id);
      if (error) {
        toast({ title: "No he podido actualizar el pedido", description: error.message, variant: "destructive" });
        return;
      }
      // Log the status change event (admin writes; RLS allows admin)
      await supabase.from("order_events").insert({
        order_id: o.id,
        kind: "status_change",
        status: action.nextStatus,
        message: action.label,
        visible_to_customer: true,
        actor: "owner",
      });
      // Fire the customer-facing email, if any.
      if (action.emailKind) {
        const { error: emailErr } = await supabase.functions.invoke("send-order-status", {
          body: { order_id: o.id, kind: action.emailKind },
        });
        if (emailErr) {
          toast({ title: "Pedido actualizado — email no enviado", description: String(emailErr.message ?? emailErr), variant: "destructive" });
        }
      }
      await load();
    };

    // Optimistic UI: show the next status on the card immediately.
    setOrders((prev) => prev.map((x) => x.id === o.id ? { ...x, status: action.nextStatus } : x));
    setUndo({
      order: o,
      action,
      snapshot,
      deadlineAt: Date.now() + 10_000,
      commit,
    });
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(async () => {
      try { await commit(); } finally { setUndo(null); undoTimerRef.current = null; }
    }, 10_000);
  };

  const cancelAction = async () => {
    const u = undo;
    if (!u) return;
    // Rewind local status back to the snapshot — no DB call needed because we
    // never committed.
    setOrders((prev) => prev.map((x) => x.id === u.order.id ? { ...x, ...u.snapshot } : x));
    clearUndo();
  };

  const commitNow = async () => {
    const u = undo;
    if (!u || !u.commit) return;
    try { await u.commit(); } finally { clearUndo(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-10 md:py-12 max-w-6xl pt-[var(--header-h)] space-y-6">
        <header className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Admin</div>
            <h1 className="text-3xl font-bold">Cola de pedidos</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Recargar
            </Button>
          </div>
        </header>

        {/* 2.1 Filter tabs */}
        <nav className="flex flex-wrap gap-1 border-b">
          <TabChip label="Todos" active={activeBucket === "all"} count={counts.all} onClick={() => setActiveBucket("all")} />
          {QUEUE_BUCKETS.map((b) => (
            <TabChip key={b.key} label={b.label} count={counts[b.key] ?? 0} active={activeBucket === b.key} onClick={() => setActiveBucket(b.key)} />
          ))}
        </nav>

        {/* Undo banner */}
        {undo ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-3 text-sm">
            <div className="flex-1">
              <strong className="text-amber-900">#{undo.order.order_number}:</strong> {undo.action.label}
              <div className="text-amber-800 text-xs mt-0.5">{undo.action.describe}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={cancelAction}>Deshacer</Button>
            <Button size="sm" variant="default" onClick={commitNow}>Enviar ya</Button>
          </div>
        ) : null}

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin w-5 h-5 mr-2" /> Cargando pedidos…
          </div>
        ) : visibleOrders.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Nada pendiente en esta vista.</Card>
        ) : (
          <ul className="grid gap-3">
            {visibleOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                selected={selectedId === o.id}
                onOpen={() => setSelectedId(selectedId === o.id ? null : o.id)}
                onAction={beginAction}
              />
            ))}
          </ul>
        )}

        {/* 2.3 Detail drawer (inline, grows below the cards) */}
        {selected ? (
          <OrderDetailDrawer
            key={selected.id}
            order={selected}
            events={events}
            onClose={() => setSelectedId(null)}
            onReload={load}
            onBeginAction={beginAction}
          />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function TabChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active ? "true" : "false"}
      data-testid={`admin-queue-tab-${label}`}
      className={
        active
          ? "px-3 py-2 text-sm font-semibold border-b-2 border-foreground text-foreground"
          : "px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
      }
    >
      {label}
      <span className="ml-2 inline-block min-w-[1.5rem] px-1.5 text-xs rounded-full bg-muted text-foreground/80">{count}</span>
    </button>
  );
}

function OrderCard({ order: o, selected, onOpen, onAction }: { order: AdminOrder; selected: boolean; onOpen: () => void; onAction: (o: AdminOrder, a: NextAction) => void }) {
  const h = hoursUntil(o.eta);
  const overdue = h != null && h < 0;
  const dueToday = h != null && h >= 0 && h < 24;
  const materials = Array.from(new Set((o.pieces ?? []).map((p) => p.material).filter(Boolean)));
  const colors = Array.from(new Set((o.pieces ?? []).map((p) => p.color).filter(Boolean)));
  const country = (() => {
    const addr = o.shipping_address as Record<string, unknown> | null | undefined;
    const c = addr?.["country"] ?? (addr?.["address"] as Record<string, unknown> | undefined)?.["country"];
    return typeof c === "string" ? c : null;
  })();
  const total = o.total_paid_cents != null ? (o.total_paid_cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" }) : "—";
  const pieceCount = (o.pieces ?? []).reduce((s, p) => s + (p.quantity ?? 0), 0);
  const next = nextActionFor(o);

  return (
    <li>
      <Card
        data-testid={`order-card-${o.order_number}`}
        data-overdue={overdue ? "true" : "false"}
        data-due-today={dueToday ? "true" : "false"}
        data-selected={selected ? "true" : "false"}
        className={`p-4 transition-colors ${overdue ? "border-red-400 bg-red-50/40" : dueToday ? "border-amber-300 bg-amber-50/40" : ""}`}
      >
        <div className="flex flex-wrap items-start gap-3">
          <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono font-semibold">#{o.order_number}</span>
              <span>{countryFlag(country)}</span>
              <span className="text-muted-foreground">{o.customer_name ?? o.customer_email ?? "—"}</span>
              <span className="ml-auto text-muted-foreground">{total}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              <span>{pieceCount} pieza{pieceCount === 1 ? "" : "s"}</span>
              {materials.length ? <span>· {materials.join(", ")}</span> : null}
              {colors.length ? <span>· {colors.join(", ")}</span> : null}
              <span>· {o.fulfillment}</span>
              {o.eta ? (
                <span className={overdue ? "text-red-700 font-medium" : dueToday ? "text-amber-700 font-medium" : ""}>· Ship-by {new Date(o.eta).toLocaleDateString("es-ES")}</span>
              ) : null}
            </div>
          </button>
          {next ? (
            <Button data-testid={`order-next-action-${o.order_number}`} onClick={() => onAction(o, next)} size="sm">
              {next.label}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onOpen}>Abrir</Button>
          )}
        </div>
      </Card>
    </li>
  );
}

function OrderDetailDrawer({
  order: o, events, onClose, onReload, onBeginAction,
}: {
  order: AdminOrder;
  events: Array<{ id: string; kind: string; status: string | null; message: string | null; created_at: string; visible_to_customer: boolean }>;
  onClose: () => void;
  onReload: () => Promise<void>;
  onBeginAction: (o: AdminOrder, a: NextAction) => void;
}) {
  const [internalNotes, setInternalNotes] = useState(o.internal_notes ?? "");
  const [customerNotes, setCustomerNotes] = useState(o.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  useEffect(() => { setInternalNotes(o.internal_notes ?? ""); setCustomerNotes(o.notes ?? ""); }, [o.id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    const patch: Record<string, string> = { internal_notes: internalNotes, notes: customerNotes };
    const { error } = await supabase.from("orders").update(patch).eq("id", o.id);
    setSavingNotes(false);
    if (error) { toast({ title: "No he podido guardar", description: error.message, variant: "destructive" }); return; }
    await onReload();
  };

  const whats = o.customer_phone ? `https://wa.me/${o.customer_phone.replace(/\D/g, "")}` : null;

  return (
    <Card id={`order-${o.id}`} className="p-5 md:p-6 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Pedido #{o.order_number}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1 text-sm">
          <div className="font-semibold">Cliente</div>
          <div>{o.customer_name ?? "—"}</div>
          {o.customer_email ? <div><a className="underline" href={`mailto:${o.customer_email}`}>{o.customer_email}</a></div> : <div className="text-muted-foreground">sin email</div>}
          {o.customer_phone ? <div>{o.customer_phone} {whats ? <a className="underline ml-1" href={whats} target="_blank" rel="noreferrer">WhatsApp</a> : null}</div> : null}
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold">Entrega</div>
          <div>{o.fulfillment}</div>
          {o.eta ? <div>Ship-by: {new Date(o.eta).toLocaleString("es-ES")}</div> : null}
          <div className="text-muted-foreground text-xs">Estado: {o.status}</div>
          {o.tracking_token ? (
            <div><a className="underline" target="_blank" rel="noreferrer" href={`/pedido/${o.tracking_token}`}>Abrir página pública <ExternalLink className="inline w-3 h-3" /></a></div>
          ) : null}
        </div>
      </section>

      {/* Pieces */}
      <section>
        <div className="font-semibold text-sm mb-2 flex items-center gap-2"><Package className="w-4 h-4" /> Piezas</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="py-1">Pieza</th><th className="py-1">Cant.</th><th className="py-1">Material</th><th className="py-1">Color</th><th className="py-1">g/u (pred)</th><th className="py-1">g (real)</th></tr></thead>
            <tbody>
              {(o.pieces ?? []).map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1 pr-2 max-w-[180px] truncate" title={p.name}>{p.name}</td>
                  <td className="py-1 pr-2">{p.quantity}</td>
                  <td className="py-1 pr-2">{p.material ?? "—"}</td>
                  <td className="py-1 pr-2">{p.color ?? "—"}</td>
                  <td className="py-1 pr-2">{p.gramsPerUnit != null ? Number(p.gramsPerUnit).toFixed(1) : "—"}</td>
                  <td className="py-1 pr-2">{p.actualGrams != null ? Number(p.actualGrams).toFixed(1) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2.4 Shipping block (manual) */}
      {o.fulfillment === "shipping" ? (
        <ShippingBlock order={o} onSaved={onReload} onShipped={() => {
          const next = nextActionFor(o);
          if (next && next.key === "mark_shipped") onBeginAction(o, next);
        }} />
      ) : null}

      {/* Notes */}
      <section className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="font-semibold text-sm mb-1">Notas del cliente (visibles)</div>
          <Textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={4} />
        </div>
        <div>
          <div className="font-semibold text-sm mb-1">Notas internas</div>
          <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={4} />
        </div>
      </section>
      <div className="flex justify-end">
        <Button onClick={saveNotes} disabled={savingNotes}>{savingNotes ? "Guardando…" : "Guardar notas"}</Button>
      </div>

      {/* Event timeline */}
      <section>
        <div className="font-semibold text-sm mb-2">Historial</div>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin eventos registrados.</div>
        ) : (
          <ol className="text-sm divide-y border rounded-md">
            {events.map((e) => (
              <li key={e.id} className="p-2 flex justify-between gap-3">
                <div>
                  <span className="font-mono text-xs text-muted-foreground mr-2">{e.kind}</span>
                  {e.status ? <span className="mr-2">{e.status}</span> : null}
                  {e.message ? <span>{e.message}</span> : null}
                  {e.visible_to_customer ? <span className="ml-2 text-xs text-emerald-700">visible</span> : <span className="ml-2 text-xs text-muted-foreground">interno</span>}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.created_at).toLocaleString("es-ES")}</div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Card>
  );
}

function ShippingBlock({ order: o, onSaved, onShipped }: { order: AdminOrder; onSaved: () => Promise<void>; onShipped: () => void }) {
  const [carrierId, setCarrierId] = useState(o.carrier ?? "Correos");
  const [number, setNumber] = useState(o.tracking_number ?? "");
  const [trackingUrl, setTrackingUrl] = useState(o.tracking_url ?? "");
  const [saving, setSaving] = useState(false);
  const carrier = CARRIERS.find((c) => c.id === carrierId) ?? CARRIERS[0];

  useEffect(() => {
    if (!number) { setTrackingUrl(o.tracking_url ?? ""); return; }
    if (!carrier.urlTemplate) return;
    setTrackingUrl(carrier.urlTemplate.replace("{n}", number));
  }, [carrierId, number]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("orders").update({
      carrier: carrierId,
      tracking_number: number,
      tracking_url: trackingUrl,
    }).eq("id", o.id);
    setSaving(false);
    if (error) { toast({ title: "No he podido guardar", description: error.message, variant: "destructive" }); return; }
    await onSaved();
    toast({ title: "Envío guardado" });
  };

  return (
    <section className="border rounded-lg p-4 space-y-3">
      <div className="font-semibold text-sm flex items-center gap-2"><Truck className="w-4 h-4" /> Envío manual</div>
      <div className="grid md:grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="text-muted-foreground">Transportista</span>
          <select value={carrierId} onChange={(e) => setCarrierId(e.target.value)} className="w-full border rounded-md px-2 py-1">
            {CARRIERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-muted-foreground">Número</span>
          <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. RX123456789ES" />
        </label>
        <label className="text-sm md:col-span-1">
          <span className="text-muted-foreground">URL seguimiento</span>
          <Input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={save} disabled={saving || !number}>Guardar</Button>
        <Button onClick={() => { void save().then(() => onShipped()); }} disabled={saving || !number}>Guardar y marcar enviado</Button>
      </div>
    </section>
  );
}
