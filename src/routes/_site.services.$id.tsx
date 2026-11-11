import { useEffect } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { site, serviceById, offerBySlug, pageTitle } from '#/config/site'
import { PageHead, CtaBand } from '#/components/Sections'
import { Photo } from '#/components/Photo'
import { track } from '#/lib/track'

export const Route = createFileRoute('/_site/services/$id')({
  loader: ({ params }) => {
    const service = serviceById(params.id)
    if (!service) throw notFound()
    return service
  },
  head: ({ loaderData }) => ({
    meta: [{ title: pageTitle(loaderData?.name ?? 'Service') }, { name: 'description', content: loaderData?.body ?? '' }],
  }),
  component: ServicePage,
})

function ServicePage() {
  const s = Route.useLoaderData()
  const offer = s.offer ? offerBySlug(s.offer) : undefined
  const i = site.services.findIndex((x) => x.id === s.id)
  const prev = site.services[(i + site.services.length - 1) % site.services.length]
  const next = site.services[(i + 1) % site.services.length]

  // Custom pixel event: this service's detail page was viewed.
  useEffect(() => {
    track('service_viewed', { service_id: s.id, service_name: s.name, view: 'detail' }, { once: `sv-detail:${s.id}` })
  }, [s.id, s.name])

  return (
    <>
      <PageHead title={s.name} lede={s.body} crumbs={[{ to: '/services', label: 'Services' }]} />
      <div className="wrap" style={{ marginBottom: 8 }}>
        <Photo k={s.photo} ratio="21 / 9" parallax priority viewTransitionName={`svc-${s.id}`} />
      </div>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="wrap detail">
          <div>
            <span className="pricepill">{s.priceGuide}</span>
            <h2 className="h2" style={{ marginTop: 40 }}>How it works</h2>
            <ol className="steps">
              {s.process.map((p) => (
                <li key={p.title} className="reveal">
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <h2 className="h2" style={{ marginTop: 64 }}>Questions we hear</h2>
            <div className="faq">
              {s.faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="side">
            <h3 style={{ fontSize: 24 }}>What’s included</h3>
            <ul className="checks" style={{ marginTop: 0 }}>
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {offer ? (
              <Link className="btn btn--accent" to="/checkout/$slug" params={{ slug: offer.slug }}>
                {s.cta} · {offer.priceLabel}
              </Link>
            ) : (
              <Link className="btn btn--accent" to="/contact" search={{ service: s.estimate }}>
                {s.cta}
              </Link>
            )}
            <Link className="btn btn--ghost" style={{ color: 'var(--text)' }} to="/contact" search={{ service: s.estimate }}>
              Ask for a free estimate
            </Link>
            <a className="link-arrow" href={`tel:${site.contact.phoneHref}`}>Or call {site.contact.phoneDisplay}</a>
          </aside>
        </div>
        <div className="wrap sibling">
          <Link className="link-arrow" to="/services/$id" params={{ id: prev.id }}>{prev.name}</Link>
          <Link className="link-arrow" to="/services/$id" params={{ id: next.id }}>{next.name}</Link>
        </div>
      </section>
      <CtaBand />
    </>
  )
}
