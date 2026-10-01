# Analytics Events Reference

All events are sent to PostHog (EU host: eu.i.posthog.com). Events marked **server** are
sent from Supabase Edge Functions. Events marked **client** are sent from the browser.

## Auto-enriched properties

The `capture()` wrapper in `src/lib/analytics.ts` merges these into **every** client event
(caller-supplied values win if there is a clash):

| Property | Source |
|---|---|
| `utm_source` | `localStorage` via `src/lib/utm.ts` (30-day persistence) |
| `utm_medium` | same |
| `utm_content` | same |
| `utm_campaign` | same |
| `page_path` | `window.location.pathname` at call time |
| `page_type` | Inferred from path: `home \| catalog \| part \| city \| international \| blog \| landing \| lemon \| admin \| tracking \| other` |
| `site_language` | `localStorage["preferred-language"]` |
| `is_internal` | `true` if `localStorage["dim3d-internal"]=1` or path starts with `/admin` |

Server events do **not** carry these auto-enriched properties. UTM and session context for
`order_paid` comes from Stripe Session metadata (threaded from the browser at checkout time).

---

## Existing events

### `$pageview` · client
Fires on every client-side navigation (pathname change only — search-param changes do NOT fire a second pageview).  
**Where:** `src/App.tsx` → `PostHogPageView`  
**Properties:** none (PostHog adds its own URL/referrer props)

---

### `estimate_generated` · client
Fires when an STL file is parsed successfully and a price estimate is computed.  
**Where:** `src/components/StlEstimator.tsx`

| Property | Type | Description |
|---|---|---|
| `material` | string | Material key, e.g. `"PLA"` |
| `infill` | number | Infill % |
| `urgency` | string | `"standard"` \| `"express"` \| `"urgent"` |
| `quantity` | number | Total units across all files |
| `estimated_grams` | number | Total weight (rounded) |
| `price_low` | number | Low end of range (rounded) |
| `price_high` | number | High end of range (rounded) |
| `file_count` | number | Valid (non-error) file count |
| `multicolour` | boolean | Whether multicolour was selected |

---

### `estimate_modal_shown` · client
Fires when the confirmation modal opens automatically after an estimate is generated (once per estimate session).  
**Where:** `src/components/StlEstimator.tsx`

---

### `estimate_modal_dismissed` · client
Fires when the user closes the confirmation modal without submitting.  
**Where:** `src/components/StlEstimator.tsx`

---

### `estimate_abandoned` · client
Fires when a user removes the last valid file or resets the estimator after seeing a price.  
**Where:** `src/components/StlEstimator.tsx`

| Property | Type | Description |
|---|---|---|
| `price_low` | number | Low end of abandoned estimate |
| `price_high` | number | High end of abandoned estimate |
| `material` | string | Material key at time of abandon |

---

### `whatsapp_click` · client
Fires when the user taps the WhatsApp button from the calculator.  
**Where:** `src/components/StlEstimator.tsx`  
**Note:** Compare with `outbound_contact_click` (channel=whatsapp) to measure how many WhatsApp taps are currently missed.

| Property | Type | Description |
|---|---|---|
| `source` | string | Always `"calculator"` |
| `location` | string | Always `"calculator"` |
| `path` | string | `window.location.pathname` at call time |

---

### `quote_submitted` · client
Fires when the user successfully submits a quote request (STL estimator flow).  
**Where:** `src/components/StlEstimator.tsx`  
**Forwarded to GA4:** yes

| Property | Type | Description |
|---|---|---|
| `has_email` | boolean | Whether an email was provided |
| `has_phone` | boolean | Whether a phone was provided |
| `material` | string | Material key |
| `urgency` | string | Urgency tier |
| `file_count` | number | Valid file count |
| `piece_count` | number | Unique piece types (= file_count in most cases) |
| `total_units` | number | Sum of all per-file quantities |
| `estimated_price_low` | number | Low estimate (rounded) |
| `estimated_price_high` | number | High estimate (rounded) |
| `value_estimate_mid` | number | Midpoint of range — use as revenue proxy for quote funnel |
| `currency` | string | Always `"EUR"` |
| `color` | boolean | Whether a color preference was specified |
| `multicolour` | boolean | Multicolour option |
| `customer_ref` | string? | First 16 hex chars of SHA-256(email) — only present when email provided |
| `quote_id` | string | UUID generated in browser; also used as `quote_requests.id` and forwarded to `quote_received` |
| `source_page` | string | `window.location.pathname` at submission time |

