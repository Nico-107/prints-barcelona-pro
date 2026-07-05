import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { esTranslations } from "@/i18n/es";
import { enTranslations } from "@/i18n/en";
import { caTranslations } from "@/i18n/ca";
import { frTranslations } from "@/i18n/fr";
import { deTranslations } from "@/i18n/de";
import { nlTranslations } from "@/i18n/nl";
import { itTranslations } from "@/i18n/it";
import { ptTranslations } from "@/i18n/pt";

export type Language = "es" | "en" | "ca" | "fr" | "de" | "nl" | "it" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  es: esTranslations,
  en: enTranslations,
  ca: caTranslations,
  fr: frTranslations,
  de: deTranslations,
  nl: nlTranslations,
  it: itTranslations,
  pt: ptTranslations,
};

// Derive language from a URL path alone — deterministic, no browser APIs needed.
// Must stay in sync with the SSR detect function in entry-server.tsx.
function pathLanguage(path: string): Language {
  if (path.startsWith("/ca/") || path === "/ca") return "ca";
  if (path === "/3d-printing-delivery-paris") return "fr";
  if (path === "/3d-printing-delivery-berlin") return "de";
  if (path === "/3d-printing-delivery-amsterdam") return "nl";
  if (path === "/3d-printing-delivery-milan") return "it";
  if (path === "/3d-printing-delivery-rome") return "it";
  if (path === "/3d-printing-delivery-lisbon") return "pt";
  if (
    path.startsWith("/3d-printing-") ||
    path.startsWith("/blog") ||
    path === "/maker-guide" ||
    path === "/privacy"
  ) return "en";
  return "es";
}

export const LanguageProvider: React.FC<{ children: ReactNode; defaultLanguage?: Language }> = ({
  children,
  defaultLanguage,
}) => {
  // Initial language is determined solely from the URL so that the client's
  // first render matches the prerendered HTML exactly.
  // • On the server: window is undefined, so we use defaultLanguage passed by
  //   the SSR render function (which already ran pathLanguage on the route URL).
  // • On the client: we read window.location.pathname — same logic, same result.
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") return pathLanguage(window.location.pathname);
    return defaultLanguage ?? "es";
  });
  // True only after the user explicitly picks a language — keeps us from
  // persisting page-forced languages (en, fr) to localStorage.
  const manualOverride = useRef(false);

  // After hydration completes, apply the user's stored preference or browser
  // language. Runs client-only (useEffect never runs during SSR), so it cannot
  // cause a hydration mismatch — it simply triggers a post-hydration re-render.
  useEffect(() => {
    const pageLang = pathLanguage(window.location.pathname);
    if (pageLang === "en" || pageLang === "fr" || pageLang === "de" || pageLang === "nl" || pageLang === "it" || pageLang === "pt") return;
    if (manualOverride.current) return; // user already picked manually this session
    const stored = localStorage.getItem("preferred-language");
    if (stored === "es" || stored === "en" || stored === "ca" || stored === "fr") {
      setLanguageState(stored as Language);
      return;
    }
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ca")) setLanguageState("ca");
    else if (browserLang.startsWith("en")) setLanguageState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    const pl = pathLanguage(window.location.pathname);
    if (!manualOverride.current) return;
    if (pl === "en" || pl === "fr" || pl === "de" || pl === "nl" || pl === "it" || pl === "pt") return;
    localStorage.setItem("preferred-language", language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    manualOverride.current = true;
    setLanguageState(lang);
  }, []);
  const t = (key: string): string =>
    translations[language][key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
