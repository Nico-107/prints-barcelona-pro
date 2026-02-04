import { Leaf, Shield, Zap, Cog } from "lucide-react";

const materials = [
  {
    icon: Leaf,
    name: "PLA",
    description: "Económico y versátil",
    details: "Ideal para prototipos, maquetas y piezas decorativas con buen acabado.",
  },
  {
    icon: Shield,
    name: "PETG",
    description: "Resistente y durable",
    details: "Para piezas funcionales que requieren flexibilidad y resistencia a impactos.",
  },
  {
    icon: Zap,
    name: "ABS / ASA",
    description: "Técnico y térmico",
    details: "Soporta calor, esfuerzos mecánicos y exposición a exteriores.",
  },
  {
    icon: Cog,
    name: "Nylon / PA-CF",
    description: "Industrial y mecánico",
    details: "Máxima resistencia para piezas técnicas de alto rendimiento.",
  },
];

const Materials = () => {
  return (
    <section id="materiales" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Materiales FDM disponibles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seleccionamos el material óptimo según la aplicación de tu pieza
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
              Te asesoramos según el uso de tu pieza. Consulta sin compromiso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Materials;
