import { MapPin, Calendar, Zap, ShieldCheck, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY } from "@/config/cities";
import { GOOGLE_BUSINESS_PROFILE_URL } from "@/seo/entities";

const ADDRESS = `${ACTIVE_CITY.streetAddress}, ${ACTIVE_CITY.cityName}`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;
const EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d191918.83221156645!2d1.8345951207794413!3d41.27117617257367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473f991ad968e8b7%3A0x36354261d56edcc9!2sDimension%203D%20BCN!5e0!3m2!1sen!2ses!4v1789241159804!5m2!1sen!2ses";

const LocationMap = () => {
  const { t } = useLanguage();

  const features = [
    { icon: MapPin, key: "location.feat.based" },
    { icon: Calendar, key: "location.feat.pickup" },
    { icon: Zap, key: "location.feat.fast" },
    { icon: ShieldCheck, key: "location.feat.trusted" },
  ];

  return (
    <section id="ubicacion" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("location.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("location.subtitle")}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left: info */}
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
              <p className="text-foreground font-semibold mb-5">{ADDRESS}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="accent" className="gap-2 flex-1">
                  <a href={GOOGLE_BUSINESS_PROFILE_URL} target="_blank" rel="noopener noreferrer">
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

          {/* Right: map */}
          <div className="rounded-2xl overflow-hidden border border-border card-shadow min-h-[360px]">
            <iframe
              src={EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "360px" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Dimension3D ${ACTIVE_CITY.cityName} location`}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
