import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { PAGES_BY_SLUG, SLUGS_BY_TOPIC } from "@/seo/registry";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (lang: Language) => {
    setLanguage(lang);

    // If we're currently on a landing page, navigate to the equivalent
    // page in the target language so the user keeps their context.
    const currentPage = PAGES_BY_SLUG[location.pathname];
    if (currentPage) {
      const target = SLUGS_BY_TOPIC[currentPage.topic]?.[lang];
      if (target && target !== location.pathname) {
        navigate(target);
      }
    }
  };

  const langs: { code: Language; label: string; aria: string }[] = [
    { code: "es", label: "ES", aria: "Español" },
    { code: "en", label: "EN", aria: "English" },
    { code: "ca", label: "CA", aria: "Català" },
  ];

  return (
    <div className="flex items-center gap-1 text-sm">
      {langs.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/50">|</span>}
          <button
            onClick={() => handleChange(l.code)}
            className={`px-2 py-1 rounded transition-colors ${
              language === l.code
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={l.aria}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LanguageSelector;
