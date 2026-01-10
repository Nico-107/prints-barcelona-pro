import { MapPin, Clock, Laptop, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Laptop,
    title: "Pedidos 100% online",
    description: "Todo el proceso se gestiona de forma digital. Sin desplazamientos innecesarios.",
  },
  {
    icon: MapPin,
    title: "Producción local",
    description: "Fabricamos en Barcelona. Apoyamos la producción local y reducimos tiempos de entrega.",
  },
  {
    icon: Clock,
    title: "Recogida con cita",
    description: "Coordina día y hora para recoger tu pedido. Flexibilidad total para ti.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad garantizada",
    description: "Utilizamos materiales premium y revisamos cada pieza antes de la entrega.",
  },
];

const ServiceInfo = () => {
  return (
    <section id="servicio" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Impresión 3D profesional{" "}
              <span className="text-gradient">bajo pedido</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Somos un servicio de impresión 3D en Barcelona especializado en piezas personalizadas. 
              No tenemos tienda física: trabajamos exclusivamente bajo pedido para ofrecerte 
              la mejor atención y los mejores precios.
            </p>

            <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Recogida en Barcelona
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Una vez tu pieza esté lista, coordinaremos una cita para que puedas 
                recogerla en Barcelona. Sin colas, sin esperas. Confirmamos disponibilidad 
                por WhatsApp y quedamos cuando mejor te venga.
              </p>
            </div>
          </div>

          {/* Right - Features grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-5 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceInfo;
