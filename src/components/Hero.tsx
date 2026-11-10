import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { site } from '#/config/site'

const notes: Record<number, string> = {
  4: 'Low slope. Common on ranches and additions, and it needs careful underlayment.',
  6: 'Standard pitch. Walkable, drains well, and the most common on Front Range homes.',
  8: 'Steep. Sheds snow fast; crews work with roof jacks and harnesses.',
  10: 'Very steep. Needs staging and extra safety time, so we price it up front.',
  12: 'A-frame territory. Specialist install, and you still get a fixed price.',
}

function describe(p: number) {
  const keys = Object.keys(notes).map(Number)
  const k = keys.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a))
  return notes[k]
}

export function Hero() {
  const [pitch, setPitch] = useState(6)
  const W = 480
  const wallTop = 222
  const half = 190
  const cx = 240
  const rise = (pitch / 12) * half
  const peakY = wallTop - rise
  const d = `M ${cx - half - 24} ${wallTop} L ${cx} ${peakY} L ${cx + half + 24} ${wallTop}`

  const words = site.company.tagline.split(' ')
  const head = words.slice(0, -3)
  const tail = words.slice(-3)

  return (
    <section className="hero">
      <div className="wrap">
        <div>
          <h1 aria-label={site.company.tagline}>
            {head.map((w, i) => (
              <span key={i} aria-hidden="true">
                <span className="w" style={{ ['--i' as any]: i }}>{w}</span>{' '}
              </span>
            ))}
            <span className="tail" aria-hidden="true">
              {tail.map((w, i) => (
                <span key={i}>
                  <span className="w" style={{ ['--i' as any]: head.length + i }}>{w}</span>{' '}
                </span>
              ))}
            </span>
          </h1>
          <p className="lede">
            {site.company.name} repairs and replaces roofs across {site.company.city} and the Front Range. Book an inspection online, put a deposit down to hold your crew, and pay the balance when the job is done.
          </p>
          <div className="hero-cta">
            <Link className="btn btn--accent" to="/contact">Get a free estimate</Link>
            <Link className="btn btn--ghost" to="/checkout/$slug" params={{ slug: site.offers[0].slug }}>
              Book inspection · {site.offers[0].priceLabel}
            </Link>
          </div>
          <div className="hero-proof">
            {site.trust.map((t) => (
              <div key={t.label}>
                <b>{t.value}</b>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pitch">
          <svg className="pitch-svg" viewBox={`0 0 ${W} 280`} role="img" aria-label={`Roof drawn at ${pitch} in 12 pitch`}>
            <rect x="0" y="0" width={W} height="280" rx="14" fill="var(--bg-2)" />
            <rect x={cx - half} y={wallTop} width={half * 2} height="58" fill="var(--line)" />
            <rect x={cx - 30} y={wallTop + 12} width="60" height="46" rx="3" fill="var(--text)" />
            <rect x={cx - half + 20} y={wallTop + 14} width="44" height="28" rx="3" fill="none" stroke="var(--muted)" strokeWidth="2" />
            <rect x={cx + half - 64} y={wallTop + 14} width="44" height="28" rx="3" fill="none" stroke="var(--muted)" strokeWidth="2" />
            <path d={d} fill="none" stroke="var(--text)" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
            <line x1={cx} y1={peakY + 10} x2={cx} y2={wallTop} stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 6" />
            <line x1={cx} y1={wallTop} x2={cx + 90} y2={wallTop} stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 6" />
            <text x={cx + 8} y={(peakY + 10 + wallTop) / 2 + 5} fill="var(--text)" fontSize="15" fontWeight="700">{pitch}</text>
            <text x={cx + 38} y={wallTop - 8} fill="var(--text)" fontSize="15" fontWeight="700">12</text>
            <text x="16" y="30" fill="var(--muted)" fontSize="14" fontWeight="600">Pitch = rise per 12 in. of run</text>
          </svg>
          <div className="pitch-row">
            <b>{pitch}/12</b>
            <span>What’s your pitch?</span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            step={1}
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            aria-label="Roof pitch, rise over 12"
          />
          <p className="pitch-note" aria-live="polite">{describe(pitch)}</p>
        </div>
      </div>
    </section>
  )
}
