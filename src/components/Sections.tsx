import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { site } from '#/config/site'
import { track } from '#/lib/track'
import { Photo } from './Photo'
import { Split } from './Motion'

type Prices = Record<string, { amount: string; formatted: string }>
type Head = { h1?: boolean }

function H({ h1, className, children }: { h1?: boolean; className?: string; children: string }) {
  return (
    <Split as={h1 ? 'h1' : 'h2'} className={className}>
      {children}
    </Split>
  )
}

/* ───────── Inner-page header ───────── */
export function PageHead({
  title,
  lede,
  crumbs,
}: {
  title: string
  lede?: string
  crumbs?: { to: string; label: string }[]
}) {
  return (
    <section className="pagehead">
      <div className="wrap">
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            {crumbs.map((c) => (
              <span key={c.to}>
                / <Link to={c.to as any}>{c.label}</Link>
              </span>
            ))}
          </nav>
        )}
        <Split as="h1">{title}</Split>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </section>
  )
}

/* ───────── Full-width photo band directly under the hero ───────── */
export function PhotoBand() {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <Photo k="hero" ratio="21 / 9" mask parallax sizes="(min-width: 1180px) 1180px, 100vw" className="ph--wide" priority>
          <p className="ph-caption">Our own crews on every roof. No subcontractors, no strangers.</p>
        </Photo>
      </div>
    </section>
  )
}

/* ───────── Closing call-to-action ───────── */
export function CtaBand({ title = 'Ready for a roof you can stop thinking about?' }: { title?: string }) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cta-band reveal">
          <div className="cta-copy">
            <Split as="h2" className="h2">{title}</Split>
            <div className="row" style={{ marginTop: 28 }}>
              <Link className="btn btn--accent" to="/contact">Get a free estimate</Link>
              <a className="btn btn--ghost" href={`tel:${site.contact.phoneHref}`}>Call {site.contact.phoneDisplay}</a>
            </div>
          </div>
          <Photo k="crew" ratio="4 / 3" sizes="(min-width: 900px) 420px, 100vw" className="cta-photo" />
        </div>
      </div>
    </section>
  )
}

