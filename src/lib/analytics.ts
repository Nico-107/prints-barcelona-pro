// PostHog instance — registered once by main.tsx (browser only).
// Null during SSR/prerender; events are queued until registration.
type PHInstance = {
  capture: (event: string, props?: Record<string, unknown>) => void;
  set_config: (config: { persistence: 'localStorage+cookie' }) => void;
}
let ph: PHInstance | null = null
let eventQueue: { event: string; properties?: Record<string, unknown> }[] = []

export function registerPostHog(instance: PHInstance) {
  ph = instance
  if (eventQueue.length > 0) {
    eventQueue.forEach(({ event, properties }) => {
      ph!.capture(event, properties)
      if (event !== '$pageview' && typeof window !== 'undefined') {
        (window as any).gtag?.('event', event, properties ?? {})
      }
    })
    eventQueue = []
  }
}

export function capture(event: string, properties?: Record<string, unknown>) {
  if (ph) {
    ph.capture(event, properties)
    if (event !== '$pageview' && typeof window !== 'undefined') {
      (window as any).gtag?.('event', event, properties ?? {})
    }
  } else {
    if (eventQueue.length >= 50) eventQueue.shift()
    eventQueue.push({ event, properties })
  }
}

// Called when user accepts cookies — upgrades from session-memory to
// persistent identity (localStorage + first-party cookie).
export function upgradeAnalyticsPersistence() {
  ph?.set_config({ persistence: 'localStorage+cookie' })
}
