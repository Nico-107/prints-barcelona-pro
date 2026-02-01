import { Upload, MessageSquare, Printer, MapPin } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Sube tu archivo",
    description: "Envíanos tu archivo 3D (STL, OBJ, 3MF...) o escríbenos por WhatsApp si tienes dudas.",
  },
  {
    icon: MessageSquare,
    title: "Presupuesto en <1h",
    description: "Revisamos tu diseño manualmente y te enviamos el precio final. Sin sorpresas.",
  },
  {
    icon: Printer,
    title: "Imprimimos tu pieza",
    description: "Producción local con materiales de calidad y atención al detalle.",
  },
  {
    icon: MapPin,
    title: "Recogida en Barcelona",
    description: "Coordina una cita para recoger tu pieza. Rápido y sin complicaciones.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Cómo funciona Reality 3D BCN?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nuestro servicio de impresión 3D en Barcelona es simple: sube tu archivo, recibe presupuesto en menos de 1 hora y recoge tu pieza
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative bg-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1 border border-border/50">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
