import { useState } from "react";
import { X } from "lucide-react";
import { ACTIVE_CITY } from "@/config/cities";
import { useLanguage } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";

const LaunchOfferBanner = () => {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  if (!ACTIVE_CITY.launchOffer.enabled || dismissed) return null;

  return (
    <div className="relative z-50 bg-cta text-cta-foreground text-sm font-medium text-center py-2.5 px-10">
      <span>{ACTIVE_CITY.launchOffer.text}</span>
      <button
        onClick={() => { capture('banner dismissed'); setDismissed(true); }}
        aria-label={t("banner.dismiss")}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LaunchOfferBanner;
