import { useState, useEffect, useRef } from "react";
import { Star, Quote, BadgeCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const reviews = [
  {
    name: "Alex A.",
    text: "Gran calidad de impresión. Todo exactamente como lo pedí. Persona seria y de confianza. 100% recomendable.",
    rating: 5,
  },
  {
    name: "Anastasia A.",
    text: "La base para las figuras de Stranger Things es espectacular. Muy contenta con la compra. Excelente producto.",
    rating: 5,
  },
  {
    name: "Jose Antonio A.",
    text: "Trabajo perfecto y atención inmejorable.",
    rating: 5,
  },
  {
    name: "Oscar G.",
    text: "Todo genial.",
    rating: 5,
  },
  {
    name: "Rocio P.",
    text: "Atención rápida y exactamente como lo quería.",
    rating: 5,
  },
  {
    name: "Carmen D.",
    text: "Muy amable y rápido.",
    rating: 5,
  },
  {
    name: "Gabriel G.",
    text: "Rapidez y buena calidad de impresión.",
    rating: 5,
  },
  {
    name: "Marc M.",
    text: "Muy buen vendedor. Un 10.",
    rating: 5,
  },
  {
    name: "Jose Antonio Z.",
    text: "Cordial, atento y muy implicado en todo el proceso de diseño. Un 10 en todos los aspectos.",
    rating: 5,
  },
  {
    name: "Carlos",
    text: "Piezas realizadas 100% perfectas y bien acabadas.",
    rating: 5,
  },
  {
    name: "Marcos A.",
    text: "Genial, súper agradable y profesional.",
    rating: 5,
  },
  {
    name: "João P.",
    text: "Excelente trabajo, exactamente lo que se pidió. Muy recomendable.",
    rating: 5,
  },
  {
    name: "Enrique B.",
    text: "Trato muy cercano y excelente comunicación durante todo el proceso. 10/10.",
    rating: 5,
  },
  {
    name: "Toni C.",
    text: "Trato serio y profesional, con buena comunicación. Recomendado.",
    rating: 5,
  },
  {
    name: "CoolStuff C.",
    text: "Producto perfecto para lo que necesitaba. 10/10.",
    rating: 5,
  },
  {
    name: "Ernesto G.",
    text: "Muy profesional.",
    rating: 5,
  },
];

const Reviews = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    reviewText: "",
    orderReference: "",
  });
   // Honeypot field - hidden from users, bots will fill it
   const [honeypot, setHoneypot] = useState("");
   // Track when form was first interacted with
   const formStartTimeRef = useRef<number>(Date.now());

   // Reset form start time when component mounts
   useEffect(() => {
     formStartTimeRef.current = Date.now();
   }, []);

  // Calculate stats dynamically
  const totalReviews = reviews.length;
  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
  ).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.reviewText.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-review", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          rating: formData.rating,
          reviewText: formData.reviewText.trim(),
          orderReference: formData.orderReference.trim(),
           // Anti-bot fields
           website: honeypot,
           formStartTime: formStartTimeRef.current,
        },
      });

      if (error) throw error;

      toast({
        title: "¡Gracias por tu reseña!",
        description: "Tu reseña ha sido enviada y será revisada antes de publicarse.",
      });

      setFormData({
        name: "",
        email: "",
        rating: 5,
        reviewText: "",
        orderReference: "",
      });
       setHoneypot("");
       formStartTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la reseña. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onSelect, interactive = false }: { rating: number; onSelect?: (r: number) => void; interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => interactive && onSelect?.(star)}
        />
      ))}
    </div>
  );

  return (
    <section id="resenas" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        {/* Summary Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Reseñas de clientes de Reality 3D BCN
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Opiniones reales de clientes con los que hemos trabajado en Barcelona
          </p>
          
          {/* Rating Summary */}
          <div className="inline-flex items-center gap-3 bg-card border border-border/50 rounded-full px-6 py-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-primary text-primary"
                />
              ))}
            </div>
            <span className="text-foreground font-semibold">
              {averageRating} / 5
            </span>
            <span className="text-muted-foreground">
              basado en {totalReviews} reseñas verificadas
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-5 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Quote className="w-6 h-6 text-primary/30" />
                <div className="flex items-center gap-1 text-xs text-primary">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Verificada</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">
                  {review.name}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
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
          Clientes satisfechos con el servicio de impresión 3D de Reality 3D BCN en Barcelona y alrededores
        </p>

        {/* Leave a Review Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-8 border border-border/50 card-shadow">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                ¿Has trabajado con Reality 3D BCN?
              </h3>
              <p className="text-muted-foreground">
                Déjanos tu opinión y ayuda a otros clientes a conocer nuestro servicio de impresión 3D en Barcelona
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="review-name">Nombre *</Label>
                  <Input
                    id="review-name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-email">Email *</Label>
                  <Input
                    id="review-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tu valoración *</Label>
                <StarRating
                  rating={formData.rating}
                  onSelect={(r) => setFormData({ ...formData, rating: r })}
                  interactive
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-text">Tu reseña *</Label>
                <Textarea
                  id="review-text"
                  placeholder="Cuéntanos tu experiencia con nuestro servicio..."
                  rows={4}
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-reference">Referencia del pedido (opcional)</Label>
                <Input
                  id="order-reference"
                  placeholder="Describe brevemente qué imprimimos para ti"
                  value={formData.orderReference}
                  onChange={(e) => setFormData({ ...formData, orderReference: e.target.value })}
                  maxLength={200}
                />
              </div>

                {/* Honeypot field - hidden from real users */}
                <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="review-website">Website</label>
                  <input
                    type="text"
                    id="review-website"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar reseña
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Todas las reseñas son verificadas manualmente antes de publicarse para garantizar que provienen de clientes reales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
