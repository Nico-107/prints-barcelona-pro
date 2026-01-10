import { MessageCircle, Printer } from "lucide-react";

const WHATSAPP_NUMBER = "34600000000"; // Placeholder - user should replace
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, me gustaría información sobre impresión 3D");

const Footer = () => {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Printer className="w-6 h-6" />
              <span className="font-bold text-lg">Print3D BCN</span>
            </div>
            <p className="text-background/70 text-sm">
              Servicio de impresión 3D en Barcelona
            </p>
            <p className="text-background/50 text-xs mt-1">
              Pedidos online · Recogida con cita previa
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
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} Print3D BCN. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
