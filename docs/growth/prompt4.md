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

FACTS (all true, use exactly these):
- Google: 25 reviews, 24 of them 5 stars, rating 4,8. The 4 review quotes already on the homepage are real Google reviews.
- Orders: close to 300 completed → show "~300 pedidos" (replace every "250+ pedidos").
- Printed in Barcelona (Les Corts) on a Bambu Lab X2D; usual turnaround 24–48 h; ships across Spain and Europe.
- Google Business Profile link: use the value on the next line. If it says none, set the GOOGLE_PROFILE_URL constant to null and hide every link while it's null. Never invent or guess a URL.
GOOGLE_PROFILE_URL = none

1. TRUST ROW IN THE PRICE MODAL (directly under the total, above or beside Buy, but visually quieter than Buy):
   "★ 4,8 · 24 de 25 reseñas en Google con 5 estrellas · ~300 pedidos · Impreso en Barcelona, enviado en 24–48 h" (translate; on non-local pages keep "Impreso en Barcelona").
   Plus 3 small thumbnails (max ~56 px tall) of real finished parts. Use photos ALREADY in the repo from the "Proyectos de clientes" section. If photos are tagged by material, show ones matching the selected material; otherwise a fixed set of 3. No new stock images here.
   Keep it to one compact row on desktop and two short lines on mobile. Buy must remain the most prominent element.
2. GOOGLE PROFILE: when GOOGLE_PROFILE_URL is set, make "4,8 · 25 reseñas en Google" a link to it (new tab, rel="noopener") in: the homepage rating strip, the reviews section ("Ver todas las reseñas en Google"), the footer, and add the URL to the Organization/LocalBusiness JSON-LD `sameAs`. Do NOT add AggregateRating/Review schema for our own reviews (Google ignores self-served review stars and it can look spammy).
3. Update every "4,8" rating strip to "4,8 · 25 reseñas en Google" and every "250+" to "~300" across all 8 languages.
4. MOBILE (0 of 29 phone visitors who saw a price paid in 35 days):
   - On viewports < 768 px, the hero primary button becomes "Sube una foto o archivo" (opens the same upload, which already accepts photos and STL). The calculator stays the primary path; do NOT make WhatsApp the main hero button.
   - Directly under it on mobile: secondary button "Envíanos una foto por WhatsApp" (existing WhatsApp link with a prefilled message "Hola Nico, quiero imprimir esto:").
   - In the price modal on mobile only: add a text link under Buy: "¿Tienes dudas? Envíanos una foto por WhatsApp". Buy stays the main button.
   - Fire `mobile_whatsapp_click` with { location: hero | modal }.
5. Keep the WhatsApp sticky bubble bottom-right on every page as it is.

PROOF TO PASTE: git diff --stat; grep -rn "250+" src (should be empty); grep -rn "GOOGLE_PROFILE_URL" src; grep of the new trust-row key in all 8 language files with values; npm run build tail.
