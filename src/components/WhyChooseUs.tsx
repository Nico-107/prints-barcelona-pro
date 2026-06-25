import { MapPin, Zap, UserCheck, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReveal } from "@/hooks/useReveal";

const WhyChooseUs = () => {
  const { t } = useLanguage();
  const sectionRef = useReveal<HTMLElement>();

  const reasons = [
    { icon: MapPin, titleKey: "why.local.title", descKey: "why.local.desc" },
    { icon: Zap, titleKey: "why.fast.title", descKey: "why.fast.desc" },
    { icon: UserCheck, titleKey: "why.personal.title", descKey: "why.personal.desc" },
    { icon: Award, titleKey: "why.quality.title", descKey: "why.quality.desc" },
  ];

  return (
    <section ref={sectionRef} id="por-que-elegirnos" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("why.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("why.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover border border-border hover:border-accent/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <reason.icon className="w-6 h-6 text-accent" />
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
