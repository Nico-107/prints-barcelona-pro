// Phase 3 item 3.2: customer-facing /presupuesto/<token>.
// Shows the quote the owner sent (pieces, price breakdown, production +
// delivery, owner's message, expiry). One primary button opens the Stripe
// payment link. Secondary "Tengo una pregunta" opens mail / WhatsApp.

import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, MessageCircle, Mail } from "lucide-react";

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_NUMBER = "+34672051147";
const CONTACT_EMAIL = "dimension3dprintsbcn@gmail.com";

interface Piece { name: string; quantity: number; material?: string | null; color?: string | null }
interface QuoteData {
  id: string;
  created_at: string;
  quote_sent_at: string | null;
  quote_expires_at: string | null;
  quote_paid_at: string | null;
  quote_price_cents: number | null;
  quote_shipping_cents: number;
  quote_production_days: number | null;
  quote_message: string | null;
  quote_fulfillment: string | null;
  quote_stripe_link: string | null;
  material: string;
  color: string | null;
  pieces: Piece[];
  first_name: string | null;
  page_language: string | null;
}

function formatEur(cents: number | null): string {
  if (cents == null || !Number.isFinite(cents)) return "—";
  return (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }); } catch { return "—"; }
}

export default function QuotePage() {
  const { token = "" } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const paidReturn = params.get("paid") === "1";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuoteData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [rpcMissing, setRpcMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token.trim()) { setNotFound(true); setLoading(false); return; }
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: row, error } = await (supabase as any).rpc("get_quote_by_token", { _token: token });
      if (cancelled) return;
      setLoading(false);
      if (error) {
        const msg = (error.message ?? "").toLowerCase();
        if (msg.includes("get_quote_by_token") || msg.includes("does not exist") || msg.includes("function")) {
          setRpcMissing(true);
        } else setNotFound(true);
        return;
      }
      const r = Array.isArray(row) ? row[0] : row;
      if (!r) { setNotFound(true); return; }
      setData(r as QuoteData);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const expired = useMemo(() => {
    if (!data?.quote_expires_at) return false;
    return new Date(data.quote_expires_at).getTime() < Date.now();
  }, [data]);
  const paid = !!data?.quote_paid_at || paidReturn;
  const total = data ? (data.quote_price_cents ?? 0) + (data.quote_shipping_cents ?? 0) : 0;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, tengo una pregunta sobre un presupuesto")}`;

  if (rpcMissing) return <Shell><Card className="p-8 text-center space-y-3"><h1 className="text-2xl font-bold">Presupuesto no disponible</h1><p className="text-muted-foreground">Estamos actualizando el sistema. Escríbenos y te lo reenviamos.</p><Button asChild><a href={`mailto:${CONTACT_EMAIL}`}>Contactar</a></Button></Card></Shell>;
  if (loading) return <Shell><div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="animate-spin w-5 h-5 mr-2" /> Cargando presupuesto…</div></Shell>;
  if (notFound || !data) return <Shell><Card className="p-8 text-center space-y-3"><h1 className="text-2xl font-bold">No encontramos este presupuesto</h1><p className="text-muted-foreground">El enlace puede haber caducado o ya no es válido.</p><Button asChild variant="outline"><a href={`mailto:${CONTACT_EMAIL}`}>Escríbenos</a></Button></Card></Shell>;

  return (
    <Shell>
      <Card className="p-6 md:p-8 space-y-6">
        <header className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Presupuesto</div>
          <h1 className="text-3xl md:text-4xl font-bold">Hola {data.first_name ?? ""}</h1>
          <p className="text-muted-foreground text-sm">Aquí tienes el detalle de lo que vamos a imprimir.</p>
        </header>

        {paid ? (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pago recibido · ¡Gracias!</p>
              <p className="text-sm text-muted-foreground">Te acabamos de confirmar el pedido por email.</p>
            </div>
          </div>
        ) : expired ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
            Este presupuesto caducó el {formatDate(data.quote_expires_at)}. Escríbenos y te lo renovamos.
          </div>
        ) : null}

        {data.quote_message ? (
          <div className="border-l-4 border-muted bg-muted/40 p-3 text-sm whitespace-pre-wrap">{data.quote_message}</div>
        ) : null}

        <section>
          <h2 className="font-semibold text-sm mb-2">Piezas</h2>
          <ul className="divide-y rounded-lg border">
            {data.pieces.map((p, i) => (
              <li key={i} className="p-3 flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">×{p.quantity}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{[p.material, p.color].filter(Boolean).join(" · ") || "—"}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border p-3 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatEur(data.quote_price_cents)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>{data.quote_shipping_cents === 0 ? "0 €" : formatEur(data.quote_shipping_cents)}</span></div>
          <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Total</span><span>{formatEur(total)}</span></div>
          <div className="text-xs text-muted-foreground mt-2">Producción en {data.quote_production_days ?? "?"} días laborables · Entrega: {data.quote_fulfillment ?? "pickup"}</div>
          <div className="text-xs text-muted-foreground">Válido hasta {formatDate(data.quote_expires_at)}</div>
        </section>

        {!paid && !expired && data.quote_stripe_link ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" data-testid="quote-pay-button">
              <a href={data.quote_stripe_link} target="_blank" rel="noopener noreferrer">Aceptar y pagar</a>
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${CONTACT_EMAIL}?subject=Presupuesto`}><Mail className="w-4 h-4 mr-1" />Tengo una pregunta</a>
            </Button>
            <Button asChild variant="ghost">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-1" />WhatsApp</a>
            </Button>
          </div>
        ) : null}
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Helmet>
        <meta name="robots" content="noindex" />
        <title>Tu presupuesto · Dimension3D</title>
        <link rel="canonical" href={`${SITE_URL}/presupuesto`} />
      </Helmet>
      <Header />
      <main className="container px-4 py-10 md:py-16 max-w-3xl pt-[var(--header-h)]">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
