import { Printer, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 text-foreground">
            <Printer className="w-5 h-5 text-foreground" />
            <span className="font-semibold tracking-tight">Reality 3D BCN</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cómo funciona
            </button>
            <button
              onClick={() => scrollToSection("servicio")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Servicio
            </button>
            <button
              onClick={() => scrollToSection("upload")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Subir archivo
            </button>
            <Button 
              size="sm"
              onClick={() => scrollToSection("upload")}
            >
              Solicitar presupuesto
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => scrollToSection("como-funciona")}
                className="text-left py-2 text-foreground font-medium"
              >
                Cómo funciona
              </button>
              <button
                onClick={() => scrollToSection("servicio")}
                className="text-left py-2 text-foreground font-medium"
              >
                Servicio
              </button>
              <button
                onClick={() => scrollToSection("upload")}
                className="text-left py-2 text-foreground font-medium"
              >
                Subir archivo
              </button>
              <Button 
                className="mt-2 w-full"
                onClick={() => scrollToSection("upload")}
              >
                Solicitar presupuesto
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