/* ───────── Home bento ───────── */
export function Bento() {
  const [repair, replacement, inspection] = site.services
  const r = site.reviews
  const photoTile = (s: (typeof site.services)[number], cls: string, extra: string, body: React.ReactNode) => (
    <Link to="/services/$id" params={{ id: s.id }} className={`tile tile--photo ${cls} reveal`} data-cursor="View">
      <Photo k={s.photo} bg bw className="ph--tile" sizes="(min-width: 900px) 600px, 100vw" />
      <div className="tile-top">
        <h3>{s.name}</h3>
        <p>{extra}</p>
      </div>
      {body}
    </Link>
  )
  return (
    <section className="section" id="services">
      <div className="wrap">
        <span className="eyebrow">What we do</span>
        <H className="h2">Repair it, replace it, or find out which.</H>
        <div className="bento">
          {photoTile(
            replacement,
            't-a',
            replacement.body,
            <div className="tile-bottom">
              <div className="big accent-serif">{replacement.priceGuide.replace('Typical homes: ', '')}</div>
              <span className="go">See how it works</span>
            </div>,
          )}
          {photoTile(repair, 't-b', `${repair.kicker}. ${repair.priceGuide}.`, <span className="go">Repair details</span>)}
          {photoTile(inspection, 't-c', `${inspection.priceGuide}.`, <span className="go">Book an inspection</span>)}
          <Link to="/reviews" className="tile t-d reveal">
            <div className="big">{r.rating.toFixed(1)}</div>
            <p>{r.count} reviews on {r.source.split(',')[0]}</p>
          </Link>
          <Link to="/financing" className="tile t-e reveal">
            <h3>Monthly payments</h3>
            <span className="go">Financing options</span>
          </Link>
          <Link to="/area" className="tile t-f reveal">
            <h3>{site.serviceAreas.radiusMiles} miles around {site.company.city}</h3>
            <span className="go">Service area</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ───────── Services list: fires `service_viewed` as each scrolls into view ───────── */
export function Services({ h1 }: Head) {
  const refs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.55) {
            const id = (e.target as HTMLElement).dataset.service!
            track('service_viewed', { service_id: id, service_name: (e.target as HTMLElement).dataset.name }, { once: `sv:${id}` })
          }
        }
      },
      { threshold: [0.55] },
    )
    Object.values(refs.current).forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="section" id="services">
      <div className="wrap">
        <span className="eyebrow">What we do</span>
        <H h1={h1} className="h2">Repair it, replace it, or find out which.</H>
        <div className="svc-list">
          {site.services.map((s) => (
            <article
              key={s.id}
              className="svc reveal"
              data-service={s.id}
              data-name={s.name}
              ref={(el) => {
                refs.current[s.id] = el
              }}
            >
              <div>
                <h3>
                  <Link to="/services/$id" params={{ id: s.id }}>{s.name}</Link>
                </h3>
                <p className="kicker">{s.kicker}</p>
              </div>
              <div>
                <p>{s.body}</p>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link className="btn btn--ink" to="/services/$id" params={{ id: s.id }}>
                  {s.cta}
                </Link>
              </div>
              <Link to="/services/$id" params={{ id: s.id }} data-cursor="View" aria-label={`${s.name} details`}>
                <Photo k={s.photo} ratio="4 / 3" bw sizes="(min-width: 900px) 340px, 100vw" viewTransitionName={`svc-${s.id}`} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────── Bookable offers (live Whop plan prices) ───────── */
export function Offers({ prices, h1 }: { prices: Prices } & Head) {
  return (
    <section className="section section--surface" id="book">
      <div className="wrap">
        <span className="eyebrow">Book and pay online</span>
        <H h1={h1} className="h2">Three ways to get started today.</H>
        <p className="lede" style={{ marginTop: 16 }}>
          Checkout runs on Whop. Apple Pay, Google Pay and cards work out of the box, and larger orders can show monthly-payment options.
        </p>
        <div className="offers reveal">
          {site.offers.map((o) => (
            <div key={o.slug} className={`offer${o.kind === 'deposit' ? ' is-feature' : ''}`}>
              <Photo k={o.photo} ratio="16 / 10" bw sizes="(min-width: 900px) 400px, 100vw" />
              <h3>{o.title}</h3>
              <div className="price">{prices[o.slug]?.formatted ?? o.priceLabel}</div>
              <p>{o.blurb}</p>
              <ul>
                {o.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Link className="btn btn--ink" to="/checkout/$slug" params={{ slug: o.slug }}>
                {o.kind === 'deposit' ? 'Pay deposit' : 'Book now'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────── Service area ───────── */
export function ServiceArea({ h1 }: Head) {
  const a = site.serviceAreas
  return (
    <section className="section section--ink" id="area">
      <div className="wrap">
        <div className="area">
          <div>
            <span className="eyebrow">Service area</span>
            <H h1={h1} className="h2">{a.headline}</H>
            <p className="lede" style={{ marginTop: 16 }}>{a.blurb}</p>
            <div className="chips">
              {a.cities.map((c) => (
                <span className="chip" key={c}>{c}</span>
              ))}
            </div>
          </div>
          <svg className="radar reveal" viewBox="0 0 400 400" role="img" aria-label={`Service radius of ${a.radiusMiles} miles around ${site.company.city}`}>
            {[170, 120, 70].map((r, i) => (
              <circle key={r} cx="200" cy="200" r={r} fill={i === 0 ? 'rgba(255,255,255,0.04)' : 'none'} stroke="var(--accent)" strokeOpacity={0.45 + i * 0.25} strokeWidth="2" strokeDasharray={i === 0 ? '3 8' : undefined} />
            ))}
            <line x1="200" y1="30" x2="200" y2="370" stroke="var(--on-ink)" strokeOpacity=".14" />
            <line x1="30" y1="200" x2="370" y2="200" stroke="var(--on-ink)" strokeOpacity=".14" />
            <circle cx="200" cy="200" r="9" fill="var(--on-ink)" />
            <text x="200" y="236" textAnchor="middle" fill="var(--on-ink)" fontSize="18" fontWeight="700">{site.company.city} HQ</text>
            <text x="200" y="22" textAnchor="middle" fill="var(--on-ink-muted)" fontSize="15">{a.radiusMiles} mi</text>
          </svg>
        </div>
        <Photo k="area" ratio="21 / 8" mask parallax bw className="area-photo" />
      </div>
    </section>
  )
}

/* ───────── Financing callout ───────── */
export function Financing({ h1 }: Head) {
  const f = site.financing
  return (
    <section className="section" id="financing">
      <div className="wrap">
        <div className="finance reveal">
          <div>
            <H h1={h1} className="h2">{f.headline}</H>
            <p>{f.body}</p>
            <small>{f.note}</small>
          </div>
          <div className="finance-art" aria-hidden="true">
            <div>Klarna <span>pay over time</span></div>
            <div>Affirm <span>monthly payments</span></div>
            <div>Afterpay <span>4 installments</span></div>
            <div>Apple Pay · Google Pay <span>one tap</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────── Reviews + trust ───────── */
export function Reviews({ h1, limit }: Head & { limit?: number }) {
  const r = site.reviews
  const items = limit ? r.items.slice(0, limit) : r.items
  return (
    <section className="section section--surface" id="reviews">
      <div className="wrap">
        <div className="rev-head">
          <H h1={h1} className="h2">Homeowners post the receipts.</H>
          <div>
            <div className="rating">{r.rating.toFixed(1)}</div>
            <div className="stars" aria-label={`${r.rating} out of 5 stars`}>★★★★★</div>
            <div style={{ color: 'var(--muted)' }}>{r.count} reviews · {r.source}</div>
          </div>
        </div>
        <Photo k="reviews" ratio="21 / 9" mask parallax className="rev-photo" />
        <div className="reviews">
          {items.map((i) => (
            <figure key={i.name} className="review reveal">
              <p>“{i.text}”</p>
              <cite>
                {i.name} <span>· {i.place} · {i.job}</span>
              </cite>
            </figure>
          ))}
        </div>
        <div className="trust">
          {site.trust.map((t) => (
            <div key={t.label}>
              <b>{t.value}</b>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
