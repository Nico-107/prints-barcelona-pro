import { Zap, Clock, CheckCircle, AlertCircle } from "lucide-react";

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
                  Impresión express: entrega en 24–48h
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  ¿Proyecto urgente? Impresión prioritaria con la misma calidad. 
                  Sujeto a complejidad y disponibilidad.
                </p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Entrega en 24–48h</span>
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
                
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Indica "urgente" al solicitar presupuesto para priorizar tu pedido
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpressPrinting;
