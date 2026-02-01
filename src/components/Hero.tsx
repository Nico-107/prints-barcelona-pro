import { Button } from "@/components/ui/button";
import { MessageCircle, Upload, Printer } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/34672051147";
const WHATSAPP_MESSAGE = encodeURIComponent("Hola, me gustaría solicitar un servicio de impresión 3D con Reality 3D BCN.");

const Hero = () => {
  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  const handleScrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-gradient">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0V0zm39 0h1v40h-1V0zM0 0h40v1H0V0zm0 39h40v1H0v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Subtle floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-20 w-48 h-48 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-primary-foreground/60 mb-4 animate-fade-in font-medium">
            Reality 3D BCN
          </p>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in-up leading-tight">
            Impresión 3D profesional en Barcelona
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-4 animate-fade-in-delay max-w-2xl mx-auto">
            Sube tu archivo y recibe presupuesto en menos de 1 hora
          </p>
          
          <p className="text-base text-primary-foreground/60 mb-10 animate-fade-in-delay max-w-xl mx-auto">
            Servicio de impresión 3D a medida · Producción local · Contacto directo
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
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-primary-foreground/60 text-sm animate-fade-in-delay-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full" />
              <span>Presupuesto en &lt;1h</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full" />
              <span>Precio final, sin sorpresas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-foreground/50 rounded-full" />
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
