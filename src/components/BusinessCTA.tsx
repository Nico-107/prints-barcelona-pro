import { Link } from "react-router-dom";
import { Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { SLUGS_BY_TOPIC } from "@/seo/registry";

const BusinessCTA = () => {
  const { t, language } = useLanguage();
  const slug = SLUGS_BY_TOPIC["business"][language] ?? "/3d-printing-for-business-barcelona";

  return (
    <section className="py-12 bg-muted/30 border-y border-border/40">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-widest mb-1">
                {t("b2bhome.badge")}
              </div>
              <h2 className="text-lg font-semibold text-foreground leading-snug">
                {t("b2bhome.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                {t("b2bhome.subtitle")}
              </p>
            </div>
          </div>
          <Button asChild variant="accent" size="default" className="shrink-0 gap-1.5">
            <Link to={slug}>
              {t("b2bhome.cta")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BusinessCTA;
