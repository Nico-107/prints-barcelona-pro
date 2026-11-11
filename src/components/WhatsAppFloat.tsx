import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const WhatsAppFloat = () => {
  const { t } = useLanguage();
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const [cookieVisible, setCookieVisible] = useState(false);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setStickyBarVisible(document.body.hasAttribute("data-sticky-bar"));
      setCookieVisible(document.body.hasAttribute("data-cookie-visible"));
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-sticky-bar", "data-cookie-visible"] });
    return () => obs.disconnect();
  }, []);

  const href = `${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`;

  // On mobile: lift above sticky bar (56px) and cookie banner (approx 80px) when visible.
  // sm+ keeps its standard offset.
  const mobileBottom = stickyBarVisible
    ? `calc(56px + ${cookieVisible ? "80px + " : ""}16px + env(safe-area-inset-bottom))`
    : cookieVisible
    ? `calc(80px + 16px + env(safe-area-inset-bottom))`
    : `calc(16px + env(safe-area-inset-bottom))`;

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer"
      data-ph-name="whatsapp-floating"
      data-whatsapp-float="true"
      onClick={() => capture('whatsapp_click', { source: 'float_button', location: 'floating', path: window.location.pathname })}
      style={{
        bottom: mobileBottom,
        right: "16px",
      }}
      className="fixed sm:!bottom-6 sm:right-6 z-50 flex items-center justify-center sm:gap-2.5 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-14 h-14 sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 group"
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
