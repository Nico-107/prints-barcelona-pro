// PostHog instance — registered once by main.tsx (browser only).
// Null during SSR/prerender; events are queued until registration.
import { getStoredUTM } from "./utm";
import { migrateExperimentAssignment, isAnyForced } from "./experiments";
import { EXPERIMENTS, type ExperimentId } from "./experimentsConfig";
import type { EventName, EventMap } from "./analyticsEvents";

type PHInstance = {
  capture: (event: string, props?: Record<string, unknown>) => void;
  set_config: (config: Partial<{ persistence: string; cookieless_mode: string }>) => void;
  identify: (distinctId: string) => void;
  register: (props: Record<string, unknown>, days?: number) => void;
  get_distinct_id: () => string;
  get_session_id: () => string;
};

let ph: PHInstance | null = null;
let eventQueue: { event: string; properties?: Record<string, unknown> }[] = [];

// ---- Internal traffic flag (A3) ----

const INTERNAL_FLAG_KEY = "dim3d-internal";

export function processInternalFlag(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("internal");
    if (flag === "1") localStorage.setItem(INTERNAL_FLAG_KEY, "1");
    else if (flag === "0") localStorage.removeItem(INTERNAL_FLAG_KEY);
  } catch {
    // localStorage unavailable
  }
}

function getIsInternal(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin")) return true;
  try {
    return localStorage.getItem(INTERNAL_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

// ---- Page context (A2) — set by App.tsx on every pathname change ----

let _pageCtx: { page_type: string } = { page_type: "other" };

export function updatePageContext(ctx: Partial<typeof _pageCtx>): void {
  Object.assign(_pageCtx, ctx);
}

// ---- Context enrichment (A2) ----

function getSiteLanguage(): string {
  try {
    return localStorage.getItem("preferred-language") ?? "es";
  } catch {
    return "es";
  }
}

function getExperimentProps(language: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (typeof window === "undefined") return props;

  const now = new Date();
  let anyForced = false;

  (Object.entries(EXPERIMENTS) as [ExperimentId, (typeof EXPERIMENTS)[ExperimentId]][]).forEach(([id, exp]) => {
    if (!exp.enabled) return;
    if (now >= new Date(exp.endsOn + "T00:00:00Z")) return;

    const langOk = (exp.langs as readonly string[]).includes(language);
    if (!langOk) {
      props[`xp_${id}`] = "n/a";
      return;
    }

    const raw = document.documentElement.dataset[exp.attr];
    const v = raw ? parseInt(raw, 10) : 1;
    props[`xp_${id}`] = v;

    if (isAnyForced()) anyForced = true;
  });

  if (anyForced) props.xp_forced = true;
  return props;
}

function buildContextProps(): Record<string, unknown> {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const utm = getStoredUTM();
  const language = getSiteLanguage();
  const xpProps = getExperimentProps(language);
  const props: Record<string, unknown> = {
    page_path: path,
    page_type: _pageCtx.page_type,
    site_language: language,
    is_internal: getIsInternal(),
    ...xpProps,
  };
  if (utm) {
    if (utm.utm_source != null) props.utm_source = utm.utm_source;
    if (utm.utm_medium != null) props.utm_medium = utm.utm_medium;
    if (utm.utm_content != null) props.utm_content = utm.utm_content;
    if (utm.utm_campaign != null) props.utm_campaign = utm.utm_campaign;
  }
  return props;
}

// ---- GA4 exclusion list (A2) — new diagnostic events skip gtag forwarding ----
// GA4 limits parameters per event; keep it only for existing conversion signals.

const NO_GTAG = new Set<string>([
  "nav_click",
  "outbound_contact_click",
  "submit_error",
  "part_page_view",
  "part_fulfillment_selected",
  "part_buy_click",
  "catalog_card_click",
  "catalog_product_view",
  "catalog_request_submitted",
  "file_upload_error",
  "estimate_add_more_click",
  "experiment_exposure",
  "experiment_error",
  "calculator_seen",
  "google_review_click",
]);

// ---- Internal dispatch (works with any string event name) ----

function _dispatch(event: string, properties?: Record<string, unknown>): void {
  // Caller-supplied values win; context fills in the blanks.
  const enriched: Record<string, unknown> = {
    ...buildContextProps(),
    ...properties,
  };

  if (ph) {
    ph.capture(event, enriched);
    if (event !== "$pageview" && !NO_GTAG.has(event) && typeof window !== "undefined") {
      (window as any).gtag?.("event", event, enriched);
    }
  } else {
    if (eventQueue.length >= 50) eventQueue.shift();
    eventQueue.push({ event, properties: enriched });
  }
}

// ---- Public typed capture (A8) ----
// Generic ensures event name and property keys are compile-checked.

export function capture<E extends EventName>(
  event: E,
  properties?: EventMap[E]
): void {
  _dispatch(event, properties as Record<string, unknown> | undefined);
}

// ---- Queue flush ----

export function registerPostHog(instance: PHInstance): void {
  ph = instance;
  if (eventQueue.length > 0) {
    eventQueue.forEach(({ event, properties }) => {
      ph!.capture(event, properties);
      if (event !== "$pageview" && !NO_GTAG.has(event) && typeof window !== "undefined") {
        (window as any).gtag?.("event", event, properties ?? {});
      }
    });
    eventQueue = [];
  }
}

// ---- Identity helpers (A1, A4) ----

export function identifyUser(ref: string): void {
  // Only call identify when cookies are accepted — consent is required for
  // persistent identity binding. The customer_ref property alone is enough to
  // join on when cookies are rejected.
  try {
    const consent = localStorage.getItem("cookie-consent");
    if (ph && consent === "accepted") {
      ph.identify(ref);
    }
  } catch {
    // localStorage unavailable
  }
}

export function register(props: Record<string, unknown>, days?: number): void {
  ph?.register(props, days);
}

export function get_distinct_id(): string | undefined {
  return ph?.get_distinct_id();
}

export function get_session_id(): string | undefined {
  return ph?.get_session_id();
}

// ---- Persistence upgrade (A1) ----
// Called when user accepts cookies — upgrades from session-memory to
// persistent identity (localStorage + first-party cookie).

export function upgradeAnalyticsPersistence(): void {
  ph?.set_config({ persistence: "localStorage+cookie" });
  migrateExperimentAssignment();
}
