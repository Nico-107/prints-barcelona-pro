import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { upgradeAnalyticsPersistence, enableHeatmapsAndReplay, disableHeatmapsAndReplay, capture } from "@/lib/analytics";
import { migrateExperimentAssignment } from "@/lib/experiments";

const CONSENT_KEY = "cookie-consent";
const CONSENT_DATE_KEY = "cookie-consent-date";
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

// IMPORTANT: set COOKIELESS_ENABLED to true in main.tsx ONLY after enabling
// "Cookieless server hash mode" in the PostHog project settings. Without the
// project-side setting, all cookieless events are silently dropped.

function getStoredConsent(): "accepted" | "rejected" | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    const date = localStorage.getItem(CONSENT_DATE_KEY);
    if (stored !== "accepted" && stored !== "rejected") return null;
    if (date && Date.now() - new Date(date).getTime() > CONSENT_TTL_MS) {
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(CONSENT_DATE_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

function storeConsent(v: "accepted" | "rejected"): void {
  try {
    localStorage.setItem(CONSENT_KEY, v);
    localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
  } catch { /* unavailable */ }
}

function getPageType(): string {
  if (typeof window === "undefined") return "other";
  const p = window.location.pathname;
  if (p === "/" || p === "") return "home";
  if (p.startsWith("/admin")) return "admin";
  if (p.includes("privacy")) return "privacy";
  return "other";
}

const CookieConsentBanner = () => {
  const { t } = useLanguage();
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [placement, setPlacement] = useState<"card" | "sheet" | "top-docked">("card");
  const shownRef = useRef(false);
  const shownAtRef = useRef<number>(0);
  const triggerRef = useRef<"scroll" | "click" | "timer">("timer");

  const showBanner = useCallback((trigger: "scroll" | "click" | "timer") => {
    if (shownRef.current) return;
    shownRef.current = true;
    triggerRef.current = trigger;
    shownAtRef.current = Date.now();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const p: "card" | "sheet" = isMobile ? "sheet" : "card";
    setPlacement(p);
    setVisible(true);
    capture("consent_prompt_shown", { placement: p, trigger });
  }, []);

  useEffect(() => {
    setHydrated(true);
    const stored = getStoredConsent();
    setConsent(stored);
    if (stored === "accepted") enableHeatmapsAndReplay();
    if (stored !== null) return;

    const onScroll = () => showBanner("scroll");
    const onClick = () => showBanner("click");
    const timer = setTimeout(() => showBanner("timer"), 4000);

    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    window.addEventListener("click", onClick, { once: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      clearTimeout(timer);
    };
  }, [showBanner]);

  // Watch for modal open — dock banner at top when modal is open
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setModalOpen(document.body.hasAttribute("data-estimator-open"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-estimator-open"] });
    return () => observer.disconnect();
  }, []);

  // Listen for footer "Preferencias de cookies" link
  useEffect(() => {
    const reopen = () => {
      shownRef.current = false;
      setConsent(null);
      setVisible(false);
      // Slight delay so state clears before re-showing
      setTimeout(() => showBanner("click"), 50);
    };
    document.addEventListener("cookie-prefs-open", reopen);
    return () => document.removeEventListener("cookie-prefs-open", reopen);
  }, [showBanner]);

  if (!hydrated || consent !== null || !visible) return null;

  const accept = () => {
    const secs = Math.round((Date.now() - shownAtRef.current) / 1000);
    storeConsent("accepted");
    upgradeAnalyticsPersistence();
    enableHeatmapsAndReplay();
    migrateExperimentAssignment();
    (window as any).gtag?.("consent", "update", { analytics_storage: "granted" });
    capture("consent_decision", { decision: "accept", seconds_to_decision: secs, page_type: getPageType() });
    setConsent("accepted");
  };

  const reject = () => {
    const secs = Math.round((Date.now() - shownAtRef.current) / 1000);
    storeConsent("rejected");
    disableHeatmapsAndReplay();
    capture("consent_decision", { decision: "reject", seconds_to_decision: secs, page_type: getPageType() });
    setConsent("rejected");
  };

  // When the calculator modal is open, dock as slim bar at top (z > modal)
  const effectivePlacement = modalOpen ? "top-docked" : placement;

  const privacyPath =
    typeof window !== "undefined" && window.location.pathname.startsWith("/ca/") ? "/ca/privacitat"
    : "/privacy";

  if (effectivePlacement === "top-docked") {
    return (
      <div
        role="dialog"
        aria-label={t("cookie.banner.accept")}
        className="fixed top-0 left-0 right-0 z-[70] border-b border-border bg-background/95 backdrop-blur-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        onKeyDown={e => { if (e.key === "Escape") e.stopPropagation(); }}
      >
        <div className="flex items-center gap-2 px-4 py-2 max-w-5xl mx-auto">
          <p className="flex-1 text-xs text-muted-foreground leading-snug min-w-0 truncate">
            {t("cookie.banner.message")}
          </p>
          <div className="flex gap-1.5 shrink-0">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={reject} data-ph-name="cookie-reject">
              {t("cookie.banner.reject")}
            </Button>
            <Button variant="accent" size="sm" className="h-7 px-2 text-xs" onClick={accept} data-ph-name="cookie-accept">
              {t("cookie.banner.accept")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (effectivePlacement === "sheet") {
    // Mobile: slim bottom sheet, ≤96px, safe-area aware
    return (
      <div
        role="dialog"
        aria-label={t("cookie.banner.accept")}
        className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-background shadow-lg"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
        onKeyDown={e => { if (e.key === "Escape") e.stopPropagation(); }}
      >
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs text-muted-foreground leading-snug">
              {t("cookie.banner.message")}{" "}
              <Link to={privacyPath} className="underline underline-offset-2 hover:text-foreground whitespace-nowrap">
                {t("cookie.banner.moreInfo")}
              </Link>
            </p>
          </div>
          <div className="flex gap-2 mt-1.5">
            <Button variant="outline" size="sm" className="flex-1 h-9" onClick={reject} data-ph-name="cookie-reject">
              {t("cookie.banner.reject")}
            </Button>
            <Button variant="accent" size="sm" className="flex-1 h-9" onClick={accept} data-ph-name="cookie-accept">
              {t("cookie.banner.accept")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: floating card, bottom-left
  return (
    <div
      role="dialog"
      aria-label={t("cookie.banner.accept")}
      className="fixed bottom-6 left-6 z-[60] max-w-[360px] rounded-xl border border-border bg-background shadow-xl p-4 space-y-3"
      onKeyDown={e => { if (e.key === "Escape") e.stopPropagation(); }}
    >
      <p className="text-sm text-muted-foreground leading-snug">
        {t("cookie.banner.message")}{" "}
        <Link to={privacyPath} className="underline underline-offset-2 hover:text-foreground whitespace-nowrap">
          {t("cookie.banner.moreInfo")}
        </Link>
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={reject} data-ph-name="cookie-reject">
          {t("cookie.banner.reject")}
        </Button>
        <Button variant="accent" size="sm" className="flex-1" onClick={accept} data-ph-name="cookie-accept">
          {t("cookie.banner.accept")}
        </Button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
