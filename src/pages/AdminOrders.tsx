import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { toast } from "@/hooks/use-toast";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orderStatus";

const ADMIN_PASSWORD = "011107";
const SESSION_KEY = "d3d_admin_ok";

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

const emptyDraft = {
  product_title: "",
  customer_phone: "",
  status: "order_received" as OrderStatus,
  eta: "",
  fulfillment: "pickup",
  notes: "",
  photos: [] as string[],
};

const AdminOrders = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [pw, setPw] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Order | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authed) loadOrders();
  }, [authed]);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_number", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((data || []) as Order[]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      toast({ title: "Incorrect password", variant: "destructive" });
      setPw("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
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

  if (!authed) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <Card className="p-8 w-full max-w-sm shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-xl bg-foreground/5 items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-foreground" />
            </div>
            <h1 className="text-xl font-bold">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
              className="h-11 text-center tracking-widest text-lg"
            />
            <Button type="submit" className="w-full" size="lg">
              Login
            </Button>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              ← Back to site
            </Link>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold tracking-tight">Order Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 md:py-8 max-w-6xl">
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

        {loading ? (
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
      </main>

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

export default AdminOrders;
