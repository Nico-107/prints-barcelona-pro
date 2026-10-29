import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { CITY_PAGES } from "@/data/cityDeliveryPages";

export const LANG_HUB: Record<Language, string> = {
  es: "/",
  ca: "/ca",
  en: "/3d-printing-service",
  de: "/de/3d-druck-service",
  fr: "/fr/impression-3d-en-ligne",
  nl: "/nl/3d-printen-laten-maken",
  it: "/it/stampa-3d-online",
  pt: "/pt/impressao-3d-online",
};

const LANG_LABELS: Record<Language, string> = {
  es: "Español",
  ca: "Català",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  nl: "Nederlands",
  it: "Italiano",
  pt: "Português",
};

const ALL_LANGUAGES: Language[] = ["es", "ca", "en", "de", "fr", "nl", "it", "pt"];

interface Props {
  landingTopicSlugs?: Partial<Record<string, string>>;
  // Intl page hreflang pairs: lang → slug for the current page
  hreflangMap?: Partial<Record<string, string>>;
}

const LanguageSelector = ({ landingTopicSlugs, hreflangMap }: Props) => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleChange = (lang: Language) => {
    setOpen(false);
    // Mark the language being LEFT so the suggestion bar never re-suggests it (STEP 4.3)
    try {
      const LS_KEY = "dim3d-lang-suggest-dismissed";
      const existing = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
      existing[language] = true;
      localStorage.setItem(LS_KEY, JSON.stringify(existing));
    } catch { /* localStorage unavailable */ }
    setLanguage(lang);

    // City delivery pages
    const currentCityPage = CITY_PAGES.find((p) => p.slug === location.pathname);
    if (currentCityPage) {
      if (currentCityPage.altSlug && currentCityPage.altSlug !== location.pathname) {
        navigate(currentCityPage.altSlug);
      }
      return;
    }

    // Hreflang map from intl pages
    if (hreflangMap) {
      const target = hreflangMap[lang];
      if (target && target !== location.pathname) {
        navigate(target);
        return;
      }
      // Fall through to hub
      const hub = LANG_HUB[lang];
      if (hub !== location.pathname) navigate(hub);
      return;
    }

    // Landing pages
    if (landingTopicSlugs) {
      const target = landingTopicSlugs[lang];
      if (target && target !== location.pathname) {
        navigate(target);
        return;
      }
      const hub = LANG_HUB[lang];
      if (hub !== location.pathname) navigate(hub);
      return;
    }

    // Default: go to hub
    const hub = LANG_HUB[lang];
    if (hub !== location.pathname) navigate(hub);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors min-h-[44px] min-w-[44px]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Language: ${LANG_LABELS[language]}`}
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="uppercase text-xs font-semibold">{language}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
        >
          {ALL_LANGUAGES.map((lang) => {
            const isActive = language === lang;
            return (
              <button
                key={lang}
                role="menuitem"
                aria-current={isActive ? "true" : undefined}
                onClick={() => handleChange(lang)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left min-h-[44px] transition-colors ${
                  isActive
                    ? "text-foreground font-medium bg-muted/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span>{LANG_LABELS[lang]}</span>
                {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
