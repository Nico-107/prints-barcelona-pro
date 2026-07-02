import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import posthog from "posthog-js";
import { registerPostHog } from "./lib/analytics";
import App from "./App.tsx";
import "./index.css";

const phKey = (import.meta.env.VITE_POSTHOG_KEY as string | undefined)?.trim();
const phHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined)?.trim();
if (phKey && phHost) {
  // Use persistent storage only when the visitor has explicitly accepted cookies.
  // Default is memory-only: anonymous aggregate analytics, no cookie/localStorage writes.
  const cookieConsent = localStorage.getItem("cookie-consent");
  posthog.init(phKey, {
    api_host: "/ingest",
    ui_host: phHost ?? "https://eu.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: cookieConsent === "accepted" ? "localStorage+cookie" : "memory",
  });
  registerPostHog(posthog);
} else if (import.meta.env.DEV) {
  console.warn("[analytics] VITE_POSTHOG_KEY or VITE_POSTHOG_HOST not set — PostHog disabled");
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