---

### `instant_checkout_initiated` · client
Fires immediately before redirecting to the Stripe checkout URL.  
**Where:** `src/components/StlEstimator.tsx` and `src/pages/PartPage.tsx`  
**Forwarded to GA4:** yes

| Property | Type | Description |
|---|---|---|
| `material` | string? | Material key (StlEstimator only; not set for PartPage) |
| `exact_price` | number? | Displayed print price before shipping (StlEstimator only) |
| `quantity` | number? | Total units (StlEstimator only) |
| `customer_ref` | string? | SHA-256 ref, only when email provided (StlEstimator only) |
| `value` | number | Base product price in EUR |
| `shipping_fee` | number | Shipping surcharge in EUR (0 for pickup) |
| `currency` | string | Always `"EUR"` |
| `fulfillment` | string | `"pickup"` \| `"shipping"` |
| `product_type` | string | `"stl_estimator"` \| `"part_page"` |
| `part_slug` | string? | Part slug (PartPage only) |
| `file_count` | number? | Count of STL files (StlEstimator only) |
| `total_units` | number | Total units ordered |

---

### `instant_checkout_completed` · client
Fires when the visitor returns from Stripe with `?checkout=success`. Properties come from a
`sessionStorage` stash written at checkout initiation — they survive the Stripe redirect.  
**Where:** `src/components/StlEstimator.tsx` (fires for both StlEstimator and PartPage checkouts,
since both redirect to `/?checkout=success`)

| Property | Type | Description |
|---|---|---|
| `value` | number? | Base product price in EUR |
| `shipping_fee` | number? | Shipping surcharge (0 for pickup) |
| `currency` | string? | `"EUR"` |
| `fulfillment` | string? | `"pickup"` \| `"shipping"` |
| `product_type` | string? | `"stl_estimator"` \| `"part_page"` |
| `part_slug` | string? | Part slug (PartPage only) |
| `file_count` | number? | STL file count (StlEstimator only) |
| `total_units` | number? | Total units |
| `material` | string? | Material key (StlEstimator only) |

---

### `instant_checkout_cancelled` · client
Fires when the visitor returns from Stripe with `?checkout=cancelled`.  
**Where:** `src/components/StlEstimator.tsx`

---

### `exit_intent_shown` · client
Fires when the exit-intent dialog is displayed (500 ms after closing the main modal without a purchase).  
**Where:** `src/components/StlEstimator.tsx`

---

### `exit_intent_recovered` · client
Fires when the user submits contact details through the exit-intent dialog.  
**Where:** `src/components/StlEstimator.tsx`

---

### `exit_intent_dismissed` · client
Fires when the user explicitly dismisses the exit-intent dialog.  
**Where:** `src/components/StlEstimator.tsx`

---

### `order_accepted` · client · admin-only
Fires when the admin marks a quote as accepted and generates a payment link.
Always has `is_internal: true` (fired from `/admin` path).  
**Where:** `src/pages/Admin.tsx`  
**Note:** This event is NOT in `src/lib/analyticsEvents.ts` (untyped). Covers manual payment methods
(Bizum, bank transfer, cash) that do not go through Stripe. Complement to `order_paid`.

| Property | Type | Description |
|---|---|---|
| `payment_method` | string | `"stripe_link"` \| `"bizum"` \| `"transfer"` \| etc. |
| `final_price` | number | Agreed price in EUR |
| `material` | string | Material key |
| `has_customer_email` | boolean | Whether customer email is on file |

---

## New events — Phase A

### `part_page_view` · client · **not forwarded to GA4**
Fires on mount of a part product page.  
**Where:** `src/pages/PartPage.tsx`

