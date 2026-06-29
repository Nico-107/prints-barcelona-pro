import { Menu, X, Star, PackageSearch, ChevronDown, Building2, Cpu } from "lucide-react";
import React, { useState, useEffect } from "react";
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
import { SERVICES_MENU, SLUGS_BY_TOPIC, slugForLang } from "@/seo/registry";

const LogoSvg = ({ onDark, style, className }: { onDark: boolean; style?: React.CSSProperties; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 470 130"
    fill="none"
    role="img"
    aria-label="Dimension3D"
    className={className}
    style={{ height: '32px', width: 'auto', display: 'block', ...style }}
  >
    <g transform="translate(6,12) scale(0.88)" fill="none">
      <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" opacity="0.35">
        <line x1="66" y1="14" x2="60" y2="42"/>
        <line x1="54" y1="108" x2="60" y2="42"/>
        <line x1="60" y1="42" x2="22" y2="62"/>
        <line x1="60" y1="42" x2="98" y2="62"/>
      </g>
      <g stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M66 14 L22 62"/><path d="M66 14 L98 62"/><path d="M66 14 L60 82"/>
        <path d="M54 108 L22 62"/><path d="M54 108 L98 62"/><path d="M54 108 L60 82"/>
        <path d="M22 62 L60 82 L98 62"/>
      </g>
      <circle cx="60" cy="42" r="4.5" fill="#ffffff" opacity="0.4"/>
      <circle cx="22" cy="62" r="7" fill="#ffffff"/>
      <circle cx="98" cy="62" r="7" fill="#ffffff"/>
      <circle cx="60" cy="82" r="7" fill="#ffffff"/>
      <circle cx="54" cy="108" r="7" fill="#ffffff"/>
      <circle cx="66" cy="14" r="9" fill="#f59e0b"/>
    </g>
    <text x="118" y="84" fontFamily="'Space Grotesk', sans-serif" fontSize="54" fontWeight="700" letterSpacing="-1.5" fill={onDark ? "#ffffff" : "#0f172a"}>
      Dimension<tspan fill="#f59e0b">3D</tspan>
    </text>
  </svg>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const { t, language } = useLanguage();
  const isEs = language === "es";
  const isCa = language === "ca";
  const groupLabel = (g: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? g.labelCa : isEs ? g.labelEs : g.labelEn;
  const itemLabel = (i: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? i.labelCa : isEs ? i.labelEs : i.labelEn;
  const servicesLabel = isCa ? "Serveis" : isEs ? "Servicios" : "Services";
  const forBusinessLabel = isCa ? "Per a Empreses" : isEs ? "Para Empresas" : "For Business";
  const makersLabel = isCa ? "Per a Makers" : isEs ? "Para Makers" : "Become a Maker";
  const businessSlug = SLUGS_BY_TOPIC["business"][language] ?? "/3d-printing-for-business-barcelona";

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: t("nav.howItWorks"), id: "como-funciona" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 border-b transition-colors duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-border/50" : "bg-transparent border-transparent"}`}>
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center" aria-label="Dimension3D">
            <LogoSvg onDark={!scrolled} style={{ height: '28px', width: 'auto' }} className="lg:hidden" />
            <LogoSvg onDark={!scrolled} style={{ height: '32px', width: 'auto' }} className="hidden lg:block" />
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
              >
                {item.label}
              </button>
            ))}

            {/* Services dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 text-sm font-medium transition-colors outline-none whitespace-nowrap ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}>
                {servicesLabel}
                <ChevronDown className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-background z-50">
                {SERVICES_MENU.map((group, gi) => (
                  <div key={group.labelEn}>
                    {gi > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                      {groupLabel(group)}
                    </DropdownMenuLabel>
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.slugEn} asChild>
                        <Link to={slugForLang(item, language)} className="cursor-pointer">
                          {itemLabel(item)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/makers"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white"}`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {makersLabel}
            </Link>

            <Button asChild variant="outline" size="sm" className="gap-1.5 border-accent/40 text-accent hover:bg-accent/5 whitespace-nowrap">
              <Link to={businessSlug}>
                <Building2 className="w-4 h-4" />
                {forBusinessLabel}
              </Link>
            </Button>

            <div className="hidden xl:flex items-center gap-1.5 text-sm">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                ))}
              </div>
              <span className={`font-medium whitespace-nowrap ${scrolled ? "text-muted-foreground" : "text-white/70"}`}>{t("nav.headerRating")}</span>
            </div>

            <LanguageSelector />
            <Button asChild variant="ghost" size="sm">
              <Link to="/track" className="gap-1.5 whitespace-nowrap">
                <PackageSearch className="w-4 h-4" />
                {t("nav.trackOrder")}
              </Link>
            </Button>
            <Button variant="cta" size="sm" onClick={() => scrollToSection("calculator")} className="whitespace-nowrap">
              {t("nav.requestQuote")}
            </Button>
          </nav>

          <div className="lg:hidden flex items-center gap-3">
            <LanguageSelector />
            <button className={`p-2 ${scrolled ? "text-foreground" : "text-white"}`} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
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
                    {groupLabel(group)}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.slugEn}
                      to={slugForLang(item, language)}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1.5 text-sm text-foreground"
                    >
                      {itemLabel(item)}
                    </Link>
                  ))}
                </div>
              ))}

              <Button asChild variant="outline" className="mt-3 w-full gap-1.5">
                <Link to="/makers" onClick={() => setIsMenuOpen(false)}>
                  <Cpu className="w-4 h-4" />
                  {makersLabel}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full gap-1.5 border-accent/40 text-accent hover:bg-accent/5">
                <Link to={businessSlug} onClick={() => setIsMenuOpen(false)}>
                  <Building2 className="w-4 h-4" />
                  {forBusinessLabel}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/track" onClick={() => setIsMenuOpen(false)}>
                  <PackageSearch className="w-4 h-4" /> {t("nav.trackOrder")}
                </Link>
              </Button>
              <Button variant="cta" className="w-full" onClick={() => scrollToSection("calculator")}>
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
