# hero_cta_r1 — Hero CTA Experiment Round 1

**Start date:** 2026-10-02  
**Status:** Running

## Hypothesis

Visitors without a ready 3D file convert better when the primary CTA is WhatsApp photo-sharing rather than a file upload prompt. A lower-friction entry ("send a photo") will increase top-of-funnel contacts and ultimately orders.

## Variants

| Variant | Description |
|---|---|
| `control` | Current hero: single "Presupuesto gratis al instante" upload CTA (variant="cta" button) |
| `photo_first` | Primary: green WhatsApp button "Envíanos una foto por WhatsApp"; tagline below; secondary text link "¿Ya tienes el archivo 3D? Calcula el precio →" pointing to the calculator |

Split: 50/50, randomised on first page load, persisted to sessionStorage (pre-consent) or localStorage (post-consent).

## Pages in scope

- `/` — Homepage (`Hero.tsx`)
- All landing pages (`LandingPage.tsx`) — customer audience only (maker pages excluded)
- All city delivery pages (`CityDeliveryPage.tsx`)

Excluded: `/lemon`, parts pages, `/catalogo`, admin.

## Implementation

- Assignment: `src/lib/experiments.ts` — `getHeroCTAVariant()`
- Anti-flicker: inline `<style>` + `<script>` in `index.html` `<head>` sets `document.documentElement.dataset.xpHeroCtaR1` before body paints
- CSS hides non-assigned variant; both variants prerendered (no hydration mismatch, zero CLS)
- QA override: `?xp_hero=control|photo_first` (persists for session, marks `xp_forced:true`)

## Events

| Event | When fired |
|---|---|
| `experiment_exposure` | Once per session on first render of any in-scope page |
| `whatsapp_click { location: "hero_xp" }` | photo_first primary button click |
| `quote_cta_click { source: "hero_cta" }` | control button click (existing) |

## HogQL queries

### Exposed sessions per variant

```sql
SELECT
  properties.xp_hero_cta_r1 AS variant,
  count(DISTINCT session_id) AS exposed_sessions
FROM events
WHERE event = 'experiment_exposure'
  AND properties.experiment = 'hero_cta_r1'
  AND timestamp >= '2026-10-02'
GROUP BY variant
```

### PRIMARY metric — conversion rate (any contact or quote action)

Numerator: sessions with at least one of `whatsapp_click`, `outbound_contact_click` (channel=whatsapp), `estimate_generated`, `quote_submitted`, `instant_checkout_initiated`.

```sql
WITH exposed AS (
  SELECT session_id, any(properties.xp_hero_cta_r1) AS variant
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment = 'hero_cta_r1'
    AND timestamp >= '2026-10-02'
  GROUP BY session_id
),
converted AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE event IN ('whatsapp_click','estimate_generated','quote_submitted','instant_checkout_initiated')
    OR (event = 'outbound_contact_click' AND properties.channel = 'whatsapp')
    AND timestamp >= '2026-10-02'
)
SELECT
  e.variant,
  count(*) AS exposed,
  countIf(c.session_id IS NOT NULL) AS converted,
  round(100.0 * countIf(c.session_id IS NOT NULL) / count(*), 2) AS cvr_pct
FROM exposed e
LEFT JOIN converted c ON e.session_id = c.session_id
GROUP BY e.variant
```

### SECONDARY metric — downstream revenue proxy

```sql
WITH exposed AS (
  SELECT session_id, any(properties.xp_hero_cta_r1) AS variant
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment = 'hero_cta_r1'
    AND timestamp >= '2026-10-02'
  GROUP BY session_id
),
orders AS (
  SELECT session_id, sum(toFloat64OrNull(properties.value)) AS order_value
  FROM events
  WHERE event IN ('order_paid', 'quote_submitted')
    AND timestamp >= '2026-10-02'
  GROUP BY session_id
)
SELECT
  e.variant,
  count(*) AS exposed,
  countIf(o.session_id IS NOT NULL) AS ordering_sessions,
  round(sum(o.order_value), 2) AS total_value,
  round(avg(o.order_value), 2) AS avg_order_value
FROM exposed e
LEFT JOIN orders o ON e.session_id = o.session_id
GROUP BY e.variant
```

### GUARDRAIL — sample ratio check

```sql
SELECT
  properties.xp_hero_cta_r1 AS variant,
  count(DISTINCT session_id) AS n
FROM events
WHERE event = 'experiment_exposure'
  AND properties.experiment = 'hero_cta_r1'
  AND timestamp >= '2026-10-02'
GROUP BY variant
```

Expected ratio: ~50/50. Flag if either variant is below 45% of total.
