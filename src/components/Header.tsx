import { Printer, Menu, X, Star } from "lucide-react";
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

  const navItems = [
    { label: t("nav.howItWorks"), id: "como-funciona" },
    { label: t("nav.services"), id: "servicios" },
    { label: t("nav.materials"), id: "materiales" },
    { label: t("nav.projects"), id: "proyectos" },
    { label: t("nav.reviews"), id: "resenas" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5 text-foreground">
            <Printer className="w-5 h-5 text-accent" />
            <span className="font-semibold tracking-tight">Dimension3D</span>
          </a>

          <nav className="hidden lg:flex items-center gap-5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}

            {/* Rating badge */}
            <div className="flex items-center gap-1.5 text-sm">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-muted-foreground font-medium">{t("nav.headerRating")}</span>
            </div>

            <LanguageSelector />
            <Button variant="accent" size="sm" onClick={() => scrollToSection("upload")}>
              {t("nav.requestQuote")}
            </Button>
          </nav>

          <div className="lg:hidden flex items-center gap-3">
            <LanguageSelector />
            <button className="p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-2 text-foreground font-medium"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center gap-1.5 py-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm font-medium">{t("nav.headerRating")}</span>
              </div>
              <Button variant="accent" className="mt-2 w-full" onClick={() => scrollToSection("upload")}>
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
