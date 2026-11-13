import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";
import { LANG_HUB } from "@/components/LanguageSelector";

interface Props {
  // Optional equiv page in detected language (if known by the current page)
  equivSlug?: string;
}

const BROWSER_LANGS: Language[] = ["es", "ca", "en", "de", "fr", "nl", "it", "pt"];

const LS_KEY = "dim3d-lang-suggest-dismissed";

function getBrowserLang(): Language | null {
  if (typeof navigator === "undefined") return null;
  const raw = navigator.language?.toLowerCase() ?? "";
  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("ca")) return "ca";
  if (raw.startsWith("en")) return "en";
  if (raw.startsWith("de")) return "de";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("nl")) return "nl";
  if (raw.startsWith("it")) return "it";
  if (raw.startsWith("pt")) return "pt";
  return null;
}

const LanguageSuggestionBar = ({ equivSlug }: Props) => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [targetLang, setTargetLang] = useState<Language | null>(null);
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Only render after hydration to avoid SSR mismatch
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Suppress the suggest banner while the estimator / checkout modal is open (R12: no distractions in checkout)
  useEffect(() => {
    if (!hydrated) return;
    const sync = () => setModalOpen(document.body.hasAttribute("data-estimator-open"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-estimator-open"] });
    return () => observer.disconnect();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    // Don't initialise (and don't fire lang_suggest_shown) while the order modal is open
    if (document.body.hasAttribute("data-estimator-open")) return;

    const detected = getBrowserLang();
    if (!detected) return;
    if (detected === language) return;
    if (!BROWSER_LANGS.includes(detected)) return;

    // Check if equiv page exists in that language
    const slug = equivSlug ?? LANG_HUB[detected];
    if (!slug) return;

    // Check dismissal
    try {
      const dismissed = localStorage.getItem(LS_KEY);
      if (dismissed) {
        const parsed = JSON.parse(dismissed);
        if (parsed[detected]) return;
      }
    } catch {}

    setTargetLang(detected);
    setTargetSlug(slug);
    setShow(true);

    capture("lang_suggest_shown", { from: language, to: detected });
  }, [hydrated, language, equivSlug, modalOpen]);

  const handleSwitch = () => {
    if (!targetLang || !targetSlug) return;
    capture("lang_suggest_accepted", { from: language, to: targetLang });
    setLanguage(targetLang);
    navigate(targetSlug);
    setShow(false);
  };

  const handleDismiss = () => {
    if (!targetLang) return;
    capture("lang_suggest_dismissed", { from: language, to: targetLang });
    try {
      const existing = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
      existing[targetLang] = true;
      localStorage.setItem(LS_KEY, JSON.stringify(existing));
    } catch {}
    setShow(false);
  };

  if (!show || !hydrated || modalOpen) return null;

  // Phase 9.contrast: on variant B the header is transparent over a dark
  // hero. A light-bg banner in the same strip breaks header-text contrast.
  // Render the banner with a dark colour scheme on variant B so white
  // header text stays ≥ 4.5:1.
  return (
    <div className="w-full bg-muted/80 border-b border-border/50 text-sm [body[data-site-variant=B]_&]:bg-[#0B1020] [body[data-site-variant=B]_&]:border-white/10 [body[data-site-variant=B]_&]:text-white">
      <div className="container px-4 py-2 flex items-center justify-between gap-3">
        <span className="text-foreground/80 flex-1 [body[data-site-variant=B]_&]:text-white/90">{t("lang.suggest.text")}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSwitch}
            className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t("lang.suggest.switch")}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors [body[data-site-variant=B]_&]:text-white/80 [body[data-site-variant=B]_&]:hover:text-white"
            aria-label={t("lang.suggest.dismiss")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSuggestionBar;
