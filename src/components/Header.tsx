import { Menu, X, Star, PackageSearch, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";
import { useXpExposure, fireXpExposure } from "@/lib/experiments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSelector, { LANG_HUB } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICES_MENU, SLUGS_BY_TOPIC, PAGES_BY_SLUG, slugForLang } from "@/seo/registry";
import { GOOGLE_RATING, formatRating } from "@/data/rating";
import { cn } from "@/lib/utils";
import { useVariant, type SiteVariant } from "@/lib/useVariant";

const XP_LANGS = ["es", "en", "ca"];

interface HeaderProps {
  /**
   * If set, this Header locks to the given variant and ignores useVariant().
   * SiteShell uses this to render BOTH headers in the HTML so the correct one
   * is visible before paint (CSS-switched by data-xp-site-variant on <html>),
   * eliminating the A→B flash on non-home pages.
   */
  forcedVariant?: SiteVariant;
}

/**
 * Wrapper that eliminates the A→B hydration flash on variant B.
 *
 * When no `forcedVariant` is passed, we render BOTH header markups in the
 * prerendered HTML and let CSS keyed on html[data-xp-site-variant] (set
 * pre-paint) show only the matching one. No React re-render on hydration
 * swaps the DOM, so B visitors never see A's header for a frame.
 */
const Header = (props: HeaderProps = {}) => {
  if (props.forcedVariant) return <HeaderInner forcedVariant={props.forcedVariant} />;
  return (
    <>
      <div data-xp-slot="site_variant" data-xp-v="A" data-testid="header-slot-A" style={{ display: 'contents' }}>
        <HeaderInner forcedVariant="A" />
      </div>
      <div data-xp-slot="site_variant" data-xp-v="B" data-testid="header-slot-B" style={{ display: 'contents' }}>
        <HeaderInner forcedVariant="B" />
      </div>
    </>
  );
};

export default Header;

const HeaderInner = ({ forcedVariant }: HeaderProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hookVariant = useVariant();
  const siteVariant = forcedVariant ?? hookVariant;
  // Dark theme applies site-wide in variant B (Phase 1.1). The old home_v2
  // experiment has been merged into site_variant — one switch for B.
  const [isOverV2Hero, setIsOverV2Hero] = useState(siteVariant === "B");
  // Separate from isOverV2Hero: true only when a dark hero exists AND we are
  // still scrolled above it. Controls header background (transparent over the
  // hero, solid dark everywhere else in variant B).
  const [isOverDarkHero, setIsOverDarkHero] = useState(false);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLandingPage = PAGES_BY_SLUG[location.pathname];
  const landingTopicSlugs = currentLandingPage
    ? SLUGS_BY_TOPIC[currentLandingPage.topic]
    : undefined;
  const desktopSlotRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const check = () => {
      if (siteVariant === "B") {
        // Variant B always uses the dark theme (white text, orange triangle
        // logo, V2 nav). Background is transparent ONLY while the viewport is
        // still over a dark hero section ([data-v2-hero] / [data-dark-hero]);
        // once scrolled past it (or on pages without one) the header gets a
        // solid #0B1020 background.
        setIsOverV2Hero(true);
        const heroEl = document.querySelector(
          '[data-v2-hero], [data-dark-hero]'
        ) as HTMLElement | null;
        if (!heroEl) { setIsOverDarkHero(false); return; }
        const rect = heroEl.getBoundingClientRect();
        setIsOverDarkHero(rect.bottom > 10);
        return;
      }
      // Variant A: always light header. (Previous home_v2 fallback removed —
      // one switch now controls B site-wide via site_variant.)
      setIsOverV2Hero(false);
      setIsOverDarkHero(false);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [siteVariant]);

  // Text depends only on language — same on server and first client render.
  const xpHeaderText = (key: string): string =>
    XP_LANGS.includes(language) ? t(key) : t("nav.requestQuote");

  const isActivePath = (href: string) => location.pathname === href || location.pathname === href + "/";

  useXpExposure(desktopSlotRef, "header_btn_r2", () => ({ placement: "desktop" }));

  useEffect(() => {
    if (isMenuOpen) fireXpExposure("header_btn_r2", { placement: "mobile" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  // Lock body scroll + close on Escape while the mobile sheet is open.
  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const isEs = language === "es";
  const isCa = language === "ca";
  const groupLabel = (g: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? g.labelCa : isEs ? g.labelEs : g.labelEn;
  const itemLabel = (i: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? i.labelCa : isEs ? i.labelEs : i.labelEn;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
    setIsMenuOpen(false);
  };

  const handleNoFile = () => {
    const url = isEs ? "/disena-tu-pieza-3d" : isCa ? "/dissenya-la-teva-peca-3d" : "/design-your-3d-part";
    navigate(url);
    setIsMenuOpen(false);
  };

  const openCalculatorFilePicker = (location: string) => {
    capture("quote_cta_click", { location });
    capture("upload_entry_click", { source: "header", page_path: window.location.pathname });
    const el = document.getElementById("calculator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
      setTimeout(() => {
        const fileInput = el.querySelector('input[type="file"]') as HTMLInputElement | null;
        fileInput?.click();
      }, 400);
    } else {
      navigate("/#calculator");
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { label: t("nav.howItWorks"), id: "como-funciona" },
  ];

  // Phase 2.6 / Item 11: both dropdowns now carry at least 4 grouped
  // sections (data-testid="nav-menu-group"), in both variants A and B.
  //
  // Servicios dropdown  → Services · Specialties · For Business · Tools (4)
  // Recursos dropdown   → Materials · Guides · Popular · Blog         (4)
  const servicesGroup = SERVICES_MENU.find((g) => g.labelEn === "Services")!;
  const specialtiesGroup = SERVICES_MENU.find((g) => g.labelEn === "Specialties")!;
  const businessGroup = SERVICES_MENU.find((g) => g.labelEn === "For Business")!;
  const materialsGroup = SERVICES_MENU.find((g) => g.labelEn === "Materials")!;
  const guidesGroup = SERVICES_MENU.find((g) => g.labelEn === "Guides")!;
  const popularGroup = SERVICES_MENU.find((g) => g.labelEn === "Popular")!;

  const toolsGroupLabel = isCa ? "Eines" : isEs ? "Herramientas" : "Tools";
  const blogGroupLabel = isCa ? "Blog i articles" : isEs ? "Blog y artículos" : "Blog & articles";
  const fileCheckerHref = isEs ? "/verificador-archivo-3d" : isCa ? "/comprovador-arxiu-3d" : "/3d-file-checker";
  const trackHref = "/track";
  const blogHref = "/blog";

  const servicesMenuGroups: { key: string; label: string; items: Array<{ key: string; label: string; href: string; menu: "services" | "resources" }> }[] = [
    {
      key: "services",
      label: groupLabel(servicesGroup),
      items: servicesGroup.items.map((i) => ({ key: i.slugEn, label: itemLabel(i), href: slugForLang(i, language as any), menu: "services" })),
    },
    {
      key: "specialties",
      label: groupLabel(specialtiesGroup),
      items: specialtiesGroup.items.map((i) => ({ key: i.slugEn, label: itemLabel(i), href: slugForLang(i, language as any), menu: "services" })),
    },
    {
      key: "business",
      label: groupLabel(businessGroup),
      items: businessGroup.items.map((i) => ({ key: i.slugEn, label: itemLabel(i), href: slugForLang(i, language as any), menu: "services" })),
    },
    {
      key: "tools",
      label: toolsGroupLabel,
      items: [
        { key: "file-checker", label: t("nav.fileChecker"), href: fileCheckerHref, menu: "services" },
        { key: "track", label: t("nav.trackOrder"), href: trackHref, menu: "services" },
      ],
    },
  ];

  const resourcesMenuGroups: { key: string; label: string; items: Array<{ key: string; label: string; href: string; menu: "services" | "resources" }> }[] = [
    {
      key: "materials",
      label: groupLabel(materialsGroup),
      items: materialsGroup.items.map((i) => ({ key: i.slugEn, label: itemLabel(i), href: slugForLang(i, language as any), menu: "resources" })),
    },
    {
      key: "guides",
      label: groupLabel(guidesGroup),
      items: guidesGroup.items.map((i) => ({ key: i.slugEn, label: itemLabel(i), href: slugForLang(i, language as any), menu: "resources" })),
    },
    {
      key: "popular",
      label: groupLabel(popularGroup),
      items: popularGroup.items.map((i) => ({ key: i.slugEn, label: itemLabel(i), href: slugForLang(i, language as any), menu: "resources" })),
    },
    {
      key: "blog",
      label: blogGroupLabel,
      items: [
        { key: "blog-index", label: isEs ? "Ver el blog" : isCa ? "Veure el blog" : "Visit the blog", href: blogHref, menu: "resources" },
      ],
    },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#2F5BEA] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      <header
        data-testid="site-header"
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-200",
          isOverV2Hero
            ? (isOverDarkHero && !isMenuOpen)
              ? "bg-transparent border-b border-transparent"
              : "bg-[#0B1020] border-b border-white/10 shadow-[0_1px_8px_rgba(0,0,0,0.25)]"
            : cn("bg-white border-b border-[#E3E8F0]", scrolled && "shadow-[0_1px_8px_rgba(15,23,42,0.08)]")
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="container px-4 sm:px-6">
          <div className="flex items-center h-[var(--header-h)]">

            {/* Logo — on the home/hub page scrolls to top (Phase 2.6: was a no-op);
                elsewhere navigates to that language's hub. */}
            <Link
              to={LANG_HUB[language as keyof typeof LANG_HUB] ?? "/"}
              className="flex items-center gap-2 shrink-0"
              onClick={(e) => {
                const hub = LANG_HUB[language as keyof typeof LANG_HUB] ?? "/";
                const path = location.pathname;
                const onHub = path === hub || path === hub + "/" || (hub === "/" && path === "");
                if (onHub) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              {isOverV2Hero ? (
                <svg width="28" height="28" viewBox="0 0 120 120" aria-hidden="true">
                  <polygon points="60,26 94,62 60,98 26,62" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinejoin="round"/>
                  <line x1="26" y1="62" x2="94" y2="62" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round"/>
                  <circle cx="60" cy="26" r="12" fill="#F5A524"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 130" fill="none" aria-hidden="true" style={{ height: '36px', width: 'auto' }}>
                  <g transform="translate(6,12) scale(0.88)" fill="none">
                    <g stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" opacity="0.35">
                      <line x1="66" y1="14" x2="60" y2="42"/>
                      <line x1="54" y1="108" x2="60" y2="42"/>
                      <line x1="60" y1="42" x2="22" y2="62"/>
                      <line x1="60" y1="42" x2="98" y2="62"/>
                    </g>
                    <g stroke="#0f172a" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M66 14 L22 62"/><path d="M66 14 L98 62"/><path d="M66 14 L60 82"/>
                      <path d="M54 108 L22 62"/><path d="M54 108 L98 62"/><path d="M54 108 L60 82"/>
                      <path d="M22 62 L60 82 L98 62"/>
                    </g>
                    <circle cx="60" cy="42" r="4.5" fill="#0f172a" opacity="0.4"/>
                    <circle cx="22" cy="62" r="7" fill="#0f172a"/>
                    <circle cx="98" cy="62" r="7" fill="#0f172a"/>
                    <circle cx="60" cy="82" r="7" fill="#0f172a"/>
                    <circle cx="54" cy="108" r="7" fill="#0f172a"/>
                    <circle cx="66" cy="14" r="9" fill="#F5A524"/>
                  </g>
                </svg>
              )}
              <span aria-label="Dimension3D" className="font-bold tracking-tight text-sm" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", color: isOverV2Hero ? '#FFFFFF' : '#0F172A' }}>
                {/* Phase 9.contrast: on the white (variant A) header the gold
                    wordmark drops to #B45309 so it clears 4.5:1 on white; on
                    the dark (variant B) header it stays the bright gold. */}
                Dimension<span style={{ color: isOverV2Hero ? '#F5A524' : '#B45309' }}>3D</span>
              </span>
            </Link>

            {/* Desktop primary nav — V2 dark header, matching the A grouped menu set.
                Phase 2.6 fix-up: Precios / Cómo / Sin archivo hide below xl so
                DE/FR labels don't push the header past 1440. All three are
                still reachable via the Servicios dropdown. */}
            {isOverV2Hero && (
              <nav className="hidden lg:flex items-center gap-4 ml-6 mr-auto" style={{ color: '#FFFFFF', fontSize: 15 }}>
                {(() => {
                  const businessHref = SLUGS_BY_TOPIC["business"][language as keyof typeof SLUGS_BY_TOPIC["business"]] ?? "/impresion-3d-empresas-barcelona";
                  return (<>
                    <button type="button" onClick={() => scrollToSection('precios')} className="hidden 2xl:inline-flex" style={{ color: '#FFFFFF', background: 'none', border: 0, cursor: 'pointer', padding: '12px 0', fontSize: 15, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t("header.v2.precios")}</button>
                    <button type="button" onClick={() => scrollToSection('maquina')} className="hidden 2xl:inline-flex" style={{ color: '#FFFFFF', background: 'none', border: 0, cursor: 'pointer', padding: '12px 0', fontSize: 15, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t("header.v2.como")}</button>
                    <Link to={businessHref} style={{ color: '#FFFFFF', textDecoration: 'none', padding: '12px 0', fontSize: 15, whiteSpace: 'nowrap' }}>{t("header.v2.empresas")}</Link>
                    <button type="button" onClick={handleNoFile} className="hidden 2xl:inline-flex" style={{ color: '#FFFFFF', background: 'none', border: 0, cursor: 'pointer', padding: '12px 0', fontSize: 15, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{t("header.v2.sin")}</button>

                    {/* Phase 2.6 / Item 11: variant B grouped menus mirror
                        variant A — both render ≥ 4 data-testid="nav-menu-group". */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 outline-none" style={{ color: '#FFFFFF', background: 'none', border: 0, cursor: 'pointer', padding: '12px 0', fontSize: 15, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        {t("nav.services")}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-white border-[#E3E8F0] z-50 grid grid-cols-2 gap-x-6 p-4 min-w-[520px]">
                        {servicesMenuGroups.map((group) => (
                          <div key={group.key} data-testid="nav-menu-group" data-group={group.key}>
                            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-[#5B6577] px-0 pt-0 pb-1">{group.label}</DropdownMenuLabel>
                            {group.items.map((i) => (
                              <DropdownMenuItem key={i.key} asChild>
                                <Link to={i.href} onClick={() => capture("nav_click", { menu: i.menu, label_key: i.key, href: i.href })} className="cursor-pointer">
                                  {i.label}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 outline-none" style={{ color: '#FFFFFF', background: 'none', border: 0, cursor: 'pointer', padding: '12px 0', fontSize: 15, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        {t("nav.resources")}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-white border-[#E3E8F0] z-50 grid grid-cols-2 gap-x-6 p-4 min-w-[560px]">
                        {resourcesMenuGroups.map((group) => (
                          <div key={group.key} data-testid="nav-menu-group" data-group={group.key}>
                            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-[#5B6577] px-0 pt-0 pb-1">{group.label}</DropdownMenuLabel>
                            {group.items.map((i) => (
                              <DropdownMenuItem key={i.key} asChild>
                                <Link to={i.href} onClick={() => capture("nav_click", { menu: i.menu, label_key: i.key, href: i.href })} className="cursor-pointer">
                                  {i.label}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>);
                })()}
              </nav>
            )}

            {/* Desktop primary nav — normal white header */}
            <nav className={cn("items-center gap-3 ml-3 mr-auto", isOverV2Hero ? "hidden" : "hidden lg:flex")}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-[#5B6577] hover:text-[#0F172A] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
              {(() => {
                const businessHref = SLUGS_BY_TOPIC["business"][language as keyof typeof SLUGS_BY_TOPIC["business"]] ?? "/impresion-3d-empresas-barcelona";
                return (
                  <Link
                    to={businessHref}
                    onClick={() => capture("nav_click", { menu: "main", label_key: "b2b-production", href: businessHref })}
                    className={cn(
                      "flex items-center gap-1 text-sm font-semibold transition-colors whitespace-nowrap border rounded-full px-3 py-1",
                      isActivePath(businessHref)
                        ? "text-[#2F5BEA] border-[#2F5BEA]/60 bg-[#2F5BEA]/5"
                        : "text-[#2F5BEA] border-[#2F5BEA]/30 hover:border-[#2F5BEA]/60"
                    )}
                  >
                    {t("nav.forBusiness")}
                  </Link>
                );
              })()}
              {/* Phase 2.6: Catálogo + Custom design hide below xl so the header
                  fits in 1024/1228 across all 8 languages (German "Bestellung
                  verfolgen" + "Sofortpreis" used to truncate at 1228). They
                  live in the Servicios / Resources dropdowns at lg widths. */}
              {(() => {
                const active = isActivePath("/catalogo");
                return (
                  <Link
                    to="/catalogo"
                    onClick={() => capture("nav_click", { menu: "main", label_key: "catalog", href: "/catalogo" })}
                    className={cn(
                      "hidden xl:inline-flex text-sm font-medium transition-colors whitespace-nowrap",
                      active ? "text-[#0F172A] font-semibold" : "text-[#5B6577] hover:text-[#0F172A]"
                    )}
                  >
                    {t("nav.catalog")}
                  </Link>
                );
              })()}
              {(() => {
                const href = isEs ? "/disena-tu-pieza-3d" : isCa ? "/dissenya-la-teva-peca-3d" : "/design-your-3d-part";
                const active = isActivePath(href);
                return (
                  <Link
                    to={href}
                    onClick={() => capture("nav_click", { menu: "main", label_key: "custom-design", href })}
                    className={cn(
                      "hidden xl:inline-flex text-sm font-medium transition-colors whitespace-nowrap",
                      active ? "text-[#0F172A] font-semibold" : "text-[#5B6577] hover:text-[#0F172A]"
                    )}
                  >
                    {t("nav.customDesign")}
                  </Link>
                );
              })()}

              {/* Services dropdown — 4 nav-menu-groups */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-[#5B6577] hover:text-[#0F172A] transition-colors outline-none whitespace-nowrap">
                  {t("nav.services")}
                  <ChevronDown className="w-3.5 h-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white border-[#E3E8F0] z-50 grid grid-cols-2 gap-x-6 p-4 min-w-[520px]">
                  {servicesMenuGroups.map((group) => (
                    <div key={group.key} data-testid="nav-menu-group" data-group={group.key}>
                      <DropdownMenuLabel className="text-xs uppercase tracking-wide text-[#5B6577] px-0 pt-0 pb-1">
                        {group.label}
                      </DropdownMenuLabel>
                      {group.items.map((i) => (
                        <DropdownMenuItem key={i.key} asChild>
                          <Link
                            to={i.href}
                            onClick={() => capture("nav_click", { menu: i.menu, label_key: i.key, href: i.href })}
                            className="cursor-pointer"
                          >
                            {i.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Resources dropdown — 4 nav-menu-groups */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-[#5B6577] hover:text-[#0F172A] transition-colors outline-none whitespace-nowrap">
                  {t("nav.resources")}
                  <ChevronDown className="w-3.5 h-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white border-[#E3E8F0] z-50 grid grid-cols-2 gap-x-6 p-4 min-w-[560px]">
                  {resourcesMenuGroups.map((group) => (
                    <div key={group.key} data-testid="nav-menu-group" data-group={group.key}>
                      <DropdownMenuLabel className="text-xs uppercase tracking-wide text-[#5B6577] px-0 pt-0 pb-1">
                        {group.label}
                      </DropdownMenuLabel>
                      {group.items.map((i) => (
                        <DropdownMenuItem key={i.key} asChild>
                          <Link
                            to={i.href}
                            onClick={() => capture("nav_click", { menu: i.menu, label_key: i.key, href: i.href })}
                            className="cursor-pointer"
                          >
                            {i.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Desktop utility nav — V2 dark header */}
            {isOverV2Hero && (
              <div className="hidden lg:flex items-center gap-3">
                <span className="hidden xl:inline" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#F5A524' }}>★</span> {t("header.v2.rating")}
                </span>
                {/* Phase 2.6 + 9.contrast: language switcher in variant B;
                    tone="dark" renders the trigger white so the code clears
                    4.5:1 on the dark header. */}
                <LanguageSelector landingTopicSlugs={landingTopicSlugs} tone="dark" />
                {/* Phase 2.6: Seguir pedido present in variant B too */}
                <Link
                  to="/track"
                  onClick={() => capture("nav_click", { menu: "main", label_key: "track", href: "/track" })}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                  style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: 14 }}
                >
                  <PackageSearch className="w-4 h-4" />
                  {t("nav.trackOrder")}
                </Link>
                <button
                  type="button"
                  onClick={() => openCalculatorFilePicker("header_v2")}
                  style={{ background: '#F5A524', color: '#0B1020', fontWeight: 600, padding: '11px 18px', borderRadius: 10, fontSize: 15, border: 0, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap' }}
                >
                  {t("header.v2.cta")}
                </button>
              </div>
            )}

            {/* Desktop utility nav — normal white header */}
            <div className={cn("items-center gap-3", isOverV2Hero ? "hidden" : "hidden lg:flex")}>
              <div className="hidden 2xl:flex items-center gap-1.5 text-sm">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-[#5B6577] font-medium whitespace-nowrap">
                  {t("nav.headerRating")
                    .replace("{rating}", formatRating(language))
                    .replace("{count}", String(GOOGLE_RATING.count))}
                </span>
              </div>

              <LanguageSelector landingTopicSlugs={landingTopicSlugs} />
              {/* Phase 2.6: label hides below xl so the German header fits at 1228. */}
              <Button asChild variant="ghost" size="sm" className="text-[#5B6577] hover:text-[#0F172A]" aria-label={t("nav.trackOrder")}>
                <Link to="/track" className="gap-1.5 whitespace-nowrap">
                  <PackageSearch className="w-4 h-4" />
                  <span className="hidden xl:inline">{t("nav.trackOrder")}</span>
                </Link>
              </Button>
              <Button
                ref={desktopSlotRef}
                variant="cta"
                size="sm"
                onClick={() => openCalculatorFilePicker("header")}
                className="whitespace-nowrap"
              >
                <span data-xp-slot="header_btn_r2" data-xp-v="A" className="whitespace-nowrap">{xpHeaderText("xp.header.v3")}</span>
                <span data-xp-slot="header_btn_r2" data-xp-v="B" className="whitespace-nowrap">{xpHeaderText("xp.header.v4")}</span>
              </Button>
            </div>

            {/* Mobile controls */}
            <div className="lg:hidden ml-auto flex items-center gap-2">
              {isOverV2Hero && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#FFFFFF' }}>
                  <span style={{ color: '#F5A524' }}>★</span> 4,8
                </span>
              )}
              {/* Phase 9.contrast: mobile language switcher goes dark-tone on
                  variant B so the lang code clears 4.5:1 against the
                  dark header. */}
              <LanguageSelector landingTopicSlugs={landingTopicSlugs} tone={isOverV2Hero ? "dark" : "light"} />
              <button
                className="p-2 inline-flex items-center justify-center min-w-[44px] min-h-[44px]"
                style={{ color: isOverV2Hero ? '#FFFFFF' : '#0F172A' }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? t("header.menu.close") : t("header.menu.open")}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile full-screen sheet */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-white overflow-y-auto"
          style={{ paddingTop: "calc(var(--header-h) + env(safe-area-inset-top))", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="px-4 pb-8 pt-6 flex flex-col gap-1">
            {/* Primary CTA */}
            <Button
              variant="cta"
              className="w-full mb-4 h-12 text-base"
              onClick={() => openCalculatorFilePicker("header_mobile")}
            >
              <span data-xp-slot="header_btn_r2" data-xp-v="A">{xpHeaderText("xp.header.v3")}</span>
              <span data-xp-slot="header_btn_r2" data-xp-v="B">{xpHeaderText("xp.header.v4")}</span>
            </Button>

            {/* For Business */}
            {(() => {
              const businessHref = SLUGS_BY_TOPIC["business"][language as keyof typeof SLUGS_BY_TOPIC["business"]] ?? "/impresion-3d-empresas-barcelona";
              return (
                <Link
                  to={businessHref}
                  onClick={() => { setIsMenuOpen(false); capture("nav_click", { menu: "main", label_key: "b2b-production", href: businessHref }); }}
                  className={cn(
                    "flex items-center min-h-[52px] px-4 rounded-xl text-base font-semibold transition-colors",
                    isActivePath(businessHref) ? "bg-[#2F5BEA]/10 text-[#2F5BEA]" : "text-[#2F5BEA] hover:bg-[#2F5BEA]/5"
                  )}
                >
                  {t("nav.forBusiness")}
                </Link>
              );
            })()}

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center min-h-[52px] px-4 rounded-xl text-base font-medium text-[#0F172A] hover:bg-[#F6F8FC] text-left transition-colors"
              >
                {item.label}
              </button>
            ))}

            <Link
              to="/catalogo"
              onClick={() => { setIsMenuOpen(false); capture("nav_click", { menu: "main", label_key: "catalog", href: "/catalogo" }); }}
              className={cn(
                "flex items-center min-h-[52px] px-4 rounded-xl text-base font-medium transition-colors",
                isActivePath("/catalogo") ? "bg-[#F6F8FC] text-[#0F172A] font-semibold" : "text-[#0F172A] hover:bg-[#F6F8FC]"
              )}
            >
              {t("nav.catalog")}
            </Link>

            {(() => {
              const href = isEs ? "/disena-tu-pieza-3d" : isCa ? "/dissenya-la-teva-peca-3d" : "/design-your-3d-part";
              return (
                <Link
                  to={href}
                  onClick={() => { setIsMenuOpen(false); capture("nav_click", { menu: "main", label_key: "custom-design", href }); }}
                  className={cn(
                    "flex items-center min-h-[52px] px-4 rounded-xl text-base font-medium transition-colors",
                    isActivePath(href) ? "bg-[#F6F8FC] text-[#0F172A] font-semibold" : "text-[#0F172A] hover:bg-[#F6F8FC]"
                  )}
                >
                  {t("nav.customDesign")}
                </Link>
              );
            })()}

            <Link
              to={isEs ? "/verificador-archivo-3d" : isCa ? "/comprovador-arxiu-3d" : "/3d-file-checker"}
              onClick={() => { setIsMenuOpen(false); capture("nav_click", { menu: "services", label_key: "file-checker", href: isEs ? "/verificador-archivo-3d" : isCa ? "/comprovador-arxiu-3d" : "/3d-file-checker" })}
              }
              className="flex items-center min-h-[52px] px-4 rounded-xl text-base font-medium text-[#0F172A] hover:bg-[#F6F8FC] transition-colors"
            >
              {t("nav.fileChecker")}
            </Link>

            {/* Services section */}
            <div className="pt-4 border-t border-[#E3E8F0] mt-2">
              <p className="text-xs font-mono uppercase tracking-widest text-[#5B6577] px-4 pb-2">
                {t("nav.services")}
              </p>
              {servicesGroup.items.map((item) => {
                const href = slugForLang(item, language as any);
                return (
                  <Link
                    key={item.slugEn}
                    to={href}
                    onClick={() => { setIsMenuOpen(false); capture("nav_click", { menu: "services", label_key: item.slugEn, href }); }}
                    className={cn(
                      "flex items-center min-h-[48px] px-4 rounded-xl text-sm font-medium transition-colors",
                      isActivePath(href) ? "bg-[#F6F8FC] text-[#0F172A] font-semibold" : "text-[#0F172A] hover:bg-[#F6F8FC]"
                    )}
                  >
                    {itemLabel(item)}
                  </Link>
                );
              })}
            </div>

            {/* Resources section */}
            <div className="pt-4 border-t border-[#E3E8F0] mt-2">
              <p className="text-xs font-mono uppercase tracking-widest text-[#5B6577] px-4 pb-2">
                {t("nav.resources")}
              </p>
              {resourcesMenuGroups.map((group) => (
                <div key={group.key} data-testid="nav-menu-group" data-group={group.key} className="mb-3">
                  <p className="text-xs text-[#5B6577] px-4 pb-1">{group.label}</p>
                  {group.items.map((i) => (
                    <Link
                      key={i.key}
                      to={i.href}
                      onClick={() => { setIsMenuOpen(false); capture("nav_click", { menu: "resources", label_key: i.key, href: i.href }); }}
                      className={cn(
                        "flex items-center min-h-[44px] px-4 rounded-xl text-sm font-medium transition-colors",
                        isActivePath(i.href) ? "bg-[#F6F8FC] text-[#0F172A] font-semibold" : "text-[#0F172A] hover:bg-[#F6F8FC]"
                      )}
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* Track order */}
            <div className="pt-4 border-t border-[#E3E8F0] mt-2">
              <Button asChild variant="outline" className="w-full h-12 border-[#E3E8F0] text-base">
                <Link to="/track" onClick={() => setIsMenuOpen(false)}>
                  <PackageSearch className="w-5 h-5 mr-2" />
                  {t("nav.trackOrder")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
