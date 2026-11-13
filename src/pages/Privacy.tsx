import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import SocialMeta from "@/components/SocialMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

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
    try { localStorage.removeItem(CONSENT_KEY); localStorage.removeItem("cookie-consent-date"); } catch {}
    document.dispatchEvent(new Event("cookie-prefs-open"));
    setConsent(null);
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
      <SocialMeta title={t("privacy.meta.title")} description={t("privacy.meta.description")} path="/privacy" />

      <div className="min-h-screen bg-secondary/20">
        <Header />
        <main id="main-content" className="container px-4 py-10 max-w-2xl pt-[calc(var(--header-h)+40px)]">
          <section data-testid="page-hero" data-page-hero>
            <h1 className="text-3xl font-bold mb-1">{t("privacy.title")}</h1>
            <p className="text-xs text-muted-foreground mb-8">{t("privacy.updated")}</p>
          </section>

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
        <Footer />
        <WhatsAppFloat />
      </div>
    </>
  );
};

export default Privacy;
