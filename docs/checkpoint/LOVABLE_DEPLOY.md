# Lovable deploy — one click (R2)

Paste this prompt into Lovable after the checkpoint branch merges into `main`.

## 1. Verify the GitHub connection

The Lovable project is connected to `Nico-107/prints-barcelona-pro`. Confirm the branch is
`main`, not `lovable-sync`. If it is `lovable-sync`, switch it to `main`. Pull latest.

## 2. Run the migrations

Open the Supabase SQL editor and run `supabase/checkpoint_all_migrations.sql` (idempotent;
safe to run twice). The file ends with a `SELECT` returning `(table_name, column_name,
exists_now)`; every row's `exists_now` should be `true`. Paste the result here:

```
(paste after the first run)
```

## 3. Deploy every edge function from `main`

Deploy every function under `supabase/functions/` exactly as it is in the repo, no code
changes. The list, with their `verify_jwt` setting from `supabase/config.toml`:

| Function | verify_jwt |
|---|---|
| `admin-sign-urls` | true |
| `admin-stripe-sync` | true |
| `approve-review` | false |
| `create-instant-checkout` | false |
| `create-stripe-payment-link` | false |
| `daily-digest` | true (cron auth header) |
| `issue-promo-code` | true |
| `order-files-zip` | false |
| `packlink-status-hook` | false |
| `pricing-config` | false |
| `save-quote` | true |
| `send-catalog-request` | false |
| `send-customer-quote` | true |
| `send-maker-application` | false |
| `send-order-confirmation` | true |
| `send-order-status` | true |
| `send-price-estimate` | true |
| `send-print-request` | false |
| `send-quote-reminders` | true |
| `send-quote-request` | false |
| `send-review` | false |
| `send-saved-quote-reminders` | true |
| `stripe-webhook` | false |

## 4. Confirm the secrets exist

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTHOG_KEY`
- `POSTHOG_HOST`
- `PACKLINK_HOOK_SECRET` — **new**, generate with `openssl rand -hex 24`

## 5. Call `GET …/functions/v1/<fn>?health=1` for every function and paste the build ids

```sh
# From Nico's Mac, after the deploy:
npm run verify:deploy
```

Expected output: every row shows the same `v5-<10 hex>` build.

## Manual fallback

If Lovable can't bulk-deploy, deploy each function in order (above). Run `supabase/
checkpoint_all_migrations.sql` first — the admin "Estado del sistema" page reads the schema
status RPC defined there. If a function fails to deploy, check the logs for a missing env
var and add it in the Supabase function secrets.

Note on `lovable-sync`: the `checkpoint/2026-11-25` branch has already merged `lovable-sync`
so `main` now contains both sets of migrations. There is no need to merge `lovable-sync`
again.
