// Phase 2 item 2.6 — quote requests inbox.
// Unanswered first, with the age shown ("hace 3 h"), the customer message
// visible in the list and the country flag. One click opens a detail panel
// with the files and the calculator's figures.

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { countryFlag, type AdminQuote } from "@/lib/adminTypes";
import { FREE_SHIPPING_FROM_EUR } from "@/config/freeShipping";

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `hace ${Math.floor(s)} s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

function detectCountry(q: AdminQuote): string | null {
  if (q.contact_email && q.contact_email.includes("@")) {
    const tld = q.contact_email.split("@")[1].split(".").pop();
    if (tld && tld.length === 2) return tld.toUpperCase();
  }
  if (q.page_language && q.page_language.length === 2) return q.page_language.toUpperCase();
  return null;
}

export default function QuotesInboxPage() {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setLoading(false);
      if (!error) setQuotes((data ?? []) as unknown as AdminQuote[]);
    })();
  }, []);

  const selected = selectedId ? quotes.find((q) => q.id === selectedId) ?? null : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selected?.file_paths?.length) { setSignedUrls({}); return; }
      const map: Record<string, string> = {};
      for (const path of selected.file_paths) {
        const { data } = await supabase.storage.from("print-requests").createSignedUrl(path, 60 * 60);
        if (data?.signedUrl) map[path] = data.signedUrl;
      }
      if (!cancelled) setSignedUrls(map);
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const sorted = useMemo(() => {
    const unanswered = quotes.filter((q) => (q.status ?? "new") === "new" || q.status === "pending");
    const answered = quotes.filter((q) => !(((q.status ?? "new") === "new") || q.status === "pending"));
    return [...unanswered, ...answered];
  }, [quotes]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-10 md:py-12 max-w-5xl pt-[var(--header-h)] space-y-6">
        <header>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Admin</div>
          <h1 className="text-3xl font-bold">Revisiones (presupuestos)</h1>
          <p className="text-muted-foreground text-sm mt-1">Primero las que aún no has contestado.</p>
        </header>

        {loading ? (
          <div className="flex items-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando…</div>
        ) : sorted.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Sin revisiones.</Card>
        ) : (
          <ul className="grid gap-2">
            {sorted.map((q) => {
              const country = detectCountry(q);
              const name = q.contact_email?.split("@")[0] ?? q.contact_phone ?? "—";
              const pieceCount = (q.pieces?.length ?? 0) || q.quantity || 1;
              const answered = !((q.status ?? "new") === "new" || q.status === "pending");
              return (
                <li key={q.id}>
                  <Card
                    data-testid={`quote-card-${q.id}`}
                    data-answered={answered ? "true" : "false"}
                    className={`p-3 cursor-pointer ${answered ? "opacity-70" : ""}`}
                    onClick={() => setSelectedId(selectedId === q.id ? null : q.id)}
                  >
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-xl leading-none">{countryFlag(country)}</span>
                          <span className="font-semibold">{name}</span>
                          <span className="text-muted-foreground text-xs">· {timeAgo(q.created_at)}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{pieceCount} pieza{pieceCount === 1 ? "" : "s"} · {q.material}</span>
                        </div>
                        {q.notes ? (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{q.notes}</p>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {selected ? (
          <Card className="p-5 space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Revisión de {selected.contact_email ?? "—"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>Cerrar</Button>
            </header>
            <section className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div><span className="text-muted-foreground">Email: </span>{selected.contact_email ?? "—"}</div>
                <div><span className="text-muted-foreground">Teléfono: </span>{selected.contact_phone ?? "—"}</div>
                <div><span className="text-muted-foreground">Página: </span>{selected.source_path ?? "—"}</div>
                <div><span className="text-muted-foreground">Idioma: </span>{selected.page_language ?? "—"}</div>
              </div>
              <div className="space-y-1">
                <div><span className="text-muted-foreground">Material: </span>{selected.material}</div>
                <div><span className="text-muted-foreground">Precio calculadora: </span>€{selected.estimated_price_low}–€{selected.estimated_price_high}</div>
                <div><span className="text-muted-foreground">Gramos: </span>{Number(selected.estimated_grams).toFixed(1)} g</div>
                <div><span className="text-muted-foreground">Horas: </span>{Number(selected.estimated_hours).toFixed(1)} h</div>
              </div>
            </section>
            {selected.notes ? (
              <section>
                <div className="font-semibold text-sm mb-1">Mensaje del cliente</div>
                <div className="rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{selected.notes}</div>
              </section>
            ) : null}
            <section>
              <div className="font-semibold text-sm mb-2">Archivos</div>
              <ul className="text-sm space-y-1">
                {(selected.file_paths ?? []).map((path) => (
                  <li key={path}>
                    {signedUrls[path]
                      ? <a className="underline" href={signedUrls[path]} target="_blank" rel="noreferrer">{path.split("-").slice(1).join("-") || path}</a>
                      : path}
                  </li>
                ))}
              </ul>
            </section>

            {/* 3.1: Send-quote form */}
            <SendQuoteForm quote={selected} onSent={() => { setSelectedId(null); /* reload is handled by useEffect on mount; keep simple */ }} />

            {/* 3.4: Reply templates */}
            <ReplyTemplates quote={selected} />
          </Card>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function SendQuoteForm({ quote: q, onSent }: { quote: AdminQuote; onSent: () => void }) {
  const [priceEur, setPriceEur] = useState<string>(((q.estimated_price_low + q.estimated_price_high) / 2 || 0).toFixed(2));
  const [productionDays, setProductionDays] = useState<string>("5");
  const [message, setMessage] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "shipping">((q.fulfillment === "shipping" ? "shipping" : "pickup"));
  const [shippingEur, setShippingEur] = useState<string>("15");
  const [busy, setBusy] = useState(false);

  // Free shipping when pieces total ≥ FREE_SHIPPING_FROM_EUR (phase 3 rule
  // applied in this flow only).
  const priceNum = Number(priceEur) || 0;
  const shippingFree = fulfillment === "shipping" && priceNum >= FREE_SHIPPING_FROM_EUR;
  const shippingCentsResolved = fulfillment === "pickup" ? 0 : (shippingFree ? 0 : Math.round(Number(shippingEur) * 100));

  const send = async () => {
    setBusy(true);
    const { error } = await supabase.functions.invoke("send-customer-quote", {
      body: {
        quote_id: q.id,
        price_cents: Math.round(priceNum * 100),
        shipping_cents: shippingCentsResolved,
        production_days: Number(productionDays) || 5,
        message: message.trim() || null,
        fulfillment,
      },
    });
    setBusy(false);
    if (error) { toast({ title: "No pude enviar", description: String(error.message ?? error), variant: "destructive" }); return; }
    toast({ title: "Presupuesto enviado" });
    onSent();
  };

  return (
    <section className="border rounded-lg p-4 space-y-3">
      <div className="font-semibold text-sm flex items-center gap-2"><Send className="w-4 h-4" /> Enviar presupuesto</div>
      <div className="grid md:grid-cols-4 gap-3 text-sm">
        <label><span className="text-muted-foreground">Precio piezas €</span><Input value={priceEur} onChange={(e) => setPriceEur(e.target.value)} inputMode="decimal" /></label>
        <label><span className="text-muted-foreground">Días</span><Input value={productionDays} onChange={(e) => setProductionDays(e.target.value)} inputMode="numeric" /></label>
        <label>
          <span className="text-muted-foreground">Entrega</span>
          <select value={fulfillment} onChange={(e) => setFulfillment(e.target.value as "pickup" | "shipping")} className="w-full border rounded-md px-2 py-1">
            <option value="pickup">Recogida</option>
            <option value="shipping">Envío</option>
          </select>
        </label>
        <label>
          <span className="text-muted-foreground">Envío €</span>
          <Input value={shippingFree ? "0 (gratis)" : shippingEur} onChange={(e) => setShippingEur(e.target.value)} disabled={fulfillment === "pickup" || shippingFree} inputMode="decimal" />
        </label>
      </div>
      <Textarea placeholder="Mensaje opcional al cliente" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
      <div className="flex justify-end">
        <Button onClick={send} disabled={busy || !priceNum}>{busy ? "Enviando…" : "Enviar al cliente"}</Button>
      </div>
      {shippingFree ? <p className="text-xs text-muted-foreground">Envío gratuito aplicado (pedido ≥ {FREE_SHIPPING_FROM_EUR} €).</p> : null}
    </section>
  );
}

function ReplyTemplates({ quote: q }: { quote: AdminQuote }) {
  // 3.4: templates in Spanish; owner edits before sending via mailto or WA.
  const email = q.contact_email ?? "";
  const phone = (q.contact_phone ?? "").replace(/\D/g, "");
  const templates = [
    { key: "need_more", title: "Necesito más datos", body: "Hola, antes de preparar el presupuesto necesito algunas dimensiones críticas: ¿puedes decirme [dimensión] y [dimensión]? Gracias." },
    { key: "not_printable", title: "Pieza no imprimible tal cual", body: "Hola, la pieza requiere ajustes para poder imprimirse (pared mínima / orientación). Puedo prepararla por un pequeño coste de adaptación — ¿te envío el presupuesto incluyéndolo?" },
    { key: "sent", title: "Presupuesto enviado", body: "Hola, te acabo de enviar el presupuesto. Cuando lo tengas, puedes aceptarlo y pagar desde el mismo enlace. Cualquier duda por aquí." },
  ];
  return (
    <section className="border rounded-lg p-4 space-y-3">
      <div className="font-semibold text-sm">Plantillas de respuesta</div>
      <ul className="space-y-2 text-sm">
        {templates.map((t) => {
          const mail = `mailto:${email}?subject=${encodeURIComponent("Dimension3D")}&body=${encodeURIComponent(t.body)}`;
          const wa = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(t.body)}` : "";
          return (
            <li key={t.key} className="border-t pt-2">
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-muted-foreground whitespace-pre-wrap mb-1">{t.body}</div>
              <div className="flex gap-2 text-xs">
                {email ? <a className="underline" href={mail}>Email</a> : null}
                {wa ? <a className="underline" href={wa} target="_blank" rel="noreferrer">WhatsApp</a> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
