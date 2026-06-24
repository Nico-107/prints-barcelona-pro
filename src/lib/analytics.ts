// PostHog instance — registered once by main.tsx (browser only).
// Null during SSR/prerender; all capture() calls are safe no-ops.
type PHInstance = { capture: (event: string, props?: Record<string, unknown>) => void }
let ph: PHInstance | null = null

export function registerPostHog(instance: PHInstance) {
  ph = instance
}

export function capture(event: string, properties?: Record<string, unknown>) {
  ph?.capture(event, properties)
}
