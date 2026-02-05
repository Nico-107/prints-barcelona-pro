import { useState, useEffect, useRef } from "react";
import { Star, Quote, BadgeCheck, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

// Static reviews (legacy - always shown)
const staticReviews = [
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

const INITIAL_VISIBLE_COUNT = 4;

const Reviews = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [dbReviews, setDbReviews] = useState<DBReview[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    reviewText: "",
    orderReference: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const formStartTimeRef = useRef<number>(Date.now());

  // Fetch published reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, review_text, rating, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (!error && data) {
        setDbReviews(data);
      }
    };

    fetchReviews();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("reviews-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    formStartTimeRef.current = Date.now();
  }, []);

  // Combine DB reviews with static reviews
  const allReviews = [
    ...dbReviews.map((r) => ({ name: r.name, text: r.review_text, rating: r.rating, fromDb: true })),
    ...staticReviews.map((r) => ({ ...r, fromDb: false })),
  ];

  const visibleReviews = showAll ? allReviews : allReviews.slice(0, INITIAL_VISIBLE_COUNT);
  const totalReviews = allReviews.length;
  const averageRating = (allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.reviewText.trim()) {
      toast({
        title: t("reviews.form.required"),
        description: t("reviews.form.requiredDesc"),
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
          website: honeypot,
          formStartTime: formStartTimeRef.current,
        },
      });

      if (error) throw error;

      toast({
        title: t("reviews.form.success"),
        description: t("reviews.form.successDesc"),
      });

      setFormData({ name: "", email: "", rating: 5, reviewText: "", orderReference: "" });
      setHoneypot("");
      formStartTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: t("reviews.form.error"),
        description: t("reviews.form.errorDesc"),
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
            {t("reviews.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t("reviews.subtitle")}
          </p>

          {/* Rating Summary */}
          <div className="inline-flex items-center gap-3 bg-card border border-border/50 rounded-full px-6 py-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-foreground font-semibold">{averageRating} / 5</span>
            <span className="text-muted-foreground">
              {t("reviews.based")} {totalReviews} {t("reviews.verified")}
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleReviews.map((review, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-5 card-shadow border border-border/50 hover:border-primary/30 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Quote className="w-6 h-6 text-primary/30" />
                <div className="flex items-center gap-1 text-xs text-primary">
                  <BadgeCheck className="w-4 h-4" />
                  <span>{t("reviews.verifiedBadge")}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">{review.name}</span>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {allReviews.length > INITIAL_VISIBLE_COUNT && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  {t("reviews.showLess")}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {t("reviews.showMore")} ({allReviews.length - INITIAL_VISIBLE_COUNT})
                </>
              )}
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t("reviews.footer")}
        </p>

        {/* Leave a Review Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-8 border border-border/50 card-shadow">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t("reviews.form.title")}
              </h3>
              <p className="text-muted-foreground">{t("reviews.form.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="review-name">{t("reviews.form.name")}</Label>
                  <Input
                    id="review-name"
                    placeholder={t("reviews.form.namePlaceholder")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-email">{t("reviews.form.email")}</Label>
                  <Input
                    id="review-email"
                    type="email"
                    placeholder={t("reviews.form.emailPlaceholder")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("reviews.form.rating")}</Label>
                <StarRating
                  rating={formData.rating}
                  onSelect={(r) => setFormData({ ...formData, rating: r })}
                  interactive
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-text">{t("reviews.form.review")}</Label>
                <Textarea
                  id="review-text"
                  placeholder={t("reviews.form.reviewPlaceholder")}
                  rows={4}
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-reference">{t("reviews.form.orderRef")}</Label>
                <Input
                  id="order-reference"
                  placeholder={t("reviews.form.orderRefPlaceholder")}
                  value={formData.orderReference}
                  onChange={(e) => setFormData({ ...formData, orderReference: e.target.value })}
                  maxLength={200}
                />
              </div>

              {/* Honeypot field */}
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  t("reviews.form.submitting")
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t("reviews.form.submit")}
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {t("reviews.form.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
