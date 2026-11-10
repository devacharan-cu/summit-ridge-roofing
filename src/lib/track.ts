/**
 * Whop pixel helper. On *.whop.site the pixel is injected automatically and
 * `window.whop` exists before app code runs. Page views and checkout/purchase
 * events are automatic; we add the custom ones below.
 *
 * Every event is also mirrored to `window.__whopEvents` and a `whop-track`
 * DOM event, which powers the on-page debug panel (add ?debug=1 to any URL).
 */
export type TrackName =
  | 'estimate_requested'
  | 'service_viewed'
  | 'deposit_started'
  | 'checkout_started'
  | 'lead'

declare global {
  interface Window {
    whop?: { track: (name: string, props?: Record<string, unknown>) => void }
  }
}

const seen = new Set<string>()

export function track(name: TrackName, props: Record<string, unknown> = {}, opts: { once?: string } = {}) {
  if (typeof window === 'undefined') return
  if (opts.once) {
    if (seen.has(opts.once)) return
    seen.add(opts.once)
  }
  try {
    const delivered = !!window.whop?.track
    if (delivered) window.whop!.track(name, props)
    else console.info('[whop.track: pixel not present]', name, props)
    const w = window as any
    w.__whopEvents = w.__whopEvents || []
    const entry = { name, props, t: Date.now(), delivered }
    w.__whopEvents.push(entry)
    window.dispatchEvent(new CustomEvent('whop-track', { detail: entry }))
  } catch (e) {
    console.warn('whop.track failed', e)
  }
}
