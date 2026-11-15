// Item 1.5: /pedido/<tracking_token> — the customer's order page.
//
// No login, no number/phone to type. The token is the secret; the RPC
// get_order_by_token returns only fields safe to show (no email, no
// phone, no file paths, no internal_notes). If the RPC is missing
// (migration not deployed yet) we show a friendly fallback that points
// at /track.

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MessageCircle, Mail, Loader2, Package, CheckCircle2, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PICKUP_ADDRESS } from "@/config/cities";

const SITE_URL = "https://www.dimension3dprints.com";
const WHATSAPP_NUMBER = "+34672051147";
const CONTACT_EMAIL = "dimension3dprintsbcn@gmail.com";

// Timeline keys mirror src/lib/orderStatus.ts TIMELINE_STEPS but we show both
// the "shipped" and "ready_pickup" options for the penultimate step.
const TIMELINE: Array<{ key: string; label: string; match: (status: string) => "done" | "current" | "pending" }> = [
  { key: "received",   label: "Recibido",           match: (s) => s === "awaiting_payment" ? "current" : "done" },
  { key: "reviewed",   label: "Revisado",           match: (s) => ["awaiting_payment", "order_received", "quote_sent"].includes(s) ? "pending" : (s === "quote_approved" ? "current" : "done") },
  { key: "printing",   label: "Imprimiendo",        match: (s) => ["printing_started"].includes(s) ? "current" : (["finishing_qc", "ready_pickup", "shipped", "completed"].includes(s) ? "done" : "pending") },
  { key: "qc",         label: "Control de calidad", match: (s) => s === "finishing_qc" ? "current" : (["ready_pickup", "shipped", "completed"].includes(s) ? "done" : "pending") },
  { key: "handoff",    label: "Enviado / Listo",    match: (s) => ["shipped", "ready_pickup"].includes(s) ? "current" : (s === "completed" ? "done" : "pending") },
  { key: "delivered",  label: "Entregado",          match: (s) => s === "completed" ? "done" : "pending" },
];

interface OrderPagePiece {
  name?: string;
  quantity?: number;
  material?: string;
  color?: string | null;
}

interface OrderPageData {
  order_number: number;
  status: string;
  eta: string | null;
  fulfillment: string;
  first_name: string | null;
  city: string | null;
  country: string | null;
  pieces_summary: OrderPagePiece[] | null;
  photos: string[] | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  customer_events: Array<{ kind: string; status: string | null; message: string | null; created_at: string }> | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

export default function OrderPage() {
  const params = useParams<{ token: string }>();
  const token = (params.token ?? "").trim();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderPageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [rpcMissing, setRpcMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) { setLoading(false); setNotFound(true); return; }
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("get_order_by_token", { _token: token });
      if (cancelled) return;
      setLoading(false);
      if (error) {
        // Function missing (migration not deployed yet) or other RPC failure.
        const msg = (error.message ?? "").toLowerCase();
        if (msg.includes("get_order_by_token") || msg.includes("does not exist") || msg.includes("function")) {
          setRpcMissing(true);
        } else {
          setNotFound(true);
        }
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setNotFound(true);
        return;
      }
      setOrder(row as OrderPageData);
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (rpcMissing) {
    return <FallbackToTrack reason="rpc" />;
  }
  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin w-5 h-5 mr-2" /> Cargando pedido…
        </div>
      </PageShell>
    );
  }
  if (notFound || !order) {
    return <FallbackToTrack reason="missing" />;
  }

  return <OrderView order={order} />;
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Helmet>
        <meta name="robots" content="noindex" />
        <title>Tu pedido · Dimension3D</title>
        <link rel="canonical" href={`${SITE_URL}/pedido`} />
      </Helmet>
      <Header />
      <main id="main-content" className="container px-4 py-10 md:py-16 max-w-3xl pt-[var(--header-h)]">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function FallbackToTrack({ reason }: { reason: "rpc" | "missing" }) {
  return (
    <PageShell>
      <Card className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">No encontramos este pedido</h1>
        <p className="text-muted-foreground text-sm">
          {reason === "rpc"
            ? "Estamos actualizando el sistema. Mientras tanto, puedes buscar tu pedido con el número y el email o los últimos 3 dígitos del teléfono."
            : "El enlace ya no es válido o el pedido no existe. Puedes buscarlo con el número y el email o los últimos 3 dígitos del teléfono."}
        </p>
        <Button asChild variant="accent" size="lg">
          <Link to="/track">Ir a /track</Link>
        </Button>
      </Card>
    </PageShell>
  );
}

