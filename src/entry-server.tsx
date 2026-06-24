import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import type { FilledContext } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import Track from "./pages/Track";
import LandingPage from "./pages/LandingPage";
import Makers from "./pages/Makers";
import NotFound from "./pages/NotFound";
import { ALL_PAGES } from "@/seo/registry";
import type { Language } from "@/contexts/LanguageContext";

export { ALL_PAGES };

// Mirror of pathLanguage() in LanguageContext.tsx — must stay in sync.
function urlLanguage(path: string): Language {
  if (path.startsWith("/ca/") || path === "/ca") return "ca";
  return "es";
}

export function render(url: string): { html: string; helmetContext: FilledContext } {
  const helmetContext = {} as FilledContext;
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
