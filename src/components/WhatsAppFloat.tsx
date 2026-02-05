import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_URL = "https://wa.me/34672051147";

const WhatsAppFloat = () => {
  const { language } = useLanguage();

  const whatsappMessage = encodeURIComponent(
    language === "en"
      ? "Hello, I would like to request a 3D printing service with Reality 3D BCN."
      : "Hola, me gustaría solicitar un servicio de impresión 3D con Reality 3D BCN."
  );

  const handleClick = () => {
    window.open(`${WHATSAPP_URL}?text=${whatsappMessage}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      aria-label={language === "en" ? "Contact via WhatsApp" : "Contactar por WhatsApp"}
    >
      <MessageCircle className="w-7 h-7 group-hover:animate-pulse" />
      
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-25" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {language === "en" ? "Chat with us" : "¿Hablamos?"}
      </span>
    </button>
  );
};

export default WhatsAppFloat;