function OrderView({ order }: { order: OrderPageData }) {
  const fulfillment = order.fulfillment as "pickup" | "shipping";
  const steps = useMemo(() => TIMELINE.map((s) => ({ ...s, state: s.match(order.status) })), [order.status]);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola, tengo una pregunta sobre el pedido #${order.order_number}`
  )}`;
  const deliveryBlock = fulfillment === "shipping"
    ? <ShippingBlock order={order} />
    : <PickupBlock order={order} />;

  return (
    <PageShell>
      <Card className="p-6 md:p-8 space-y-6">
        <header className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Pedido</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">#{order.order_number}</h1>
          {order.first_name ? <p className="text-muted-foreground">Hola {order.first_name},</p> : null}
        </header>

        <Timeline steps={steps} eta={order.eta} />

        <section className="space-y-2">
          <h2 className="text-base font-semibold flex items-center gap-2"><Package className="w-4 h-4" /> Piezas</h2>
          <PiecesList pieces={order.pieces_summary ?? []} />
        </section>

        {deliveryBlock}

        {order.photos && order.photos.length > 0 ? <PhotosBlock photos={order.photos} /> : null}

        {order.customer_notes && order.customer_notes.trim() !== "" ? (
          <section className="space-y-2">
            <h2 className="text-base font-semibold">Notas del estudio</h2>
            <div className="text-sm whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{order.customer_notes}</div>
          </section>
        ) : null}

        <section className="pt-4 border-t space-y-3">
          <h2 className="text-base font-semibold">¿Alguna duda?</h2>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="default">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Pedido #${order.order_number}`)}`}>
                <Mail className="w-4 h-4" /> Email
              </a>
            </Button>
          </div>
        </section>
      </Card>
    </PageShell>
  );
}

function Timeline({ steps, eta }: { steps: Array<{ key: string; label: string; state: "done" | "current" | "pending" }>; eta: string | null }) {
  const etaLabel = formatDate(eta);
  return (
    <ol className="relative space-y-3">
      {steps.map((s) => (
        <li key={s.key} className="flex items-center gap-3">
          <span
            data-state={s.state}
            className={
              s.state === "done" ? "shrink-0 w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center"
              : s.state === "current" ? "shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center animate-pulse"
              : "shrink-0 w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
            }
          >
            {s.state === "done" ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </span>
          <div className="flex-1">
            <div className="text-sm font-medium">{s.label}</div>
            {s.state === "current" && etaLabel ? <div className="text-xs text-muted-foreground">Previsto: {etaLabel}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function PiecesList({ pieces }: { pieces: OrderPagePiece[] }) {
  if (!pieces || pieces.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin piezas registradas.</p>;
  }
  return (
    <ul className="divide-y rounded-lg border">
      {pieces.map((p, i) => (
        <li key={i} className="p-3 flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-md bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
            ×{p.quantity ?? 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate" title={p.name ?? ""}>{p.name ?? "Pieza"}</div>
            <div className="text-xs text-muted-foreground">
              {[p.material, p.color].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ShippingBlock({ order }: { order: OrderPageData }) {
  const dest = [order.city, order.country].filter(Boolean).join(", ");
  if (order.carrier && order.tracking_number) {
    return (
      <section className="space-y-2">
        <h2 className="text-base font-semibold">Envío</h2>
        <div className="rounded-lg border p-3 text-sm space-y-1">
          <div><span className="text-muted-foreground">Transportista: </span>{order.carrier}</div>
          <div><span className="text-muted-foreground">Nº seguimiento: </span>
            {order.tracking_url ? <a className="underline" href={order.tracking_url} target="_blank" rel="noreferrer">{order.tracking_number}</a> : order.tracking_number}
          </div>
          {dest ? <div><span className="text-muted-foreground">Destino: </span>{dest}</div> : null}
          {order.shipped_at ? <div><span className="text-muted-foreground">Enviado: </span>{formatDate(order.shipped_at)}</div> : null}
          {order.delivered_at ? <div><span className="text-muted-foreground">Entregado: </span>{formatDate(order.delivered_at)}</div> : null}
        </div>
      </section>
    );
  }
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">Envío</h2>
      <div className="rounded-lg border p-3 text-sm text-muted-foreground">
        El envío se registrará aquí cuando salga del estudio. Enviaremos también un email con el enlace de seguimiento.
      </div>
    </section>
  );
}

function PickupBlock({ order }: { order: OrderPageData }) {
  const address = PICKUP_ADDRESS?.full ?? "Rambla del Brasil, 53, 08028 Barcelona";
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">Recogida en estudio</h2>
      <div className="rounded-lg border p-3 text-sm space-y-1">
        <div><span className="text-muted-foreground">Dirección: </span>{address}</div>
        <div className="text-muted-foreground">Con cita previa — te avisaremos en cuanto esté listo.</div>
        {order.delivered_at ? <div><span className="text-muted-foreground">Recogido: </span>{formatDate(order.delivered_at)}</div> : null}
      </div>
    </section>
  );
}

function PhotosBlock({ photos }: { photos: string[] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">Fotos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden rounded-md border bg-muted/40">
            <img src={url} alt={`Foto ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
          </a>
        ))}
      </div>
    </section>
  );
}
