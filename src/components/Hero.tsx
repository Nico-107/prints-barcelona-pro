import { Button } from "@/components/ui/button";
import { MessageCircle, Upload, Printer } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/34672051147";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I'd like to request a 3D printing service and send a file.");

const Hero = () => {
  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  const handleScrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-gradient">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating 3D elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-pulse-slow" />
      <div className="absolute bottom-32 right-20 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse-slow" />
      <div className="absolute top-40 right-10 opacity-20">
        <Printer className="w-24 h-24 text-primary-foreground" />
      </div>

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up leading-tight">
            Impresión 3D a medida en Barcelona
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-4 animate-fade-in-delay max-w-2xl mx-auto">
            Sube tu archivo y recibe presupuesto en menos de 1 hora
          </p>
          
          <p className="text-base text-primary-foreground/70 mb-10 animate-fade-in-delay max-w-xl mx-auto">
            Producción local · Contacto directo · Sin precios automáticos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <Button 
              variant="whatsapp" 
              size="xl" 
              onClick={handleWhatsApp}
              className="group"
            >
              <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
              Contactar por WhatsApp
            </Button>
            
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={handleScrollToUpload}
            >
              <Upload className="w-5 h-5" />
              Solicitar presupuesto
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-primary-foreground/70 text-sm animate-fade-in-delay-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>Presupuesto en &lt;1h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>Precio final, sin sorpresas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>Recogida en Barcelona</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 70C1200 65 1320 55 1380 50L1440 45V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
