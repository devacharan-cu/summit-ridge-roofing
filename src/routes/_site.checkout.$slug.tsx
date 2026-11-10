import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import {
  WhopElements,
  Payments,
  PaymentElement,
  AddressElement,
  EmailElement,
  BrandingElement,
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  usePayments,
  useWhop,
} from '@whop/elements-react'
import type { AddressElementHandle } from '@whop/elements-react'
import { loadWhop } from '@whop/elements'
import { site, offerBySlug, type Offer } from '#/config/site'
import { confirmCheckout, getOfferPrices } from '#/lib/api'
import { track } from '#/lib/track'

export const Route = createFileRoute('/_site/checkout/$slug')({
  validateSearch: (s: Record<string, unknown>): { ui?: 'hosted' } => (s.ui === 'hosted' ? { ui: 'hosted' } : {}),
  loader: async ({ params }) => {
    const offer = offerBySlug(params.slug)
    if (!offer) throw notFound()
    const prices = await getOfferPrices()
    return { offer, price: prices[offer.slug]?.formatted ?? offer.priceLabel }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.offer.title ?? 'Checkout'} · ${site.company.name}` }],
  }),
  component: CheckoutPage,
})

function CheckoutPage() {
  const { offer, price } = Route.useLoaderData()
  const { ui } = Route.useSearch()
  const hosted = ui === 'hosted' && offer.kind !== 'deposit'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
    // Custom pixel event: fires once when the visitor lands on this checkout.
    track(offer.trackEvent, { offer: offer.slug, plan_id: offer.planId, title: offer.title }, { once: `co:${offer.slug}` })
  }, [offer])

  return (
    <div className="co">
      <div className="wrap">
        <Link className="crumb" to="/book">← Back to booking</Link>
        <div className="co-grid" style={{ marginTop: 22 }}>
          <aside className="co-summary" data-whop-variant-id={offer.planId} data-whop-price={price.replace(/[^0-9.]/g, '')} data-whop-currency="USD">
            <span className="eyebrow">{offer.kind === 'deposit' ? 'Project deposit' : 'Book online'}</span>
            <h1 className="h2">{offer.title}</h1>
            <div className="price">{price}</div>
            <p className="lede">{offer.blurb}</p>
            <ul>
              {offer.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {offer.kind === 'deposit' && (
              <p className="notice" style={{ marginTop: 22 }}>
                <b>Card on file.</b> We securely save the card you use here through Whop. When your job is complete we bill the remaining balance as a Whop invoice, charged to this card or sent for manual payment.
              </p>
            )}
            {offer.kind !== 'deposit' && (
              <p className="co-note" style={{ marginTop: 22 }}>
                {hosted ? (
                  <>Showing Whop’s full <b>CheckoutElement</b> (promo codes, tax, financing). <Link to="/checkout/$slug" params={{ slug: offer.slug }} search={{}}>Switch to the PaymentElement form</Link>.</>
                ) : (
                  <>Showing the <b>PaymentElement</b> form with Express wallets. <Link to="/checkout/$slug" params={{ slug: offer.slug }} search={{ ui: 'hosted' }}>Switch to the full CheckoutElement</Link> (promo codes, tax, financing).</>
                )}
              </p>
            )}
          </aside>

          <section className="co-card" aria-label="Payment">
            {ready ? <PayPanel offer={offer} hosted={hosted} /> : <p className="co-note">Loading secure checkout…</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

function PayPanel({ offer, hosted }: { offer: Offer; hosted: boolean }) {
  const navigate = useNavigate()
  const elements = useMemo(() => loadWhop(), [])
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const returnUrl = `${origin}/thanks?offer=${offer.slug}`
  const isDeposit = offer.kind === 'deposit'

  // Deposit checkout runs in SETUP mode: it collects a saveable method and charges nothing
  // client-side; the server creates the setup intent, then charges the deposit.
  const paymentsProps: any = useMemo(
    () =>
      isDeposit
        ? { accountId: site.whop.accountId, mode: 'setup', currency: 'usd', setupFutureUsage: 'off_session', returnUrl }
        : { accountId: site.whop.accountId, plan: offer.planId, returnUrl },
    [isDeposit, returnUrl, offer.planId],
  )
  const appearance = useMemo(() => ({ theme: 'light' }) as any, [])
  const expressMeta = useMemo(() => ({ flow: 'express', offer: offer.slug }), [offer.slug])
  const onExpressComplete = useCallback(
    (r: any) => {
      navigate({ to: '/thanks', search: { offer: offer.slug, payment: r.paymentId ?? '', status: 'succeeded' } })
    },
    [navigate, offer.slug],
  )

  if (hosted) {
    // Full hosted surface: order summary, promo codes, tax, financing, wallets.
    return (
      <WhopElements elements={elements} appearance={appearance}>
        <Checkout plan={offer.planId} returnUrl={returnUrl} metadata={expressMeta} onComplete={onExpressComplete}>
          <CheckoutElement />
        </Checkout>
      </WhopElements>
    )
  }

  return (
    <WhopElements elements={elements} appearance={appearance}>
      {/* Express: Apple Pay / Google Pay / PayPal wallet buttons (render only where available) */}
      {!isDeposit && (
        <>
          <Checkout plan={offer.planId} returnUrl={returnUrl} metadata={expressMeta} onComplete={onExpressComplete}>
            <ExpressCheckoutElement />
          </Checkout>
          <div className="co-sep">Card, bank and more</div>
        </>
      )}

      <Payments {...paymentsProps}>
        <PayForm offer={offer} returnUrl={returnUrl} />
      </Payments>
    </WhopElements>
  )
}

function PayForm({ offer, returnUrl }: { offer: Offer; returnUrl: string }) {
  const navigate = useNavigate()
  const payments = usePayments()
  const whopSdk = useWhop()
  const addressRef = useRef<AddressElementHandle | null>(null)
  const [email, setEmail] = useState('')
  const [emailOk, setEmailOk] = useState(false)
  const [methodOk, setMethodOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isDeposit = offer.kind === 'deposit'
  const onEmail = useCallback((p: any) => {
    setEmail(p.email)
    setEmailOk(!!p.complete)
  }, [])
  const onMethod = useCallback((e: any) => setMethodOk(!!e.complete), [])

  async function pay() {
    if (busy || !payments) return
    setError('')
    setBusy(true)
    try {
      const addr = await addressRef.current?.validate()
      if (!addr?.complete) throw new Error('Complete your billing address.')
      const a = addr.address
      const { confirmationToken } = await payments.createConfirmationToken({
        billingDetails: {
          email,
          name: a.name,
          address: { line1: a.line1, line2: a.line2, city: a.city, state: a.state, postal_code: a.postal_code, country: a.country },
        },
      })
      const res = await confirmCheckout({ data: { slug: offer.slug, confirmationToken, email, returnUrl } })
      if (!res.ok) throw new Error(res.error)
      if (res.clientSecret && (res.status === 'requires_action' || res.status === 'pending' || res.status === 'open') && whopSdk) {
        const next = await (whopSdk as any).payments.handleNextAction({ clientSecret: res.clientSecret, returnUrl })
        if (next?.redirected) return
        if (next?.status && next.status !== 'succeeded' && next.status !== 'paid') {
          throw new Error(next.lastPaymentError?.message || 'The payment was not completed.')
        }
      }
      navigate({
        to: '/thanks',
        search: { offer: offer.slug, payment: res.paymentId, status: 'succeeded', card: res.savedCard?.last4 ?? '' },
      })
    } catch (e: any) {
      setError(e?.message || 'Payment failed. Check your details and try again.')
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <EmailElement onChange={onEmail} />
      <AddressElement ref={addressRef as any} mode="billing" />
      <PaymentElement onChange={onMethod} />
      {/* Required by Whop on every payment form: merchant-of-record notice */}
      <BrandingElement />
      {error && <div className="form-msg err" role="alert">{error}</div>}
      <button className="btn btn--accent" type="button" onClick={pay} disabled={busy || !payments || !emailOk || !methodOk}>
        {busy ? 'Processing…' : isDeposit ? 'Save card & pay deposit' : `Pay ${offer.priceLabel}`}
      </button>
      <p className="co-note">
        {isDeposit ? 'Your card is saved for the final balance only. ' : ''}
        Payments are processed by <b>Whop</b>. We never see your card number.
      </p>
    </div>
  )
}
