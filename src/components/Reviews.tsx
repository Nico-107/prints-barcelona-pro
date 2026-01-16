import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Alex A.",
    text: "Gran calidad de impresión. Todo exactamente como lo pedí. Persona seria y de confianza. 100% recomendable.",
  },
  {
    name: "Anastasia A.",
    text: "La base para las figuras de Stranger Things es espectacular. Muy contenta con la compra. Excelente producto.",
  },
  {
    name: "Jose Antonio A.",
    text: "Trabajo perfecto y atención inmejorable.",
  },
  {
    name: "Oscar G.",
    text: "Todo genial.",
  },
  {
    name: "Rocio P.",
    text: "Atención rápida y exactamente como lo quería.",
  },
  {
    name: "Carmen D.",
    text: "Muy amable y rápido.",
  },
  {
    name: "Gabriel G.",
    text: "Rapidez y buena calidad de impresión.",
  },
  {
    name: "Marc M.",
    text: "Muy buen vendedor. Un 10.",
  },
  {
    name: "Jose Antonio Z.",
    text: "Cordial, atento y muy implicado en todo el proceso de diseño. Un 10 en todos los aspectos.",
  },
  {
    name: "Carlos",
    text: "Piezas realizadas 100% perfectas y bien acabadas.",
  },
  {
    name: "Marcos A.",
    text: "Genial, súper agradable y profesional.",
  },
  {
    name: "João P.",
    text: "Excelente trabajo, exactamente lo que se pidió. Muy recomendable.",
  },
  {
    name: "Enrique B.",
    text: "Trato muy cercano y excelente comunicación durante todo el proceso. 10/10.",
  },
  {
    name: "Toni C.",
    text: "Trato serio y profesional, con buena comunicación. Recomendado.",
  },
  {
    name: "CoolStuff C.",
    text: "Producto perfecto para lo que necesitaba. 10/10.",
  },
  {
    name: "Ernesto G.",
    text: "Muy profesional.",
  },
];

const Reviews = () => {
  return (
    <section id="resenas" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Reseñas de clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            La opinión de quienes ya han confiado en nosotros
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-5 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <Quote className="w-6 h-6 text-primary/30 mb-3" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">
                  {review.name}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Reseñas verificadas de clientes reales
        </p>
      </div>
    </section>
  );
};

export default Reviews;
