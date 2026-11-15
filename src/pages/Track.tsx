import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import OrderTracker from "@/components/OrderTracker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const SITE_URL = "https://www.dimension3dprints.com";
const SOCIAL_IMAGE_URL = `${SITE_URL}/og/share-default.png`;

const Track = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  // Item 1.5: single input accepts either email OR last 3 digits of the phone.
  // The confirmation email promises "email or phone"; we pick the right lookup
  // based on what the user typed.
  const [credential, setCredential] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(orderNumber.trim(), 10);
    const raw = credential.trim();
    if (!num || raw.length === 0) {
      toast({ title: t("track.error.title"), description: t("track.error.invalid"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const isEmail = raw.includes("@");
    let row: any = null;
    let error: unknown = null;
    if (isEmail) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase as any).rpc("get_order_tracking_by_email", {
        _order_number: num,
        _email: raw.toLowerCase(),
      });
      if (res.error) {
        // Fallback: try the digits-only variant if the user put @ by mistake.
        error = res.error;
      } else {
        row = Array.isArray(res.data) ? res.data[0] : res.data;
      }
    }
    if (!row) {
      const digitsOnly = raw.replace(/\D/g, "").slice(-3);
      if (digitsOnly.length === 3) {
        const res = await supabase.rpc("get_order_tracking", {
          _order_number: num,
          _phone_last3: digitsOnly,
        });
        row = Array.isArray(res.data) ? res.data[0] : res.data;
        error = res.error ?? error;
      }
    }
    setLoading(false);
    if (!row) {
      void navigate; void error;
      toast({ title: t("track.error.title"), description: t("track.error.notFound"), variant: "destructive" });
      return;
    }
    setOrder(row);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Helmet>
        <meta name="robots" content="noindex" />
        <title>Track Your Order Barcelona</title>
        <meta name="description" content="Check the live status of your 3D printing order from Dimension3D Barcelona. Enter your order number and phone digits to see updates." />
        <link rel="canonical" href={`${SITE_URL}/track`} />
        <meta property="og:title" content="Track Your Order Barcelona" />
        <meta property="og:description" content="Check the live status of your 3D printing order from Dimension3D Barcelona." />
        <meta property="og:url" content={`${SITE_URL}/track`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />
        <meta name="twitter:title" content="Track Your Order Barcelona" />
        <meta name="twitter:description" content="Check the live status of your 3D printing order from Dimension3D Barcelona." />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
      </Helmet>
      {/* Item 1: /track joins SiteShell — mini header removed. */}
      <Header />

      <main id="main-content" className="container px-4 py-12 md:py-20 max-w-3xl pt-[var(--header-h)]">
        {!order ? (
          <Card className="p-8 md:p-12 shadow-lg border-border/60">
            <section data-testid="page-hero" data-page-hero className="text-center mb-8">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-accent/10 items-center justify-center mb-4">
                <Search className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{t("track.title")}</h1>
              <p className="text-muted-foreground">{t("track.subtitle")}</p>
            </section>

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
                <label className="block text-sm font-medium mb-1.5">Email o últimos 3 dígitos del teléfono</label>
                <Input
                  type="text"
                  inputMode="text"
                  placeholder="tucorreo@email.com  ·  422"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  className="h-12 text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Usa el email o el teléfono que nos facilitaste al hacer el pedido.</p>
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
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Track;
