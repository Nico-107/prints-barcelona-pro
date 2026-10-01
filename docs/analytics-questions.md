# Analytics Business Questions

12 business questions and the exact PostHog HogQL query for each.
Run queries in **PostHog → Data Management → HogQL** (or any Insight with HogQL mode).

All property names match what is implemented in this repo. See `docs/analytics-events.md`
for the full event and property reference.

**Standard filter — add to every dashboard tile:**
```sql
WHERE properties.is_internal = false OR properties.is_internal IS NULL
```
This removes owner-testing sessions. Server events (`order_paid`, `quote_received`) do not
carry `is_internal`, so the `IS NULL` branch keeps them.

---

## 1. Paid revenue by utm_content (per Lemon plaque) per month

`order_paid` carries `utm_content` from the Stripe Session metadata, which was threaded
from the browser at checkout time. Each Lemon NFC plaque has a distinct `utm_content` value.

```sql
SELECT
    toStartOfMonth(timestamp)                       AS month,
    coalesce(properties.utm_content, '(unattributed)') AS plaque,
    count()                                         AS orders,
    round(sum(toFloat(properties.value)), 2)        AS revenue_eur
FROM events
WHERE event = 'order_paid'
GROUP BY month, plaque
ORDER BY month DESC, revenue_eur DESC
```

**Note:** Covers instant Stripe checkouts only. Manual orders (Bizum/transfer) are in
`order_accepted` (`final_price` property) but do not carry UTM data.

---

## 2. Taps → quote → paid funnel per plaque

Use PostHog **Funnels** Insight for person-level conversion rates. Configure three steps:

| Step | Event | Filter |
|---|---|---|
| 1 | `$pageview` | `utm_content` is set |
| 2 | `quote_submitted` OR `instant_checkout_initiated` | — |
| 3 | `order_paid` | — |

**Breakdown:** `utm_content`

For a SQL view of raw step counts per plaque (not person-level):

```sql
SELECT
    coalesce(properties.utm_content, '(unattributed)') AS plaque,
    countIf(event = '$pageview')                        AS pageviews,
    countIf(event IN ('quote_submitted',
                      'instant_checkout_initiated'))    AS quoted_or_initiated,
    countIf(event = 'order_paid')                       AS paid
FROM events
WHERE (properties.utm_content IS NOT NULL AND properties.utm_content != '')
   OR event = 'order_paid'
GROUP BY plaque
ORDER BY paid DESC
```

---

## 3. Revenue and order count by acquisition channel

`order_paid` carries UTM threaded from the browser. Group by `utm_source` for channel,
`utm_medium` for medium.

```sql
SELECT
    coalesce(properties.utm_source, '(direct)')  AS source,
    coalesce(properties.utm_medium, '(none)')    AS medium,
    count()                                       AS orders,
    round(sum(toFloat(properties.value)), 2)      AS revenue_eur,
    round(avg(toFloat(properties.value)), 2)      AS avg_order_value
FROM events
WHERE event = 'order_paid'
GROUP BY source, medium
ORDER BY revenue_eur DESC
```

To include manual orders, union with `order_accepted`:

```sql
SELECT source, medium, count() AS orders, round(sum(value), 2) AS revenue_eur
FROM (
    SELECT
        coalesce(properties.utm_source, '(direct)')  AS source,
        coalesce(properties.utm_medium, '(none)')    AS medium,
        toFloat(properties.value)                    AS value
    FROM events
    WHERE event = 'order_paid'
    UNION ALL
    SELECT
        '(admin)'                                    AS source,
        '(manual)'                                   AS medium,
        toFloat(properties.final_price)              AS value
    FROM events
    WHERE event = 'order_accepted'
)
GROUP BY source, medium
ORDER BY revenue_eur DESC
```

---

## 4. WhatsApp clicks by page — and outbound_contact_click vs whatsapp_click gap

Two queries to compare coverage. The gap reveals WhatsApp CTAs tracked by the delegated
listener (`outbound_contact_click`) but missed by the explicit calculator button
(`whatsapp_click`).

**4a — outbound_contact_click (channel = whatsapp) by page:**
```sql
SELECT
    properties.page_path                           AS page,
    properties.element_location                    AS location,
    count()                                        AS clicks
FROM events
WHERE event = 'outbound_contact_click'
  AND properties.channel = 'whatsapp'
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY page, location
ORDER BY clicks DESC
```

**4b — legacy whatsapp_click by page:**
```sql
SELECT
    coalesce(properties.path, properties.page_path) AS page,
    count()                                          AS clicks
FROM events
WHERE event = 'whatsapp_click'
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY page
ORDER BY clicks DESC
```

**Gap = (4a total) − (4b total).** A large gap means CTAs outside the calculator
are driving WhatsApp contact but not being counted by the legacy event.

---

## 5. Parts pages funnel: part_page_view → part_buy_click → order_paid

Use PostHog **Funnels** Insight for conversion rates. Configure:

