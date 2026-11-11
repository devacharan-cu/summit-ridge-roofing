import { createFileRoute, Link } from '@tanstack/react-router'
import { site, offerBySlug, pageTitle } from '#/config/site'

type Search = { offer?: string; payment?: string; status?: string; card?: string; setup?: string }

export const Route = createFileRoute('/_site/thanks')({
  head: () => ({ meta: [{ title: pageTitle('Payment Received') }, { name: 'robots', content: 'noindex' }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    offer: typeof s.offer === 'string' ? s.offer : undefined,
    payment: typeof s.payment === 'string' ? s.payment : undefined,
    status: typeof s.status === 'string' ? s.status : undefined,
    card: typeof s.card === 'string' ? s.card : undefined,
    setup: typeof s.setup === 'string' ? s.setup : undefined,
  }),
  component: Thanks,
})

function Thanks() {
  const s = Route.useSearch()
  const offer = s.offer ? offerBySlug(s.offer) : undefined
  const failed = s.status === 'failed' || s.status === 'canceled'
  const deposit = offer?.kind === 'deposit'

  return (
    <div className="wrap section">
      <div className="panel" style={{ maxWidth: 760 }}>
        <span className="eyebrow">{failed ? 'Payment not completed' : 'Payment received'}</span>
        <h1 className="h2" style={{ maxWidth: '22ch' }}>
          {failed ? 'That payment didn’t go through.' : deposit ? 'Your crew is reserved.' : 'You’re booked.'}
        </h1>
        <p className="lede" style={{ margin: '18px 0' }}>
          {failed
            ? 'No money was taken. Go back and try another payment method, or call us and we’ll take it over the phone.'
            : deposit
              ? `Your ${offer?.priceLabel} deposit is paid${s.card ? ` and your card ending ${s.card} is saved securely` : ''}. When the work is finished we’ll bill the remaining balance with a Whop invoice, charged to your saved card or emailed to you to pay manually.`
              : `We’ve received your payment${offer ? ` for ${offer.title.toLowerCase()}` : ''}. A confirmation receipt is on its way to your email, and we’ll call within one business day to schedule.`}
        </p>
        {s.payment && (
          <p className="co-note">Payment reference: <span className="code">{s.payment}</span></p>
        )}
        <div className="row mt">
          <Link className="btn btn--ink" to="/">Back to {site.company.shortName}</Link>
          {failed && offer && <Link className="btn btn--accent" to="/checkout/$slug" params={{ slug: offer.slug }} search={{}}>Try again</Link>}
        </div>
      </div>
    </div>
  )
}
