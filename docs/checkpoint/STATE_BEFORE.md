# STATE_BEFORE — Dimension3D checkpoint 2026-11-25

Snapshot of what is pushed vs what is actually running when the autonomous checkpoint started.
Derived from `AUDIT_2026-11-25.md`, commit history and live probes.

## Git SHAs

| Branch | SHA | Note |
|---|---|---|
| `origin/main` | `c21c44a` (pre-checkpoint) | Prompt 3 — shipping config (24 Nov 10:55) |
| `origin/main` (now, with H0–H9 landed) | `6540525`+ | Phase H complete |
| `origin/lovable-sync` | `f1602fd` | Promo codes + quote recovery drizzle migrations; merged into `checkpoint/2026-11-25` in D1 |
| `checkpoint/2026-11-25` | this branch, created in D1 | base for D..R work |

## Edge-function deployment state (18 Nov)

Lovable has been stuck at the 18 Nov morning deploy (commit `0aebcd6`). None of the server parts
of Phase 6 (18 Nov afternoon), Prompt 1, Prompt 2 or Prompt 3 ever shipped. Live probes:

| Function | Deployed version signal | Expected after Lovable deploy |
|---|---|---|
| `create-instant-checkout` | shipping 5,90 € when parts subtotal < 100 € (`priced.order.totalCents < 9990` branch); PRICE_MISMATCH on repaired meshes | v5 shipping rules (D-2), PRICE_UPDATED contract |
| `stripe-webhook` | pre-18-Nov: does not store customer_name / phone / address, no email_log | O1 schema + O2 owner email retry path |
| `order-files-zip` | `order-files-zip?order_number=1&exp=9999999999&sig=00` returns 401 JSON = 15 Nov version; the 18 Nov version returns an HTML "expired link" page | File-reassembly path for chunked uploads (P9) |
| `admin-sign-urls` | returns one URL per file, loops per order — slow | H8 UI only signs on click |
| `send-order-confirmation` | ADMIN_RECIPIENT = `dimension3dprintsbcn@gmail.com` only | D-8: both recipients + Daniel on Sevilla |
| `send-price-estimate` | old template; totals wrong (2× €9,90 = €19,80 vs site total) | E2 redesign |

## Migrations: filesystem vs applied

`src/integrations/supabase/types.ts` is the surest proof of what has been applied.

| Migration file | In types.ts? | State |
|---|---|---|
| `20261114231645_phase1_after_purchase.sql` | yes | applied |
| `20261114232556_uploaded_not_purchased.sql` | yes | applied |
| `20261115121739_get_order_tracking_by_email.sql` | yes | applied |
| `20261115122852_phase3_quote_accept_pay.sql` | yes | applied |
| `20261117000001_promo_codes.sql` | yes (merged from lovable-sync in D1) | applied |
| `20261117000002_promo_increment_uses.sql` | yes | applied |
| `20261117000003_saved_quotes.sql` | yes | applied |
| `20261117000004_checkout_recoveries.sql` | yes | applied |
| `20261118000001_order_urgency_shipby.sql` | **no** | not applied in prod; Lovable owes it |
| `20261118000002_order_payment_breakdown.sql` | **no** (but `total_paid_cents` exists) | partially applied |

D6 rolls everything from 20261118+ into idempotent migrations so one Lovable run brings the schema
all the way up.

## Live site markers (Vercel)

Live JS bundle on `www.dimension3dprints.com` contains: `shipping_r1`, `upfrontNote`, `fromDelivered`,
`exit_reason_answered`, `piece_purpose_answered`, `ph_did`, `mesh_repaired`, `dim3d-internal`. The
frontend is Prompt 3, the server is still 18 Nov.

## AUDIT summary (15 lines)

1. Buy label ≠ Stripe charge on every shipping page (B1).
2. Messy meshes cannot be bought: 26 of 27 real estimates since 24 Nov are PRICE_MISMATCH (B2).
3. The student's maqueta prices €9,90 instead of €43,90 because `meshRepair` drops open shells (B3).
4. Oversize parts are sold as printable; server rejects with OVERSIZE_PART (B4, B9).
5. Safety cap inverts material order on clean files (B5).
6. Files > 50 MB get no price (B6); 32 real STLs hit this in 30 days.
7. STEP / 3DM / BLEND / FBX / ZIP / SCAD parse errors produce dead ends (B7).
8. No unit detection: metres / inches files price €9,90 as specks (B8).
9. Sevilla page offers Barcelona pickup (C1); page-group default is LOCAL so intl pages leak pickup (C2); the street address appears in checkout (C3).
10. Experiment leakage: `shipping_r1` tagged on non-local pages, `site_language` wrong on `/it/*` (C4).
11. Delivery promises contradict each other and `shipDate.ts` (C5, C6).
12. Calculator window: empty left space, right column scrolls off-screen, Advanced mode too long, orientation/supports useless (D audit section).
13. Owner order email goes to one inbox; admin does not show name/phone/address; two admin UIs (E1-E3).
14. File downloads timeout because admin signs every file at list load (E4).
15. Lovable stuck at 18 Nov; every frontend-only prompt since then has promised things the server does not do (A table).

## What Nico needs to do next

The autonomous run advances the code. Three manual steps remain gated behind Nico: Lovable
deploy (ships every edge function + migrations in one click per `LOVABLE_DEPLOY.md`), the live
smoke for H9 and Q7, and the Packlink CSV example + Zapier wiring. See `BLOCKERS.md`.
