import { Zap, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ExpressPrinting = () => {
  const { t } = useLanguage();

  return (
    <section id="express" className="py-16 md:py-20 bg-accent/5">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 md:p-10 card-shadow border border-accent/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t("express.title")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{t("express.desc")}</p>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>{t("express.time")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>{t("express.quality")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Zap className="w-4 h-4 text-accent" />
                    <span>{t("express.fee")}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t("express.note")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpressPrinting;
