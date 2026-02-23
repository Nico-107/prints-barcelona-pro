import { Printer, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5 text-foreground">
            <Printer className="w-5 h-5 text-foreground" />
            <span className="font-semibold tracking-tight">Dimension3D</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("como-funciona")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.howItWorks")}
            </button>
            <button onClick={() => scrollToSection("servicios")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.services")}
            </button>
            <button onClick={() => scrollToSection("materiales")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.materials")}
            </button>
            <LanguageSelector />
            <Button size="sm" onClick={() => scrollToSection("upload")}>
              {t("nav.requestQuote")}
            </Button>
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <LanguageSelector />
            <button className="p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              <button onClick={() => scrollToSection("como-funciona")} className="text-left py-2 text-foreground font-medium">
                {t("nav.howItWorks")}
              </button>
              <button onClick={() => scrollToSection("servicios")} className="text-left py-2 text-foreground font-medium">
                {t("nav.services")}
              </button>
              <button onClick={() => scrollToSection("materiales")} className="text-left py-2 text-foreground font-medium">
                {t("nav.materials")}
              </button>
              <Button className="mt-2 w-full" onClick={() => scrollToSection("upload")}>
                {t("nav.requestQuote")}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
