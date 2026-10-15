# Analytics — Dimension3D

## Stack

| Tool | Role |
|------|------|
| PostHog (EU Cloud) | Primary analytics, funnel, session recording |
| GA4 / gtag | Legacy conversion signals (running in parallel) |

Both receive the same events via `capture()` in `src/lib/analytics.ts`.  
GA4 is excluded from diagnostic/internal events via the `NO_GTAG` set.

---

## Consent model

PostHog initialises with `persistence: "memory"` before cookie consent, so no cookie or localStorage write happens. On consent acceptance, `upgradeAnalyticsPersistence()` upgrades to `"localStorage+cookie"` and calls `posthog.identify()` with the customer ref.

`COOKIELESS_ENABLED` in `src/main.tsx` gates PostHog's native cookieless mode. It is `false` until the PostHog project setting is also enabled — enabling the flag without the project setting causes silent data loss.

---

## Internal traffic filtering

To mark a session as internal (owner / dev):

```
https://www.dimension3dprints.com/?internal=1
```

This writes `dim3d-internal=1` to localStorage. All `capture()` calls return early when this flag is set, so internal sessions produce zero PostHog or GA4 events. To clear the flag:

```
https://www.dimension3dprints.com/?internal=0
```

Admin paths (`/admin`, `/admin-orders`, `/admin-makers`) are always treated as internal — no events are fired there regardless of the flag.

---

## Key events

| Event | When fired | Key properties |
|-------|-----------|----------------|
| `$pageview` | Every client-side navigation | `page_path`, `site_language` |
| `file_uploaded` | After STL parse | `material`, `quantity` |
| `quote_submitted` | Quote form submit | `material`, `price_low`, `quote_id` |
| `quote_received` | Server-side (edge fn) | `quote_id`, `price_low` |
| `instant_checkout_initiated` | Buy Now click | `material`, `exact_price` |
| `order_paid` | Stripe webhook | `order_id`, `amount` |
| `lang_suggest_shown/accepted/dismissed` | Language suggestion bar | `from`, `to` |
| `b2b_page_view` | B2B page mount | `lang` |
| `b2b_cta_click` | B2B CTA buttons | `which`, `section` |

Full list: `src/lib/analyticsEvents.ts`.

---

## Context properties (auto-attached to every event)

| Property | Source |
|----------|--------|
| `page_path` | `window.location.pathname` |
| `page_type` | Updated by `PostHogPageView` component |
| `site_language` | `localStorage["preferred-language"]` |
| `is_internal` | Internal flag / admin path (never reaches PostHog — events are skipped) |
| `utm_source/medium/content/campaign` | Stored UTM from landing URL |
| `xp_*` | A/B experiment assignment from `data-xp-*` HTML attributes |

---

## Server-side events

`send-quote-request` fires `quote_received` using service-role credentials.  
`stripe-webhook` fires `order_paid` using service-role credentials.  
Both use a 3-second timeout and swallow errors silently.

Env vars required on edge functions: `POSTHOG_KEY`, `POSTHOG_HOST`.

---

## Source tracking (Item 6)

Every quote request now includes:

| Field | Source |
|-------|--------|
| `source_path` | `window.location.pathname` at submit time |
| `page_language` | Active UI language |
| `browser_language` | `navigator.language` |
| `referrer_domain` | `document.referrer` hostname |
| `utm` | Stored UTM object |
| `fulfillment` | Shipping or pickup selection |

These are written to `quote_requests` by `send-quote-request` via service-role UPDATE.  
Migration: `supabase/migrations/20261015000000_source_tracking.sql`

---

## Cookieless mode activation checklist

1. Enable **cookieless mode** in PostHog project settings (Settings → Project → Cookieless mode)
2. Set `COOKIELESS_ENABLED = true` in `src/main.tsx`
3. Deploy edge functions with updated `POSTHOG_KEY`
4. Verify events appear in PostHog with `$device_id` instead of cookie-based `distinct_id`
