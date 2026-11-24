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

WHY: Of 22 visitors who clicked Buy on a quote under €15, only 2 paid. The €5.90 shipping only appears at Stripe, so a €9.90 part becomes €15.80 by surprise. Fix: the number next to Buy must always be the number charged at Stripe, shipping included.

NEW SHIPPING RULES (put every number in ONE config file, e.g. src/config/shipping.ts):
- SHIPPING_EUR = 4.90 (was 5.90). FREE_SHIPPING_FROM_EUR = 30 (order subtotal of parts after discount codes).
- PAGE GROUPS:
  • LOCAL pages = everything that offers pickup: the Barcelona pages (homepage in every language, all Barcelona landing/city/service pages) and the Sevilla page(s). Pickup stays available: Barcelona = "Recogida en Les Corts con cita", Sevilla = the partner pickup that already exists. Pickup is always free.
  • NON-LOCAL pages = every other page (all international pages /de /fr /it /nl /pt and city pages like Berlin, Paris, Milán, Lisboa, Amsterdam, and Spanish non-local cities like Madrid, Valencia). NO pickup option at all. This replaces the old rule "international: €5.90, free over €100".
- Grep for every hard-coded 5,90 / 5.90 / 6 € / SHIPPING_SURCHARGE in src and all 8 language files and route them through the config. List them all in your proof.

NON-LOCAL pages: always "delivered price" (no test):
- Orders under €30: the shown price INCLUDES shipping. Delivered total = min( roundTo90(subtotal + 4.90), 30.90 ). Example: €9.90 part → €14.90 "envío incluido". Order €30 or more: price = subtotal, label "Envío gratis".
- Marketing text on these pages: "Desde 14,90 €, envío incluido" (and "Envío gratis desde 30 €") instead of "desde 9,90 €". Translate per language.

LOCAL pages: new A/B test shipping_r1, 50/50, persistent per visitor and identical on every page (use the existing framework; tag events with xp_shipping_r1; fire experiment_exposure). Internal visitors excluded.
- Variant A "delivered": same as non-local (prices under €30 include shipping, "envío incluido"; free from €30), PLUS a clearly visible pickup option card: "Recoger gratis en Les Corts (con cita)" showing the lower total (delivered total minus the shipping included).
- Variant B "upfront": the price shown is the parts price, and RIGHT under it, before the Buy button: "+ 4,90 € envío · gratis desde 30 € · o recogida gratis en Les Corts". Two clear option cards (Envío / Recogida) each showing its own full total. Selecting one updates the total next to Buy.
- In BOTH variants: two clear, equal-size option cards (Envío a domicilio / Recogida gratis), each with its own final total visible. The Buy button label includes the final total ("Comprar · 14,90 €"). Header keeps "Precios desde 9,90 €" (true with pickup).
- Fire `fulfillment_chosen` { option, total_eur, xp_shipping_r1 } when they pick.

CHECKOUT CONSISTENCY (the most important part)
- The total charged at Stripe MUST equal the total shown next to Buy, to the cent, for every variant, page group, quantity, discount code and fulfillment choice. Write a small unit test with at least 12 cases (pickup/shipping × A/B/non-local × under/over €30 × with DIMENSION11 code) and paste the output.
- The frontend must send to create-instant-checkout: page_group (local/non_local), shipping_mode (delivered/upfront), fulfillment (pickup/shipping), the parts subtotal, the shipping amount, and the expected total. The edge function changes go into LOVABLE_TODO.md (section "Prompt 3"): line items = parts + one shipping line labelled "Envío (incluido)" or "Envío" or "Envío gratis 0,00 €"; server recomputes the shipping from the config rules and rejects a mismatch; raise the server price ceiling so the highest legitimate total (instant-buy cap €200, shipping free above €30) always passes; put page_group, shipping_mode and xp_* variants in Stripe metadata.
- Update the order confirmation email/admin view only if they show "5,90" hard-coded (list where).

PROOF TO PASTE: git diff --stat; grep -rn "5[.,]90\|SHIPPING_SURCHARGE" src (should only show config or nothing); the 12-case test output; screenshots are not needed — instead print, for each of: Barcelona home ES, Sevilla page, /it page, Madrid page, the text shown next to Buy for a €9.90 part and for a €34.90 part in variants A and B; LOVABLE_TODO.md content; npm run build tail.
