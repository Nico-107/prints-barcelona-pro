import { useState, useEffect, useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import { Star, Quote, BadgeCheck, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";

const staticReviews: { name: string; text: string; rating: number; source?: "google" | "wallapop" }[] = [
  { name: "Valentino Modestino Lombardi", text: "Excellent on-demand 3D printing service, very helpful and patient customer service. Recommended!", rating: 5, source: "google" },
  { name: "Kirill Gromskiy", text: "I'm working for a construction company. We needed a special round shadow gap profile for a wall, but there was no way to buy one because nobody sells it. So we decided to make it with the help of 3D printing. It was fast, affordable, and worked perfectly.", rating: 5, source: "google" },
  { name: "Daniel Cáceres Álvarez", text: "Espectacular, compré dos maquetas de Stranger Things para los Funkos de Kinder Joy y quedaron geniales. Servicio y calidad de 10.", rating: 5, source: "google" },
  { name: "Alex A.", text: "Todo lo impreso está tal cual lo pedí. Gran calidad de impresión y persona seria y de confianza. 100% recomendable.", rating: 5, source: "wallapop" },
  { name: "Fco Javier M.", text: "Perfecto con las medidas exactas. Muy bien trabajado.", rating: 5, source: "wallapop" },
  { name: "Jose Antonio A.", text: "Trabajo perfecto. Atención inmejorable. Muy contento.", rating: 5, source: "wallapop" },
  { name: "Alex A.", text: "Gran calidad de impresión. Todo exactamente como lo pedí. Persona seria y de confianza. 100% recomendable.", rating: 5 },
  { name: "Anastasia A.", text: "La base para las figuras de Stranger Things es espectacular. Muy contenta con la compra. Excelente producto.", rating: 5 },
  { name: "Jose Antonio A.", text: "Trabajo perfecto y atención inmejorable.", rating: 5 },
  { name: "Oscar G.", text: "Todo genial.", rating: 5 },
  { name: "Rocio P.", text: "Atención rápida y exactamente como lo quería.", rating: 5 },
  { name: "Carmen D.", text: "Muy amable y rápido.", rating: 5 },
  { name: "Gabriel G.", text: "Rapidez y buena calidad de impresión.", rating: 5 },
  { name: "Marc M.", text: "Muy buen vendedor. Un 10.", rating: 5 },
  { name: "Jose Antonio Z.", text: "Cordial, atento y muy implicado en todo el proceso de diseño. Un 10 en todos los aspectos.", rating: 5 },
  { name: "Carlos", text: "Piezas realizadas 100% perfectas y bien acabadas.", rating: 5 },
  { name: "Marcos A.", text: "Genial, súper agradable y profesional.", rating: 5 },
  { name: "João P.", text: "Excelente trabajo, exactamente lo que se pidió. Muy recomendable.", rating: 5 },
  { name: "Enrique B.", text: "Trato muy cercano y excelente comunicación durante todo el proceso. 10/10.", rating: 5 },
  { name: "Toni C.", text: "Trato serio y profesional, con buena comunicación. Recomendado.", rating: 5 },
  { name: "CoolStuff C.", text: "Producto perfecto para lo que necesitaba. 10/10.", rating: 5 },
  { name: "Ernesto G.", text: "Muy profesional.", rating: 5 },
];

interface DBReview {
  id: string;
  name: string;
  review_text: string;
  rating: number;
  published_at: string;
}

const INITIAL_VISIBLE_COUNT = 6;

const Reviews = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const sectionRef = useReveal<HTMLElement>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [dbReviews, setDbReviews] = useState<DBReview[]>([]);
  const [formData, setFormData] = useState({ name: "", email: "", rating: 5, reviewText: "", orderReference: "" });
  const [honeypot, setHoneypot] = useState("");
  const formStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews_public")
        .select("id, name, review_text, rating, published_at")
        .order("published_at", { ascending: false });
      if (!error && data) setDbReviews(data);
    };
    fetchReviews();
    const channel = supabase
      .channel("reviews-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => fetchReviews())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { formStartTimeRef.current = Date.now(); }, []);

  const allReviews = [
    ...dbReviews.map((r) => ({ name: r.name, text: r.review_text, rating: r.rating, source: undefined as "google" | "wallapop" | undefined, fromDb: true })),
    ...staticReviews.map((r) => ({ ...r, fromDb: false })),
  ];

  const visibleReviews = showAll ? allReviews : allReviews.slice(0, INITIAL_VISIBLE_COUNT);
  const totalReviews = allReviews.length;
  const averageRating = (allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.reviewText.trim()) {
      toast({ title: t("reviews.form.required"), description: t("reviews.form.requiredDesc"), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-review", {
        body: { name: formData.name.trim(), email: formData.email.trim(), rating: formData.rating, reviewText: formData.reviewText.trim(), orderReference: formData.orderReference.trim(), website: honeypot, formStartTime: formStartTimeRef.current },
      });
      if (error) throw error;
      capture('review submitted', {
        rating: formData.rating,
        has_order_reference: !!formData.orderReference.trim(),
      });
      toast({ title: t("reviews.form.success"), description: t("reviews.form.successDesc") });
      setFormData({ name: "", email: "", rating: 5, reviewText: "", orderReference: "" });
      setHoneypot("");
      formStartTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ title: t("reviews.form.error"), description: t("reviews.form.errorDesc"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const GoldStars = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${size} ${star <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );

  const InteractiveStars = ({ rating, onSelect }: { rating: number; onSelect: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${star <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
          onClick={() => onSelect(star)}
        />
      ))}
    </div>
  );

  return (
    <section ref={sectionRef} id="resenas" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("reviews.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">{t("reviews.subtitle")}</p>
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3 card-shadow">
            <GoldStars rating={5} size="w-5 h-5" />
            <span className="text-foreground font-bold text-lg">{averageRating}</span>
            <span className="text-muted-foreground">/ 5 · {totalReviews} {t("reviews.verified")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {visibleReviews.map((review, index) => (
            <div key={index} className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover border border-border hover:border-accent/20 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <Quote className="w-5 h-5 text-accent/30" />
                {review.source === "google" ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#4285F4" }}>
                    <span className="w-3.5 h-3.5 rounded-full text-[8px] font-bold inline-flex items-center justify-center flex-shrink-0" style={{ background: "#4285F4", color: "#fff" }}>G</span>
                    Google
                  </div>
                ) : review.source === "wallapop" ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#13c1ac" }}>
                    <span className="w-3.5 h-3.5 rounded-full text-[8px] font-bold inline-flex items-center justify-center flex-shrink-0" style={{ background: "#13c1ac", color: "#fff" }}>W</span>
                    Wallapop
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-accent">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>{t("reviews.verifiedBadge")}</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{review.text}"</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">{review.name}</span>
                <GoldStars rating={review.rating} size="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {allReviews.length > INITIAL_VISIBLE_COUNT && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="gap-2">
              {showAll ? (<><ChevronUp className="w-4 h-4" />{t("reviews.showLess")}</>) : (<><ChevronDown className="w-4 h-4" />{t("reviews.showMore")} ({allReviews.length - INITIAL_VISIBLE_COUNT})</>)}
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">{t("reviews.footer")}</p>

        {/* Leave a Review */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-8 border border-border card-shadow">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">{t("reviews.form.title")}</h3>
              <p className="text-muted-foreground">{t("reviews.form.subtitle")}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="review-name">{t("reviews.form.name")}</Label>
                  <Input id="review-name" placeholder={t("reviews.form.namePlaceholder")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-email">{t("reviews.form.email")}</Label>
                  <Input id="review-email" type="email" placeholder={t("reviews.form.emailPlaceholder")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} maxLength={255} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("reviews.form.rating")}</Label>
                <InteractiveStars rating={formData.rating} onSelect={(r) => setFormData({ ...formData, rating: r })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-text">{t("reviews.form.review")}</Label>
                <Textarea id="review-text" placeholder={t("reviews.form.reviewPlaceholder")} rows={4} value={formData.reviewText} onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })} maxLength={1000} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-reference">{t("reviews.form.orderRef")}</Label>
                <Input id="order-reference" placeholder={t("reviews.form.orderRefPlaceholder")} value={formData.orderReference} onChange={(e) => setFormData({ ...formData, orderReference: e.target.value })} maxLength={200} />
              </div>
              <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="review-website">Website</label>
                <input type="text" id="review-website" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
              </div>
              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? t("reviews.form.submitting") : (<><Send className="w-4 h-4 mr-2" />{t("reviews.form.submit")}</>)}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-6">{t("reviews.form.disclaimer")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
