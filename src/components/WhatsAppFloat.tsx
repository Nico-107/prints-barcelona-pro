import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";
import { useExperiment } from "@/lib/useExperiment";
import { wasExposureFired, markExposureFired } from "@/lib/experiments";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const WhatsAppFloat = () => {
  const { t, language } = useLanguage();
  const { version, active, forced, langOk } = useExperiment("float_label_r1");
  const labelRef = useRef<HTMLSpanElement>(null);

  const xpText = (key: string): string =>
    langOk && active ? t(key) : t("whatsapp.float.label");

  useEffect(() => {
    if (!active || !langOk) return;
    if (wasExposureFired("float_label_r1")) return;

    // Only fire when the label span is actually visible
    const el = labelRef.current;
    if (!el || el.offsetParent === null) return;

    const slots = document.querySelectorAll('[data-xp-slot="float_label_r1"]');
    const visible = Array.from(slots).filter(
      (s) => (s as HTMLElement).offsetParent !== null
    );

    let visible_ok = false;
    if (visible.length === 1 && visible[0].getAttribute("data-xp-v") === String(version)) {
      visible_ok = true;
    } else if (visible.length !== 1) {
      capture("experiment_error", {
        experiment: "float_label_r1",
        reason: visible.length === 0 ? "no_visible_block" : "visible_mismatch",
        assigned: version,
        visible: visible.length,
      });
    }

    capture("experiment_exposure", {
      experiment: "float_label_r1",
      version,
      language,
      page_type: "float",
      forced,
      visible_ok,
    });
    markExposureFired("float_label_r1");
  }, [active, langOk, version, forced, language]);

  const href = `${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => capture('whatsapp_click', { source: 'float_button', location: 'floating', path: window.location.pathname })}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-whatsapp text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-5 py-3.5 group"
      aria-label={t("whatsapp.tooltip")}
    >
      <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-20" />
      <MessageCircle className="w-6 h-6 shrink-0 relative" />
      <span ref={labelRef} className="text-sm font-semibold relative">
        <span data-xp-slot="float_label_r1" data-xp-v="1">{t("whatsapp.float.label")}</span>
        <span data-xp-slot="float_label_r1" data-xp-v="2">{xpText("xp.float.v2")}</span>
        <span data-xp-slot="float_label_r1" data-xp-v="3">{xpText("xp.float.v3")}</span>
        <span data-xp-slot="float_label_r1" data-xp-v="4">{xpText("xp.float.v4")}</span>
      </span>
    </a>
  );
};

export default WhatsAppFloat;
