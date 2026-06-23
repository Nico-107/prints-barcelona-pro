import { useLanguage } from "@/contexts/LanguageContext";
import { Tag, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingInfo = () => {
  const { t } = useLanguage();

  const handleScrollToQuote = () => {
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-10 bg-section-dark">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-accent" />
            <span className="font-semibold text-section-dark-fg">{t("pricing.line")}</span>
          </div>
          <p className="text-sm text-section-dark-muted mb-6">{t("pricing.note")}</p>
          <Button variant="cta" size="lg" onClick={handleScrollToQuote}>
            <Upload className="w-4 h-4" />
            {t("cta.getQuote")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingInfo;
