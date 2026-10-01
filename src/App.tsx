import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { capture, updatePageContext } from "@/lib/analytics";
import Index from "./pages/Index";
import CookieConsentBanner from "./components/CookieConsentBanner";
import NotFound from "./pages/NotFound";
import { ALL_PAGES, PAGES_BY_SLUG } from "@/seo/registry";
import { CITY_PAGES } from "@/data/cityDeliveryPages";
import { partPages } from "@/data/partsPages";

const Track = lazy(() => import("./pages/Track"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminMakers = lazy(() => import("./pages/AdminMakers"));
const Privacy = lazy(() => import("./pages/Privacy"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const B2BPage = lazy(() => import("./pages/B2BPage"));
const Makers = lazy(() => import("./pages/Makers"));
const MakerGuide = lazy(() => import("./pages/MakerGuide"));
const BlogPrecioBcn = lazy(() => import("./pages/BlogPrecioBcn"));
const BlogUrgentesBcn = lazy(() => import("./pages/BlogUrgentesBcn"));
const BlogRecambiosBcn = lazy(() => import("./pages/BlogRecambiosBcn"));
const BlogPrototiposBcn = lazy(() => import("./pages/BlogPrototiposBcn"));
const StudentsBcn = lazy(() => import("./pages/StudentsBcn"));
const Blog = lazy(() => import("./pages/Blog"));
const InternationalServicePage = lazy(() => import("./pages/InternationalServicePage"));
const CityDeliveryPage = lazy(() => import("./pages/CityDeliveryPage"));
const Catalog = lazy(() => import("./pages/Catalog"));
const CatalogProduct = lazy(() => import("./pages/CatalogProduct"));
const Creator = lazy(() => import("./pages/Creator"));
const DesignRequest = lazy(() => import("./pages/DesignRequest"));
const FileChecker = lazy(() => import("./pages/FileChecker"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const PartPage = lazy(() => import("./pages/PartPage"));
const RepuestoDescatalogado = lazy(() => import("./pages/RepuestoDescatalogado"));
const SinPedidoMinimo = lazy(() => import("./pages/SinPedidoMinimo"));
const EmpresasBcn = lazy(() => import("./pages/EmpresasBcn"));
const Lemon = lazy(() => import("./pages/Lemon"));

const PageFallback = <div className="min-h-screen bg-background" />;

// Build slug sets once for O(1) page_type lookups (A2)
const CITY_SLUGS = new Set(CITY_PAGES.map((p) => p.slug));
const LANDING_SLUGS = new Set(ALL_PAGES.map((p) => p.slug));
const PART_SLUGS = new Set(partPages.map((p) => p.slug));

function inferPageType(path: string): string {
  if (path === "/" || path === "/ca") return "home";
  if (path === "/catalogo" || path.startsWith("/catalogo/")) return "catalog";
  if (path === "/lemon") return "lemon";
  if (path.startsWith("/admin")) return "admin";
  if (path === "/track") return "tracking";
  if (path === "/3d-printing-service") return "international";
  if (path.startsWith("/blog")) return "blog";
  if (CITY_SLUGS.has(path)) return "city";
  if (LANDING_SLUGS.has(path)) return "landing";
  if (PART_SLUGS.has(path)) return "part";
  return "other";
}

// Outbound contact link detection (A6)
function getChannel(href: string): "whatsapp" | "email" | "phone" | null {
  if (href.includes("wa.me") || href.includes("whatsapp.com")) return "whatsapp";
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "phone";
  return null;
}

function getElementLocation(target: EventTarget | null): string {
  if (!target || !(target instanceof Element)) return "unknown";
  let el: Element | null = target;
  while (el) {
    const id = el.id;
    if (id) return id;
    const tag = el.tagName.toLowerCase();
    if (tag === "header") return "header";
    if (tag === "footer") return "footer";
    if (tag === "nav") return "nav";
    if (tag === "main") return "main";
    if (tag === "section") return (el as HTMLElement).dataset.section ?? "section";
    el = el.parentElement;
  }
  return "page";
}

// A5: Fire $pageview only on pathname change (not on search-param changes).
// A2: Update page context before firing so the pageview carries the right page_type.
function PostHogPageView() {
  const location = useLocation();
  useEffect(() => {
    updatePageContext({ page_type: inferPageType(location.pathname) });
    capture("$pageview");
  }, [location.pathname]); // intentionally excludes location.search
  return null;
}

// A6: Global delegated outbound-contact listener — one listener for the whole app.
function OutboundContactTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.href ?? anchor.getAttribute("href") ?? "";
      const channel = getChannel(href);
      if (!channel) return;
      capture("outbound_contact_click", {
        channel,
        element_location: getElementLocation(anchor),
      });
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PostHogPageView />
          <OutboundContactTracker />
          <CookieConsentBanner />
          <Suspense fallback={PageFallback}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ca" element={<Index />} />
              <Route path="/3d-printing-service" element={<InternationalServicePage />} />
              <Route path="/track" element={<Track />} />
              <Route path="/makers" element={<Makers />} />
              <Route path="/maker-guide" element={<MakerGuide />} />
              <Route path="/blog/precio-impresion-3d-barcelona" element={<BlogPrecioBcn />} />
              <Route path="/blog/impresion-3d-urgente-barcelona" element={<BlogUrgentesBcn />} />
              <Route path="/blog/recambios-piezas-rotas-impresion-3d-barcelona" element={<BlogRecambiosBcn />} />
              <Route path="/blog/prototipos-rapidos-piezas-funcionales-barcelona" element={<BlogPrototiposBcn />} />
              <Route path="/impresion-3d-estudiantes-barcelona" element={<StudentsBcn />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-orders" element={<AdminOrders />} />
              <Route path="/admin-makers" element={<AdminMakers />} />
              <Route path="/3d-printing-for-business-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/3d-printing-for-business-barcelona"]} />} />
              <Route path="/impresion-3d-empresas-barcelona" element={<EmpresasBcn />} />
              <Route path="/ca/impressio-3d-empreses-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/ca/impressio-3d-empreses-barcelona"]} />} />
              {ALL_PAGES.map((p) => (
                <Route key={p.slug} path={p.slug} element={<LandingPage page={p} />} />
              ))}
              {CITY_PAGES.map((p) => (
                <Route key={p.slug} path={p.slug} element={<CityDeliveryPage config={p} />} />
              ))}
              {partPages.map((p) => (
                <Route key={p.slug} path={p.slug} element={<PartPage part={p} />} />
              ))}
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/catalogo/:slug" element={<CatalogProduct />} />
              <Route path="/creator" element={<Creator />} />
              <Route path="/design-your-3d-part" element={<DesignRequest />} />
              <Route path="/disena-tu-pieza-3d" element={<DesignRequest />} />
              <Route path="/dissenya-la-teva-peca-3d" element={<DesignRequest />} />
              <Route path="/3d-file-checker" element={<FileChecker />} />
              <Route path="/verificador-archivo-3d" element={<FileChecker />} />
              <Route path="/comprovador-arxiu-3d" element={<FileChecker />} />
              <Route path="/repuesto-descatalogado" element={<RepuestoDescatalogado />} />
              <Route path="/impresion-3d-sin-pedido-minimo" element={<SinPedidoMinimo />} />
              <Route path="/politica-devoluciones" element={<ReturnPolicy />} />
              {/* NFC referral landing — noindex, not in sitemap, not linked from nav/footer */}
              <Route path="/lemon" element={<Lemon />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
