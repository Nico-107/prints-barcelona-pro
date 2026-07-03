import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { PAGES_BY_SLUG, SLUGS_BY_TOPIC } from "@/seo/registry";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (lang: Language) => {
    setLanguage(lang);

    // City delivery pages are bilingual — the same URL serves all languages,
    // so we only swap the language state without navigating.
    const isCityPage =
      location.pathname.startsWith("/3d-printing-delivery-") ||
      location.pathname.startsWith("/impresion-3d-con-entrega-");
    if (isCityPage) return;

    // For SEO landing pages navigate to the equivalent slug in the new language.
    const currentPage = PAGES_BY_SLUG[location.pathname];
    if (currentPage) {
      const target = SLUGS_BY_TOPIC[currentPage.topic]?.[lang];
      if (target && target !== location.pathname) {
        navigate(target);
      }
    }
  };

  // On French pages show FR | EN only; elsewhere keep the ES | EN | CA selector.
  const langs: { code: Language; label: string; aria: string }[] =
    language === "fr"
      ? [
          { code: "fr", label: "FR", aria: "Français" },
          { code: "en", label: "EN", aria: "English" },
        ]
      : [
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
