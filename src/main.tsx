import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import posthog from "posthog-js";
import { registerPostHog, processInternalFlag, enableHeatmapsAndReplay } from "./lib/analytics";
import { captureFirstTouch } from "./lib/firstTouch";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";

// Set to true ONLY after enabling cookieless mode in the PostHog PROJECT settings.
// If this is true while the project setting is off, PostHog silently discards all
// cookieless events — total data loss for non-consenting visitors. Ship OFF.
const COOKIELESS_ENABLED = false;

const phKey = (import.meta.env.VITE_POSTHOG_KEY as string | undefined)?.trim();
const phHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined)?.trim();

processInternalFlag();
// Conv 4.3: first-touch source pinned once per visitor; attached as
// ft_* props on every event via lib/analytics.
captureFirstTouch();

// Prompt 1 Part C: Stripe return attribution.
// Stripe sends the customer back with ?ph_did=<distinct_id>&ph_sid=<session_id>.
// Pick those up before posthog.init and pass them as bootstrap so
// checkout_returned / instant_checkout_completed / order_paid land on the
// same person and session as the original buy click.
function readBootstrapIds(): { distinctID?: string; sessionID?: string } {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const rawDid = params.get("ph_did");
    const rawSid = params.get("ph_sid");
    // Shape check: PostHog distinct IDs are UUID-ish strings up to ~128 chars.
    // Session IDs are similar. Reject anything containing whitespace or
    // characters outside the alphabet of base64url/UUID.
    const looksLikeId = (s: string | null): s is string =>
      !!s && s.length >= 10 && s.length <= 128 && /^[A-Za-z0-9._-]+$/.test(s);
    const out: { distinctID?: string; sessionID?: string } = {};
    if (looksLikeId(rawDid)) out.distinctID = rawDid;
    if (looksLikeId(rawSid)) out.sessionID = rawSid;
    if (out.distinctID || out.sessionID) {
      // Strip the params from the URL so they don't survive a refresh and
      // don't leak into page_path analytics.
      params.delete("ph_did");
      params.delete("ph_sid");
      const q = params.toString();
      const clean = window.location.pathname + (q ? "?" + q : "") + window.location.hash;
      window.history.replaceState(null, "", clean);
    }
    return out;
  } catch {
    return {};
  }
}
const bootstrapIds = readBootstrapIds();

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
      ...(bootstrapIds.distinctID || bootstrapIds.sessionID
        ? { bootstrap: bootstrapIds }
        : {}),
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
  <ErrorBoundary fullPage>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ErrorBoundary>
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
