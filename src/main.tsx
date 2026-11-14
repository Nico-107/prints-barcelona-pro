import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import posthog from "posthog-js";
import { registerPostHog, processInternalFlag, enableHeatmapsAndReplay } from "./lib/analytics";
import { captureFirstTouch } from "./lib/firstTouch";
import App from "./App.tsx";
import "./index.css";

// Legal / Conv-legal 2.3: ENABLE cookieless mode. Before any banner answer
// and after "reject", posthog-js runs in cookieless mode — no persistent id,
// no device storage — but still sends every pageview and custom event (uploads,
// price shown, Buy clicks, WhatsApp clicks). After "accept" the SDK flips to
// the normal mode with a persistent id and session recording is enabled.
//
// REQUIRES: cookieless mode must also be enabled in the PostHog project
// settings (Project settings → Autocapture → Enable cookieless mode). Until
// the project flag is on, cookieless events are silently dropped. See owner
// steps printed at the end of the legal branch push report.
const COOKIELESS_ENABLED = true;

const phKey = (import.meta.env.VITE_POSTHOG_KEY as string | undefined)?.trim();
const phHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined)?.trim();

processInternalFlag();
// Conv 4.3: first-touch source pinned once per visitor; attached as
// ft_* props on every event via lib/analytics.
captureFirstTouch();

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
      autocapture: true,
      rageclick: true,
      persistence: accepted ? "localStorage+cookie" : "memory",
      disable_session_recording: true,
      enable_heatmaps: false,
      ...(COOKIELESS_ENABLED ? { cookieless_mode: "on_reject" as const } : {}),
      on_request_error: (failure) => {
        console.error("[PostHog] request failed:", failure);
      },
      loaded: () => {
        registerPostHog(posthog);
        if (localStorage.getItem("cookie-consent") === "accepted") {
          enableHeatmapsAndReplay();
        }
      },
    });
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
