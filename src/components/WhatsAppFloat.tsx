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
      rel="nofollow noopener noreferrer"
      data-ph-name="whatsapp-floating"
      data-whatsapp-float="true"
      onClick={() => capture('whatsapp_click', { source: 'float_button', location: 'floating', path: window.location.pathname })}
      style={{
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        right: "16px",
      }}
      className="fixed sm:bottom-6 sm:right-6 z-50 flex items-center justify-center sm:gap-2.5 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-14 h-14 sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 group"
      aria-label={t("whatsapp.float.label")}
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-20" />
      <MessageCircle className="w-6 h-6 shrink-0 relative" />
      <span className="hidden sm:inline text-sm font-semibold relative">
        {t("whatsapp.float.label")}
      </span>
    </a>
  );
};

export default WhatsAppFloat;
