# Event Dictionary and Funnel Definition

## Conversion funnel

```
$pageview
  → upload_area_view       (calculator section ≥50% visible)
  → upload_started         (file picked or dropped)
  → file_parsed            (status: ok | error)
  → estimate_shown         (price bucket, time_to_price_ms)
  → buy_clicked / review_clicked / whatsapp_from_modal
  → stripe_redirect        (just before Stripe redirect)
  → checkout_returned      (result: success | cancelled)
  → (PostHog server: order_paid)
```

## Events

### Funnel events

| Event | Properties | Notes |
|---|---|---|
| `$pageview` | auto | PostHog built-in |
| `upload_area_view` | `page_type` | Calculator section ≥50% visible once per page view |
| `upload_started` | `method` (drop/click), `file_count` | File picker opened or drag released |
| `file_parsed` | `status` (ok/error), `size_kb`, `ext`, `reason?` | Per-file, after STL parse |
| `estimate_shown` | `price_eur_bucket` (<15/15-30/30-60/60-100/>100), `time_to_price_ms`, `file_count` | When modal opens after valid parse |
| `config_changed` | `field` (material/quantity/colour/quality/urgency), `value` | User changes a setting |
| `fulfillment_chosen` | `type` (pickup/shipping) | Pickup or shipping selected |
| `contact_entered` | `field` (email/phone/notes) | First character typed per field |
| `buy_clicked` | `price_eur_bucket` | "Buy now" button clicked |
| `review_clicked` | `source` | "Free review" clicked |
| `whatsapp_from_modal` | `source` | WhatsApp button clicked from modal |
| `stripe_redirect` | `price_eur`, `fulfillment` | Fired just before redirect to Stripe |
| `checkout_returned` | `result` (success/cancelled) | Browser returns from Stripe |
| `modal_time_open` | `duration_ms` | On modal close |

### Engagement events

| Event | Properties | Notes |
|---|---|---|
| `scroll_depth` | `depth` (25/50/75/100) | Once per depth threshold per page view |
| `section_view` | `section`, `page_type` | When section ≥50% visible |
| `cta_click` | `cta_id`, `section`, `text_variant` | Any primary/secondary button |

Sections tracked: `hero`, `reviews`, `how-it-works`, `calculator`, `materials`, `faq`, `footer`, `b2b`.

### Experiment events

| Event | Properties | Notes |
|---|---|---|
| `experiment_exposure` | `experiment`, `variant`, `layer`, `page_path`, `lang`, `forced` | IntersectionObserver ≥50%/≥1s, once per session |
| `exit_reason` | `reason`, `price_eur_bucket` | "What stopped you?" micro-survey answer |

### Enrichment (on every event)

- `page_path` — current pathname
- `page_type` — home / page / catalog / etc.
- `site_language` — preferred language
- `is_internal` — owner sessions excluded
- `xp_<experiment_id>` — variant assignment per active experiment
- `utm_source/medium/content/campaign` — from stored UTM

## Primary metrics per experiment

| Experiment | Layer | Primary metric | Guardrail |
|---|---|---|---|
| `header_btn_r2` | header | `instant_checkout_initiated` | `whatsapp_click` |
| `modal_actions_r1` | checkout_modal | `instant_checkout_initiated` | `whatsapp_click` |
| `home_proof_r1` | home_body | `upload_started` | — |
| `upload_area_r1` | upload_area | `upload_started` per `upload_area_view` | — |