| Property | Type | Description |
|---|---|---|
| `part_slug` | string | Slug, e.g. `"/adaptador-vesa-monitor"` |
| `category` | string | `"adapter"` \| `"replacement"` |
| `price` | number | Base price in EUR |

---

### `part_fulfillment_selected` · client · **not forwarded to GA4**
Fires when the user switches between pickup and shipping on a part page.  
**Where:** `src/pages/PartPage.tsx`

| Property | Type | Description |
|---|---|---|
| `part_slug` | string | Part slug |
| `fulfillment` | string | `"pickup"` \| `"shipping"` |

---

### `part_buy_click` · client · **not forwarded to GA4**
Fires when the user taps "Buy now" (before checkout starts).  
**Where:** `src/pages/PartPage.tsx`

| Property | Type | Description |
|---|---|---|
| `part_slug` | string | Part slug |
| `value` | number | Total price shown (including shipping if selected) |
| `fulfillment` | string | `"pickup"` \| `"shipping"` |

---

### `catalog_card_click` · client · **not forwarded to GA4**
Fires when a catalog grid card is clicked.  
**Where:** `src/pages/Catalog.tsx`

| Property | Type | Description |
|---|---|---|
| `item_type` | string | `"part"` \| `"catalog"` |
| `slug` | string | Product/part slug |
| `position` | number | 0-based grid position |

---

### `catalog_product_view` · client · **not forwarded to GA4**
Fires on mount of a `/catalogo/:slug` product page.  
**Where:** `src/pages/CatalogProduct.tsx`

| Property | Type | Description |
|---|---|---|
| `slug` | string | Product slug |

---

### `catalog_request_submitted` · client · **not forwarded to GA4**
Fires when a customised catalog product request is successfully submitted.  
**Where:** `src/pages/CatalogProduct.tsx`

| Property | Type | Description |
|---|---|---|
| `slug` | string | Product slug |
| `value` | number | Low price point (EUR) |
| `customer_ref` | string? | SHA-256 ref, only when email provided |
| `source_page` | string | `window.location.pathname` at submission time |

---

### `nav_click` · client · **not forwarded to GA4**
Fires when the user clicks a navigation link.  
**Where:** `src/components/Header.tsx`

| Property | Type | Description |
|---|---|---|
| `menu` | string | `"main"` \| `"services"` \| `"resources"` |
| `label_key` | string | Stable identifier, e.g. `"catalog"`, `"file-checker"`, or `item.slugEn` |
| `href` | string | Destination path |

---

### `outbound_contact_click` · client · **not forwarded to GA4**
Fires for any anchor click whose href contains `wa.me`, `whatsapp.com`, `mailto:`, or `tel:`.
This is a separate event from `whatsapp_click` — compare the two to measure missed WhatsApp taps.  
**Where:** `src/App.tsx` → `OutboundContactTracker` (single delegated listener)

| Property | Type | Description |
|---|---|---|
| `channel` | string | `"whatsapp"` \| `"email"` \| `"phone"` |
| `element_location` | string | Closest ancestor id, or `"header"` / `"footer"` / `"nav"` / `"main"` / `"page"` |

---

### `file_upload_error` · client · **not forwarded to GA4**
Fires when an uploaded file cannot be parsed or is rejected.  
**Where:** `src/components/StlEstimator.tsx`

| Property | Type | Description |
|---|---|---|
| `reason` | string | `"not_stl"` \| `"size_exceeded"` \| `"parse_error"` |
| `file_type` | string | File extension (e.g. `"obj"`) or `"stl"` |

---

### `submit_error` · client · **not forwarded to GA4**
Fires when a Supabase database insert fails silently in a fire-and-forget path.
The control flow is unchanged — the user is not shown an error. This event makes failures visible.  
**Where:** `src/components/StlEstimator.tsx`

| Property | Type | Description |
|---|---|---|
| `stage` | string | `"estimate"` \| `"quote"` \| `"exit_intent"` |
| `table` | string | `"price_estimates"` \| `"quote_requests"` |
| `code` | string | Supabase Postgres error code (e.g. `"23502"` for NOT NULL violation) |

