import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import OrderTracker from "@/components/OrderTracker";

const Track = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [phone3, setPhone3] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(orderNumber.trim(), 10);
    const digits = phone3.trim();
    if (!num || digits.length !== 3) {
      toast({ title: t("track.error.title"), description: t("track.error.invalid"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", num)
      .eq("phone_last3", digits)
      .maybeSingle();
    setLoading(false);
    if (error || !data) {
      toast({ title: t("track.error.title"), description: t("track.error.notFound"), variant: "destructive" });
      return;
    }
    setOrder(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> {t("track.backHome")}
          </Link>
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <Package className="w-5 h-5 text-accent" /> Dimension3D
          </div>
        </div>
      </header>

      <main className="container px-4 py-12 md:py-20 max-w-3xl">
        {!order ? (
          <Card className="p-8 md:p-12 shadow-lg border-border/60">
            <div className="text-center mb-8">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-accent/10 items-center justify-center mb-4">
                <Search className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{t("track.title")}</h1>
              <p className="text-muted-foreground">{t("track.subtitle")}</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-5 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("track.orderId")}</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="100"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("track.phone3")}</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="422"
                  value={phone3}
                  onChange={(e) => setPhone3(e.target.value.replace(/\D/g, ""))}
                  className="h-12 text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground mt-1.5">{t("track.phone3.hint")}</p>
              </div>
              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
                {loading ? t("track.searching") : t("track.search")}
              </Button>
            </form>
          </Card>
        ) : (
          <>
            <button
              onClick={() => setOrder(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> {t("track.searchAnother")}
            </button>
            <OrderTracker order={order} />
          </>
        )}
      </main>
    </div>
  );
};

export default Track;
