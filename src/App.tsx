import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";
import Index from "./pages/Index";
import CookieConsentBanner from "./components/CookieConsentBanner";
import NotFound from "./pages/NotFound";
import { ALL_PAGES, PAGES_BY_SLUG } from "@/seo/registry";

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
const Blog = lazy(() => import("./pages/Blog"));

const PageFallback = <div className="min-h-screen bg-background" />;

function PostHogPageView() {
  const location = useLocation();
  useEffect(() => {
    capture("$pageview");
  }, [location.pathname, location.search]);
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
          <CookieConsentBanner />
          <Suspense fallback={PageFallback}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/track" element={<Track />} />
              <Route path="/makers" element={<Makers />} />
              <Route path="/maker-guide" element={<MakerGuide />} />
              <Route path="/blog/precio-impresion-3d-barcelona" element={<BlogPrecioBcn />} />
              <Route path="/blog/impresion-3d-urgente-barcelona" element={<BlogUrgentesBcn />} />
              <Route path="/blog/recambios-piezas-rotas-impresion-3d-barcelona" element={<BlogRecambiosBcn />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-orders" element={<AdminOrders />} />
              <Route path="/admin-makers" element={<AdminMakers />} />
              <Route path="/3d-printing-for-business-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/3d-printing-for-business-barcelona"]} />} />
              <Route path="/impresion-3d-empresas-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/impresion-3d-empresas-barcelona"]} />} />
              <Route path="/ca/impressio-3d-empreses-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/ca/impressio-3d-empreses-barcelona"]} />} />
              {ALL_PAGES.map((p) => (
                <Route key={p.slug} path={p.slug} element={<LandingPage page={p} />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
