import { MapPin, Clock, Laptop, ShieldCheck, Truck } from "lucide-react";

const features = [
  {
    icon: Laptop,
    title: "Pedidos 100% online",
    description: "Gestión digital completa. Sube tu archivo y recibe presupuesto.",
  },
  {
    icon: MapPin,
    title: "Producción en Barcelona",
    description: "Fabricación local con tiempos de entrega reducidos.",
  },
  {
    icon: Clock,
    title: "Recogida con cita previa",
    description: "Coordina día y hora para recoger tu pedido en Barcelona.",
  },
  {
    icon: Truck,
    title: "Envíos a toda España",
    description: "Entrega a domicilio en cualquier punto de la península.",
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
              Servicio de impresión 3D{" "}
              <span className="text-gradient">en Barcelona</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Reality 3D Barcelona es un servicio profesional de impresión 3D bajo pedido. 
              Producción local en Barcelona con envíos a toda España.
            </p>

            <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50 mb-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Recogida local en Barcelona
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Coordina una cita para recoger tu pedido. Sin colas ni esperas.
              </p>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Envíos a toda España
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enviamos a cualquier punto de la península con seguimiento incluido.
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
