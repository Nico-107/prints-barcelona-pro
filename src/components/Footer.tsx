import { MessageCircle, MapPin, Clock, Truck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICES_MENU, SLUGS_BY_TOPIC, slugForLang } from "@/seo/registry";
import { ACTIVE_CITY, whatsappUrl } from "@/config/cities";
import { capture } from "@/lib/analytics";

const WHATSAPP_URL = whatsappUrl(ACTIVE_CITY);

const Footer = () => {
  const { t, language } = useLanguage();
  const { pathname } = useLocation();
  const isInternational =
    pathname.startsWith("/3d-printing-service") ||
    pathname.startsWith("/3d-printing-delivery-") ||
    pathname.startsWith("/impresion-3d-con-entrega-");
  const brandSuffix = isInternational ? "" : ` ${ACTIVE_CITY.cityName}`;
  const isEs = language === "es";
  const isCa = language === "ca";
  const groupLabel = (g: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? g.labelCa : isEs ? g.labelEs : g.labelEn;
  const itemLabel = (i: { labelEn: string; labelEs: string; labelCa: string }) =>
    isCa ? i.labelCa : isEs ? i.labelEs : i.labelEn;

  const forBusinessLabel = isCa ? "Per a Empreses" : isEs ? "Para Empresas" : "For Business";
  const businessSlug = SLUGS_BY_TOPIC["business"][language] ?? "/3d-printing-for-business-barcelona";

  // Delivery / cities column — surfaces the city-delivery pages and the
  // secondary landing routes (Madrid, Valencia) so they stop being orphans.
  const deliveryLinks = [
    { slug: "/madrid", label: isCa ? "Madrid" : "Madrid" },
    { slug: "/3d-printing-madrid", label: isCa ? "3D Printing Madrid" : isEs ? "Impresión 3D Madrid" : "3D Printing Madrid" },
    { slug: "/impresion-3d-con-entrega-a-valencia", label: isCa ? "Enviament a València" : isEs ? "Envío a Valencia" : "Delivery to Valencia" },
    { slug: "/3d-printing-delivery-paris", label: isCa ? "Enviament a París" : isEs ? "Envío a París" : "Delivery to Paris" },
    { slug: "/3d-printing-delivery-london", label: isCa ? "Enviament a Londres" : isEs ? "Envío a Londres" : "Delivery to London" },
    { slug: "/3d-printing-delivery-amsterdam", label: isCa ? "Enviament a Amsterdam" : isEs ? "Envío a Ámsterdam" : "Delivery to Amsterdam" },
    { slug: "/3d-printing-delivery-berlin", label: isCa ? "Enviament a Berlín" : isEs ? "Envío a Berlín" : "Delivery to Berlin" },
    { slug: "/3d-printing-delivery-milan", label: isCa ? "Enviament a Milà" : isEs ? "Envío a Milán" : "Delivery to Milan" },
    { slug: "/3d-printing-delivery-rome", label: isCa ? "Enviament a Roma" : isEs ? "Envío a Roma" : "Delivery to Rome" },
    { slug: "/3d-printing-delivery-lisbon", label: isCa ? "Enviament a Lisboa" : isEs ? "Envío a Lisboa" : "Delivery to Lisbon" },
    { slug: "/3d-printing-delivery-new-york", label: isCa ? "Enviament a Nova York" : isEs ? "Envío a Nueva York" : "Delivery to New York" },
  ];

  // Popular catalogue products — one inbound each was the /catalogo listing;
  // adding them here gives the second inbound so they're no longer orphaned.
  const catalogueProducts = [
    { slug: "/catalogo/jarron-personalizado", label: isCa ? "Gerra Personalitzada" : isEs ? "Jarrón Personalizado" : "Custom Vase" },
    { slug: "/catalogo/placa-nombre", label: isCa ? "Placa de Nom" : isEs ? "Placa con Nombre" : "Custom Name Plate" },
    { slug: "/catalogo/placa-mascota", label: isCa ? "Placa per a Mascota" : isEs ? "Placa para Mascota" : "Pet ID Plate" },
    { slug: "/catalogo/soporte-telefono", label: isCa ? "Suport per a Mòbil" : isEs ? "Soporte de Teléfono" : "Phone Stand" },
    { slug: "/catalogo/topper-boda", label: isCa ? "Topper de Casament" : isEs ? "Topper de Boda" : "Wedding Cake Topper" },
  ];

  const handleWhatsApp = () => {
    capture('whatsapp_click', { source: 'footer' });
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(t("whatsapp.message"))}`, "_blank");
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container px-4 py-12">

        <div className="grid md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-background/10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">{t("footer.location.label")}</span>
            </div>
            <p className="text-background/70 text-sm">{t("footer.location.city")}</p>
            <p className="text-background/50 text-xs mt-1">{t("footer.location.pickup")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">{t("footer.shipping.label")}</span>
            </div>
            <p className="text-background/70 text-sm">{t("footer.shipping.area")}</p>
            <p className="text-background/50 text-xs mt-1">{t("footer.shipping.tracking")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">{t("footer.response.label")}</span>
            </div>
            <p className="text-background/70 text-sm">{t("footer.response.time")}</p>
            <p className="text-background/50 text-xs mt-1">{t("footer.response.express")}</p>
          </div>
          <div className="text-center md:text-right">
            <span className="font-medium text-sm block mb-3">{t("footer.quickLinks")}</span>
            <div className="flex flex-col gap-1.5">
              <Link to="/" className="text-background/70 text-sm hover:text-background transition-colors">{t("footer.nav.home")}</Link>
              <Link to={businessSlug} className="text-background/70 text-sm hover:text-background transition-colors">{forBusinessLabel}</Link>
              <Link to="/makers" className="text-background/70 text-sm hover:text-background transition-colors">{t("nav.becomeMaker")}</Link>
              <Link to="/maker-guide" className="text-background/70 text-sm hover:text-background transition-colors">{t("footer.nav.makerGuide")}</Link>
              <Link to="/3d-printing-service" className="text-background/70 text-sm hover:text-background transition-colors">International service</Link>
              <Link to="/track" className="text-background/70 text-sm hover:text-background transition-colors">{t("nav.trackOrder")}</Link>
              <Link to="/creator" className="text-background/70 text-sm hover:text-background transition-colors">{isCa ? "Sobre el creador" : isEs ? "Sobre el creador" : "About the creator"}</Link>
              <Link to="/privacy" className="text-background/70 text-sm hover:text-background transition-colors">{t("footer.nav.privacy")}</Link>
            </div>
          </div>
        </div>

        {/* SEO links: Services / Materials / For Business / Specialties / Guides */}
        <div className="grid md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-background/10">
          {SERVICES_MENU.filter((g) => g.labelEn !== "Guides").map((group) => (
            <div key={group.labelEn}>
              <p className="font-medium text-sm mb-3">{groupLabel(group)}</p>
              <ul className="flex flex-col gap-1.5">
                {group.items.map((item) => (
                  <li key={item.slugEn}>
                    <Link to={slugForLang(item, language as any)} className="text-background/70 text-sm hover:text-background transition-colors">
                      {itemLabel(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {(() => {
            const guidesGroup = SERVICES_MENU.find((g) => g.labelEn === "Guides");
            const designSlug = isCa ? "/dissenya-la-teva-peca-3d" : isEs ? "/disena-tu-pieza-3d" : "/design-your-3d-part";
            const designLabel = isCa ? "Disseny a mida" : isEs ? "Diseño a medida" : "Custom Design";
            return (
              <div>
                <p className="font-medium text-sm mb-3">
                  {isCa ? "Guies" : isEs ? "Guías" : "Guides"}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {guidesGroup?.items.map((item) => (
                    <li key={item.slugEn}>
                      <Link to={slugForLang(item, language as any)} className="text-background/70 text-sm hover:text-background transition-colors">
                        {itemLabel(item)}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to={designSlug} className="text-background/70 text-sm hover:text-background transition-colors">
                      {designLabel}
                    </Link>
                  </li>
                  <li>
                    <Link to="/catalogo" className="text-background/70 text-sm hover:text-background transition-colors">
                      {isCa ? "Catàleg" : isEs ? "Catálogo" : "Catalogue"}
                    </Link>
                  </li>
                </ul>
              </div>
            );
          })()}
        </div>

        {/* Delivery cities + popular products — restores inbound links for
            city-delivery routes and individual catalogue products that would
            otherwise be reachable only from a single index page. */}
        <div className="grid md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-background/10">
          <div>
            <p className="font-medium text-sm mb-3">
              {isCa ? "Ciutats i Enviaments" : isEs ? "Ciudades y Envíos" : "Cities & Delivery"}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {deliveryLinks.map((l) => (
                <li key={l.slug}>
                  <Link to={l.slug} className="text-background/70 text-sm hover:text-background transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-sm mb-3">
              {isCa ? "Productes Populars" : isEs ? "Productos Populares" : "Popular Products"}
            </p>
            <ul className="flex flex-col gap-1.5">
              {catalogueProducts.map((p) => (
                <li key={p.slug}>
                  <Link to={p.slug} className="text-background/70 text-sm hover:text-background transition-colors">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 120 120" aria-hidden="true" className="flex-shrink-0">
                <rect width="120" height="120" rx="26" fill="#0f172a"/>
                <polygon points="60,26 94,62 60,98 26,62" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinejoin="round"/>
                <line x1="26" y1="62" x2="94" y2="62" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                <circle cx="60" cy="26" r="12" fill="#f59e0b"/>
              </svg>
              <span className="font-semibold tracking-tight">Dimension3D{brandSuffix}</span>
            </div>
            <p className="text-background/60 text-sm">{t("footer.tagline")}</p>
            <p className="text-background/40 text-xs mt-1">{t("footer.taglineSub")}</p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-background font-medium transition-colors duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            {t("footer.whatsapp")}
          </button>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center">
          <p className="text-background/40 text-sm">
            © {new Date().getFullYear()} Dimension3D{brandSuffix}. {t("footer.copyright")}
          </p>
          <p className="text-background/40 text-xs mt-2">
            Built by{" "}
            <a
              href="https://nico-portfolio-gold.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background/70 transition-colors"
            >
              Mikołaj Szczełkun
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
