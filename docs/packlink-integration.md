# Packlink PRO API — integration research (Phase 4, item 4.0)

This is the first step of Phase 4. Per the goal: *"If any of this cannot be
confirmed from the documentation, stop Phase 4 after this file and say
exactly what is missing; do not guess endpoints."*

**Phase 4 stops here.** The rest of the items (4.1 create-draft edge
function, 4.2 webhook, 4.3 refresh-tracking button, 4.4 fixture tests) are
intentionally not written, because the critical pieces below could not be
verified against Packlink's own official documentation.

The owner can complete 4.0 in one of two ways:

1. Share screenshots / an export of the current Packlink PRO API reference
   from the dashboard (Settings → Packlink PRO API → "Developer resources"
   or similar). The gaps listed in §3 are the only things blocking 4.1.
2. Confirm by email with Packlink support that the public endpoints below
   are still available on a PRO account, and share the webhook signature
   policy they return.

## 1. What is tentatively known

These values come from open-source Packlink clients (notably
[`wout/packlink.cr`](https://github.com/wout/packlink.cr) and
[`mauromarano/packlink-api`](https://github.com/mauromarano/packlink-api))
and from the AnythingMCP guide at
[`anythingmcp.com/guides/packlink-to-mcp`](https://anythingmcp.com/guides/packlink-to-mcp).
Both the Crystal client and the Python SDK agree on the surface, which is
consistent with what has been publicly documented for the last several
years — but **none of these is Packlink's current official reference**.

### Base URL

- Production: `https://api.packlink.com`
- Sandbox: `https://apisandbox.packlink.com`
  (The Crystal client builds the host as
  `"https://api#{"sandbox" if Config.sandbox?}.packlink.com"` — the
  presence of sandbox hosting is widely reported but not verified from a
  Packlink-authored page in this research.)

### Authentication header

```
Authorization: <PACKLINK_API_KEY>
Accept: application/json
Content-Type: application/json
```

The API key is passed **verbatim** in the `Authorization` header, **without
a `Bearer` prefix**. The key is issued in the Packlink PRO dashboard:
Settings → Packlink PRO API.

### Endpoints

All paths are versioned under `/v1`:

| Purpose                         | Method | Path                                           |
|---------------------------------|--------|------------------------------------------------|
| Available carrier services      | GET    | `/v1/services`                                 |
| Service detail                  | GET    | `/v1/services/available/{id}/details`          |
| Create shipment draft           | POST   | `/v1/shipments`                                |
| Read shipment                   | GET    | `/v1/shipments/{reference}`                    |
| Get labels                      | GET    | `/v1/shipments/{reference}/labels`             |
| Tracking history                | GET    | `/v1/shipments/{reference}/track`              |
| Register callback (webhook) URL | POST   | `/v1/shipments/callback`                       |
| Account warehouses              | GET    | `/v1/warehouses`                               |
| Parcel presets                  | GET    | `/v1/parcels`                                  |
| Create order from draft(s)      | POST   | `/v1/orders`                                   |

### Webhook events

The open-source Crystal client and the AnythingMCP guide both list the
same event names as the ones the goal's §4.2 expects:

- `shipment.carrier.success`
- `shipment.carrier.fail`
- `shipment.label.ready`
- `shipment.label.fail`
- `shipment.tracking.update`
- `shipment.delivered`

Observed payload shape (from the `Callback::Event` struct in the Crystal
client):

```json
{
  "event":    "shipment.label.ready",
  "datetime": "YYYY-MM-DD HH:MM:SS",
  "data": {
    "shipment_custom_reference": "order_264",
    "shipment_reference":        "PL-ABCD-1234"
  }
}
```

The callback URL is set once per account (not once per shipment). Calling
`POST /v1/shipments/callback` with `{ "url": "https://…" }` overwrites it.

## 2. What matches the goal's §4.0 expectations

Comparing against the goal:

- ✅ Base URL known (production confirmed by third-party clients).
- ⚠ Sandbox URL plausible but not verified against an official source.
- ✅ Authentication header — plain `Authorization: <api-key>`.
- ✅ Services endpoint (`GET /v1/services`).
- ✅ Draft-create endpoint (`POST /v1/shipments`).
- ⚠ **How a draft gets paid** — see §3, this is the biggest open question.
- ✅ Label endpoint (`GET /v1/shipments/{reference}/labels`).
- ✅ Tracking endpoint (`GET /v1/shipments/{reference}/track`).
- ✅ Callback registration endpoint (`POST /v1/shipments/callback`).
- ✅ Webhook event names all match the goal's expected list.
- ✅ Webhook payload has `event`, `datetime`, `data.shipment_reference`.

## 3. What could NOT be confirmed in Packlink's official documentation

Each of these is a hard blocker for Phase 4. All of them need an answer
before the integration can go beyond this file.

### 3.1 Public API availability for PRO accounts in 2026

AnythingMCP writes: *"The draft is neither paid nor booked: you complete
and pay it in Packlink PRO."* Multiple references suggest Packlink has
been **restricting the public API in favour of in-panel-only workflows**
for small-merchant PRO accounts. **I could not reach a live, Packlink-
authored page that confirms the `/v1/*` endpoints are still callable from
a current PRO API key.** Attempts to open Packlink's public docs timed out
or landed on marketing pages rather than an API reference.

**What the owner needs to confirm:** is the `PACKLINK_API_KEY` from the
PRO dashboard valid against `https://api.packlink.com/v1/warehouses`? A
single `curl` that comes back with a JSON array (not a `403 Account not
enabled for API` response) is enough.

### 3.2 Whether `POST /v1/orders` (paying by API) is still supported

If payment via the API is **not** available, the integration must use the
"create draft via API, pay in the Packlink panel" flow that the goal's
§4.1 already describes ("The owner pays for the label in Packlink as
usual; nothing is purchased automatically"). That matches §4.1's own
expectation, so this is likely fine — but it needs confirming so the
code doesn't attempt `POST /v1/orders` and silently fail.

### 3.3 Webhook signature / verification

The goal's §4.2 says *"receives the callbacks, verifies them as the
documentation allows"*. The Crystal client's Event struct carries no
signature field, and I found **no Packlink-authored page describing an
HMAC, signing secret, or a `X-Packlink-Signature`-style header**.

If Packlink does not sign webhooks, the only hardening available is:

- Source-IP allow-list (if Packlink publishes stable IPs).
- Secret prefix in the callback URL (e.g.
  `https://…/functions/v1/packlink-webhook?k=<random>`), checked server-
  side.

The owner should confirm which (if either) is Packlink's current
recommendation. Without this, the webhook handler cannot be safely
implemented.

### 3.4 Sandbox availability and API key provisioning

Packlink PRO's dashboard does not expose a separate sandbox API key out
of the box, as far as I could verify. If `apisandbox.packlink.com` still
exists, is it keyed with the same production key or a different one?
Without an answer, fixture tests can run against recorded JSON only — no
live round-trip is possible.

### 3.5 Rate limits and retry behaviour

Not documented in anything I could reach from Packlink. Will stub the
edge function with a generous timeout + single retry and treat anything
≥429 as "back off and retry on next webhook"; this needs to be refined
once Packlink's actual limits are known.

## 4. What ships in this commit

- This document only. No edge functions, no DB columns, no admin UI.
- Phase 4 is paused at 4.0 awaiting answers to §3.

## 5. Suggested owner-side next step (takes ~15 minutes)

```bash
# Use the PRO API key copied from Settings → Packlink PRO API.
curl -i -H "Authorization: $PACKLINK_API_KEY" \
     -H "Accept: application/json" \
     https://api.packlink.com/v1/warehouses
```

- `200 OK` with a JSON array of warehouses → §3.1 is answered yes; Phase
  4.1 can proceed.
- `401`/`403` → §3.1 is answered no; the integration stops here and the
  owner stays with the manual shipping block delivered in Phase 2 (item
  2.4), which is already a working fallback.
- Anything else (timeout, 404, HTML) → paste the response into this file
  and we triage together.

A follow-up call registering a throwaway callback URL and watching the
owner's Packlink test shipment will answer §3.3 (whether a signature
header is set).

## 6. Sources used in this research

- [`wout/packlink.cr` source](https://github.com/wout/packlink.cr) — the
  values for base URL, auth header, and all `/v1/*` paths above come from
  inspecting `src/packlink/client.cr`, `draft.cr`, `callback.cr`,
  `label.cr`, `tracking.cr`, `order.cr`, `service.cr`, `shipment.cr`.
- [`mauromarano/packlink-api`](https://github.com/mauromarano/packlink-api)
  — same endpoints, same auth shape, independent Python implementation.
- [AnythingMCP Packlink PRO guide](https://anythingmcp.com/guides/packlink-to-mcp)
  — list of available MCP tools, note that "the draft is neither paid
  nor booked", confirmation that the API key is retrieved from Settings →
  Packlink PRO API.
- Not reached: Packlink's own developer portal / API reference. If the
  owner can share a link or PDF, that closes §3 immediately.
