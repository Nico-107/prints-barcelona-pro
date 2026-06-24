import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { upgradeAnalyticsPersistence } from "@/lib/analytics";

const CONSENT_KEY = "cookie-consent";

const CookieConsentBanner = () => {
  const { t } = useLanguage();
  // Start hidden; read localStorage only after hydration to avoid SSR mismatch.
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    setHydrated(true);
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") setConsent(stored);
  }, []);

  // Not visible during SSR or when consent already stored.
  if (!hydrated || consent !== null) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    upgradeAnalyticsPersistence();
    setConsent("accepted");
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setConsent("rejected");
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-lg"
    >
      <div className="container max-w-5xl px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="flex-1 text-sm text-muted-foreground leading-snug">
          {t("cookie.banner.message")}{" "}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground whitespace-nowrap">
            {t("cookie.banner.privacy")}
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={reject}>
            {t("cookie.banner.reject")}
          </Button>
          <Button variant="accent" size="sm" onClick={accept}>
            {t("cookie.banner.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
