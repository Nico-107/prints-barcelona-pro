import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useLanguage } from "@/contexts/LanguageContext";

const SITE_URL = "https://www.dimension3dprints.com";

const ReturnPolicy = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t("returns.meta.title")}</title>
        <meta name="description" content={t("returns.meta.description")} />
        <link rel="canonical" href={`${SITE_URL}/politica-devoluciones`} />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="container px-4 max-w-2xl mx-auto">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground block mb-8">
            {t("returns.back")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-6">{t("returns.title")}</h1>
          <p className="text-muted-foreground leading-relaxed">{t("returns.body")}</p>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default ReturnPolicy;
