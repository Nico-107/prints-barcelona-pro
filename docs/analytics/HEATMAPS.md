# Heatmaps and Session Replay

## Activation

Heatmaps and session replay are **disabled by default** and enabled only after the visitor explicitly accepts cookies.

Activation paths:
1. **On accept** — `CookieConsentBanner` calls `enableHeatmapsAndReplay()` immediately after the user clicks "Accept".
2. **On return visit** — `CookieConsentBanner` reads `localStorage["cookie-consent"]` on mount; if `"accepted"`, calls `enableHeatmapsAndReplay()` before PostHog fires any events.

## PostHog config applied on activation

```ts
posthog.set_config({
  enable_heatmaps: true,
  session_recording: {
    maskAllInputs: true,           // masks every <input> by default
    maskTextSelector: '[data-ph-mask]',  // also masks any element with this attr
  },
});
```

`maskAllInputs: true` is the baseline. `data-ph-mask` adds explicit masking to
elements that PostHog would not mask by default (e.g. `<textarea>`).

## Masked fields

| Element | Location | Reason |
|---|---|---|
| `<input type="email">` | `ContactFields.tsx` | PII — email address |
| `<input type="tel">` | `ContactFields.tsx` | PII — phone number |
| `<input type="email">` | `StlEstimator.tsx` exit-intent | PII — email address |
| `<input type="tel">` | `StlEstimator.tsx` exit-intent | PII — phone number |
| `<textarea>` (notes) | `CheckoutConfigurator.tsx` (Advanced + Simple mode) | Free text may contain PII |

All `<input>` elements are also masked by `maskAllInputs: true`, which provides
defence-in-depth for any field not explicitly listed above.

## Privacy guarantees

- No session recording or heatmap data is collected before consent.
- No personal data (email, phone, notes content) appears in replays.
- `is_internal` super-property excludes owner sessions from all PostHog data.
