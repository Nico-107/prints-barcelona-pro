import { Button } from "@/components/ui/button";
import { Upload, MessageCircle } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const CallToAction = () => {
  const { t } = useLanguage();

  const handleScrollToUpload = () => {
    capture('cta quote clicked', { source: 'cta_section' });
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    capture('cta whatsapp clicked', { source: 'cta_section' });
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
            <Button variant="cta" size="xl" onClick={handleScrollToUpload} className="shadow-lg">
              <Upload className="w-5 h-5" />
              {t("cta.getQuote")}
            </Button>
            <Button variant="whatsapp-outline" size="xl" onClick={handleWhatsApp} className="group">
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
