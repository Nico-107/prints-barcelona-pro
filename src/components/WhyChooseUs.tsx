import { UserCheck, Wrench, MessageCircle, Award, Heart } from "lucide-react";

const reasons = [
  {
    icon: UserCheck,
    title: "Atención personalizada",
    description: "Cada proyecto recibe atención individual. No somos una fábrica, somos tu partner de impresión 3D.",
  },
  {
    icon: Wrench,
    title: "Proyectos a medida",
    description: "Desde piezas técnicas y mecánicas hasta hobby, automoción y proyectos personalizados únicos.",
  },
  {
    icon: MessageCircle,
    title: "Comunicación directa",
    description: "Contacto directo por WhatsApp. Sin intermediarios, sin esperas, sin complicaciones.",
  },
  {
    icon: Award,
    title: "Experiencia demostrada",
    description: "Años de experiencia en impresión 3D con decenas de clientes satisfechos en Barcelona.",
  },
  {
    icon: Heart,
    title: "Confianza real",
    description: "Reseñas verificadas de clientes reales que avalan nuestro trabajo y profesionalidad.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="por-que-elegirnos" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Por qué elegirnos?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lo que nos diferencia de otros servicios de impresión 3D en Barcelona
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className={`bg-card rounded-xl p-6 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300 ${
                index === reasons.length - 1 && reasons.length % 3 === 2
                  ? "md:col-span-2 lg:col-span-1"
                  : ""
              } ${
                index >= reasons.length - 2 && reasons.length === 5
                  ? "lg:last:col-start-2"
                  : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <reason.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
