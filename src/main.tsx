import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

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
