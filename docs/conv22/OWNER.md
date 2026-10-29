# conv-22 Owner checklist — run after merge

## 1. PostHog project settings (before merge)

- **Cookieless server hash mode** → ON (otherwise visitors who have not accepted
  cookies are not counted at all — we'd be blind to 40–60% of EU traffic).
- **Session replay** → ON, sample rate **100%**, minimum duration 2 s,
  canvas recording **allowed**, no URL/feature-flag triggers that would limit it.

## 2. Post-deploy smoke test

1. Hard-refresh `www.dimension3dprints.com` and **Accept** cookies.
2. Open PostHog → Replay. A recording should appear within a few minutes.
3. Complete one real purchase of a ≤€10 part with **pickup**. Confirm the
   `purchase_completed` event appears in PostHog.
4. Refund the order in Stripe Dashboard.
5. After 7 days check accept rate:
   `consent_decision {decision: "accept"}` ÷ `consent_prompt_shown`.

## 3. Lovable

- Open the Lovable project → **Republish once** so that any cached
  `*.lovable.app` visitors are redirected to `www.dimension3dprints.com`.
  (Alternatively unpublish the Lovable site entirely if it is not being used.)

## 4. Stripe payment methods

Turn on the following in **Stripe → Settings → Payment methods**:
- **iDEAL** — default payment method in the Netherlands (NL visitors could not
  pay; 2 started checkout last week, 0 converted)
- **Bancontact** — Belgium (BE)
- **MB WAY / Multibanco** — Portugal (PT)
- **Klarna** — DE, NL (already wired in PaymentBadges.tsx)
- **Apple Pay** and **Google Pay** — global (already wired)

Checkout uses dynamic payment methods and the page language, so the badges
shown on the checkout page already adapt — just enable them in Stripe.

## 5. Search Console and Bing

- Resubmit the sitemap in Search Console (and Bing Webmaster Tools).
- Run: `npm run indexnow`
- Manually request indexing for `/`, `/3d-printing-service` and the IT, PT, NL hubs.

## 6. QA fixtures

Drop the two STL files that showed no Buy button (from the STEP 1 repro session)
into `qa/fixtures/user-repro/` if not already there, then re-run:

```
npx playwright test buy-matrix
```

## 7. Consent rate monitoring (7-day follow-up)

PostHog query:
```
event = consent_decision, grouped by decision
accept ÷ (accept + reject)   →  target ≥ 55%
```

If accept rate < 40% the 4-second timer may be too fast; consider increasing
to 6s in `CookieConsentBanner.tsx`.
