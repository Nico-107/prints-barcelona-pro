import { UserCheck, Wrench, MessageCircle, Award } from "lucide-react";

const reasons = [
  {
    icon: UserCheck,
    title: "Atención personalizada",
    description: "Cada proyecto recibe atención individual. Trato directo y cercano.",
  },
  {
    icon: Wrench,
    title: "Proyectos a medida",
    description: "Piezas técnicas, mecánicas, hobby, automoción y proyectos únicos.",
  },
  {
    icon: MessageCircle,
    title: "Comunicación directa",
    description: "Contacto por WhatsApp. Sin intermediarios ni complicaciones.",
  },
  {
    icon: Award,
    title: "Experiencia probada",
    description: "Clientes satisfechos en Barcelona y toda España.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="por-que-elegirnos" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por qué elegir Reality 3D Barcelona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Servicio de impresión 3D profesional con producción local y envíos a toda España
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300"
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
