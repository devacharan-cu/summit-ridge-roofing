import { useEffect, useState } from 'react'

type Entry = { name: string; props: Record<string, unknown>; t: number; delivered: boolean }

/**
 * Live view of every whop.track call. Add ?debug=1 to any URL.
 * Lets anyone verify the custom pixel events firing without opening devtools.
 */
export function PixelDebug() {
  const [on, setOn] = useState(false)
  const [events, setEvents] = useState<Entry[]>([])

  useEffect(() => {
    const enabled = new URLSearchParams(window.location.search).get('debug') === '1'
    if (enabled) sessionStorage.setItem('pixel-debug', '1')
    const active = enabled || sessionStorage.getItem('pixel-debug') === '1'
    setOn(active)
    if (!active) return
    const w = window as any
    setEvents([...(w.__whopEvents || [])].slice(-6))
    const handler = (e: Event) => setEvents((prev) => [...prev, (e as CustomEvent<Entry>).detail].slice(-6))
    window.addEventListener('whop-track', handler)
    return () => window.removeEventListener('whop-track', handler)
  }, [])

  if (!on) return null
  const pixel = typeof window !== 'undefined' && !!window.whop?.track
  return (
    <div className="dbg" role="status" aria-live="polite">
      <b>WHOP PIXEL · whop.track {pixel ? '(connected)' : '(pixel not present)'}</b>
      {events.length === 0 && <small>No custom events yet. Scroll, open a service, or start a checkout.</small>}
      {events.map((e, i) => (
        <div key={i}>
          <span className="ok">{e.delivered ? '✓' : '·'}</span>
          <span>{e.name}</span>
        </div>
      ))}
    </div>
  )
}
