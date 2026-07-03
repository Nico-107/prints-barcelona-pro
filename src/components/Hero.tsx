import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Upload, MapPin, Clock, UserCheck, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl, countryFlag } from "@/config/cities";
import { capture } from "@/lib/analytics";

const GEO_DELIVERY: Record<string, string> = {
  FR: "3–4 business days",
  PT: "2–3 business days",
  DE: "3–4 business days",
  IT: "3–4 business days",
  NL: "3–4 business days",
  BE: "3–4 business days",
  AT: "3–4 business days",
  CH: "3–4 business days",
  SE: "4–5 business days",
  NO: "4–5 business days",
  DK: "4–5 business days",
  FI: "5–6 business days",
  PL: "4–6 business days",
  CZ: "4–5 business days",
  HU: "4–5 business days",
  RO: "5–6 business days",
  GB: "4–6 business days",
  US: "7–10 business days",
  CA: "8–12 business days",
  AU: "10–14 business days",
  MX: "7–10 business days",
  JP: "8–12 business days",
};

const GEO_DELIVERY_ES: Record<string, string> = {
  FR: "3–4 días laborables",
  PT: "2–3 días laborables",
  DE: "3–4 días laborables",
  IT: "3–4 días laborables",
  NL: "3–4 días laborables",
  BE: "3–4 días laborables",
  AT: "3–4 días laborables",
  CH: "3–4 días laborables",
  SE: "4–5 días laborables",
  NO: "4–5 días laborables",
  DK: "4–5 días laborables",
  FI: "5–6 días laborables",
  PL: "4–6 días laborables",
  CZ: "4–5 días laborables",
  HU: "4–5 días laborables",
  RO: "5–6 días laborables",
  GB: "4–6 días laborables",
  US: "7–10 días laborables",
  CA: "8–12 días laborables",
  AU: "10–14 días laborables",
  MX: "7–10 días laborables",
  JP: "8–12 días laborables",
};

const GEO_DELIVERY_CA: Record<string, string> = {
  FR: "3–4 dies laborables",
  PT: "2–3 dies laborables",
  DE: "3–4 dies laborables",
  IT: "3–4 dies laborables",
  NL: "3–4 dies laborables",
  BE: "3–4 dies laborables",
  AT: "3–4 dies laborables",
  CH: "3–4 dies laborables",
  SE: "4–5 dies laborables",
  NO: "4–5 dies laborables",
  DK: "4–5 dies laborables",
  FI: "5–6 dies laborables",
  PL: "4–6 dies laborables",
  CZ: "4–5 dies laborables",
  HU: "4–5 dies laborables",
  RO: "5–6 dies laborables",
  GB: "4–6 dies laborables",
  US: "7–10 dies laborables",
  CA: "8–12 dies laborables",
  AU: "10–14 dies laborables",
  MX: "7–10 dies laborables",
  JP: "8–12 dies laborables",
};

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const MOBILE_HINT: Record<string, string> = {
  en: "Upload your file below",
  es: "Sube tu archivo abajo",
  ca: "Puja el teu arxiu a sota",
};

interface HeroProps {
  onScrollToCalc?: () => void;
}

const Hero = ({ onScrollToCalc }: HeroProps) => {
  const { t, language } = useLanguage();
  const [geoSubtitle, setGeoSubtitle] = useState<string | null>(null);
  const geoDataRef = useRef<{ code: string; place: string } | null>(null);

  useEffect(() => {
    const buildSubtitle = (code: string, place: string) => {
      const table = language === "es" ? GEO_DELIVERY_ES : language === "ca" ? GEO_DELIVERY_CA : GEO_DELIVERY;
      const fallback = language === "es" ? "5–7 días laborables" : language === "ca" ? "5–7 dies laborables" : "5–7 business days";
      const days = table[code] ?? fallback;
      if (language === "es") return `Entregamos en ${place} en ${days}. Sube tu archivo para un presupuesto al instante.`;
      if (language === "ca") return `Lliurem a ${place} en ${days}. Puja el teu arxiu per a un pressupost instantani.`;
      return `We deliver to ${place} in ${days}. Upload your file for an instant quote.`;
    };

    // Language changed and we already have geo data — recompute without fetching
    if (geoDataRef.current) {
      setGeoSubtitle(buildSubtitle(geoDataRef.current.code, geoDataRef.current.place));
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { country_code?: string; city?: string; country_name?: string }) => {
        const code = data.country_code ?? "";
        if (code === "ES" || !code) return;
        const place = data.city || data.country_name || code;
        geoDataRef.current = { code, place };
        setGeoSubtitle(buildSubtitle(code, place));
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
    return () => { controller.abort(); clearTimeout(timer); };
  }, [language]);

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'hero_cta' });
    const msg = "Hola, me gustaría solicitar un presupuesto para impresión 3D";
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message") || msg)}`, "_blank");
  };

  const handleScrollToUpload = () => {
    capture('quote_cta_click', { source: 'hero_cta' });
    if (onScrollToCalc) {
      onScrollToCalc();
    } else {
      // Fallback if used outside Index
      const el = document.getElementById("calculator");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  const trustItems = [
    {
      icon: MapPin,
      text: t("hero.trust.location")
        .replace("{city}", ACTIVE_CITY.cityName)
        .replace("{flag}", countryFlag(ACTIVE_CITY.countryCode)),
    },
    { icon: Clock, text: t("hero.trust.turnaround") },
    { icon: UserCheck, text: t("hero.trust.expert") },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-gradient">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-primary-foreground/60 mb-4 animate-fade-in font-medium">
            Dimension3D {ACTIVE_CITY.cityName}
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up leading-tight">
            {t("hero.title")}
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/90 mb-6 animate-fade-in-delay max-w-2xl mx-auto">
            {geoSubtitle ?? t("hero.subtitle")}
          </p>

          <div className="flex justify-center mb-8 animate-fade-in-delay">
            <div className="inline-flex items-center gap-2 bg-cta/10 border border-cta/30 text-cta rounded-full px-5 py-2 text-sm font-semibold">
              <Zap className="w-4 h-4 flex-shrink-0" />
              {t("hero.speedPromise")}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <Button
              variant="cta"
              size="xl"
              onClick={handleScrollToUpload}
              className="shadow-lg"
            >
              <Upload className="w-5 h-5" />
              {t("hero.cta.getQuote")}
            </Button>

            <Button
              variant="whatsapp-outline"
              size="xl"
              onClick={handleWhatsApp}
              className="group"
            >
              <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
              {t("hero.cta.whatsapp")}
            </Button>
          </div>

          {/* Mobile scroll hint — visible only on small screens */}
          <p className="md:hidden mt-4 text-center text-sm text-primary-foreground/60 animate-fade-in-delay-2">
            ↓ {MOBILE_HINT[language] ?? MOBILE_HINT.es}
          </p>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-primary-foreground/70 text-sm animate-fade-in-delay-2">
            {trustItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-accent" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Highlighted review quotes */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center animate-fade-in-delay-2">
            {[t("hero.quote1"), t("hero.quote2"), t("hero.quote3")].map((quote, i) => (
              <div key={i} className="bg-primary-foreground/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-primary-foreground/10">
                <p className="text-primary-foreground/80 text-xs italic">{quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 70C1200 65 1320 55 1380 50L1440 45V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
