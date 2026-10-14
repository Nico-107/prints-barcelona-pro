import type { Language } from "@/lib/pathLanguage";

const LOCALE_MAP: Record<Language, string> = {
  es: "es-ES",
  ca: "ca-ES",
  en: "en-IE",
  de: "de-DE",
  fr: "fr-FR",
  nl: "nl-NL",
  it: "it-IT",
  pt: "pt-PT",
};

export function formatEUR(value: number, language: Language): string {
  return new Intl.NumberFormat(LOCALE_MAP[language] ?? "es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
