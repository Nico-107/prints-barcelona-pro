GROUND RULES (read before doing anything)
- Repo: ~/Projects/prints-barcelona-pro. Vite + React + TS + Tailwind + shadcn, prerendered SSR (~99 routes), 8 languages (en, es, ca, de, fr, it, nl, pt), Supabase, Stripe, PostHog EU (project 208342), Vercel.
- Supabase edge functions are NOT edited here (they are managed in Lovable). If a task needs an edge-function change, write the exact change into LOVABLE_TODO.md and tell me.
- Never use `routes` in vercel.json (only `rewrites`). Never proxy PostHog through Vercel; keep the direct eu.i.posthog.com connection.
- pathLanguage() in LanguageContext.tsx and urlLanguage() in entry-server.tsx must stay mirror images; never call setLanguage in a hydration useEffect.
- Every new user-facing string goes into ALL 8 languages with a real translation (no English copied into other languages). After adding, print the actual values of each new key in every language file, not just the key names.
- The Buy button stays the main, most visible element in the price modal. Keep the modal uncluttered.
- Prices always end in .90. The minimum order is €9.90. No setup fee anywhere.
- Do not change the price calculator maths except where a prompt says so explicitly.
- Do not change the site's look or layout beyond what a prompt asks.
- Work on main, run `npm run build` and fix every error before committing, then push to main (Vercel previews don't work for me).
- PROOF, NOT SUMMARIES: at the end, paste raw `git diff --stat`, the raw output of the greps I ask for, and the build result. Do not claim anything is done without the raw output that shows it. If something could not be done, say so plainly.

GOAL: make the analytics trustworthy before we start new tests, and stop the tests that are finished. Data from PostHog (20 Oct – 23 Nov, real visits only):
- header_btn_r2: B "Precios desde 9,90 €" beat A "Precio al instante" on every step (uploads 34% vs 30%, buy clicks 11 vs 6, paid 3 vs 0).
- upload_area_r1: C (3-step guide) lost clearly (17% uploads vs 24%, p=0.015). B (bigger zone + WhatsApp link) leads A on paid (10 vs 6).
- buy_label_r1: A "Comprar" 4 buy clicks / 2 paid vs B "Imprimir mi pieza" 1 / 0.
- home_proof_r1: no winner between A and C; B is weakest.
- site_variant (V1 vs V2 homepage design): V1 now ahead on uploads (23% vs 18%) and buy clicks (12 vs 6); paid tied 4–4.

PART A — Lock in winners / end tests
1. Find the experiment assignment code (the xp_* tags: xp_header_btn_r2, xp_upload_area_r1, xp_buy_label_r1, xp_home_proof_r1, xp_site_variant, plus the experiment_exposure event).
2. Make permanent and remove the test branches:
   - header button: variant B "Precios desde 9,90 €" (and its translations) for everyone.
   - upload area: variant B for everyone. Delete variant C (3-step guide) code and variant A branch.
   - buy button label: variant A "Comprar" (and translations) for everyone.
   - homepage design: V1 for everyone. Put the winner in ONE constant (e.g. SITE_DESIGN = 'v1') so I can flip to 'v2' in one line. Keep the V2 code, just not served. Keep ?xp_home_v2=v2 working as a preview override for me.
3. home_proof_r1: remove variant B, keep A vs C as a 50/50 test (same assignment mechanics).
4. Remove the stale tags from events for ended tests (no more xp_header_btn_r2 / xp_upload_area_r1 / xp_buy_label_r1 / xp_site_variant on new events). Keep xp_home_proof_r1.
5. Keep the experiment framework itself — Prompt 3 adds a new test (shipping_r1) using it. Make sure the framework (a) assigns per visitor, persistent across pages and visits, (b) tags every event with xp_<test>, (c) fires experiment_exposure once per session per test with {experiment, variant} — currently experiment_exposure is missing for some tests; make it consistent for all running tests.

PART B — Internal-traffic filter (is_internal currently tags NOBODY)
1. Visiting any URL with ?internal=1 sets a persistent flag (localStorage, try/catch) and calls posthog.register({ is_internal: true }) so every later event carries is_internal=true. ?internal=0 clears it.
2. Also set it automatically when: the admin is logged in, any /admin route is visited, the host is localhost / *.vercel.app preview / any lovable host, or the referrer contains "lovable".
3. Make the experiment assignment skip internal visitors (they get the control and are not counted), and make sure bots/no-storage browsers are NOT all dumped into variant A (that skewed the last test) — give them no variant tag at all.
4. Print the exact URL I should open once on each of my devices (Mac, phone) to tag myself.

PART C — Buyers returning from Stripe show up as new people
1. Find where the Stripe checkout is created from the frontend (the call to create-instant-checkout). Send along: posthog.get_distinct_id(), posthog.get_session_id(), and the current xp_* variants.
2. The edge function must put these into the Stripe success_url / cancel_url as ?ph_did=…&ph_sid=… and into the checkout session metadata. That is an edge-function change: write it into LOVABLE_TODO.md (section "Prompt 1").
3. On the frontend, when the page loads with ph_did/ph_sid in the URL, initialise PostHog with bootstrap: { distinctID: ph_did, sessionID: ph_sid } (only if they look valid), then remove the params from the URL with history.replaceState. Result: checkout_returned / instant_checkout_completed / order_paid land on the same person and session as the buy click.

PART D — Exit question records nothing
PostHog shows exit_popup_shown 70 times and exit_popup_action only with action = back_to_order / dismissed. The "what stopped you" answer that unlocks the 20% reward has NEVER been recorded in 30 days.
1. Find the exit popup and the reason question. Find out why no answer is captured (not rendered? no event? event name mismatch?). Explain the cause in one sentence with the code line.
2. Fix it so choosing a reason fires `exit_reason_answered` with { reason, price_eur_bucket, device_type } and then shows the reward code. Reasons (one click each, translated): "Es caro", "El envío", "Solo estaba comparando", "No sé qué material elegir", "Necesito que alguien lo revise", "Otro".

PART E — Thank-you page question
After a successful payment (the ?checkout=success page), show one question, one click, no typing: "¿Para qué es esta pieza?" with options Reparación / Proyecto propio / Empresa / Regalo o decoración / Otro (translated). Fire `piece_purpose_answered` { purpose, order_number, value_eur }. Show "¡Gracias!" after clicking. Don't block anything else on the page.

PART F — www vs non-www
1. Check vercel.json / Vercel domain config / canonical tags / sitemap / hreflang: every canonical, hreflang and sitemap URL must be https://www.dimension3dprints.com/... (PostHog shows all traffic on www, so www is the primary).
2. Grep the built dist for any "https://dimension3dprints.com" (without www) in canonical/hreflang/og:url/sitemap and fix them.
3. Tell me if the apex → www redirect is configured in the repo or must be checked in the Vercel dashboard (if dashboard, give me the exact click path).

PROOF TO PASTE: git diff --stat; grep -rn "xp_upload_area_r1\|xp_header_btn_r2\|xp_buy_label_r1\|xp_site_variant" src (should only show removal leftovers or nothing); grep -rn "is_internal" src; grep -rn "ph_did" src; grep -rn "exit_reason_answered\|piece_purpose_answered" src; grep -c "https://dimension3dprints.com" on the dist sitemap and 3 built HTML files; the contents of LOVABLE_TODO.md; npm run build tail.
