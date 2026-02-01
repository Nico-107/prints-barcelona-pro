import { Wrench, Cog, Box, Cpu, Sparkles, Puzzle } from "lucide-react";

const printables = [
  {
    icon: Wrench,
    title: "Prototipos funcionales",
    description: "Valida tus diseños antes de la producción final",
  },
  {
    icon: Cog,
    title: "Piezas de repuesto",
    description: "Repuestos exactos para electrodomésticos, máquinas o vehículos",
  },
  {
    icon: Box,
    title: "Soportes y adaptadores",
    description: "Brackets, montajes y soluciones a medida",
  },
  {
    icon: Cpu,
    title: "Piezas técnicas",
    description: "Componentes para RC, drones, automoción y mecánica",
  },
  {
    icon: Puzzle,
    title: "Proyectos personalizados",
    description: "Piezas únicas para hobby, decoración o uso personal",
  },
  {
    icon: Sparkles,
    title: "Diseños originales",
    description: "Si lo puedes imaginar, lo podemos imprimir",
  },
];

const WhatCanWePrint = () => {
  return (
    <section id="que-imprimimos" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Qué podemos imprimir?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En Reality 3D BCN imprimimos todo tipo de proyectos: desde prototipos hasta piezas finales
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
                <h3 className="font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          ¿No estás seguro si tu pieza es imprimible? <span className="text-primary font-medium">Consúltanos sin compromiso</span> — Reality 3D BCN te asesora
        </p>
      </div>
    </section>
  );
};

export default WhatCanWePrint;
