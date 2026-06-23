import { Wrench, Cog, Box, Cpu, Sparkles, Puzzle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WhatCanWePrint = () => {
  const { t } = useLanguage();

  const printables = [
    { icon: Wrench, titleKey: "services.proto.title", descKey: "services.proto.desc", targetKey: "services.proto.target" },
    { icon: Cog, titleKey: "services.parts.title", descKey: "services.parts.desc", targetKey: "services.parts.target" },
    { icon: Box, titleKey: "services.brackets.title", descKey: "services.brackets.desc", targetKey: "services.brackets.target" },
    { icon: Cpu, titleKey: "services.technical.title", descKey: "services.technical.desc", targetKey: "services.technical.target" },
    { icon: Puzzle, titleKey: "services.custom.title", descKey: "services.custom.desc", targetKey: "services.custom.target" },
    { icon: Sparkles, titleKey: "services.original.title", descKey: "services.original.desc", targetKey: "services.original.target" },
  ];

  return (
    <section id="servicios" className="py-20 md:py-28 bg-section-dark section-dark-texture">
      <div className="container relative z-10 px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-section-dark-fg mb-4">
            {t("services.title")}
          </h2>
          <p className="text-lg text-section-dark-muted max-w-2xl mx-auto">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {printables.map((item, index) => (
            <div
              key={index}
              className="bg-section-dark-surface rounded-xl p-6 border border-section-dark-border hover:border-accent/50 transition-all duration-300 hover:card-shadow-hover"
            >
              <div className="w-11 h-11 rounded-lg bg-accent/15 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-section-dark-fg mb-1.5">{t(item.titleKey)}</h3>
              <p className="text-sm text-section-dark-muted leading-relaxed mb-3">{t(item.descKey)}</p>
              <p className="text-xs text-accent font-medium">{t(item.targetKey)}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-section-dark-muted mt-10">
          {t("services.cta")}
        </p>
      </div>
    </section>
  );
};

export default WhatCanWePrint;
