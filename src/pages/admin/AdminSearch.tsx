// Phase 2 item 2.7 — admin search across orders and quotes.
// Matches on order number, name, email, phone, or filename. Works on 390 px.

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Link as LinkIcon } from "lucide-react";
import type { AdminOrder, AdminQuote } from "@/lib/adminTypes";

interface Hit {
  kind: "order" | "quote";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export default function AdminSearchPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);

  // Pre-load the recent set so the search is instant for the common cases.
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [o, c] = await Promise.all([
        supabase.from("orders").select("id, order_number, customer_name, customer_email, customer_phone, file_paths, pieces, tracking_token").order("created_at", { ascending: false }).limit(500),
        supabase.from("quote_requests").select("id, contact_email, contact_phone, file_paths, created_at, material").order("created_at", { ascending: false }).limit(500),
      ]);
      setLoading(false);
      if (o.data) setOrders(o.data as unknown as AdminOrder[]);
      if (c.data) setQuotes(c.data as unknown as AdminQuote[]);
    })();
  }, []);

  const hits: Hit[] = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const out: Hit[] = [];
    for (const o of orders) {
      const hay = [
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        ...(o.pieces ?? []).map((p) => p.name),
        ...(o.file_paths ?? []),
      ].filter(Boolean).map((v) => String(v).toLowerCase()).join(" ");
      if (hay.includes(needle)) {
        out.push({
          kind: "order",
          id: o.id,
          title: `#${o.order_number} · ${o.customer_name ?? o.customer_email ?? "—"}`,
          subtitle: [(o.pieces ?? []).length + " piezas", o.customer_email ?? o.customer_phone].filter(Boolean).join(" · "),
          href: `/admin/queue#order-${o.id}`,
        });
      }
    }
    for (const c of quotes) {
      const hay = [c.contact_email, c.contact_phone, c.material, ...(c.file_paths ?? [])]
        .filter(Boolean).map((v) => String(v).toLowerCase()).join(" ");
      if (hay.includes(needle)) {
        out.push({
          kind: "quote",
          id: c.id,
          title: `Revisión · ${c.contact_email ?? c.contact_phone ?? "—"}`,
          subtitle: `${c.material} · ${new Date(c.created_at).toLocaleDateString("es-ES")}`,
          href: `/admin/quotes-inbox`,
        });
      }
    }
    return out.slice(0, 50);
  }, [q, orders, quotes]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-10 md:py-12 max-w-3xl pt-[var(--header-h)] space-y-4">
        <header>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Admin</div>
          <h1 className="text-3xl font-bold">Buscar</h1>
          <p className="text-muted-foreground text-sm mt-1">Número, nombre, email, teléfono o nombre de archivo.</p>
        </header>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            data-testid="admin-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="264, pietro@…, 672 051 147, bracket_left.stl"
            className="pl-9 h-12 text-base"
          />
        </div>
        {loading ? (
          <div className="flex items-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando índice…</div>
        ) : q.trim() === "" ? (
          <p className="text-sm text-muted-foreground">Escribe algo para buscar.</p>
        ) : hits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin resultados.</p>
        ) : (
          <ul className="grid gap-2">
            {hits.map((h) => (
              <li key={`${h.kind}-${h.id}`}>
                <Card className="p-3">
                  <a href={h.href} className="flex items-center gap-3 min-w-0">
                    <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{h.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{h.subtitle}</div>
                    </div>
                    <span className="text-xs text-muted-foreground uppercase">{h.kind}</span>
                  </a>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
