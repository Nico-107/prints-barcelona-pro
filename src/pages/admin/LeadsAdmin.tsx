// /admin/leads — saved quotes, budgets sent and exit reasons with emails
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  contact_email: string | null;
  contact_phone: string | null;
  material: string | null;
  estimated_price_low: number | null;
  estimated_price_high: number | null;
  status: string | null;
  created_at: string;
  utm_source: string | null;
  color: string | null;
  urgency: string | null;
  language: string | null;
}

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `hace ${Math.floor(s)} s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}

function fmtPrice(low: number | null, high: number | null): string {
  if (!low) return "—";
  return low === high ? `${low.toFixed(2)} €` : `${low.toFixed(2)}–${high?.toFixed(2)} €`;
}

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("quote_requests")
      .select("id, contact_email, contact_phone, material, estimated_price_low, estimated_price_high, status, created_at, utm_source, color, urgency, language")
      .order("created_at", { ascending: false })
      .limit(200);
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markContacted = async (id: string) => {
    setContacting(prev => ({ ...prev, [id]: true }));
    const { error } = await supabase
      .from("quote_requests")
      .update({ status: "contacted" })
      .eq("id", id);
    setContacting(prev => ({ ...prev, [id]: false }));
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: "contacted" } : l));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Leads</h1>
          <Button onClick={load} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Actualizar
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : leads.length === 0 ? (
          <p className="text-muted-foreground">No hay leads.</p>
        ) : (
          <div className="space-y-2">
            {leads.map(l => (
              <div key={l.id} className={`border rounded-xl p-4 flex items-start gap-3 ${l.status === "contacted" ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {l.contact_email && (
                      <a href={`mailto:${l.contact_email}`} className="font-medium text-sm hover:underline truncate max-w-[200px]">
                        {l.contact_email}
                      </a>
                    )}
                    {l.contact_phone && (
                      <span className="text-sm text-muted-foreground">{l.contact_phone}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{timeAgo(l.created_at)}</span>
                    {l.status && l.status !== "pending" && (
                      <span className="text-xs rounded-full border px-2 py-0.5">{l.status}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[
                      l.material,
                      fmtPrice(l.estimated_price_low, l.estimated_price_high),
                      l.urgency,
                      l.utm_source ? `utm: ${l.utm_source}` : null,
                    ].filter(Boolean).join(" · ")}
                  </p>
                  {l.color && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{l.color}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {l.contact_email && (
                    <a
                      href={`mailto:${l.contact_email}`}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      title="Enviar email"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {l.status !== "contacted" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markContacted(l.id)}
                      disabled={contacting[l.id]}
                      title="Marcar como contactado"
                    >
                      {contacting[l.id]
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <CheckCircle className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
