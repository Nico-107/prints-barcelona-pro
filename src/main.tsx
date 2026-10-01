import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import posthog from "posthog-js";
import { registerPostHog, processInternalFlag } from "./lib/analytics";
import App from "./App.tsx";
import "./index.css";

// Set to true ONLY after enabling cookieless mode in the PostHog PROJECT settings.
// If this is true while the project setting is off, PostHog silently discards all
// cookieless events — total data loss for non-consenting visitors. Ship OFF.
const COOKIELESS_ENABLED = false;

const phKey = (import.meta.env.VITE_POSTHOG_KEY as string | undefined)?.trim();
const phHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined)?.trim();

processInternalFlag();

const initPostHog = () => {
  if (phKey && phHost) {
    const cookieConsent = localStorage.getItem("cookie-consent");
    const accepted = cookieConsent === "accepted";
    posthog.init(phKey, {
      api_host: phHost ?? "https://eu.i.posthog.com",
      ui_host: "https://eu.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      capture_exceptions: true,
      capture_dead_clicks: true,
      persistence: accepted ? "localStorage+cookie" : "memory",
      ...(COOKIELESS_ENABLED ? { cookieless_mode: "on_reject" as const } : {}),
      on_request_error: (failure) => {
        console.error("[PostHog] request failed:", failure);
      },
    });
    registerPostHog(posthog);
  } else if (import.meta.env.DEV) {
    console.warn("[analytics] VITE_POSTHOG_KEY or VITE_POSTHOG_HOST not set — PostHog disabled");
  }
};

if (typeof window.requestIdleCallback === "function") {
  window.requestIdleCallback(initPostHog, { timeout: 1000 });
} else {
  setTimeout(initPostHog, 1);
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
  hydrateRoot(rootEl, app, {
    onRecoverableError: (error, errorInfo) => {
      console.error("[Hydration Error]", error);
      console.error("[Component Stack]", errorInfo?.componentStack);
    },
  });
} else {
  createRoot(rootEl).render(app);
}
