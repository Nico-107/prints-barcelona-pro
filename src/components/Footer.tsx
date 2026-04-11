import { MessageCircle, Printer, MapPin, Clock, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_URL = "https://wa.me/34672051147";

const Footer = () => {
  const { t } = useLanguage();

  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`, "_blank");
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Google Maps */}
      <div className="w-full h-64 md:h-80">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d95889.75885045736!2d2.0693762!3d41.3873974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a49816718e30e5%3A0x44b0fb3d4f47660a!2sBarcelona%2C%20Spain!5e0!3m2!1sen!2ses!4v1700000000000!5m2!1sen!2ses"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Dimension3D Barcelona location"
          className="grayscale"
        />
      </div>

      <div className="container px-4 py-12">
        <p className="text-center text-background/60 text-sm mb-10">{t("footer.mapText")}</p>

        <div className="grid md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-background/10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">{t("footer.location.label")}</span>
            </div>
            <p className="text-background/70 text-sm">{t("footer.location.city")}</p>
            <p className="text-background/50 text-xs mt-1">{t("footer.location.pickup")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">{t("footer.shipping.label")}</span>
            </div>
            <p className="text-background/70 text-sm">{t("footer.shipping.area")}</p>
            <p className="text-background/50 text-xs mt-1">{t("footer.shipping.tracking")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">{t("footer.response.label")}</span>
            </div>
            <p className="text-background/70 text-sm">{t("footer.response.time")}</p>
            <p className="text-background/50 text-xs mt-1">{t("footer.response.express")}</p>
          </div>
          <div className="text-center md:text-right">
            <span className="font-medium text-sm block mb-3">{t("footer.quickLinks")}</span>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => scrollToSection("como-funciona")} className="text-background/70 text-sm hover:text-background transition-colors">{t("nav.howItWorks")}</button>
              <button onClick={() => scrollToSection("servicios")} className="text-background/70 text-sm hover:text-background transition-colors">{t("nav.services")}</button>
              <button onClick={() => scrollToSection("materiales")} className="text-background/70 text-sm hover:text-background transition-colors">{t("nav.materials")}</button>
              <button onClick={() => scrollToSection("proyectos")} className="text-background/70 text-sm hover:text-background transition-colors">{t("nav.projects")}</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
              <Printer className="w-5 h-5 text-accent" />
              <span className="font-semibold tracking-tight">Dimension3D Barcelona</span>
            </div>
            <p className="text-background/60 text-sm">{t("footer.tagline")}</p>
            <p className="text-background/40 text-xs mt-1">{t("footer.taglineSub")}</p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-background font-medium transition-colors duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            {t("footer.whatsapp")}
          </button>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-background/40 text-sm">
            © {new Date().getFullYear()} Dimension3D Barcelona. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
