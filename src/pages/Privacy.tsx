import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const CONSENT_KEY = "cookie-consent";

const Privacy = () => {
  const { t } = useLanguage();
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") setConsent(stored);
  }, []);

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
    // Reload so main.tsx re-initialises PostHog in memory mode and banner reappears.
    window.location.reload();
  };

  const currentLabel = !hydrated || consent === null
    ? t("privacy.consent.none")
    : consent === "accepted"
    ? t("privacy.consent.accepted")
    : t("privacy.consent.rejected");

  return (
    <>
      <Helmet>
        <title>{t("privacy.meta.title")}</title>
        <meta name="description" content={t("privacy.meta.description")} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-secondary/20">
        <header className="border-b border-border bg-background">
          <div className="container px-4 h-14 flex items-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              {t("privacy.back")}
            </Link>
          </div>
        </header>

        <main className="container px-4 py-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-1">{t("privacy.title")}</h1>
          <p className="text-xs text-muted-foreground mb-8">{t("privacy.updated")}</p>

          <p className="text-muted-foreground mb-8">{t("privacy.intro")}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-2">{t("privacy.analytics.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("privacy.analytics.body")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t("privacy.cookies.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("privacy.cookies.body")}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">{t("privacy.contact.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("privacy.contact.body")}</p>
            </section>

            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-semibold">{t("privacy.consent.current")}</h2>
              <p className="text-sm text-muted-foreground">{currentLabel}</p>
              <Button variant="outline" size="sm" onClick={resetConsent}>
                {t("privacy.consent.change")}
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default Privacy;
