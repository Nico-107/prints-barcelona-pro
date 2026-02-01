import { Leaf, Shield, Zap } from "lucide-react";

const materials = [
  {
    icon: Leaf,
    name: "PLA",
    description: "Rápido y económico",
    details: "Ideal para prototipos, maquetas y piezas decorativas. Acabado limpio y buena definición.",
  },
  {
    icon: Shield,
    name: "PETG",
    description: "Resistente y flexible",
    details: "Perfecto para piezas funcionales que requieren durabilidad y resistencia a impactos.",
  },
  {
    icon: Zap,
    name: "ABS / ASA",
    description: "Técnico y resistente",
    details: "Para piezas que soportan calor, esfuerzos mecánicos o exposición exterior.",
  },
];

const Materials = () => {
  return (
    <section id="materiales" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Materiales y acabados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En Reality 3D BCN elegimos el material adecuado según el uso de tu pieza
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
              <h3 className="text-lg font-bold text-foreground mb-1">
                {material.name}
              </h3>
              <p className="text-sm font-medium text-primary mb-3">
                {material.description}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {material.details}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">¿No sabes qué material elegir?</span>
              <br />
              El equipo de Reality 3D BCN te asesora según el uso que le darás a tu pieza. Sin compromiso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Materials;
