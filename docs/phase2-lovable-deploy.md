# Phase 2 — what to deploy in Lovable

No new migrations. Phase 2 is entirely in-app: new admin routes that read
the same tables Phase 1 already provisioned. The legacy `/admin` page keeps
working so nothing breaks during the transition.

## Migrations

None.

## Edge functions

None new. Phase 2 uses the existing `send-order-status` (shipped in
Phase 1) when the owner presses a "next step" button on the queue.

## Site build

Redeploy so the new admin routes ship:

- `/admin/queue` — orders workbench (item 2.1–2.4).
- `/admin/print-queue` — pieces by material/colour (item 2.5).
- `/admin/quotes-inbox` — unanswered revisions first (item 2.6).
- `/admin/search` — number, name, email, phone, filename (item 2.7).

The legacy `/admin` page gains a small banner at the top of the orders
tab linking to the new surfaces.

## Verification done

- `src/lib/adminTypes.test.ts` walks the full life cycle of a shipping
  order and a pickup order through `nextActionFor`, asserting that each
  path fires the right emails exactly once (in_production, shipped,
  delivered for shipping; in_production, ready_pickup, delivered for
  pickup). Covers `bucketForOrder`, `countryFlag`, `hoursUntil`.

What the Playwright pass would add on top (deferred): rendering the real
queue in a browser with a fake Resend client, clicking each primary
button, asserting the toast + the `order_events` row. The state machine
is the only thing that decides which email fires; the unit tests lock
that contract. UI smoke is straightforward to add once a dev DB is
seeded.
