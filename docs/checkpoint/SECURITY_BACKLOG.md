# Security backlog — findings only (next prompt handles the overhaul)

This checkpoint deliberately skips the security overhaul; R1 collects the findings so the
next autonomous run can plan it. No fixes in this file — only observations with enough
context to triage.

## Secrets & environment

- `STRIPE_SECRET_KEY` currently lives in the edge-function env; confirmed not referenced in
  any frontend bundle grep.
- `SUPABASE_SERVICE_ROLE_KEY` used by webhook / admin-stripe-sync / packlink-status-hook /
  daily-digest. Rotate when the deploy prompt lands.
- `PACKLINK_HOOK_SECRET` is newly introduced in D7 config.toml and the hook function.
  Generate with `openssl rand -hex 24` before Zapier wiring (R4).
- `CRON_AUTH` for daily-digest; stored as function env.

## RLS / row-level access

- `webhook_events`, `email_log`, `checkout_failures`, `leads` have no explicit RLS policies
  in the new migration — the admin role needs grants that match the existing pattern for
  `orders`. Tracked for the security prompt because the default-no-access deny is correct
  for the anonymous role but breaks the new admin UI tabs (O10-O13) until a policy ships.

## CORS & auth

- `pricing-config`, `packlink-status-hook`, `stripe-webhook`, `order-files-zip` run with
  `verify_jwt = false` per D7. They each validate their own auth: pricing-config is a
  public read, packlink-status-hook needs the shared secret, stripe-webhook validates the
  Stripe signature, and order-files-zip validates the HMAC in the URL.
- Admin functions (admin-sign-urls, admin-stripe-sync) rely on verify_jwt = true + an
  inside-the-function admin-role check. Not audited here beyond compile-time.

## Rate limiting

- `evaluate.ts` ships a minimal 10/min bucket (S6). Replace with a Redis/edge-cache
  implementation before high-traffic events; the current `Map` is per-process and loses
  state between instances.

## Dependency risk

- `manifold-3d` was removed (P3). `occt-import-js` added but gated to the file-conversion
  code path (never auto-loaded).
- `npm audit` reports 34 vulnerabilities (none introduced by checkpoint deps; most from
  pre-existing transitive deps). Scoped audit + upgrade is the next prompt.

## Repo-is-public guardrails

- Every screenshot path lives under `docs/checkpoint/screens/`. Private customer files go
  only in `test-fixtures/checkpoint/private/` (gitignored).
- Test fingerprint logs sanitize absolute paths through `scripts/checkpoint/run-tests.mjs`.

## PostHog

- `capture_exceptions: true` is on in `src/main.tsx` — exception payloads include stack.
  Verify PII redaction rules on the PostHog project before the next release.