| Step | Event | Filter |
|---|---|---|
| 1 | `part_page_view` | — |
| 2 | `part_buy_click` | — |
| 3 | `order_paid` | `product_type = "part_page"` |

**Breakdown:** `part_slug`

For a SQL view of step counts per part:

```sql
SELECT
    properties.part_slug                         AS part,
    countIf(event = 'part_page_view')            AS views,
    countIf(event = 'part_buy_click')            AS buy_clicks,
    countIf(event = 'order_paid'
        AND properties.product_type = 'part_page') AS paid
FROM events
WHERE (properties.is_internal = false OR properties.is_internal IS NULL)
  AND (event IN ('part_page_view', 'part_buy_click')
       OR (event = 'order_paid' AND properties.product_type = 'part_page'))
GROUP BY part
ORDER BY views DESC
```

---

## 6. Where uploads fail — file_upload_error by reason

```sql
SELECT
    properties.reason                              AS reason,
    properties.file_type                           AS file_type,
    count()                                        AS errors,
    toStartOfWeek(timestamp)                       AS week
FROM events
WHERE event = 'file_upload_error'
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY reason, file_type, week
ORDER BY week DESC, errors DESC
```

For an all-time summary without date breakdown:

```sql
SELECT
    properties.reason    AS reason,
    properties.file_type AS file_type,
    count()              AS total_errors
FROM events
WHERE event = 'file_upload_error'
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY reason, file_type
ORDER BY total_errors DESC
```

---

## 7. Quote-to-paid conversion rate and median time to pay

Use PostHog **Funnels** Insight for accurate person-level conversion and median time.
Configure:

| Step | Event |
|---|---|
| 1 | `quote_submitted` |
| 2 | `order_paid` |

**Conversion window:** 30 days. The funnel will show median time between steps.

For a SQL conversion rate using `customer_ref` to join across sessions:

```sql
WITH
    quotes AS (
        SELECT
            properties.customer_ref        AS ref,
            properties.quote_id            AS qid,
            min(timestamp)                 AS quoted_at
        FROM events
        WHERE event = 'quote_submitted'
          AND isNotNull(properties.customer_ref)
          AND (properties.is_internal = false OR properties.is_internal IS NULL)
        GROUP BY ref, qid
    ),
    paid AS (
        SELECT
            properties.customer_ref        AS ref,
            min(timestamp)                 AS paid_at
        FROM events
        WHERE event = 'order_paid'
          AND isNotNull(properties.customer_ref)
        GROUP BY ref
    )
SELECT
    count(DISTINCT q.ref)                                   AS unique_quoters,
    count(DISTINCT p.ref)                                   AS converted_to_paid,
    round(100.0 * count(DISTINCT p.ref)
          / count(DISTINCT q.ref), 1)                       AS conversion_pct,
    round(avg(dateDiff('hour', q.quoted_at, p.paid_at)), 1) AS avg_hours_to_pay
FROM quotes q
LEFT JOIN paid p ON q.ref = p.ref AND p.paid_at >= q.quoted_at
```

**Limitation:** `customer_ref` requires the customer to have provided an email.
Sessions without email input will not be joinable.

---

## 8. Orders and revenue by material and by product_type

**By product_type** (use `order_paid`):
```sql
SELECT
    coalesce(properties.product_type, '(unknown)') AS product_type,
    count()                                         AS orders,
    round(sum(toFloat(properties.value)), 2)        AS revenue_eur
FROM events
WHERE event = 'order_paid'
GROUP BY product_type
ORDER BY revenue_eur DESC
```

**By material** — `order_paid` does not carry material. Use `instant_checkout_initiated`
as a proxy (it carries `material` and fires just before payment):

```sql
SELECT
    coalesce(properties.material, '(unknown)') AS material,
    count()                                     AS checkout_initiations,
    round(sum(toFloat(properties.value)), 2)   AS value_eur
FROM events
WHERE event = 'instant_checkout_initiated'
  AND isNotNull(properties.material)
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY material
ORDER BY value_eur DESC
```

**Note:** `instant_checkout_initiated` includes abandoned checkouts (user left Stripe
without paying). For confirmed paid orders by material, cross-reference with
`order_accepted.material` (which covers the quote flow where material is always present):

```sql
SELECT
    properties.material                            AS material,
    count()                                        AS accepted_quotes,
    round(sum(toFloat(properties.final_price)), 2) AS revenue_eur
FROM events
WHERE event = 'order_accepted'
GROUP BY material
ORDER BY revenue_eur DESC
```

---

## 9. Which blog/landing pages precede a quote or purchase

`quote_submitted` and `instant_checkout_initiated` are auto-enriched with `page_path`
and `page_type` at the moment they fire. This tells you which page the user was on
when they converted.

