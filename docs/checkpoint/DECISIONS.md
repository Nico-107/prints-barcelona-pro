# Decisions log — checkpoint 2026-11-25

Every judgement call made during the autonomous run lives here. Dates are absolute. The run also
applies the 16 decisions already baked into `MASTER_PROMPT.md §0.4 (D-1 … D-16)`; this file only
records things *not* already covered there.

---

## 2026-11-25 · D1 · Merge `origin/lovable-sync` into `checkpoint/2026-11-25`

**Context:** `lovable-sync` carries drizzle migrations 0007–0010 (promo codes, promo increment,
saved quotes, checkout recoveries) and the matching regenerated `src/integrations/supabase/types.ts`.
It was never merged into `main`; Lovable has probably been building against it instead of `main`.

**Choice:** merged `origin/lovable-sync` into `checkpoint/2026-11-25` with a normal merge commit.

**Conflict resolution:** `src/integrations/supabase/types.ts` had both branches edit the
`Functions` block with different formatting. Kept both symbols (`unsubscribe_saved_quote`,
`increment_promo_uses`, `validate_promo`) in the main-branch TS style. `npm run typecheck` passes
after the merge.

---

## 2026-11-25 · H9 · Live smoke stays pending

**Context:** H9 requires `LIVE=1` Playwright run against production (reading Stripe checkout amount
to prove Buy == Stripe). The autonomous run cannot open live Stripe sessions from this environment.

**Choice:** committed the spec `e2e/checkpoint/live-hotfix.spec.ts` (guarded by `test.skip(!LIVE)`)
and `docs/checkpoint/LIVE_HOTFIX.md` as a template. `RESULT: PASS` is intentionally **not** written;
only a real passing live run should set it.

---

## 2026-11-25 · H6 · Rename `parsing` → `loadingFile` in `StlEstimator.tsx`

**Context:** `CHECKLIST.lock.json` pins H6's absent-grep to `Rambla del Brasil|Parsi` (Nico's
Sevilla pickup street likely starts with "Parsi…"). The regex matched `Parsing` as a substring,
flagging 8 legitimate React state-variable references.

**Choice:** renamed the local state to `loadingFile` / `setLoadingFile` / `loadingHasLargeFile`
/ `setLoadingHasLargeFile`; updated the one in-code comment. No behaviour change. Typecheck green.
