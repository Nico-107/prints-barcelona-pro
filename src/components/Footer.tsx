import { MessageCircle, Printer, MapPin, Clock, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICES_MENU, slugForLang } from "@/seo/registry";

const WHATSAPP_URL = "https://wa.me/34672051147";

const Footer = () => {
  const { t, language } = useLanguage();
  const isEs = language === "es";
  const isCa = language === "ca";
  const groupLabel = (g: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? g.labelCa : isEs ? g.labelEs : g.labelEn;
  const itemLabel = (i: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? i.labelCa : isEs ? i.labelEs : i.labelEn;

  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`, "_blank");
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container px-4 py-12">

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

        {/* SEO links: Services / Materials / Specialties */}
        <div className="grid md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-background/10">
          {SERVICES_MENU.map((group) => (
            <div key={group.labelEn}>
              <p className="font-medium text-sm mb-3">{groupLabel(group)}</p>
              <ul className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <li key={item.slugEn}>
                    <Link to={slugForLang(item, language)} className="text-background/70 text-sm hover:text-background transition-colors">
                      {itemLabel(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
