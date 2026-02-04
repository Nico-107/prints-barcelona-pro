import { MessageCircle, Printer, MapPin, Clock, Truck } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/34672051147";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, me gustaría solicitar un servicio de impresión 3D con Reality 3D Barcelona.");

const Footer = () => {
  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container px-4">
        {/* Local Business Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-background/10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Ubicación</span>
            </div>
            <p className="text-background/70 text-sm">Barcelona, España</p>
            <p className="text-background/50 text-xs mt-1">Recogida local con cita previa</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Envíos</span>
            </div>
            <p className="text-background/70 text-sm">Toda España peninsular</p>
            <p className="text-background/50 text-xs mt-1">Con seguimiento incluido</p>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Respuesta</span>
            </div>
            <p className="text-background/70 text-sm">Presupuesto en menos de 1h</p>
            <p className="text-background/50 text-xs mt-1">Express disponible (24-48h)</p>
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
              Servicio profesional de impresión 3D en Barcelona
            </p>
            <p className="text-background/40 text-xs mt-1">
              Producción local · Clientes de Barcelona y toda España
            </p>
          </div>

          {/* WhatsApp button */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-whatsapp hover:bg-whatsapp-hover text-background font-medium transition-colors duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            Contactar por WhatsApp
          </button>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-background/40 text-sm">
            © {new Date().getFullYear()} Reality 3D Barcelona. Servicio de impresión 3D en Barcelona, España.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
