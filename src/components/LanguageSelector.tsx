import { useLanguage, Language } from "@/contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const handleChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => handleChange("es")}
        className={`px-2 py-1 rounded transition-colors ${
          language === "es"
            ? "bg-primary text-primary-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Español"
      >
        ES
      </button>
      <span className="text-muted-foreground/50">|</span>
      <button
        onClick={() => handleChange("en")}
        className={`px-2 py-1 rounded transition-colors ${
          language === "en"
            ? "bg-primary text-primary-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
