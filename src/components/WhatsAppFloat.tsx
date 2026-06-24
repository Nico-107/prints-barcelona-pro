import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const WhatsAppFloat = () => {
  const { t } = useLanguage();

  const handleClick = () => {
    capture('whatsapp contact clicked', { source: 'float_button' });
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      aria-label={t("whatsapp.tooltip")}
    >
      <MessageCircle className="w-7 h-7 group-hover:animate-pulse" />
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-25" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {t("whatsapp.tooltip")}
      </span>
    </button>
  );
};

export default WhatsAppFloat;
