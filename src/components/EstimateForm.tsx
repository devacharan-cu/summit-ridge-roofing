import { useState } from 'react'
import { site } from '#/config/site'
import { submitEstimate } from '#/lib/api'
import { track } from '#/lib/track'

export function EstimateSection({ defaultService, h1 }: { defaultService?: string; h1?: boolean }) {
  const Heading = h1 ? 'h1' : 'h2'
  const initialService = site.estimateServices.includes(defaultService ?? '') ? defaultService! : site.estimateServices[0]
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const form = e.currentTarget
    const f = new FormData(form)
    setState('sending')
    setMsg('')
    try {
      const res = await submitEstimate({
        data: {
          name: String(f.get('name') ?? ''),
          email: String(f.get('email') ?? ''),
          phone: String(f.get('phone') ?? ''),
          address: String(f.get('address') ?? ''),
          zip: String(f.get('zip') ?? ''),
          service: String(f.get('service') ?? ''),
          urgency: String(f.get('urgency') ?? ''),
          message: String(f.get('message') ?? ''),
          company_website: String(f.get('company_website') ?? ''),
          referrer: typeof document !== 'undefined' ? document.referrer || window.location.href : '',
        },
      })
      if (res.ok) {
        // Custom pixel events: our own name + Whop's standard `lead`.
        const common = { service: String(f.get('service')), zip: String(f.get('zip')), lead_id: res.leadId }
        track('estimate_requested', common, { once: `est:${res.leadId}` })
        track('lead', { ...common, event_id: res.leadId } as any)
        setState('ok')
        setMsg(`Thanks ${String(f.get('name')).split(' ')[0]}, we’ve got your request. An estimator will call you within one business day.`)
        form.reset()
      } else {
        setState('err')
        setMsg(res.error)
      }
    } catch {
      setState('err')
      setMsg('Something went wrong sending your request. Please call us instead.')
    }
  }

  return (
    <section className="section section--ink" id="estimate">
      <div className="wrap est">
        <div>
          <span className="eyebrow">Free estimate</span>
          <Heading className="h2">Tell us about your roof.</Heading>
          <p className="lede" style={{ marginTop: 16 }}>
            Send the basics and an estimator calls you within one business day. No obligation, no pressure.
          </p>
          <div className="contact-list">
            <div>
              <b>Call</b>
              <a href={`tel:${site.contact.phoneHref}`}>{site.contact.phoneDisplay}</a>
            </div>
            <div>
              <b>Email</b>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </div>
            <div>
              <b>Office</b>
              <span>{site.contact.address}</span>
            </div>
            <div>
              <b>Hours</b>
              <span>{site.contact.hours}</span>
            </div>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required />
          </div>
          <div className="field full">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="address">Street address</label>
            <input id="address" name="address" autoComplete="street-address" />
          </div>
          <div className="field">
            <label htmlFor="zip">ZIP code</label>
            <input id="zip" name="zip" autoComplete="postal-code" inputMode="numeric" maxLength={5} required />
          </div>
          <div className="field">
            <label htmlFor="service">What do you need?</label>
            <select id="service" name="service" key={initialService} defaultValue={initialService}>
              {site.estimateServices.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="urgency">How soon?</label>
            <select id="urgency" name="urgency" defaultValue="Within a month">
              <option>Active leak: ASAP</option>
              <option>Within 2 weeks</option>
              <option>Within a month</option>
              <option>Just planning</option>
            </select>
          </div>
          <div className="field full">
            <label htmlFor="message">Anything we should know?</label>
            <textarea id="message" name="message" placeholder="Roof age, leaks, hail date, insurance claim number…" />
          </div>
          {/* honeypot */}
          <div className="hp" aria-hidden="true">
            <label>Company website<input name="company_website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          {msg && <div className={`form-msg ${state === 'ok' ? 'ok' : 'err'}`} role="status">{msg}</div>}
          <div className="field full">
            <button className="btn btn--accent" type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Request my estimate'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
