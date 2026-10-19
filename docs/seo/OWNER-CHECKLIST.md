# Owner SEO Checklist — Weekly Monday Routine

## 1. Search Console — Performance (15 min)

1. Go to **Google Search Console → Performance → Search results**.
2. Date range: last 28 days, compared to previous 28 days.
3. Filter by query containing "barcelona":
   - Check clicks and position for the 7 money queries:
     - `impresion 3d barcelona` (target: top 10)
     - `impresión 3d barcelona precios` (target: top 5)
     - `servicio de impresion 3d barcelona` (target: top 10)
     - `prototipos 3d barcelona` (target: top 10)
     - `prototipado rapido barcelona` (target: top 5)
     - `impresora 3d barcelona` (target: top 10)
     - `mejor impresion 3d barcelona` (target: top 10)
   - If any dropped more than 5 positions week over week: investigate that page first.
4. Filter by query containing "madrid":
   - `impresión 3d madrid precios` and `stl madrid` — check position.
5. Check the AI Overviews filter (if available): pages getting AI Overview impressions are candidates for FAQ/content improvements.

## 2. Pages Report (5 min)

1. Go to **Search Console → Pages**.
2. Look for any new "Not indexed" pages:
   - "Crawled – not indexed": add internal links to these pages.
   - "Discovered – currently not indexed": submit the URL.
   - "Google chose different canonical": investigate if the canonical tag in code is correct.
3. Check that the sitemap (`https://www.dimension3dprints.com/sitemap.xml`) was fetched within the last 2 weeks.

## 3. Submitting New URLs (2 min)

After publishing new content or making significant changes to existing pages:

1. **Use IndexNow** (preferred): run `npm run indexnow` after deploying to production. This notifies Bing and other supported engines instantly.
   - Only run `npm run indexnow` after a production deploy, never from a branch.
   - The script reads all URLs from the sitemap and submits them to IndexNow.
2. **Manual URL inspection** (Google specific): go to Search Console → URL Inspection → paste the URL → Request indexing. Do this for the most important changed URLs (homepage, new landing pages, updated city pages).
3. **Update the sitemap**: the `public/sitemap.xml` is generated as part of the build. After a deploy, verify the sitemap at `/sitemap.xml` includes the new pages and has updated `lastmod` dates.

## 4. Reviews (2 min)

- Check if there are any new reviews to respond to in the Google Business Profile.
- If you've had a good customer interaction this week: send them the review link from the Google Business Profile.
- Target: maintain an active review profile (ideally 1–2 new reviews per month).

## 5. Backlink Targets — Who to Approach

Priority backlink sources for the site:

| Target | Type | Approach |
|--------|------|----------|
| **Lemon Printers** (lemon.page) | Partner | NFC referral system already in place at `/lemon`; ask for a reciprocal link on their site |
| **Intercruises** (local Barcelona) | Local business | Offer reciprocal mention in exchange for linking to `/impresion-3d-empresas-barcelona` |
| **Cultural Habits** (Barcelona cultural org) | Local | Offer a project showcase; ask for a mention in their maker/design context |
| **GS Bikes** (Barcelona cycling) | Local | Custom parts collaboration; link to `/piezas-personalizadas-3d-barcelona` |
| **La Salle Barcelona** | Education | Contact the 3D printing / design department; offer a student discount page (`/impresion-3d-estudiantes-barcelona`) in exchange for a resource link |
| **Barcelona maker communities** | Community | Fablab Barcelona, Fab Academy nodes, Barcelona maker spaces — list in their resources |
| **Barcelona directories** | Citation | Yelp Barcelona, Foursquare, Hotfrog, Páginas Amarillas — NAP (Name, Address, Phone) consistency |
| **Product Hunt** | PR | If launching a new feature (e.g. the instant checkout, the estimator), submit to Product Hunt |

## 6. After a Major Deploy

- [ ] Run `npm run indexnow` (after production deploy only)
- [ ] Verify `/sitemap.xml` is updated
- [ ] Submit homepage and any new/changed URLs via Search Console URL Inspection
- [ ] Check that the build checks all passed: `npm run build` output should show 0 errors for check-seo-meta, check-schema, check-sitemap, check-internal-links, check-social-meta
