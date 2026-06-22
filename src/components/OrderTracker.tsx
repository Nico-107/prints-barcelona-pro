import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, MapPin, MessageCircle, Package, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { STATUS_INDEX, TIMELINE_STEPS, type OrderStatus } from "@/lib/orderStatus";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";

interface Order {
  order_number: number;
  product_title: string;
  status: OrderStatus;
  eta: string | null;
  fulfillment: string;
  notes: string;
  photos: string[];
}

const WHATSAPP = whatsappUrl(ACTIVE_CITY);

const OrderTracker = ({ order }: { order: Order }) => {
  const { t, language } = useLanguage();
  const currentIdx = STATUS_INDEX[order.status] ?? 0;
  const isShipped = order.status === "shipped";
  const isCompleted = order.status === "completed";

  const formatEta = (iso: string | null) => {
    if (!iso) return t("track.eta.none");
    return new Date(iso).toLocaleString(language === "es" ? "es-ES" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="p-6 md:p-8 shadow-lg border-border/60">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">{t("track.order")}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">#{order.order_number}</h1>
            {order.product_title && (
              <p className="text-muted-foreground mt-1">{order.product_title}</p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
            {isCompleted ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {t(`track.statusLabel.${order.status}`)}
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6 md:p-8 shadow-lg border-border/60">
        <h2 className="text-lg font-semibold mb-6">{t("track.progress")}</h2>
        <ol className="relative space-y-5">
          {TIMELINE_STEPS.map((step, i) => {
            const stepIdx = STATUS_INDEX[step.key];
            const reached = currentIdx >= stepIdx;
            const isCurrent = currentIdx === stepIdx;
            return (
              <li key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      reached
                        ? "bg-accent text-accent-foreground shadow-md"
                        : "bg-secondary text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-accent/20 animate-pulse" : ""}`}
                  >
                    {reached ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-1 ${reached && currentIdx > stepIdx ? "bg-accent" : "bg-border"}`}
                    />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className={`font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                    {t(step.i18n)}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-accent mt-0.5">{t("track.inProgress")}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Details grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4" /> {t("track.eta")}
          </div>
          <p className="font-semibold text-lg">{formatEta(order.eta)}</p>
        </Card>
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {order.fulfillment === "shipping" ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            {t("track.fulfillment")}
          </div>
          <p className="font-semibold text-lg">
            {t(order.fulfillment === "shipping" ? "track.fulfillment.shipping" : "track.fulfillment.pickup")
              .replace("{city}", ACTIVE_CITY.cityName)}
          </p>
          {order.fulfillment === "pickup" && (
            <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {ACTIVE_CITY.streetAddress}, {ACTIVE_CITY.cityName}
            </p>
          )}
        </Card>
      </div>

      {/* Notes */}
      {order.notes && (
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t("track.notes")}</h3>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{order.notes}</p>
        </Card>
      )}

      {/* Photos */}
      {order.photos && order.photos.length > 0 && (
        <Card className="p-6 border-border/60">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t("track.photos")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {order.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                <img
                  src={url}
                  alt={`Progress ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border border-border/60 hover:opacity-90 transition"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* WhatsApp CTA */}
      <Button asChild variant="whatsapp" size="lg" className="w-full">
        <a href={WHATSAPP} target="_blank" rel="noreferrer">
          <MessageCircle className="w-5 h-5" /> {t("track.whatsapp")}
        </a>
      </Button>
    </div>
  );
};

export default OrderTracker;
