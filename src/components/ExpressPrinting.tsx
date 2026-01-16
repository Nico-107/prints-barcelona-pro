import { Zap, Clock, CheckCircle } from "lucide-react";

const ExpressPrinting = () => {
  return (
    <section id="express" className="py-16 md:py-20 bg-primary/5">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 md:p-10 card-shadow border border-primary/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  ¿Necesitas tu pieza con urgencia?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Ofrecemos impresión 3D express con entrega prioritaria por un pequeño 
                  suplemento, manteniendo la misma calidad que en nuestros trabajos estándar.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Entrega prioritaria</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Misma calidad garantizada</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Pequeño suplemento</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpressPrinting;
