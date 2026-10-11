import { Link } from "react-router-dom";
import { Building2, ChevronRight, Clock, Package, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { SLUGS_BY_TOPIC } from "@/seo/registry";
import { STATS, FREE_SAMPLE, TRUST } from "@/config/b2bFacts";
import { capture } from "@/lib/analytics";

const COPY = {
  es: {
    badge: "Para empresas",
    title: "Piezas en 3D para tu empresa en Barcelona",
    subtitle: "Factura, NDA y entrega rápida. Desde 10€ por pedido, sin tarifas de configuración. Respondo en menos de una hora.",
    free: "Prototipo gratis para proyectos nuevos",
    cta: "Ver servicio para empresas",
    orders: "pedidos/mes",
    response: "respuesta",
  },
  en: {
    badge: "For business",
    title: "3D-printed parts for your company in Barcelona",
    subtitle: "Invoice, NDA, fast delivery. €10 minimum order, no setup fee. I respond in under an hour.",
    free: "Free prototype for new projects",
    cta: "See business service",
    orders: "orders/month",
    response: "response",
  },
  ca: {
    badge: "Per a empreses",
    title: "Peces en 3D per a la teva empresa a Barcelona",
    subtitle: "Factura, NDA i lliurament ràpid. Des de 10€ per comanda, sense tarifes de configuració. Respoc en menys d'una hora.",
    free: "Prototip gratis per a projectes nous",
    cta: "Veure servei per a empreses",
    orders: "comandes/mes",
    response: "resposta",
  },
};

const BusinessCTA = () => {
  const { language } = useLanguage();
  const isEs = language === "es";
  const isCa = language === "ca";
  const lang = isCa ? "ca" : isEs ? "es" : "en";
  const c = COPY[lang];
  const slug = SLUGS_BY_TOPIC["business"][language] ?? "/3d-printing-for-business-barcelona";

  const stats: { icon: React.ReactNode; value: string; label: string }[] = [];
  if (STATS.ordersPerMonth) {
    stats.push({ icon: <Package className="w-4 h-4" />, value: STATS.ordersPerMonth, label: c.orders });
  }
  if (STATS.responseTime) {
    stats.push({ icon: <Clock className="w-4 h-4" />, value: STATS.responseTime, label: c.response });
  }

  return (
    <section className="py-14 bg-muted/30 border-y border-border/40">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-accent" />
                </div>
                <span className="text-xs font-semibold text-accent uppercase tracking-widest">{c.badge}</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground leading-snug mb-2">
                {c.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {c.subtitle}
              </p>

              {stats.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {stats.map((s) => (
                    <span key={s.label} className="inline-flex items-center gap-1.5 text-xs font-medium bg-accent/10 text-accent rounded-full px-3 py-1">
                      {s.icon}
                      <strong>{s.value}</strong>
                      <span className="text-accent/70">{s.label}</span>
                    </span>
                  ))}
                  {TRUST.invoiceForCompanies && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-full px-3 py-1">
                      {lang === "es" ? "Facturas para empresas" : lang === "ca" ? "Factures per a empreses" : "Business invoices"}
                    </span>
                  )}
                </div>
              )}

              {FREE_SAMPLE.enabled && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-accent shrink-0" />
                  {c.free}
                </p>
              )}
            </div>

            <div className="md:pt-10 shrink-0">
              <Button
                asChild
                variant="accent"
                size="default"
                className="gap-1.5 w-full md:w-auto"
                onClick={() => capture("b2b_cta_homepage_click", { source: "BusinessCTA" })}
              >
                <Link to={slug}>
                  {c.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessCTA;
