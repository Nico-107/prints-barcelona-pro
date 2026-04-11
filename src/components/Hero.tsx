import { Button } from "@/components/ui/button";
import { MessageCircle, Upload, MapPin, Clock, UserCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_URL = "https://wa.me/34672051147";

const Hero = () => {
  const { t } = useLanguage();

  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`, "_blank");
  };

  const handleScrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  const trustItems = [
    { icon: MapPin, text: t("hero.trust.location") },
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
            Dimension3D Barcelona
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up leading-tight">
            {t("hero.title")}
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 animate-fade-in-delay max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <Button
              variant="accent"
              size="xl"
              onClick={handleScrollToUpload}
              className="shadow-lg"
            >
              <Upload className="w-5 h-5" />
              {t("hero.cta.upload")}
            </Button>

            <Button
              variant="hero-outline"
              size="xl"
              onClick={handleWhatsApp}
              className="group"
            >
              <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
              {t("hero.cta.whatsapp")}
            </Button>
          </div>

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
