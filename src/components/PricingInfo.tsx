import { useLanguage } from "@/contexts/LanguageContext";
import { Tag } from "lucide-react";

const PricingInfo = () => {
  const { t } = useLanguage();

  return (
    <section className="py-10 bg-section-dark">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-accent" />
            <span className="font-semibold text-section-dark-fg">{t("pricing.line")}</span>
          </div>
          <p className="text-sm text-section-dark-muted">{t("pricing.note")}</p>
        </div>
      </div>
    </section>
  );
};

export default PricingInfo;
