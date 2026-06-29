import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Lock,
  X,
  Upload as UploadIcon,
  LogOut,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Package,
  Users,
  Calculator,
  BarChart3,
  Link2,
  FileText,
  Loader2,
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

interface QuoteRequest {
  id: string;
  created_at: string;
  contact_email: string | null;
  contact_phone: string | null;
  material: string;
  color: string | null;
  infill: string;
  wall_loops: number;
  quantity: number;
  estimated_grams: number;
  estimated_hours: number;
  estimated_price_low: number;
  estimated_price_high: number;
  file_paths: string[];
  status: string;
  converted_order_id: string | null;
}

type Tab = "orders" | "quotes" | "makers" | "calculator" | "estimates" | "links";

const emptyDraft = {
  product_title: "",
  customer_phone: "",
  status: "order_received" as OrderStatus,
  eta: "",
  fulfillment: "pickup",
  notes: "",
  photos: [] as string[],
};

const emptyAcceptDraft = {
  price: "",
  material: "",
  color: "",
  deliveryDate: "",
  customerName: "",
  fulfillment: "pickup" as "pickup" | "shipping",
};

const PRINTING_MANAGEMENT_URL = "https://REPLACE_ME";

// ─── Status badge helpers ─────────────────────────────────────────────────────

function orderStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    order_received:   { label: "Received",   cls: "bg-slate-100 text-slate-700" },
    quote_sent:       { label: "Quote Sent", cls: "bg-blue-100 text-blue-700" },
    quote_approved:   { label: "Approved",   cls: "bg-amber-100 text-amber-700" },
    printing_started: { label: "Printing",   cls: "bg-violet-100 text-violet-700" },
    finishing_qc:     { label: "QC",         cls: "bg-orange-100 text-orange-700" },
    ready_pickup:     { label: "Ready",      cls: "bg-emerald-100 text-emerald-700" },
    shipped:          { label: "Shipped",    cls: "bg-emerald-100 text-emerald-700" },
    completed:        { label: "Done",       cls: "bg-green-100 text-green-700" },
  };
  const v = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${v.cls}`}>
      {v.label}
    </span>
  );
}

function quoteStatusBadge(status: string) {
  if (status === "pending")  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Pending</span>;
  if (status === "accepted") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" />Accepted</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600"><XCircle className="w-3 h-3" />Declined</span>;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "orders",     label: "Orders",           icon: <Package className="w-4 h-4" /> },
  { id: "quotes",     label: "Quote Requests",   icon: <FileText className="w-4 h-4" /> },
  { id: "makers",     label: "Maker Applications", icon: <Users className="w-4 h-4" /> },
  { id: "calculator", label: "Calculator",        icon: <Calculator className="w-4 h-4" /> },
  { id: "estimates",  label: "Price Log",         icon: <BarChart3 className="w-4 h-4" /> },
  { id: "links",      label: "Quick Links",       icon: <Link2 className="w-4 h-4" /> },
];

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

  const hashTab = location.hash.replace("#", "") as Tab;
  const validTabs: Tab[] = ["orders", "quotes", "makers", "calculator", "estimates", "links"];
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

  // ── Quote Requests state ──────────────────────────────────────────────────────
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [signedUrlMap, setSignedUrlMap] = useState<Record<string, string>>({});
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState<QuoteRequest | null>(null);
  const [acceptDraft, setAcceptDraft] = useState(emptyAcceptDraft);
  const [acceptBusy, setAcceptBusy] = useState(false);

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
      if (s?.user) setTimeout(() => checkRole(s.user.id), 0);
      else { setIsAdmin(false); setAuthChecked(true); }
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
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setAuthChecked(true);
  };

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
      loadQuotes();
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
    if (error) { toast({ title: "Login failed", description: error.message, variant: "destructive" }); setPassword(""); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setIsAdmin(false); };

  // ── Orders handlers ──────────────────────────────────────────────────────────
  const loadOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("order_number", { ascending: false });
    setOrdersLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setOrders((data || []) as Order[]);
  };

  const openNew = () => { setEditing(null); setDraft(emptyDraft); setOpen(true); };
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
    if (!draft.customer_phone.trim()) { toast({ title: "Phone is required", variant: "destructive" }); return; }
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
      if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); continue; }
      const { data } = supabase.storage.from("order-photos").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }
    setDraft((d) => ({ ...d, photos: [...d.photos, ...newUrls] }));
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (url: string) => setDraft((d) => ({ ...d, photos: d.photos.filter((p) => p !== url) }));

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return String(o.order_number).includes(q) || o.customer_phone.toLowerCase().includes(q) || o.product_title.toLowerCase().includes(q);
  });

  // ── Quote Requests handlers ───────────────────────────────────────────────────
  const loadQuotes = async () => {
    setQuotesLoading(true);
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setQuotesLoading(false);
    if (error) { console.error("quote_requests load error:", error); return; }
    const rows = (data || []) as QuoteRequest[];
    setQuoteRequests(rows);

    // Fetch signed URLs for all file paths in one batch
    const allPaths = [...new Set(rows.flatMap(r => r.file_paths))];
    if (allPaths.length === 0) return;
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-sign-urls", {
        body: { paths: allPaths },
        headers: s?.access_token ? { Authorization: `Bearer ${s.access_token}` } : {},
      });
      if (!res.error && res.data?.signedUrls) {
        const map: Record<string, string> = {};
        for (const entry of res.data.signedUrls as { path: string; url: string | null }[]) {
          if (entry.url) map[entry.path] = entry.url;
        }
        setSignedUrlMap(map);
      }
    } catch (e) {
      console.error("admin-sign-urls error:", e);
    }
  };

  const openAccept = (q: QuoteRequest) => {
    setAcceptTarget(q);
    const mid = ((q.estimated_price_low + q.estimated_price_high) / 2).toFixed(2);
    setAcceptDraft({
      price: mid,
      material: q.material,
      color: q.color ?? "",
      deliveryDate: "",
      customerName: "",
      fulfillment: "pickup",
    });
    setAcceptOpen(true);
  };

  const handleAccept = async () => {
    if (!acceptTarget) return;
    const priceNum = parseFloat(acceptDraft.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Enter a valid price", variant: "destructive" }); return;
    }
    setAcceptBusy(true);
    try {
      const phone = acceptTarget.contact_phone?.trim() || "see notes";
      const noteParts = [
        `Accepted from quote request ${acceptTarget.id.slice(0, 8)}.`,
        acceptDraft.customerName ? `Customer: ${acceptDraft.customerName}.` : "",
        acceptTarget.contact_email ? `Email: ${acceptTarget.contact_email}.` : "",
        `Confirmed price: €${priceNum.toFixed(2)}.`,
        `Material: ${acceptDraft.material}${acceptDraft.color ? ` / ${acceptDraft.color}` : ""}.`,
        `Infill: ${acceptTarget.infill}, ${acceptTarget.wall_loops} walls, qty ${acceptTarget.quantity}.`,
        `Est. ${acceptTarget.estimated_grams.toFixed(1)} g / ${acceptTarget.estimated_hours.toFixed(1)} h.`,
      ].filter(Boolean).join(" ");

      const { data: newOrders, error: orderErr } = await supabase.from("orders").insert({
        product_title: `3D Print — ${acceptDraft.material}${acceptDraft.color ? ` (${acceptDraft.color})` : ""}`,
        customer_phone: phone,
        status: "quote_approved",
        eta: acceptDraft.deliveryDate ? new Date(acceptDraft.deliveryDate).toISOString() : null,
        fulfillment: acceptDraft.fulfillment,
        notes: noteParts,
        photos: [],
      }).select("id, order_number").single();

      if (orderErr) throw orderErr;

      await supabase.from("quote_requests").update({
        status: "accepted",
        converted_order_id: newOrders.id,
      }).eq("id", acceptTarget.id);

      // Fire-and-forget confirmation email if customer email is known
      if (acceptTarget.contact_email) {
        const { data: { session: s } } = await supabase.auth.getSession();
        supabase.functions.invoke("send-order-confirmation", {
          body: {
            customerEmail: acceptTarget.contact_email,
            orderNumber: newOrders.order_number,
            finalPrice: priceNum,
            material: acceptDraft.material,
            color: acceptDraft.color || null,
            deliveryDate: acceptDraft.deliveryDate || null,
            customerName: acceptDraft.customerName || null,
          },
          headers: s?.access_token ? { Authorization: `Bearer ${s.access_token}` } : {},
        }).catch(e => console.error("send-order-confirmation failed:", e));
      }

      toast({ title: `Order #${newOrders.order_number} created`, description: "Quote marked as accepted." });
      setAcceptOpen(false);
      loadQuotes();
      loadOrders();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAcceptBusy(false);
    }
  };

  const handleDecline = async (q: QuoteRequest) => {
    if (!confirm("Decline this quote request?")) return;
    const { error } = await supabase.from("quote_requests").update({ status: "declined" }).eq("id", q.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Quote declined" });
    setQuoteRequests(prev => prev.map(r => r.id === q.id ? { ...r, status: "declined" } : r));
  };

  // ── Maker Applications handlers ───────────────────────────────────────────────
  const loadApplications = async () => {
    setMakersLoading(true);
    const { data, error } = await supabase.from("maker_applications").select("*").order("created_at", { ascending: false });
    setMakersLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setApplications((data || []) as MakerApplication[]);
  };

  // ── Price Estimates handlers ──────────────────────────────────────────────────
  const loadEstimates = async () => {
    setEstimatesLoading(true);
    const { data, error } = await supabase.from("price_estimates").select("*").order("created_at", { ascending: false }).limit(100);
    setEstimatesLoading(false);
    if (error) { setEstimatesUnavailable(true); return; }
    setEstimates((data || []) as PriceEstimate[]);
  };

  // ── Auth screens ─────────────────────────────────────────────────────────────

  if (authChecked && session && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-sm text-center space-y-4">
          <Lock className="w-8 h-8 mx-auto text-slate-400" />
          <h1 className="text-xl font-bold text-slate-900">Not authorized</h1>
          <p className="text-sm text-slate-500">Your account does not have admin access.</p>
          <Button onClick={handleLogout} variant="outline" className="w-full">Sign out</Button>
          <Link to="/" className="block text-sm text-slate-400 hover:text-slate-700">← Back to site</Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <span className="text-2xl font-bold text-slate-900">Dimension<span className="text-amber-500">3D</span></span>
            <p className="text-sm text-slate-500 mt-1">Admin Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="h-11" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="h-11" />
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold h-11" disabled={authBusy}>
              {authBusy ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in…</> : "Sign in"}
            </Button>
            <Link to="/" className="block text-center text-sm text-slate-400 hover:text-slate-700">← Back to site</Link>
          </form>
        </div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────

  const pendingQuotes = quoteRequests.filter(q => q.status === "pending");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="bg-slate-900 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-slate-200 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Link>
            <span className="text-white font-bold text-lg leading-none">
              Dimension<span className="text-amber-400">3D</span>
            </span>
            <span className="hidden sm:block text-slate-500 text-sm">Admin Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-100 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Nav tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 pb-0 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === item.id
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === "quotes" && pendingQuotes.length > 0 && (
                <span className="ml-0.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {pendingQuotes.length > 9 ? "9+" : pendingQuotes.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8">

        {/* ── Orders tab ────────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by order #, phone, or product…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 bg-white border-slate-200"
                />
              </div>
              <Button onClick={openNew} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold h-10">
                <Plus className="w-4 h-4 mr-1" /> New Order
              </Button>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading orders…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Package className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm mt-1">Create your first order above</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filtered.map((o) => (
                  <div key={o.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-slate-900 text-lg">#{o.order_number}</span>
                          {orderStatusBadge(o.status)}
                          <span className="text-xs text-slate-400">{o.fulfillment}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700">{o.product_title || <span className="text-slate-400 italic">No title</span>}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                          <span className="text-xs text-slate-500">{o.customer_phone}</span>
                          {o.eta ? (
                            <span className="text-xs text-slate-500">
                              Estimated delivery: <span className="font-medium text-slate-700">{new Date(o.eta).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No delivery date set</span>
                          )}
                        </div>
                        {o.notes && (
                          <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{o.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEdit(o)}
                          className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(o)}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Quote Requests tab ────────────────────────────────────────────── */}
        {activeTab === "quotes" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Quote Requests</h2>
                <p className="text-sm text-slate-500">{pendingQuotes.length} pending · {quoteRequests.length} total</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadQuotes} className="border-slate-200">
                Refresh
              </Button>
            </div>

            {quotesLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading quote requests…
              </div>
            ) : quoteRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No quote requests yet</p>
                <p className="text-sm mt-1">They'll appear here when customers submit from the calculator</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {quoteRequests.map((q) => (
                  <div
                    key={q.id}
                    className={`bg-white rounded-xl border shadow-sm p-5 transition-shadow hover:shadow-md ${
                      q.status === "pending" ? "border-amber-200" :
                      q.status === "accepted" ? "border-green-200 opacity-80" :
                      "border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {quoteStatusBadge(q.status)}
                          <span className="text-xs text-slate-400">
                            {new Date(q.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-700">
                          {q.contact_email && <span className="font-medium">{q.contact_email}</span>}
                          {q.contact_phone && <span className="text-slate-500">{q.contact_phone}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold text-slate-900">
                          €{Math.round(q.estimated_price_low)}–{Math.round(q.estimated_price_high)}
                        </div>
                        <div className="text-xs text-slate-400">estimated range</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Material</p>
                        <p className="text-sm font-semibold text-slate-800">{q.material}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Color</p>
                        <p className="text-sm font-semibold text-slate-800">{q.color || <span className="text-slate-400 italic">any</span>}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Infill / Walls</p>
                        <p className="text-sm font-semibold text-slate-800">{q.infill} / {q.wall_loops}w</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Qty</p>
                        <p className="text-sm font-semibold text-slate-800">{q.quantity} unit{q.quantity !== 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-xs text-slate-500 mb-4">
                      <span>~{Number(q.estimated_grams).toFixed(1)} g</span>
                      <span>~{Number(q.estimated_hours).toFixed(1)} h print time</span>
                    </div>

                    {/* File download links */}
                    {q.file_paths.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {q.file_paths.map((path) => {
                          const url = signedUrlMap[path];
                          const name = path.replace(/^\d+-/, "").replace(/_/g, " ");
                          return url ? (
                            <a
                              key={path}
                              href={url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xs font-medium text-slate-700 hover:text-amber-700 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {name.length > 30 ? name.slice(0, 30) + "…" : name}
                            </a>
                          ) : (
                            <span key={path} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-400">
                              <Download className="w-3.5 h-3.5" />
                              {name.length > 30 ? name.slice(0, 30) + "…" : name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions — only for pending */}
                    {q.status === "pending" && (
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <Button
                          size="sm"
                          onClick={() => openAccept(q)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(q)}
                          className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </Button>
                      </div>
                    )}
                    {q.status === "accepted" && q.converted_order_id && (
                      <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 text-xs text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Order created
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Maker Applications tab ─────────────────────────────────────────── */}
        {activeTab === "makers" && (
          <>
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-900">Maker Applications</h2>
              <p className="text-sm text-slate-500">{applications.length} total</p>
            </div>
            {makersLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No applications yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {applications.map((a) => (
                  <div key={a.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">{a.name}</span>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{a.city}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-600">
                          <span>{a.email}</span>
                          {a.phone && <span>{a.phone}</span>}
                        </div>
                        <p className="text-sm">
                          <span className="text-slate-400 text-xs uppercase tracking-wide mr-1">Printers:</span>
                          {a.printers}
                        </p>
                        {a.message && (
                          <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{a.message}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-xs text-slate-400">
                        {new Date(a.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Calculator tab ─────────────────────────────────────────────────── */}
        {activeTab === "calculator" && (
          <StlEstimator adminMode />
        )}

        {/* ── Price Estimates tab ────────────────────────────────────────────── */}
        {activeTab === "estimates" && (
          <>
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-900">Price Estimate Log</h2>
              <p className="text-sm text-slate-500">Last 100 calculator uses</p>
            </div>
            {estimatesLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            ) : estimatesUnavailable ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">Price estimates table not available yet</p>
                <p className="text-sm mt-1">Run the SQL migration in Supabase to enable this log</p>
              </div>
            ) : estimates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">No estimates logged yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-left">
                        {["Date", "File", "Material", "Infill", "Qty", "Grams", "Hours", "Range"].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {estimates.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {new Date(e.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-4 py-3 max-w-[140px] truncate text-slate-600" title={e.file_name ?? undefined}>{e.file_name ?? "—"}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{e.material}</td>
                          <td className="px-4 py-3 text-slate-600">{e.infill_pct}%</td>
                          <td className="px-4 py-3 text-slate-600">{e.quantity}</td>
                          <td className="px-4 py-3 text-slate-600">{Number(e.grams).toFixed(1)} g</td>
                          <td className="px-4 py-3 text-slate-600">{Number(e.est_hours).toFixed(1)} h</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">€{Number(e.price_low).toFixed(0)}–{Number(e.price_high).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Quick Links tab ────────────────────────────────────────────────── */}
        {activeTab === "links" && (
          <div className="grid gap-4 max-w-lg">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Internal</h2>
              <div className="space-y-2">
                <Link to="/track" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors">
                  <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
                  Order Tracking (/track)
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">External</h2>
              <div className="space-y-2">
                <a href={PRINTING_MANAGEMENT_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-amber-600 transition-colors">
                  <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
                  Printing Management
                  <span className="text-xs text-slate-400">(update URL in Admin.tsx)</span>
                </a>
              </div>
            </div>
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
              <label className="text-sm font-medium block mb-1.5 text-slate-700">Product title</label>
              <Input value={draft.product_title} onChange={(e) => setDraft({ ...draft, product_title: e.target.value })} placeholder="Custom Mount, Prototype…" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 text-slate-700">Customer phone *</label>
              <Input value={draft.customer_phone} onChange={(e) => setDraft({ ...draft, customer_phone: e.target.value })} placeholder="+34 600 123 422" />
              <p className="text-xs text-slate-400 mt-1">Last 3 digits used for tracking lookup.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5 text-slate-700">Status</label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as OrderStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5 text-slate-700">Fulfillment</label>
                <Select value={draft.fulfillment} onValueChange={(v) => setDraft({ ...draft, fulfillment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 text-slate-700">Estimated delivery date</label>
              <Input type="datetime-local" value={draft.eta} onChange={(e) => setDraft({ ...draft, eta: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 text-slate-700">Notes</label>
              <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Latest progress notes shown to customer…" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 text-slate-700">Progress photos</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {draft.photos.map((p) => (
                  <div key={p} className="relative group">
                    <img src={p} className="w-full aspect-square object-cover rounded border" />
                    <button type="button" onClick={() => removePhoto(p)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 text-sm text-slate-500">
                <UploadIcon className="w-4 h-4" />
                {uploading ? "Uploading…" : "Add photos"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
              {editing ? "Save changes" : "Create order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Accept Quote modal ──────────────────────────────────────────────────── */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Quote & Create Order</DialogTitle>
          </DialogHeader>
          {acceptTarget && (
            <div className="space-y-4 py-1">
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-0.5">
                <p>Estimate: €{Math.round(acceptTarget.estimated_price_low)}–{Math.round(acceptTarget.estimated_price_high)} · {acceptTarget.material} · {acceptTarget.infill} · qty {acceptTarget.quantity}</p>
                {acceptTarget.contact_email && <p>Will send confirmation email to <strong>{acceptTarget.contact_email}</strong></p>}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5 text-slate-700">Customer name <span className="text-slate-400 font-normal">(optional)</span></label>
                <Input value={acceptDraft.customerName} onChange={e => setAcceptDraft(d => ({ ...d, customerName: e.target.value }))} placeholder="Maria García" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5 text-slate-700">Confirmed price (€) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={acceptDraft.price}
                  onChange={e => setAcceptDraft(d => ({ ...d, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5 text-slate-700">Material</label>
                  <Input value={acceptDraft.material} onChange={e => setAcceptDraft(d => ({ ...d, material: e.target.value }))} placeholder="PLA" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5 text-slate-700">Color</label>
                  <Input value={acceptDraft.color} onChange={e => setAcceptDraft(d => ({ ...d, color: e.target.value }))} placeholder="black" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5 text-slate-700">Estimated delivery date</label>
                <Input type="date" value={acceptDraft.deliveryDate} onChange={e => setAcceptDraft(d => ({ ...d, deliveryDate: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5 text-slate-700">Fulfillment</label>
                <Select value={acceptDraft.fulfillment} onValueChange={(v) => setAcceptDraft(d => ({ ...d, fulfillment: v as "pickup" | "shipping" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)} disabled={acceptBusy}>Cancel</Button>
            <Button onClick={handleAccept} disabled={acceptBusy} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
              {acceptBusy ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Creating…</> : <><CheckCircle2 className="w-4 h-4 mr-1.5" />Create Order</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
