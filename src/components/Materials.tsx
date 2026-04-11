import { Leaf, Shield, Zap, Cog } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Materials = () => {
  const { t } = useLanguage();

  const materials = [
    { icon: Leaf, name: "PLA", descKey: "materials.pla.desc", detailKey: "materials.pla.detail", color: "bg-green-500/10 text-green-600" },
    { icon: Shield, name: "PETG", descKey: "materials.petg.desc", detailKey: "materials.petg.detail", color: "bg-accent/10 text-accent" },
    { icon: Zap, name: "ABS / ASA", descKey: "materials.abs.desc", detailKey: "materials.abs.detail", color: "bg-orange-500/10 text-orange-600" },
    { icon: Cog, name: "Nylon / PA-CF", descKey: "materials.nylon.desc", detailKey: "materials.nylon.detail", color: "bg-purple-500/10 text-purple-600" },
  ];

  return (
    <section id="materiales" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("materials.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("materials.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {materials.map((material, index) => (
            <div key={index} className="bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover border border-border/50 hover:border-accent/20 transition-all duration-300 text-center">
              <div className={`w-14 h-14 rounded-xl ${material.color} flex items-center justify-center mx-auto mb-4`}>
                <material.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{material.name}</h3>
              <p className="text-sm font-medium text-accent mb-3">{t(material.descKey)}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(material.detailKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-2xl mx-auto">
          <div className="bg-card rounded-xl p-6 border border-border/50 text-center card-shadow">
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
