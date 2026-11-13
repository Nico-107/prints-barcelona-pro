import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { capture } from "@/lib/analytics";

const INTERNAL_FLAG_KEY = "dim3d-internal";

/**
 * Conv 4.1 + 4.6 — internal tooling page.
 *   - Shows / sets / clears the dim3d-internal localStorage flag.
 *   - Lets Nico log a manual order (taken over WhatsApp or in person)
 *     so every order lives in PostHog, not just the Stripe ones.
 */
export default function Internal() {
  const [internal, setInternal] = useState(false);
  const [val, setVal] = useState({ value: "", country: "ES", source: "whatsapp", note: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try { setInternal(localStorage.getItem(INTERNAL_FLAG_KEY) === "1"); } catch { /* ignore */ }
  }, []);

  const flip = (on: boolean) => {
    try {
      if (on) localStorage.setItem(INTERNAL_FLAG_KEY, "1");
      else localStorage.removeItem(INTERNAL_FLAG_KEY);
    } catch { /* ignore */ }
    setInternal(on);
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(val.value.replace(",", "."));
    if (!isFinite(value) || value <= 0) return;
    capture("order_paid", {
      channel: "manual",
      order_id: `manual_${Date.now()}`,
      value_eur: value,
      currency: "EUR",
      country: val.country,
      source: val.source,
      note: val.note,
    });
    setSent(true);
    setVal({ value: "", country: val.country, source: val.source, note: "" });
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <>
      <Helmet>
        <title>Internal — Dimension3D</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 pt-[calc(var(--header-h)+32px)] pb-16">
          <section data-testid="page-hero" data-page-hero className="container max-w-xl mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Internal</h1>
            <p className="text-sm text-muted-foreground mb-8">
              This page toggles the <code>dim3d-internal</code> flag on this device and logs
              manual orders taken over WhatsApp or in person. Noindex by design.
            </p>

            <div className="rounded-xl border border-border p-5 mb-10">
              <p className="text-sm font-semibold text-foreground mb-2">
                Internal flag: <span data-testid="internal-flag-state">{internal ? "ON" : "OFF"}</span>
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                When ON, events from this device still fire but carry <code>is_internal: true</code> so
                the dashboards exclude them.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="cta" onClick={() => flip(true)} disabled={internal}>Set internal</Button>
                <Button size="sm" variant="outline" onClick={() => flip(false)} disabled={!internal}>Clear</Button>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-3">Log a manual order</h2>
            <form onSubmit={submitManual} className="rounded-xl border border-border p-5 space-y-3" data-testid="manual-order-form">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Value (EUR)</label>
                <Input inputMode="decimal" value={val.value} onChange={(e) => setVal({ ...val, value: e.target.value })} placeholder="48,00" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Country</label>
                  <Input value={val.country} onChange={(e) => setVal({ ...val, country: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Source</label>
                  <select
                    value={val.source}
                    onChange={(e) => setVal({ ...val, source: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="in_person">In person</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Note</label>
                <Input value={val.note} onChange={(e) => setVal({ ...val, note: e.target.value })} placeholder="what was ordered, by whom" />
              </div>
              <Button type="submit" variant="cta" size="sm">Log order</Button>
              {sent && <p className="text-xs text-green-600 pt-1">Logged. order_paid fired with channel=manual.</p>}
            </form>
          </section>
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </>
  );
}
