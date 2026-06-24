<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Dimension3D 3D printing project. A lightweight analytics utility (`src/lib/analytics.ts`) was created that sends events to the PostHog Capture REST API using `fetch`, making it fully compatible with the Vite/React browser environment. Event capture was added to six React components and three Supabase edge functions, covering the full customer journey from initial contact through to order submission, review, and maker recruitment.

| Event name | Description | File |
|---|---|---|
| `print request submitted` | User successfully submitted a 3D print request form with their files | `src/components/FileUpload.tsx` |
| `print request whatsapp clicked` | User clicked the WhatsApp button in the print request form | `src/components/FileUpload.tsx` |
| `whatsapp contact clicked` | User clicked the floating WhatsApp button | `src/components/WhatsAppFloat.tsx` |
| `cta quote clicked` | User clicked the main CTA button to scroll to the quote form | `src/components/CallToAction.tsx` |
| `cta whatsapp clicked` | User clicked the WhatsApp button in the CTA section | `src/components/CallToAction.tsx` |
| `maker application submitted` | User submitted a maker application to join the printer network | `src/pages/Makers.tsx` |
| `review submitted` | User submitted a customer review | `src/components/Reviews.tsx` |
| `banner dismissed` | User dismissed the launch offer banner | `src/components/LaunchOfferBanner.tsx` |
| `print request processed` | Server processed a print request and sent the admin email | `supabase/functions/send-print-request/index.ts` |
| `review received` | Server saved a review submission to the database | `supabase/functions/send-review/index.ts` |
| `review approved` | Admin approved a review, making it publicly visible | `supabase/functions/approve-review/index.ts` |
| `review rejected` | Admin rejected a review submission | `supabase/functions/approve-review/index.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) dashboard](https://eu.posthog.com/project/208342/dashboard/769815)
- [Print Requests Over Time](https://eu.posthog.com/project/208342/insights/ruXa1yGt)
- [WhatsApp Contact Clicks](https://eu.posthog.com/project/208342/insights/Uwo04i1x)
- [Maker Applications](https://eu.posthog.com/project/208342/insights/o3gzEo1H)
- [Print Request Conversion Funnel](https://eu.posthog.com/project/208342/insights/fkS1RAxj)
- [Reviews Submitted](https://eu.posthog.com/project/208342/insights/QnbGtRdq)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names (`VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`) to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Add `POSTHOG_KEY` and `POSTHOG_HOST` as Supabase Edge Function secrets (via `supabase secrets set POSTHOG_KEY=... POSTHOG_HOST=...`) so the server-side events in the three Deno functions are captured in production.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
