# Experiment Health Checks

> **UNVERIFIED** — these HogQL queries have been written from the event schema in code
> but have not been run against live data. Validate the first run carefully.
> Always filter `is_internal != true` and `xp_forced != true` for analysis.

Experiment IDs: `hero_pkg_r1`, `header_btn_r1`, `float_label_r1`, `calc_title_r1`
Analytics properties: `xp_hero_pkg_r1`, `xp_header_btn_r1`, `xp_float_label_r1`, `xp_calc_title_r1`

---

## a) Exposures per version + split deviation (sample-ratio check)

```sql
SELECT
  properties.experiment            AS experiment,
  properties.xp_hero_pkg_r1        AS xp_hero,
  properties.xp_header_btn_r1      AS xp_header,
  properties.xp_float_label_r1     AS xp_float,
  properties.xp_calc_title_r1      AS xp_calc,
  properties.version               AS version,
  count(DISTINCT session_id)        AS exposed_sessions,
  round(
    100.0 * count(DISTINCT session_id)
    / sum(count(DISTINCT session_id)) OVER (PARTITION BY properties.experiment),
    1
  ) AS pct_of_experiment
FROM events
WHERE event = 'experiment_exposure'
  AND properties.is_internal != true
  AND properties.xp_forced != true
  AND timestamp >= '2026-10-03'
GROUP BY 1,2,3,4,5,6
ORDER BY experiment, version
```

Expected: each version ~25%. Flag any version below 20% or above 30% (±5 pp from 25%).

---

## b) visible_ok share and experiment_error counts

```sql
-- Share of exposures with visible_ok = true
SELECT
  properties.experiment   AS experiment,
  countIf(properties.visible_ok = true)  AS visible_ok_count,
  count(*)                               AS total_exposures,
  round(100.0 * countIf(properties.visible_ok = true) / count(*), 1) AS visible_ok_pct
FROM events
WHERE event = 'experiment_exposure'
  AND properties.is_internal != true
  AND timestamp >= '2026-10-03'
GROUP BY experiment
ORDER BY experiment
```

```sql
-- experiment_error counts by experiment and reason
SELECT
  properties.experiment AS experiment,
  properties.reason     AS reason,
  count(*)              AS error_count
FROM events
WHERE event = 'experiment_error'
  AND properties.is_internal != true
  AND timestamp >= '2026-10-03'
GROUP BY experiment, reason
ORDER BY experiment, error_count DESC
```

---

## c) Property coverage — share of events carrying each xp_* value, last 7 days

```sql
SELECT
  toDate(timestamp)                                             AS day,
  round(100.0 * countIf(properties.xp_hero_pkg_r1    IS NOT NULL) / count(*), 1) AS hero_pct,
  round(100.0 * countIf(properties.xp_header_btn_r1  IS NOT NULL) / count(*), 1) AS header_pct,
  round(100.0 * countIf(properties.xp_float_label_r1 IS NOT NULL) / count(*), 1) AS float_pct,
  round(100.0 * countIf(properties.xp_calc_title_r1  IS NOT NULL) / count(*), 1) AS calc_pct,
  count(*) AS total_events
FROM events
WHERE timestamp >= now() - INTERVAL 7 DAY
  AND properties.is_internal != true
GROUP BY day
ORDER BY day DESC
```

---

## d) Sessions with xp_* = "n/a" (unsupported language)

```sql
SELECT
  properties.xp_hero_pkg_r1    AS xp_hero,
  properties.xp_header_btn_r1  AS xp_header,
  properties.xp_float_label_r1 AS xp_float,
  properties.xp_calc_title_r1  AS xp_calc,
  count(DISTINCT session_id)   AS sessions
FROM events
WHERE event = 'experiment_exposure'
  AND (
    properties.xp_hero_pkg_r1    = 'n/a'
    OR properties.xp_header_btn_r1  = 'n/a'
    OR properties.xp_float_label_r1 = 'n/a'
    OR properties.xp_calc_title_r1  = 'n/a'
  )
  AND properties.is_internal != true
  AND timestamp >= '2026-10-03'
GROUP BY 1,2,3,4
ORDER BY sessions DESC
```

---

## e) Per-version PRIMARY metrics

### e1) hero_pkg_r1 — step toward ordering

Exposed sessions that took at least one of: uploaded a file / clicked hero button /
submitted quote or design request / started checkout / clicked a WhatsApp link
**excluding** `location = "header"`, `location = "header_mobile"`, `location = "floating"`.

```sql
WITH exposed AS (
  SELECT session_id, any(properties.version) AS version
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment = 'hero_pkg_r1'
    AND properties.is_internal != true
    AND properties.xp_forced != true
    AND timestamp >= '2026-10-03'
  GROUP BY session_id
),
converted AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE timestamp >= '2026-10-03'
    AND (
      event IN ('estimate_generated', 'quote_submitted', 'instant_checkout_initiated', 'design_request_submitted')
      OR (event = 'quote_cta_click' AND properties.location = 'hero')
      OR (
        event = 'whatsapp_click'
        AND properties.location NOT IN ('header', 'header_mobile', 'floating')
      )
    )
)
SELECT
  e.version,
  count(*) AS exposed,
  countIf(c.session_id IS NOT NULL) AS converted,
  round(100.0 * countIf(c.session_id IS NOT NULL) / count(*), 2) AS cvr_pct
FROM exposed e
LEFT JOIN converted c ON e.session_id = c.session_id
GROUP BY e.version
ORDER BY e.version
```

