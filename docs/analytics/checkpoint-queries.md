# HogQL queries — Dimension3D checkpoint

Every query runs in PostHog project 208342 (EU host). Replace `<DATE_FROM>` with the
start of the audit window.

## Funnel by page group

```sql
SELECT
    page_group,
    countIf(event = 'estimate_shown') AS estimates,
    countIf(event = 'buy_clicked') AS buy_clicks,
    countIf(event = 'checkout_succeeded') AS paid
FROM events
WHERE timestamp >= '<DATE_FROM>'
GROUP BY page_group
ORDER BY estimates DESC
```

## Failures by code

```sql
SELECT
    properties.code AS code,
    count() AS n,
    uniq(distinct_id) AS people
FROM events
WHERE event = 'checkout_failed'
  AND timestamp >= '<DATE_FROM>'
GROUP BY code
ORDER BY n DESC
```

## Success rate by file type

```sql
SELECT
    coalesce(properties.file_ext, 'stl') AS ext,
    countIf(event = 'estimate_shown') AS tries,
    countIf(event = 'checkout_succeeded') AS paid,
    paid / nullif(tries, 0) AS rate
FROM events
WHERE timestamp >= '<DATE_FROM>'
GROUP BY ext
ORDER BY tries DESC
```

## Time-to-price distribution

```sql
SELECT
    quantiles(0.5, 0.9, 0.99)(properties.estimate_ms) AS p50_p90_p99
FROM events
WHERE event = 'estimate_shown'
  AND properties.estimate_ms IS NOT NULL
  AND timestamp >= '<DATE_FROM>'
```

## Messy share (how often meshes are robust-repaired)

```sql
SELECT
    sumIf(1, properties.mesh_watertight = false) / nullif(count(), 0) AS messy_share
FROM events
WHERE event = 'estimate_shown'
  AND timestamp >= '<DATE_FROM>'
```

## Buy = Stripe audit (server vs client totals)

```sql
SELECT
    event,
    properties.code AS code,
    properties.client_total_cents AS client,
    properties.legacy_server_total_cents AS server,
    client - server AS delta_cents,
    properties.page_group AS page_group,
    timestamp
FROM events
WHERE event = 'checkout_failed'
  AND properties.legacy_server_total_cents IS NOT NULL
  AND timestamp >= '<DATE_FROM>'
ORDER BY abs(delta_cents) DESC
LIMIT 100
```
