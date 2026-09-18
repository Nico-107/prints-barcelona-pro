import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const WhatsAppFloat = () => {
  const { t } = useLanguage();

  const href = `${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => capture('whatsapp_click', { source: 'float_button' })}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-4 py-3 group"
      aria-label={t("whatsapp.tooltip")}
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-20" />
      <MessageCircle className="w-6 h-6 shrink-0 relative" />
      <span className="text-sm font-semibold relative">WhatsApp</span>
    </a>
  );
};

export default WhatsAppFloat;