### e2) header_btn_r1 — quote_cta_click from header

```sql
WITH exposed AS (
  SELECT session_id, any(properties.version) AS version
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment = 'header_btn_r1'
    AND properties.is_internal != true
    AND properties.xp_forced != true
    AND timestamp >= '2026-10-03'
  GROUP BY session_id
),
clicked AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE event = 'quote_cta_click'
    AND properties.location IN ('header', 'header_mobile')
    AND timestamp >= '2026-10-03'
)
SELECT
  e.version,
  count(*) AS exposed,
  countIf(c.session_id IS NOT NULL) AS clicked,
  round(100.0 * countIf(c.session_id IS NOT NULL) / count(*), 2) AS click_rate_pct
FROM exposed e
LEFT JOIN clicked c ON e.session_id = c.session_id
GROUP BY e.version
ORDER BY e.version
```

### e3) float_label_r1 — whatsapp_click location floating

```sql
WITH exposed AS (
  SELECT session_id, any(properties.version) AS version
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment = 'float_label_r1'
    AND properties.is_internal != true
    AND properties.xp_forced != true
    AND timestamp >= '2026-10-03'
  GROUP BY session_id
),
clicked AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE event = 'whatsapp_click'
    AND properties.location = 'floating'
    AND timestamp >= '2026-10-03'
)
SELECT
  e.version,
  count(*) AS exposed,
  countIf(c.session_id IS NOT NULL) AS clicked,
  round(100.0 * countIf(c.session_id IS NOT NULL) / count(*), 2) AS click_rate_pct
FROM exposed e
LEFT JOIN clicked c ON e.session_id = c.session_id
GROUP BY e.version
ORDER BY e.version
```

### e4) calc_title_r1 — estimate_generated per calculator_seen session

```sql
WITH seen AS (
  SELECT session_id, any(properties.version) AS version
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment = 'calc_title_r1'
    AND properties.is_internal != true
    AND properties.xp_forced != true
    AND timestamp >= '2026-10-03'
  GROUP BY session_id
),
estimated AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE event = 'estimate_generated'
    AND timestamp >= '2026-10-03'
)
SELECT
  s.version,
  count(*) AS seen_sessions,
  countIf(e.session_id IS NOT NULL) AS estimated,
  round(100.0 * countIf(e.session_id IS NOT NULL) / count(*), 2) AS estimate_rate_pct
FROM seen s
LEFT JOIN estimated e ON s.session_id = e.session_id
GROUP BY s.version
ORDER BY s.version
```

---

## f) GUARDRAIL — downstream conversions per version

```sql
WITH exposed AS (
  SELECT
    properties.experiment AS experiment,
    session_id,
    any(properties.version) AS version
  FROM events
  WHERE event = 'experiment_exposure'
    AND properties.experiment IN ('hero_pkg_r1','header_btn_r1','float_label_r1','calc_title_r1')
    AND properties.is_internal != true
    AND properties.xp_forced != true
    AND timestamp >= '2026-10-03'
  GROUP BY experiment, session_id
),
orders AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE event IN ('quote_submitted', 'instant_checkout_initiated', 'design_request_submitted')
    AND timestamp >= '2026-10-03'
)
SELECT
  e.experiment,
  e.version,
  count(*) AS exposed,
  countIf(o.session_id IS NOT NULL) AS ordering_sessions,
  round(100.0 * countIf(o.session_id IS NOT NULL) / count(*), 2) AS guardrail_cvr_pct
FROM exposed e
LEFT JOIN orders o ON e.session_id = o.session_id
GROUP BY e.experiment, e.version
ORDER BY e.experiment, e.version
```

No version's guardrail CVR should be meaningfully lower than Version 1 of the same experiment.

---

## g) Days remaining until endsOn (2026-12-28)

```sql
SELECT dateDiff('day', now(), toDateTime('2026-12-28 00:00:00')) AS days_remaining
```

---

## h) Excluded session counts

```sql
SELECT
  countIf(properties.is_internal = true) AS internal_sessions,
  countIf(properties.xp_forced = true)   AS forced_sessions,
  count(*) AS total_exposure_events
FROM events
WHERE event = 'experiment_exposure'
  AND timestamp >= '2026-10-03'
```

---

## i) Location-label coverage — null location, last 7 days

```sql
SELECT
  event,
  countIf(properties.location IS NULL OR properties.location = '') AS null_location,
  count(*) AS total,
  round(100.0 * countIf(properties.location IS NULL OR properties.location = '') / count(*), 1) AS null_pct
FROM events
WHERE event IN ('quote_cta_click', 'whatsapp_click')
  AND timestamp >= now() - INTERVAL 7 DAY
  AND properties.is_internal != true
GROUP BY event
ORDER BY event
```

Target: `null_pct` = 0 for both events after Prompt 2 is deployed.
