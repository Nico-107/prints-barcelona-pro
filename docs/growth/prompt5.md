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

Do a full verification pass of Prompts 1–4 on the production build (npm run build && npm run preview):
1. Click through: Barcelona home ES/EN/CA, Sevilla page, /it, /de, Madrid page. For each: upload control_cutter_clean.stl (PLA) and report the price text next to Buy, the fulfillment options shown, and whether pickup appears (it must appear ONLY on Barcelona + Sevilla).
2. Upload overpriced_stamp_22693_shells.stl on the Barcelona home: report the price (must be ~€10–12) and the mesh_* properties sent with estimate_shown (log them to console in dev).
3. Force each shipping_r1 variant (add a ?xp_shipping_r1=A|B override if it doesn't exist) and confirm the Buy label total equals what would be sent as expected_total.
4. Confirm with ?internal=1 that events carry is_internal=true.
5. Confirm only these experiments are still assigning: home_proof_r1 (A/C) and shipping_r1 (local pages only).
6. List anything that is broken or that you could not verify. Do not hide problems.

PROOF TO PASTE: a table of the results for steps 1–5 with the raw values.
