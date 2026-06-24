import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import posthog from "posthog-js";
import { registerPostHog } from "./lib/analytics";
import App from "./App.tsx";
import "./index.css";

const phKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const phHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined;
if (phKey && phHost) {
  posthog.init(phKey, {
    api_host: phHost,
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  registerPostHog(posthog);
}

const rootEl = document.getElementById("root")!;
const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Use hydrateRoot only when this exact route was prerendered — avoids
// blowing away server-rendered DOM while still doing a fresh render for
// routes that use the SPA shell (e.g. /admin-orders).
if (rootEl.getAttribute("data-prerendered") === window.location.pathname) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
