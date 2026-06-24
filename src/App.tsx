import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";
import Index from "./pages/Index";
import Track from "./pages/Track";
import AdminOrders from "./pages/AdminOrders";
import AdminMakers from "./pages/AdminMakers";
import Privacy from "./pages/Privacy";
import CookieConsentBanner from "./components/CookieConsentBanner";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Makers from "./pages/Makers";
import { ALL_PAGES } from "@/seo/registry";

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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/track" element={<Track />} />
            <Route path="/makers" element={<Makers />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin-orders" element={<AdminOrders />} />
            <Route path="/admin-makers" element={<AdminMakers />} />
            {ALL_PAGES.map((p) => (
              <Route key={p.slug} path={p.slug} element={<LandingPage page={p} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
