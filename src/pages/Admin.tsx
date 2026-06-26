import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Pencil,
  Lock,
  X,
  Upload as UploadIcon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { StlEstimator } from "@/components/StlEstimator";
import { toast } from "@/hooks/use-toast";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orderStatus";
import type { Session } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  order_number: number;
  product_title: string;
  customer_phone: string;
  status: OrderStatus;
  eta: string | null;
  fulfillment: string;
  notes: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

interface MakerApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  printers: string;
  message: string | null;
  created_at: string;
}

interface PriceEstimate {
  id: string;
  file_name: string | null;
  material: string;
  infill_pct: number;
  quantity: number;
  grams: number;
  est_hours: number;
  price_low: number;
  price_high: number;
  language: string | null;
  created_at: string;
}

type Tab = "orders" | "makers" | "calculator" | "estimates" | "links";

const emptyDraft = {
  product_title: "",
  customer_phone: "",
  status: "order_received" as OrderStatus,
  eta: "",
  fulfillment: "pickup",
  notes: "",
  photos: [] as string[],
};

// Placeholder for the external print management tool URL
const PRINTING_MANAGEMENT_URL = "https://REPLACE_ME";

// ─── Component ────────────────────────────────────────────────────────────────

const Admin = () => {
  const location = useLocation();

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("011107miko@gmail.com");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // ── Tab state — default from URL hash if present ────────────────────────────
  const hashTab = location.hash.replace("#", "") as Tab;
  const validTabs: Tab[] = ["orders", "makers", "calculator", "estimates", "links"];
  const [activeTab, setActiveTab] = useState<Tab>(
    validTabs.includes(hashTab) ? hashTab : "orders"
  );

  // ── Orders state ─────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Order | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ── Maker Applications state ─────────────────────────────────────────────────
  const [applications, setApplications] = useState<MakerApplication[]>([]);
  const [makersLoading, setMakersLoading] = useState(false);

  // ── Price Estimates state ────────────────────────────────────────────────────
  const [estimates, setEstimates] = useState<PriceEstimate[]>([]);
  const [estimatesLoading, setEstimatesLoading] = useState(false);
  const [estimatesUnavailable, setEstimatesUnavailable] = useState(false);

  // ── Auth effect ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => checkRole(s.user.id), 0);
      } else {
        setIsAdmin(false);
        setAuthChecked(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) checkRole(s.user.id);
      else setAuthChecked(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
    setAuthChecked(true);
  };

  // Load all data once admin confirmed
  useEffect(() => {
    if (isAdmin) {
      loadOrders();
      loadApplications();
      loadEstimates();
    }
  }, [isAdmin]);

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  // ── Orders handlers ──────────────────────────────────────────────────────────
  const loadOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_number", { ascending: false });
    setOrdersLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((data || []) as Order[]);
  };

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setOpen(true);
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setDraft({
      product_title: o.product_title,
      customer_phone: o.customer_phone,
      status: o.status,
      eta: o.eta ? new Date(o.eta).toISOString().slice(0, 16) : "",
      fulfillment: o.fulfillment,
      notes: o.notes,
      photos: o.photos || [],
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!draft.customer_phone.trim()) {
      toast({ title: "Phone is required", variant: "destructive" });
      return;
    }
    const payload = {
      product_title: draft.product_title,
      customer_phone: draft.customer_phone,
      status: draft.status,
      eta: draft.eta ? new Date(draft.eta).toISOString() : null,
      fulfillment: draft.fulfillment,
      notes: draft.notes,
      photos: draft.photos,
    };
    if (editing) {
      const { error } = await supabase.from("orders").update(payload).eq("id", editing.id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Order updated" });
    } else {
      const { error } = await supabase.from("orders").insert(payload);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Order created" });
    }
    setOpen(false);
    loadOrders();
  };

  const handleDelete = async (o: Order) => {
    if (!confirm(`Delete order #${o.order_number}?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", o.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Order deleted" });
    loadOrders();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("order-photos").upload(path, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }
      const { data } = supabase.storage.from("order-photos").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }
    setDraft((d) => ({ ...d, photos: [...d.photos, ...newUrls] }));
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (url: string) => {
    setDraft((d) => ({ ...d, photos: d.photos.filter((p) => p !== url) }));
  };

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(o.order_number).includes(q) ||
      o.customer_phone.toLowerCase().includes(q) ||
      o.product_title.toLowerCase().includes(q)
    );
  });

  // ── Maker Applications handlers ───────────────────────────────────────────────
  const loadApplications = async () => {
    setMakersLoading(true);
    const { data, error } = await supabase
      .from("maker_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setMakersLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setApplications((data || []) as MakerApplication[]);
  };

  // ── Price Estimates handlers ──────────────────────────────────────────────────
  const loadEstimates = async () => {
    setEstimatesLoading(true);
    const { data, error } = await supabase
      .from("price_estimates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setEstimatesLoading(false);
    if (error) {
      // Table may not exist yet if migration hasn't been run
      setEstimatesUnavailable(true);
      return;
    }
    setEstimates((data || []) as PriceEstimate[]);
  };

  // ── Auth screens ─────────────────────────────────────────────────────────────

  if (authChecked && session && !isAdmin) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <Card className="p-8 w-full max-w-sm shadow-xl text-center space-y-4">
          <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold">Not authorized</h1>
          <p className="text-sm text-muted-foreground">
            Your account does not have admin access.
          </p>
          <Button onClick={handleLogout} variant="outline" className="w-full">Sign out</Button>
          <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground">← Back to site</Link>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <Card className="p-8 w-full max-w-sm shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-xl bg-foreground/5 items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-foreground" />
            </div>
            <h1 className="text-xl font-bold">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in with your admin account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="h-11"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-11"
            />
            <Button type="submit" className="w-full" size="lg" disabled={authBusy}>
              {authBusy ? "Signing in..." : "Sign in"}
            </Button>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              ← Back to site
            </Link>
          </form>
        </Card>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders",     label: "Orders" },
    { id: "makers",     label: "Maker Applications" },
    { id: "calculator", label: "Calculator" },
    { id: "estimates",  label: "Price Estimates" },
    { id: "links",      label: "Quick Links" },
  ];

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold tracking-tight">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Tab bar */}
        <div className="container px-4 flex gap-1 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="container px-4 py-6 md:py-8 max-w-6xl">

        {/* ── Orders tab ──────────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order #, phone, or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <Button onClick={openNew} variant="accent" size="lg">
                <Plus className="w-4 h-4" /> New Order
              </Button>
            </div>

            {ordersLoading ? (
              <p className="text-center text-muted-foreground py-12">Loading...</p>
            ) : filtered.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">No orders yet.</Card>
            ) : (
              <div className="grid gap-3">
                {filtered.map((o) => (
                  <Card key={o.id} className="p-4 md:p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">#{o.order_number}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                            {o.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{o.product_title || "—"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {o.customer_phone} · {o.fulfillment} ·{" "}
                          {o.eta ? `ETA ${new Date(o.eta).toLocaleDateString()}` : "no ETA"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(o)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(o)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Maker Applications tab ──────────────────────────────────────────── */}
        {activeTab === "makers" && (
          <>
            {makersLoading ? (
              <p className="text-center text-muted-foreground py-12">Loading...</p>
            ) : applications.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">No applications yet.</Card>
            ) : (
              <div className="grid gap-3">
                {applications.map((a) => (
                  <Card key={a.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">{a.name}</span>
                          <span className="text-xs text-muted-foreground">{a.city}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                          <span>{a.email}</span>
                          {a.phone && <span>{a.phone}</span>}
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Printers:</span> {a.printers}
                        </p>
                        {a.message && (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.message}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground md:text-right">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Calculator tab ──────────────────────────────────────────────────── */}
        {activeTab === "calculator" && (
          <StlEstimator adminMode />
        )}

        {/* ── Price Estimates tab ─────────────────────────────────────────────── */}
        {activeTab === "estimates" && (
          <>
            {estimatesLoading ? (
              <p className="text-center text-muted-foreground py-12">Loading...</p>
            ) : estimatesUnavailable ? (
              <Card className="p-12 text-center text-muted-foreground">
                <p className="font-medium mb-1">Price estimates table not available yet.</p>
                <p className="text-sm">Run the SQL migration in Supabase to enable this log.</p>
              </Card>
            ) : estimates.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">No estimates logged yet.</Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">File</th>
                      <th className="pb-3 pr-4">Material</th>
                      <th className="pb-3 pr-4">Infill</th>
                      <th className="pb-3 pr-4">Qty</th>
                      <th className="pb-3 pr-4">Grams</th>
                      <th className="pb-3 pr-4">Hours</th>
                      <th className="pb-3">Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {estimates.map((e) => (
                      <tr key={e.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 max-w-[140px] truncate" title={e.file_name ?? undefined}>
                          {e.file_name ?? "—"}
                        </td>
                        <td className="py-3 pr-4 font-medium">{e.material}</td>
                        <td className="py-3 pr-4">{e.infill_pct}%</td>
                        <td className="py-3 pr-4">{e.quantity}</td>
                        <td className="py-3 pr-4">{Number(e.grams).toFixed(1)} g</td>
                        <td className="py-3 pr-4">{Number(e.est_hours).toFixed(1)} h</td>
                        <td className="py-3 font-medium">
                          €{Number(e.price_low).toFixed(0)}–{Number(e.price_high).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Quick Links tab ─────────────────────────────────────────────────── */}
        {activeTab === "links" && (
          <div className="grid gap-4 max-w-lg">
            <Card className="p-5">
              <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Internal</h2>
              <div className="space-y-2">
                <Link
                  to="/track"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  Order Tracking (/track)
                </Link>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">External</h2>
              <div className="space-y-2">
                <a
                  href={PRINTING_MANAGEMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  Printing Management
                  <span className="text-xs text-muted-foreground ml-1">(update PRINTING_MANAGEMENT_URL in Admin.tsx)</span>
                </a>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* ── Order edit/create dialog ────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit Order #${editing.order_number}` : "New Order"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Product title</label>
              <Input
                value={draft.product_title}
                onChange={(e) => setDraft({ ...draft, product_title: e.target.value })}
                placeholder="Custom Mount, Prototype..."
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Customer phone *</label>
              <Input
                value={draft.customer_phone}
                onChange={(e) => setDraft({ ...draft, customer_phone: e.target.value })}
                placeholder="+34 600 123 422"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Last 3 digits used for tracking lookup.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Status</label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => setDraft({ ...draft, status: v as OrderStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Fulfillment</label>
                <Select
                  value={draft.fulfillment}
                  onValueChange={(v) => setDraft({ ...draft, fulfillment: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">ETA</label>
              <Input
                type="datetime-local"
                value={draft.eta}
                onChange={(e) => setDraft({ ...draft, eta: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Notes</label>
              <Textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Latest progress notes shown to customer..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Progress photos</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {draft.photos.map((p) => (
                  <div key={p} className="relative group">
                    <img src={p} className="w-full aspect-square object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removePhoto(p)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-md p-3 cursor-pointer hover:bg-secondary text-sm">
                <UploadIcon className="w-4 h-4" />
                {uploading ? "Uploading..." : "Add photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="accent">
              {editing ? "Save changes" : "Create order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
