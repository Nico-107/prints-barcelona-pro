import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import type { HelmetServerState } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import Track from "./pages/Track";
import LandingPage from "./pages/LandingPage";
import B2BPage from "./pages/B2BPage";
import Makers from "./pages/Makers";
import MakerGuide from "./pages/MakerGuide";
import BlogPrecioBcn from "./pages/BlogPrecioBcn";
import BlogUrgentesBcn from "./pages/BlogUrgentesBcn";
import BlogRecambiosBcn from "./pages/BlogRecambiosBcn";
import BlogPrototiposBcn from "./pages/BlogPrototiposBcn";
import StudentsBcn from "./pages/StudentsBcn";
import Blog from "./pages/Blog";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { ALL_PAGES, PAGES_BY_SLUG } from "@/seo/registry";
import type { Language } from "@/contexts/LanguageContext";

export { ALL_PAGES };

type HelmetServerContext = {
  helmet?: HelmetServerState | null;
};

// Mirror of pathLanguage() in LanguageContext.tsx — must stay in sync.
function urlLanguage(path: string): Language {
  if (path.startsWith("/ca/") || path === "/ca") return "ca";
  return "es";
}

export function render(url: string): { html: string; helmetContext: HelmetServerContext } {
  const helmetContext: HelmetServerContext = {};
  const queryClient = new QueryClient();
  const defaultLanguage = urlLanguage(url);

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider defaultLanguage={defaultLanguage}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <StaticRouter location={url}>
              <Routes>
                <Route path="/" element={<Index />} />
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
                <Route path="/3d-printing-for-business-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/3d-printing-for-business-barcelona"]} />} />
                <Route path="/impresion-3d-empresas-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/impresion-3d-empresas-barcelona"]} />} />
                <Route path="/ca/impressio-3d-empreses-barcelona" element={<B2BPage page={PAGES_BY_SLUG["/ca/impressio-3d-empreses-barcelona"]} />} />
                {ALL_PAGES.map((p) => (
                  <Route key={p.slug} path={p.slug} element={<LandingPage page={p} />} />
                ))}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </StaticRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );

  return { html, helmetContext };
}
