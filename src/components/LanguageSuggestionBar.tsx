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

  // Only render after hydration to avoid SSR mismatch
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

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
  }, [hydrated, language, equivSlug]);

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

  if (!show || !hydrated) return null;

  return (
    <div className="w-full bg-muted/80 border-b border-border/50 text-sm">
      <div className="container px-4 py-2 flex items-center justify-between gap-3">
        <span className="text-foreground/80 flex-1">{t("lang.suggest.text")}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSwitch}
            className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t("lang.suggest.switch")}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
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
