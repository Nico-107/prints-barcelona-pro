import { Leaf, Shield, Zap, Cog } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Materials = () => {
  const { t } = useLanguage();

  const materials = [
    { icon: Leaf, name: "PLA", descKey: "materials.pla.desc", detailKey: "materials.pla.detail" },
    { icon: Shield, name: "PETG", descKey: "materials.petg.desc", detailKey: "materials.petg.detail" },
    { icon: Zap, name: "ABS / ASA", descKey: "materials.abs.desc", detailKey: "materials.abs.detail" },
    { icon: Cog, name: "Nylon / PA-CF", descKey: "materials.nylon.desc", detailKey: "materials.nylon.detail" },
  ];

  return (
    <section id="materiales" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("materials.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("materials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {materials.map((material, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300 text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <material.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{material.name}</h3>
              <p className="text-sm font-medium text-primary mb-3">{t(material.descKey)}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(material.detailKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{t("materials.help")}</span>
              <br />
              {t("materials.helpDesc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Materials;
