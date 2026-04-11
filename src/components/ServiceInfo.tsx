import { MapPin, Clock, Laptop, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ServiceInfo = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Laptop, titleKey: "service.feat.online", descKey: "service.feat.onlineDesc" },
    { icon: MapPin, titleKey: "service.feat.local", descKey: "service.feat.localDesc" },
    { icon: Clock, titleKey: "service.feat.appointment", descKey: "service.feat.appointmentDesc" },
    { icon: Truck, titleKey: "service.feat.shipping", descKey: "service.feat.shippingDesc" },
  ];

  return (
    <section id="servicio" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t("service.title")}{" "}
              <span className="text-accent">{t("service.titleHighlight")}</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{t("service.desc")}</p>

            <div className="bg-secondary/50 rounded-xl p-6 border border-border/50 mb-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                {t("service.pickup.title")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("service.pickup.desc")}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                {t("service.shipping.title")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("service.shipping.desc")}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover border border-border/50 hover:border-accent/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceInfo;
