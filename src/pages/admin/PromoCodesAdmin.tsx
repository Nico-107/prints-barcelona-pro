// /admin/codes — view, create and deactivate promo codes
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase as _supabase } from "@/integrations/supabase/client";
const db = _supabase as unknown as { from(t: string): any };
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PromoCode {
  code: string;
  pct: number;
  kind: string;
  starts_at: string;
  ends_at: string;
  max_uses: number | null;
  uses: number;
  bound_email: string | null;
  active: boolean;
  note: string | null;
  created_at: string;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

export default function PromoCodesAdmin() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", pct: "10", kind: "public", ends_at: "", max_uses: "", note: "",
  });

  const load = async () => {
    setLoading(true);
    const { data } = await db.from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setCodes((data as PromoCode[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deactivate = async (code: string) => {
    const { error } = await db.from("promo_codes").update({ active: false }).eq("code", code);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCodes(prev => prev.map(c => c.code === code ? { ...c, active: false } : c));
    toast({ title: "Código desactivado" });
  };

  const handleCreate = async () => {
    const code = form.code.trim().toUpperCase();
    const pct = parseInt(form.pct, 10);
    if (!code || isNaN(pct) || pct < 1 || pct > 50 || !form.ends_at) {
      toast({ title: "Faltan datos", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await db.from("promo_codes").insert({
      code,
      pct,
      kind: form.kind,
      starts_at: new Date().toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      uses: 0,
      bound_email: null,
      active: true,
      note: form.note || null,
    });
    setCreating(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Código creado" });
    setShowForm(false);
    setForm({ code: "", pct: "10", kind: "public", ends_at: "", max_uses: "", note: "" });
    load();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Códigos de descuento</h1>
          <Button onClick={() => setShowForm(v => !v)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Crear código
          </Button>
        </div>

        {showForm && (
          <div className="border border-border rounded-xl p-4 mb-6 space-y-3 bg-card">
            <h2 className="font-semibold text-sm">Nuevo código</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Código (ej. VERANO20)" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              <Input placeholder="% descuento (1–50)" type="number" value={form.pct} onChange={e => setForm(f => ({ ...f, pct: e.target.value }))} />
              <select
                value={form.kind}
                onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="public">public</option>
                <option value="student">student</option>
                <option value="exit">exit</option>
                <option value="manual">manual</option>
              </select>
              <Input placeholder="Usos máximos (vacío = ilimitado)" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} />
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Caduca</label>
                <Input type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} />
              </div>
              <Input className="col-span-2" placeholder="Nota interna (opcional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating} size="sm">
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Crear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : codes.length === 0 ? (
          <p className="text-muted-foreground">No hay códigos.</p>
        ) : (
          <div className="space-y-2">
            {codes.map(c => (
              <div key={c.code} className={`border rounded-xl p-4 flex items-center gap-3 ${c.active ? "border-border" : "border-border/40 opacity-60"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm">{c.code}</span>
                    <span className="text-xs bg-accent/10 text-accent rounded-full px-2 py-0.5">{c.pct} %</span>
                    <span className="text-xs text-muted-foreground rounded-full border px-2 py-0.5">{c.kind}</span>
                    {!c.active && <span className="text-xs text-destructive">inactivo</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Caduca {fmt(c.ends_at)} · Usos: {c.uses}{c.max_uses != null ? `/${c.max_uses}` : ""}
                    {c.bound_email ? ` · ${c.bound_email}` : ""}
                    {c.note ? ` · ${c.note}` : ""}
                  </p>
                </div>
                {c.active && (
                  <Button variant="ghost" size="sm" onClick={() => deactivate(c.code)} title="Desactivar">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
