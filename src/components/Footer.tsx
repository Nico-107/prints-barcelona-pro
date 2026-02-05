import { MessageCircle, Printer, MapPin, Clock, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_URL = "https://wa.me/34672051147";

const Footer = () => {
  const { language } = useLanguage();

  const whatsappMessage = encodeURIComponent(
    language === "en"
      ? "Hello, I would like to request a 3D printing service with Reality 3D Barcelona."
      : "Hola, me gustaría solicitar un servicio de impresión 3D con Reality 3D Barcelona."
  );

  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${whatsappMessage}`, "_blank");
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container px-4">
        {/* Local Business Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-background/10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">
                {language === "en" ? "Location" : "Ubicación"}
              </span>
            </div>
            <p className="text-background/70 text-sm">
              {language === "en" ? "Barcelona, Spain" : "Barcelona, España"}
            </p>
            <p className="text-background/50 text-xs mt-1">
              {language === "en" ? "Local pickup by appointment" : "Recogida local con cita previa"}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">
                {language === "en" ? "Shipping" : "Envíos"}
              </span>
            </div>
            <p className="text-background/70 text-sm">
              {language === "en" ? "All mainland Spain" : "Toda España peninsular"}
            </p>
            <p className="text-background/50 text-xs mt-1">
              {language === "en" ? "With tracking included" : "Con seguimiento incluido"}
            </p>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">
                {language === "en" ? "Response" : "Respuesta"}
              </span>
            </div>
            <p className="text-background/70 text-sm">
              {language === "en" ? "Quote in less than 1h" : "Presupuesto en menos de 1h"}
            </p>
            <p className="text-background/50 text-xs mt-1">
              {language === "en" ? "Express available (24-48h)" : "Express disponible (24-48h)"}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
              <Printer className="w-5 h-5" />
              <span className="font-semibold tracking-tight">Reality 3D Barcelona</span>
            </div>
            <p className="text-background/60 text-sm">
              {language === "en" 
                ? "Professional 3D printing service in Barcelona"
                : "Servicio profesional de impresión 3D en Barcelona"}
            </p>
            <p className="text-background/40 text-xs mt-1">
              {language === "en"
                ? "Local production · Customers from Barcelona and all of Spain"
                : "Producción local · Clientes de Barcelona y toda España"}
            </p>
          </div>

          {/* WhatsApp button */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-whatsapp hover:bg-whatsapp-hover text-background font-medium transition-colors duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            {language === "en" ? "Contact via WhatsApp" : "Contactar por WhatsApp"}
          </button>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-background/40 text-sm">
            © {new Date().getFullYear()} Reality 3D Barcelona. {language === "en" ? "3D printing service in Barcelona, Spain." : "Servicio de impresión 3D en Barcelona, España."}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
