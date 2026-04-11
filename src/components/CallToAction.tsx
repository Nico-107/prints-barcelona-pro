import { Button } from "@/components/ui/button";
import { Upload, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_URL = "https://wa.me/34672051147";

const CallToAction = () => {
  const { t } = useLanguage();

  const handleScrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`, "_blank");
  };

  return (
    <section className="py-20 md:py-28 hero-gradient">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="xl" onClick={handleScrollToUpload} className="shadow-lg">
              <Upload className="w-5 h-5" />
              {t("cta.upload")}
            </Button>
            <Button variant="hero-outline" size="xl" onClick={handleWhatsApp} className="group">
              <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
              {t("cta.contact")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
