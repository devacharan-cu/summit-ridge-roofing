import { Fragment, useEffect, useRef } from 'react'
import { useRouter } from '@tanstack/react-router'

/* ───────── Split-text reveal: words rise out of masks, staggered, once, when scrolled into view ───────── */
export function Split({
  as: Tag = 'h2',
  className = '',
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  children: string
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('in')
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in')
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const words = children.split(' ')
  return (
    <Tag ref={ref as any} className={`split ${className}`.trim()} aria-label={children}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="sw-wrap" aria-hidden="true">
            <span className="sw" style={{ ['--wi' as any]: i }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </Tag>
  )
}

/* ───────── Site-wide motion: inertia scroll, magnetic controls, contextual cursor ─────────
   Opt-in for mouse users who haven't asked for reduced motion. */
export function MotionRoot() {
  const router = useRouter()
  const ringRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || calm) return

    const cleanups: Array<() => void> = []

    /* Inertia scroll (Lenis) */
    let lenis: any = null
    let raf = 0
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 })
      const loop = (t: number) => {
        lenis.raf(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      document.documentElement.classList.add('lenis')
    })
    const unsub = router.subscribe('onResolved', () => lenis?.scrollTo(0, { immediate: true }))
    cleanups.push(() => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      document.documentElement.classList.remove('lenis')
      unsub()
    })

    /* Magnetic controls: buttons pull slightly toward the cursor */
    const MAGNETIC = '.btn, .icon-btn, [data-magnetic]'
    let active: HTMLElement | null = null
    const reset = (el: HTMLElement | null) => {
      if (!el) return
      el.style.setProperty('--mx', '0px')
      el.style.setProperty('--my', '0px')
    }
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(MAGNETIC) as HTMLElement | null
      if (target !== active) {
        reset(active)
        active = target
      }
      if (target) {
        const r = target.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        target.style.setProperty('--mx', `${(dx * 0.22).toFixed(1)}px`)
        target.style.setProperty('--my', `${(dy * 0.32).toFixed(1)}px`)
      }
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    cleanups.push(() => document.removeEventListener('pointermove', onMove))

    /* Contextual cursor ring: grows on links, becomes a labelled disc over photo links */
    const ring = ringRef.current
    const label = labelRef.current
    if (ring && label) {
      let x = -100, y = -100, rx = x, ry = y, loopId = 0
      const tick = () => {
        rx += (x - rx) * 0.2
        ry += (y - ry) * 0.2
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
        loopId = requestAnimationFrame(tick)
      }
      loopId = requestAnimationFrame(tick)
      const move = (e: PointerEvent) => {
        x = e.clientX
        y = e.clientY
        ring.classList.add('on')
        const t = e.target as HTMLElement | null
        const labelled = t?.closest?.('[data-cursor]') as HTMLElement | null
        const link = t?.closest?.('a, button, summary, input, select, textarea, [role=button]')
        ring.classList.toggle('is-view', !!labelled)
        ring.classList.toggle('is-link', !!link && !labelled)
        label.textContent = labelled?.dataset.cursor ?? ''
      }
      const leave = () => ring.classList.remove('on')
      document.addEventListener('pointermove', move, { passive: true })
      document.documentElement.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        cancelAnimationFrame(loopId)
        document.removeEventListener('pointermove', move)
        document.documentElement.removeEventListener('pointerleave', leave)
      })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [router])

  return (
    <div className="cursor" ref={ringRef} aria-hidden="true">
      <span ref={labelRef} />
    </div>
  )
}