---

## New events — Phase B

### `order_paid` · server
Fires from `stripe-webhook` on `checkout.session.completed`.
Idempotent — PostHog `uuid` is set to the Stripe Session ID, so webhook retries do not
double-count. Covers **instant Stripe checkouts only** (StlEstimator and PartPage).
Manual payments (Bizum/transfer) are reflected in `order_accepted` instead.  
**Where:** `supabase/functions/stripe-webhook/index.ts`

| Property | Type | Description |
|---|---|---|
| `order_id` | string | Supabase `orders.id` UUID |
| `order_number` | string | Human-readable order number |
| `value` | number | Total charged in EUR (amount_total / 100) |
| `currency` | string | Always `"EUR"` for this store |
| `fulfillment` | string | `"pickup"` \| `"shipping"` |
| `product_type` | string | `"stl_estimator"` \| `"part_page"` |
| `part_slug` | string? | Part slug (part_page orders only) |
| `utm_source` | string? | First-touch UTM threaded from browser |
| `utm_medium` | string? | — |
| `utm_content` | string? | — (identifies Lemon NFC plaques) |
| `utm_campaign` | string? | — |
| `customer_ref` | string? | SHA-256 ref threaded from browser |
| `$session_id` | string? | PostHog session ID threaded from browser |

**distinct_id logic:** uses `ph_distinct_id` from Stripe metadata when available (links to the
visitor's PostHog profile); falls back to `"anon_<session.id>"` with
`$process_person_profile: false` (no ghost profile created).

---

### `quote_received` · server
Fires from `send-quote-request` after the notification email is sent.
Provides server-side confirmation that a quote request reached the backend.
Join to `quote_submitted` via `quote_id` to measure client→server delivery reliability.  
**Where:** `supabase/functions/send-quote-request/index.ts`

| Property | Type | Description |
|---|---|---|
| `quote_id` | string? | UUID generated in browser, matches `quote_submitted.quote_id` |
| `material` | string | Material key |
| `total_units` | number | Total units |
| `price_low` | number | Low estimate (rounded) |
| `price_high` | number | High estimate (rounded) |
| `source_city` | string? | Delivery city ref (if request came from a city landing page) |

**distinct_id logic:** uses `ph_distinct_id` forwarded from browser when available;
falls back to `"srv_<16-hex>"` with `$process_person_profile: false`.

---

## Legacy server events

These events predate this tracking overhaul and have been updated to use a fresh
`"srv_<16-hex>"` distinct_id per call (with `$process_person_profile: false`) instead
of the old shared `"server"` string.

### `"review received"` · server
Event name contains a space — do not rename. Fires in `send-review`.  
Properties: `rating`, `has_order_reference`

### `"review approved"` · server
Event name contains a space — do not rename. Fires in `approve-review`.  
Properties: `review_id`

### `"review rejected"` · server
Event name contains a space — do not rename. Fires in `approve-review`.  
Properties: `review_id`

### `"print request processed"` · server
Fires in `send-print-request`. Properties: `is_urgent`

### `"maker application submitted"` · server
Fires in `send-maker-application` (unchanged from pre-overhaul). Do not rename.

---

## Identity

`posthog.identify(customer_ref)` is called after `quote_submitted`, `instant_checkout_initiated`,
and `catalog_request_submitted` — **only if the user has accepted cookies**
(`localStorage["cookie-consent"] === "accepted"`).

`customer_ref` = first 16 hex chars of `SHA-256(email.trim().toLowerCase())`.
This is a one-way pseudonym that lets you join sessions to orders in PostHog without storing PII.
Source: `src/lib/customerRef.ts`.

---

## Internal traffic filtering

Any client event with `is_internal: true` comes from the site owner.
Filter these out in dashboards with `WHERE properties.is_internal = false OR properties.is_internal IS NULL`.

Set the flag permanently: visit any page with `?internal=1`.  
Clear it: `?internal=0`.
