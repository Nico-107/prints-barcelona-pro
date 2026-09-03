import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { CITY_PAGES } from "@/data/cityDeliveryPages";

interface Props {
  // Per-language slug map for the current landing page topic, resolved by
  // Header.tsx from PAGES_BY_SLUG + SLUGS_BY_TOPIC. Undefined when the current
  // page is not a landing page (homepage, static routes, etc.).
  landingTopicSlugs?: Partial<Record<string, string>>;
}

const LanguageSelector = ({ landingTopicSlugs }: Props) => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (lang: Language) => {
    setLanguage(lang);

    // City delivery pages: some have language-paired counterparts (Madrid:
    // /madrid ES ↔ /3d-printing-madrid EN) and must navigate to altSlug.
    // Other city pages (Paris, Berlin, …) are bilingual on the same URL —
    // just swap the language state without navigating.
    const currentCityPage = CITY_PAGES.find((p) => p.slug === location.pathname);
    if (currentCityPage) {
      if (currentCityPage.altSlug && currentCityPage.altSlug !== location.pathname) {
        navigate(currentCityPage.altSlug);
      }
      return;
    }

    // Landing pages: navigate to the equivalent slug in the new language.
    // The slug map is computed in Header.tsx via PAGES_BY_SLUG + SLUGS_BY_TOPIC
    // and passed as a prop so the lookup happens once per render, not per click.
    // If no equivalent exists for this language (e.g. no CA version of a
    // comparison page), fall back to just the setLanguage() call above — the
    // user stays on the current URL with updated UI chrome rather than being
    // sent to an unrelated page.
    if (landingTopicSlugs) {
      const target = landingTopicSlugs[lang];
      if (target && target !== location.pathname) {
        navigate(target);
      }
    }
  };

  // FR pages: FR | EN. NL pages (Amsterdam bilingual): NL | EN. Elsewhere: ES | EN | CA.
  const langs: { code: Language; label: string; aria: string }[] =
    language === "fr"
      ? [
          { code: "fr", label: "FR", aria: "Français" },
          { code: "en", label: "EN", aria: "English" },
        ]
      : language === "nl"
      ? [
          { code: "nl", label: "NL", aria: "Nederlands" },
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
