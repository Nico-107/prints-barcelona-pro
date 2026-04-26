import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { esTranslations } from "@/i18n/es";
import { enTranslations } from "@/i18n/en";
import { caTranslations } from "@/i18n/ca";

export type Language = "es" | "en" | "ca";

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
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      // 1. URL prefix wins (so /ca/... loads in Catalan even on first visit)
      const path = window.location.pathname;
      if (path.startsWith("/ca/") || path === "/ca") return "ca";

      // 2. Stored preference
      const stored = localStorage.getItem("preferred-language");
      if (stored === "es" || stored === "en" || stored === "ca") return stored;

      // 3. Browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("ca")) return "ca";
      if (browserLang.startsWith("en")) return "en";
    }
    return "es";
  });

  useEffect(() => {
    localStorage.setItem("preferred-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
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
