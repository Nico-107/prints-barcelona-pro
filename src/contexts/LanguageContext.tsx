import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { esTranslations } from "@/i18n/es";
import { enTranslations } from "@/i18n/en";
import { caTranslations } from "@/i18n/ca";
import { frTranslations } from "@/i18n/fr";
import { deTranslations } from "@/i18n/de";
import { nlTranslations } from "@/i18n/nl";
import { itTranslations } from "@/i18n/it";
import { ptTranslations } from "@/i18n/pt";
import { pathLanguage as _pathLanguage } from "@/lib/pathLanguage";

export type Language = "es" | "en" | "ca" | "fr" | "de" | "nl" | "it" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  _syncFromPath: (pathname: string) => void;
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

// Re-export the shared pathLanguage so other files can import from here.
const pathLanguage = _pathLanguage;

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

  // After hydration, apply the user's explicitly stored language preference.
  // The URL always decides the language on first load; only an explicit switcher
  // click can change it. Browser navigator.language is intentionally NOT used
  // (it caused Spanish content with English chrome on /de/ and Spanish pages).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const pageLang = pathLanguage(window.location.pathname);
        // Forced-language pages (all non-es paths) are never overridden.
        if (pageLang !== "es") return;
        // /lemon forces ES for the walk-in NFC audience.
        if (window.location.pathname === "/lemon") return;
        if (manualOverride.current) return;
        // Apply only an explicit prior preference — no browser-language fallback.
        const stored = localStorage.getItem("preferred-language");
        if (stored === "en" || stored === "ca") {
          setLanguageState(stored as Language);
        }
      });
    });
    return () => cancelAnimationFrame(id);
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

  // Used by LanguageNavigationSync on client-side navigation. The URL always
  // determines the language; an explicit preference overrides only for es pages.
  const syncFromPath = useCallback((pathname: string) => {
    const pageLang = pathLanguage(pathname);
    if (pageLang !== "es") {
      // All non-Spanish paths are URL-forced: no override allowed.
      setLanguageState(pageLang);
      manualOverride.current = false;
      return;
    }
    // /lemon forces ES.
    if (pathname === "/lemon") {
      setLanguageState("es");
      manualOverride.current = false;
      return;
    }
    if (manualOverride.current) return;
    // Apply stored explicit preference only (no browser language fallback).
    const stored = localStorage.getItem("preferred-language");
    if (stored === "en" || stored === "ca") {
      setLanguageState(stored as Language);
      return;
    }
    setLanguageState("es");
  }, []);

  const t = (key: string): string =>
    translations[language][key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, _syncFromPath: syncFromPath }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};

// Null-renderer — place once inside BrowserRouter (alongside PostHogPageView).
// Re-syncs the language context whenever the client navigates to a new route,
// which the mount-only effect in LanguageProvider cannot handle.
export const LanguageNavigationSync: React.FC = () => {
  const location = useLocation();
  const { _syncFromPath } = useLanguage();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    _syncFromPath(location.pathname);
  }, [location.pathname, _syncFromPath]);

  return null;
};
