import { MapPin, Calendar, Clock, ShieldCheck, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY } from "@/config/cities";

const ADDRESS = `${ACTIVE_CITY.streetAddress}, ${ACTIVE_CITY.cityName}`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;
const MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Dimension 3D BCN Barcelona")}`;

const LocationMap = () => {
  const { t } = useLanguage();

  const features = [
    { icon: MapPin, key: "location.feat.based" },
    { icon: Calendar, key: "location.feat.pickup" },
    { icon: Clock, key: "location.feat.fast" },
    { icon: ShieldCheck, key: "location.feat.trusted" },
  ];


  return (
    <section id="ubicacion" className="py-12 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("location.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("location.subtitle")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-7 md:p-8 border border-border card-shadow flex flex-col">
            <div className="space-y-4 mb-6">
              {features.map(({ icon: Icon, key }) => (
                <div key={key} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-foreground font-medium pt-2">{t(key)}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-5 border-t border-border/50">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t("location.addressLabel")}</p>
              <p className="text-foreground font-semibold mb-3">{ADDRESS}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t("location.hoursLabel")}</p>
              <p className="text-foreground font-medium mb-3">{t("location.hours")}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t("location.areasLabel")}</p>
              <p className="text-sm text-muted-foreground mb-5">{t("location.areas")}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="accent" className="gap-2 flex-1">
                  <a href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    {t("location.viewMaps")}
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2 flex-1">
                  <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4" />
                    {t("location.directions")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