```sql
SELECT
    properties.page_path                      AS page,
    properties.page_type                      AS page_type,
    properties.site_language                  AS language,
    countIf(event = 'quote_submitted')        AS quotes,
    countIf(event = 'instant_checkout_initiated') AS checkout_starts
FROM events
WHERE event IN ('quote_submitted', 'instant_checkout_initiated')
  AND properties.page_type IN ('blog', 'landing', 'city', 'international', 'lemon')
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY page, page_type, language
ORDER BY quotes + checkout_starts DESC
```

For the "last page visited before conversion" (i.e., the referrer page, not the
conversion page), use PostHog **Paths** Insight:
- Target event: `quote_submitted`
- Direction: **backwards**
- This shows the paths leading to a quote.

---

## 10. Repeat customers — customer_ref with 2+ order_paid

```sql
SELECT
    properties.customer_ref                        AS customer_ref,
    count()                                        AS paid_orders,
    round(sum(toFloat(properties.value)), 2)       AS lifetime_value_eur,
    min(timestamp)                                 AS first_order,
    max(timestamp)                                 AS last_order
FROM events
WHERE event = 'order_paid'
  AND isNotNull(properties.customer_ref)
  AND properties.customer_ref != ''
GROUP BY customer_ref
HAVING paid_orders >= 2
ORDER BY lifetime_value_eur DESC
```

`customer_ref` is the pseudonymous SHA-256 digest of the customer's email — never the
email itself. To look up an individual, compute `SHA-256(email.trim().toLowerCase())`
and take the first 16 hex chars.

**Limitation:** `customer_ref` is only threaded into `order_paid` when the customer
provided an email at checkout. Part-page orders without email will not appear here.

---

## 11. Silent submit failures — submit_error by stage

```sql
SELECT
    toStartOfDay(timestamp)                        AS day,
    properties.stage                               AS stage,
    properties.table                               AS table,
    properties.code                                AS pg_error_code,
    count()                                        AS failures
FROM events
WHERE event = 'submit_error'
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY day, stage, table, pg_error_code
ORDER BY day DESC, failures DESC
```

For an all-time summary:

```sql
SELECT
    properties.stage    AS stage,
    properties.table    AS db_table,
    properties.code     AS pg_error_code,
    count()             AS total_failures,
    max(timestamp)      AS last_seen
FROM events
WHERE event = 'submit_error'
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY stage, db_table, pg_error_code
ORDER BY total_failures DESC
```

A spike in `stage = "quote"` means quote requests are failing to reach the database
silently. The user still sees "success" — this is the only signal that something is wrong.

---

## 12. Conversion by page_type and site_language

```sql
SELECT
    properties.page_type                       AS page_type,
    properties.site_language                   AS language,
    countIf(event = '$pageview')               AS pageviews,
    countIf(event = 'quote_submitted')         AS quotes,
    countIf(event = 'instant_checkout_initiated') AS checkout_starts,
    round(100.0 * countIf(event = 'quote_submitted')
          / nullIf(countIf(event = '$pageview'), 0), 2) AS quote_rate_pct
FROM events
WHERE event IN ('$pageview', 'quote_submitted', 'instant_checkout_initiated')
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY page_type, language
ORDER BY pageviews DESC
```

To see conversion rate by language alone (all page types):

```sql
SELECT
    properties.site_language                   AS language,
    countIf(event = '$pageview')               AS pageviews,
    countIf(event = 'quote_submitted')         AS quotes,
    round(100.0 * countIf(event = 'quote_submitted')
          / nullIf(countIf(event = '$pageview'), 0), 2) AS quote_rate_pct
FROM events
WHERE event IN ('$pageview', 'quote_submitted')
  AND (properties.is_internal = false OR properties.is_internal IS NULL)
GROUP BY language
ORDER BY pageviews DESC
```

---

## Answerable / Not-fully-answerable summary

| # | Question | Status | Gap (if any) |
|---|---|---|---|
| 1 | Revenue by plaque per month | **Fully answerable** | — |
| 2 | Taps→quote→paid funnel per plaque | **Fully answerable** | Use Funnels UI for person-level rates |
| 3 | Revenue by acquisition channel | **Fully answerable** | Manual orders lack UTM |
| 4 | WhatsApp clicks by page + gap | **Fully answerable** | — |
| 5 | Parts funnel | **Fully answerable** | Use Funnels UI for person-level rates |
| 6 | Upload failures by reason | **Fully answerable** | — |
| 7 | Quote-to-paid conversion + time | **Partially answerable** | Requires email to join; sessions without email are invisible |
| 8 | Orders by material | **Partially answerable** | `order_paid` lacks material; use `instant_checkout_initiated` (includes abandoned) + `order_accepted` (manual) |
| 9 | Pages preceding conversion | **Fully answerable** | Use Paths for referrer chain; `page_path` on conversion event shows the page where they converted |
| 10 | Repeat customers | **Partially answerable** | Only for customers who provided email at Stripe checkout |
| 11 | Silent submit failures | **Fully answerable** | — |
| 12 | Conversion by page_type + language | **Fully answerable** | — |
