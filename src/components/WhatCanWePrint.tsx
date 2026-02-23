import { Wrench, Cog, Box, Cpu, Sparkles, Puzzle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhatCanWePrint = () => {
  const { t } = useLanguage();

  const printables = [
    { icon: Wrench, titleKey: "services.proto.title", descKey: "services.proto.desc" },
    { icon: Cog, titleKey: "services.parts.title", descKey: "services.parts.desc" },
    { icon: Box, titleKey: "services.brackets.title", descKey: "services.brackets.desc" },
    { icon: Cpu, titleKey: "services.technical.title", descKey: "services.technical.desc" },
    { icon: Puzzle, titleKey: "services.custom.title", descKey: "services.custom.desc" },
    { icon: Sparkles, titleKey: "services.original.title", descKey: "services.original.desc" },
  ];

  return (
    <section id="servicios" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("services.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {printables.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{t(item.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          {t("services.cta")}
        </p>
      </div>
    </section>
  );
};

export default WhatCanWePrint;
