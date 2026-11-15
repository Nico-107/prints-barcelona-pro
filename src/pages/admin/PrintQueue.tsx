// Phase 2 item 2.5 — print queue view.
// Groups pieces from orders in "Por imprimir" (status quote_approved) by
// material then colour, with quantities + predicted hours, so the owner can
// fill one plate per material/colour. Ticking a piece writes an event to
// order_events so the admin never forgets what's on which plate.

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { AdminOrder, PieceInfo } from "@/lib/adminTypes";

interface PrintRow {
  key: string; // material|color|order|idx
  orderNumber: number;
  orderId: string;
  pieceIndex: number;
  name: string;
  material: string;
  color: string;
  qty: number;
  hours: number;
}

type MarkedMap = Record<string, true>;

const LS_KEY = "dim3d-print-queue-marked";

function loadMarked(): MarkedMap {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") as MarkedMap; } catch { return {}; }
}
function saveMarked(m: MarkedMap) { try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch { /* ignore */ } }

export default function PrintQueuePage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [marked, setMarked] = useState<MarkedMap>(() => loadMarked());

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, pieces, status")
        .eq("status", "quote_approved")
        .order("eta", { ascending: true, nullsFirst: false });
      setLoading(false);
      if (!error) setOrders((data ?? []) as unknown as AdminOrder[]);
    })();
  }, []);

  const rows: PrintRow[] = useMemo(() => {
    const out: PrintRow[] = [];
    for (const o of orders) {
      const pieces: PieceInfo[] = o.pieces ?? [];
      pieces.forEach((p, idx) => {
        const key = `${o.id}-${idx}`;
        const material = (p.material ?? "?").toString();
        const color = (p.color ?? "—").toString();
        out.push({
          key,
          orderNumber: o.order_number,
          orderId: o.id,
          pieceIndex: idx,
          name: p.name,
          material,
          color,
          qty: p.quantity ?? 1,
          hours: (p.hoursPerUnit ?? 0) * (p.quantity ?? 1),
        });
      });
    }
    return out;
  }, [orders]);

  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, PrintRow[]>>();
    for (const r of rows) {
      if (!map.has(r.material)) map.set(r.material, new Map());
      const bycolor = map.get(r.material)!;
      if (!bycolor.has(r.color)) bycolor.set(r.color, []);
      bycolor.get(r.color)!.push(r);
    }
    return map;
  }, [rows]);

  const toggle = async (row: PrintRow) => {
    const next = { ...marked };
    const wasMarked = !!next[row.key];
    if (wasMarked) delete next[row.key]; else next[row.key] = true;
    setMarked(next);
    saveMarked(next);
    if (!wasMarked) {
      await supabase.from("order_events").insert({
        order_id: row.orderId,
        kind: "piece_printed",
        status: null,
        message: `${row.name} × ${row.qty}`,
        visible_to_customer: false,
        actor: "owner",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-10 md:py-12 max-w-5xl pt-[var(--header-h)] space-y-6">
        <header>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Admin</div>
          <h1 className="text-3xl font-bold">Cola de impresión</h1>
          <p className="text-muted-foreground text-sm mt-1">Pedidos en “Por imprimir”, agrupados por material y color para llenar la plancha.</p>
        </header>

        {loading ? (
          <div className="flex items-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando…</div>
        ) : rows.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Nada pendiente.</Card>
        ) : (
          <div className="space-y-5">
            {Array.from(grouped.entries()).map(([material, bycolor]) => (
              <Card key={material} className="p-4 space-y-3">
                <h2 className="font-semibold text-lg">{material}</h2>
                {Array.from(bycolor.entries()).map(([color, pieces]) => {
                  const totalQty = pieces.reduce((s, p) => s + p.qty, 0);
                  const totalH = pieces.reduce((s, p) => s + p.hours, 0);
                  return (
                    <div key={color} className="border rounded-md">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                        <div><span className="font-medium">{color}</span>
                          <span className="text-muted-foreground text-sm ml-2">· {totalQty} uds · ~{totalH.toFixed(1)} h</span>
                        </div>
                      </div>
                      <ul className="divide-y">
                        {pieces.map((p) => {
                          const isMarked = !!marked[p.key];
                          return (
                            <li key={p.key} className="px-3 py-2 flex items-center gap-3">
                              <button type="button" onClick={() => toggle(p)} className={isMarked ? "text-emerald-600" : "text-muted-foreground"} aria-label={isMarked ? "Desmarcar" : "Marcar impreso"}>
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm truncate ${isMarked ? "line-through text-muted-foreground" : ""}`} title={p.name}>{p.name}</div>
                                <div className="text-xs text-muted-foreground">#{p.orderNumber} · {p.qty} uds · ~{p.hours.toFixed(1)} h</div>
                              </div>
                              <Button asChild size="sm" variant="ghost"><a href={`/admin/queue#order-${p.orderId}`}>Abrir</a></Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
