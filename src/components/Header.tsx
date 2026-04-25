import { Printer, Menu, X, Star, PackageSearch, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICES_MENU } from "@/seo/registry";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language } = useLanguage();
  const isEs = language === "es";

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: t("nav.howItWorks"), id: "como-funciona" },
    { label: t("nav.materials"), id: "materiales" },
    { label: t("nav.projects"), id: "proyectos" },
    { label: t("nav.reviews"), id: "resenas" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 text-foreground">
            <Printer className="w-5 h-5 text-accent" />
            <span className="font-semibold tracking-tight">Dimension3D</span>
          </Link>

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

            {/* Services dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
                {isEs ? "Servicios" : "Services"}
                <ChevronDown className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-background z-50">
                {SERVICES_MENU.map((group, gi) => (
                  <div key={group.labelEn}>
                    {gi > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                      {isEs ? group.labelEs : group.labelEn}
                    </DropdownMenuLabel>
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.slugEn} asChild>
                        <Link to={isEs ? item.slugEs : item.slugEn} className="cursor-pointer">
                          {isEs ? item.labelEs : item.labelEn}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1.5 text-sm">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
              <span className="text-muted-foreground font-medium">{t("nav.headerRating")}</span>
            </div>

            <LanguageSelector />
            <Button asChild variant="ghost" size="sm">
              <Link to="/track" className="gap-1.5">
                <PackageSearch className="w-4 h-4" />
                {t("nav.trackOrder")}
              </Link>
            </Button>
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
          <nav className="lg:hidden py-4 border-t border-border/50 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-2 text-foreground font-medium"
                >
                  {item.label}
                </button>
              ))}

              {SERVICES_MENU.map((group) => (
                <div key={group.labelEn} className="pt-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground py-1">
                    {isEs ? group.labelEs : group.labelEn}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.slugEn}
                      to={isEs ? item.slugEs : item.slugEn}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1.5 text-sm text-foreground"
                    >
                      {isEs ? item.labelEs : item.labelEn}
                    </Link>
                  ))}
                </div>
              ))}

              <Button asChild variant="outline" className="mt-3 w-full">
                <Link to="/track" onClick={() => setIsMenuOpen(false)}>
                  <PackageSearch className="w-4 h-4" /> {t("nav.trackOrder")}
                </Link>
              </Button>
              <Button variant="accent" className="w-full" onClick={() => scrollToSection("upload")}>
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
