import type { CSSProperties, ReactNode } from 'react'
import { site, photoUrl } from '#/config/site'

const WIDTHS = [480, 800, 1200, 1600]

/**
 * Responsive photo with scroll-driven motion (all CSS, GPU-only transforms):
 *  - `mask`      clip-path reveal as it enters the viewport
 *  - `parallax`  image drifts inside its frame while scrolling
 *  - default     gentle zoom-out on entry
 *  - `bw`        greyscale until hovered (hover-capable devices only)
 * `viewTransitionName` makes it a shared element across page transitions.
 */
export function Photo({
  k,
  ratio,
  sizes = '(min-width: 1180px) 1180px, 100vw',
  priority = false,
  mask = false,
  parallax = false,
  bw = false,
  bg = false,
  className = '',
  viewTransitionName,
  children,
}: {
  k: string
  ratio?: string
  sizes?: string
  priority?: boolean
  mask?: boolean
  parallax?: boolean
  bw?: boolean
  bg?: boolean
  className?: string
  viewTransitionName?: string
  children?: ReactNode
}) {
  const p = site.photos[k]
  if (!p) return null
  const style: CSSProperties = { aspectRatio: ratio, viewTransitionName }
  return (
    <div
      className={`ph${bw ? ' ph--bw' : ''}${bg ? ' ph--bg' : ''} ${className}`.trim()}
      style={style}
      data-mask={mask ? '' : undefined}
      data-par={parallax ? '' : undefined}
    >
      <img
        src={photoUrl(p.id, 1200)}
        srcSet={WIDTHS.map((w) => `${photoUrl(p.id, w)} ${w}w`).join(', ')}
        sizes={sizes}
        alt={bg ? '' : p.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
      {children}
    </div>
  )
}
