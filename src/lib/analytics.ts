// PostHog instance — registered once by main.tsx (browser only).
// Null during SSR/prerender; all calls are safe no-ops.
type PHInstance = {
  capture: (event: string, props?: Record<string, unknown>) => void;
  set_config: (config: { persistence: 'localStorage+cookie' }) => void;
}
let ph: PHInstance | null = null

export function registerPostHog(instance: PHInstance) {
  ph = instance
}

export function capture(event: string, properties?: Record<string, unknown>) {
  ph?.capture(event, properties)
  if (event !== '$pageview' && typeof window !== 'undefined') {
    (window as any).gtag?.('event', event, properties ?? {})
  }
}

// Called when user accepts cookies — upgrades from session-memory to
// persistent identity (localStorage + first-party cookie).
export function upgradeAnalyticsPersistence() {
  ph?.set_config({ persistence: 'localStorage+cookie' })
}
