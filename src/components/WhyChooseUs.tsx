import { UserCheck, Wrench, MessageCircle, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhyChooseUs = () => {
  const { t } = useLanguage();

  const reasons = [
    { icon: UserCheck, titleKey: "why.personal.title", descKey: "why.personal.desc" },
    { icon: Wrench, titleKey: "why.custom.title", descKey: "why.custom.desc" },
    { icon: MessageCircle, titleKey: "why.direct.title", descKey: "why.direct.desc" },
    { icon: Award, titleKey: "why.proven.title", descKey: "why.proven.desc" },
  ];

  return (
    <section id="por-que-elegirnos" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("why.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("why.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <reason.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t(reason.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(reason.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
