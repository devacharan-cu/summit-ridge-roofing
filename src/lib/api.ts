import { createServerFn } from '@tanstack/react-start'
import { site, offerBySlug } from '#/config/site'

/* ───────────────────────── helpers ───────────────────────── */

const clean = (v: unknown, max = 200) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function srv() {
  return await import('./whop.server')
}

const money = (n: number) => n.toFixed(2)

/* ─────────────── 1. Live plan prices (read from Whop) ─────────────── */

export const getOfferPrices = createServerFn({ method: 'GET' }).handler(async () => {
  const { whop } = await srv()
  const out: Record<string, { amount: string; formatted: string }> = {}
  await Promise.all(
    site.offers.map(async (o) => {
      try {
        const v = await whop('GET', `/variants/${o.planId}`)
        out[o.slug] = {
          amount: String(v.initial_price_due?.amount ?? v.initial_price ?? ''),
          formatted: v.formatted_price ?? o.priceLabel,
        }
      } catch {
        out[o.slug] = { amount: '', formatted: o.priceLabel }
      }
    }),
  )
  return out
})

/* ─────────────── 2. Estimate request → Whop Lead ─────────────── */

export type EstimateInput = {
  name: string
  email: string
  phone: string
  address: string
  zip: string
  service: string
  urgency: string
  message: string
  referrer?: string
  company_website?: string // honeypot
}

let ownerUserId: string | null = null

export const submitEstimate = createServerFn({ method: 'POST' })
  .validator((d: EstimateInput) => d)
  .handler(async ({ data }) => {
    // Honeypot: bots fill hidden fields. Pretend success, create nothing.
    if (data.company_website) return { ok: true as const, leadId: 'ignored' }

    const input = {
      name: clean(data.name, 80),
      email: clean(data.email, 120).toLowerCase(),
      phone: clean(data.phone, 30),
      address: clean(data.address, 160),
      zip: clean(data.zip, 10),
      service: clean(data.service, 60),
      urgency: clean(data.urgency, 40),
      message: clean(data.message, 450),
    }
    if (input.name.length < 2) return { ok: false as const, error: 'Enter your name.' }
    if (!emailRe.test(input.email)) return { ok: false as const, error: 'Enter a valid email address.' }
    if (input.phone.replace(/\D/g, '').length < 10) return { ok: false as const, error: 'Enter a 10-digit phone number.' }
    if (!/^\d{5}$/.test(input.zip)) return { ok: false as const, error: 'Enter a 5-digit ZIP code.' }

    const { whop } = await srv()
    try {
      // The Leads API attaches a lead to a Whop user. Anonymous visitors have no
      // Whop user yet, so we attach to the business owner and keep the prospect's
      // details in the lead's metadata (visible in the dashboard and /pro).
      if (!ownerUserId) {
        const members = await whop<any>('GET', `/members?account_id=${site.whop.accountId}&first=20`)
        const admin = members.data?.find((m: any) => m.access_level === 'admin') ?? members.data?.[0]
        ownerUserId = admin?.user?.id ?? null
      }
      if (!ownerUserId) throw new Error('No owner user found for the account')

      // Whop keeps ONE lead per (user, product), so a second POST for the same pair returns the
      // same lead. To keep every quote request, we ensure the lead exists, then append each
      // submission to its metadata as a numbered entry (req_001, req_002, …) and mirror the
      // latest contact details at the top level.
      const lead = await whop<any>('POST', '/leads', {
        account_id: site.whop.accountId,
        product_id: site.whop.leadProductId,
        user_id: ownerUserId,
        referrer: data.referrer ? clean(data.referrer, 300) : null,
        // No `metadata` here on purpose: a repeat POST for the same user+product replaces any
        // metadata it carries, which would wipe the stored request history.
      })
      const current = await whop<any>('GET', `/leads/${lead.id}`)
      const prev: Record<string, string> = { ...(current.metadata ?? {}) }
      const count = (Number(prev.request_count) || 0) + 1

      // Each metadata value is limited to 500 chars: shrink the message until the entry fits.
      let msg = input.message
      let entry = ''
      for (;;) {
        entry = JSON.stringify({ t: new Date().toISOString(), n: input.name, e: input.email, p: input.phone, a: input.address, z: input.zip, s: input.service, u: input.urgency, m: msg })
        if (entry.length <= 480 || msg.length === 0) break
        msg = msg.slice(0, Math.max(0, msg.length - 40))
      }

      // Keep the 40 most recent entries (Whop allows 50 metadata keys).
      const reqKeys = Object.keys(prev).filter((k) => /^req_\d+$/.test(k)).sort()
      for (const k of reqKeys.slice(0, Math.max(0, reqKeys.length - 39))) delete prev[k]

      const metadata: Record<string, string> = {
        ...prev,
        source: 'website_estimate_form',
        request_count: String(count),
        ...Object.fromEntries(Object.entries(input).map(([k, v]) => [`latest_${k}`, v])),
        [`req_${String(count).padStart(3, '0')}`]: entry,
      }
      await whop<any>('PATCH', `/leads/${lead.id}`, { metadata })
      return { ok: true as const, leadId: lead.id as string }
    } catch (e: any) {
      console.error('submitEstimate failed', e?.status, e?.message)
      return { ok: false as const, error: 'We could not send your request. Please call us or try again.' }
    }
  })

/* ─────────────── 3. Checkout confirmation ─────────────── */

export type ConfirmInput = {
  slug: string
  confirmationToken: string
  email: string
  returnUrl: string
}

export type ConfirmResult =
  | { ok: true; status: string; paymentId: string; clientSecret?: string | null; savedCard?: { brand?: string; last4?: string } | null; setupIntentId?: string }
  | { ok: false; error: string }

export const confirmCheckout = createServerFn({ method: 'POST' })
  .validator((d: ConfirmInput) => d)
  .handler(async ({ data }): Promise<ConfirmResult> => {
    const offer = offerBySlug(data.slug)
    if (!offer) return { ok: false, error: 'Unknown service.' }
    if (!data.confirmationToken) return { ok: false, error: 'Missing payment details.' }
    const { whop } = await srv()
    const accountId = site.whop.accountId

    try {
      if (offer.kind === 'deposit') {
        // Step 1: SETUP INTENT. Save the card on file (nothing charged yet).
        const setup = await whop<any>('POST', '/setup_intents', {
          account_id: accountId,
          confirmation_token: data.confirmationToken,
          email: clean(data.email, 120),
          currency: 'usd',
          return_url: data.returnUrl,
          metadata: { purpose: 'final_balance_card_on_file', offer: offer.slug },
        })
        if (setup.status === 'requires_action') {
          return { ok: true, status: 'requires_action', paymentId: '', clientSecret: setup.client_secret, setupIntentId: setup.id }
        }
        if (setup.status !== 'succeeded' || !setup.payment_method_id) {
          return { ok: false, error: setup.last_setup_error?.message || 'We could not save that card. Try another payment method.' }
        }
        // Step 2: charge the DEPOSIT against the freshly saved method.
        const pay = await whop<any>('POST', '/payments', {
          account_id: accountId,
          variant_id: offer.planId,
          member_id: setup.member_id,
          payment_method_id: setup.payment_method_id,
          off_session: false,
          return_url: data.returnUrl,
          metadata: { flow: 'deposit', offer: offer.slug, setup_intent_id: setup.id },
        })
        return {
          ok: true,
          status: pay.status,
          paymentId: pay.id,
          clientSecret: pay.client_secret,
          setupIntentId: setup.id,
          savedCard: { brand: setup.payment_instrument?.card?.brand, last4: setup.payment_instrument?.card?.last4 },
        }
      }

      const pay = await whop<any>('POST', '/payments', {
        account_id: accountId,
        variant_id: offer.planId,
        confirmation_token: data.confirmationToken,
        email: clean(data.email, 120),
        return_url: data.returnUrl,
        metadata: { flow: 'one_time', offer: offer.slug },
      })
      return { ok: true, status: pay.status, paymentId: pay.id, clientSecret: pay.client_secret }
    } catch (e: any) {
      console.error('confirmCheckout failed', e?.status, e?.message)
      return { ok: false, error: e?.message || 'Payment failed. Please try again.' }
    }
  })

/* ─────────────── 4. Contractor console (passcode-gated) ─────────────── */

async function assertPro(passcode: string) {
  const { getEnv } = await srv()
  const expected = getEnv('PRO_PASSCODE')
  if (!expected) throw new Error('Console disabled: set the PRO_PASSCODE app secret.')
  if (clean(passcode, 100) !== expected) throw new Error('Wrong passcode.')
}

export type ProRow = {
  paymentId: string
  email: string | null
  paidAt: string | null
  status: string
  amount: string
  card: string | null
  hasSavedCard: boolean
  offer: string
}

export const proOverview = createServerFn({ method: 'POST' })
  .validator((d: { passcode: string }) => d)
  .handler(async ({ data }) => {
    try {
      await assertPro(data.passcode)
    } catch (e: any) {
      return { ok: false as const, error: e.message as string }
    }
    const { whop } = await srv()
    const accountId = site.whop.accountId
    let leads: any, payments: any
    try {
      ;[leads, payments] = await Promise.all([
        whop<any>('GET', `/leads?account_id=${accountId}&first=25`),
        whop<any>('GET', `/payments?account_id=${accountId}&first=25`),
      ])
    } catch (e: any) {
      console.error('proOverview failed', e?.status, e?.message)
      return { ok: false as const, error: `Whop API error${e?.status ? ` ${e.status}` : ''}: ${e?.message ?? 'unknown'}` }
    }
    const rows: ProRow[] = (payments.data ?? [])
      .filter((p: any) => p.status === 'paid')
      .map((p: any) => ({
        paymentId: p.id,
        email: p.customer_email ?? p.user?.email ?? null,
        paidAt: p.paid_at,
        status: p.status,
        amount: p.total?.amount ?? '',
        card: p.payment_instrument?.card ? `${p.payment_instrument.card.brand ?? 'Card'} ····${p.payment_instrument.card.last4 ?? ''}` : null,
        hasSavedCard: !!p.payment_method_id,
        offer: p.metadata?.offer ?? '',
      }))
    return {
      ok: true as const,
      // One Whop lead holds every request as req_### metadata entries; flatten them for display.
      requests: (leads.data ?? [])
        .filter((l: any) => l.metadata?.source === 'website_estimate_form')
        .flatMap((l: any) => {
          const m: Record<string, string> = l.metadata ?? {}
          const rows = Object.keys(m)
            .filter((k) => /^req_\d+$/.test(k))
            .sort()
            .reverse()
            .map((k) => {
              try {
                const r = JSON.parse(m[k])
                return { leadId: l.id as string, at: r.t as string, name: r.n as string, email: r.e as string, phone: r.p as string, address: r.a as string, zip: r.z as string, service: r.s as string, urgency: r.u as string, message: r.m as string }
              } catch {
                return null
              }
            })
            .filter(Boolean) as { leadId: string; at: string; name: string; email: string; phone: string; address: string; zip: string; service: string; urgency: string; message: string }[]
          return rows
        }),
      deposits: rows,
      job: site.demoJob,
    }
  })

export const createFinalInvoice = createServerFn({ method: 'POST' })
  .validator((d: { passcode: string; paymentId: string; mode: 'auto_charge' | 'send' }) => d)
  .handler(async ({ data }) => {
    try {
      await assertPro(data.passcode)
    } catch (e: any) {
      return { ok: false as const, error: e.message as string }
    }
    const { whop } = await srv()
    const accountId = site.whop.accountId
    try {
      const dep = await whop<any>('GET', `/payments/${clean(data.paymentId, 40)}`)
      if (!dep.member_id) return { ok: false as const, error: 'That payment has no customer to invoice.' }
      if (data.mode === 'auto_charge' && !dep.payment_method_id) {
        return { ok: false as const, error: 'No card on file for this customer. Use "Send invoice to pay" instead.' }
      }
      const paid = Number(dep.total?.amount ?? 0)
      const balance = Math.max(site.demoJob.contractTotal - paid, 1)

      const invoice = await whop<any>('POST', '/invoices', {
        account_id: accountId,
        member_id: dep.member_id,
        payment_method_id: data.mode === 'auto_charge' ? dep.payment_method_id : undefined,
        memo: `Final balance: ${site.demoJob.label}. Contract total $${money(site.demoJob.contractTotal)} less $${money(paid)} already paid.`,
        metadata: { kind: 'final_balance', deposit_payment_id: dep.id },
        items: [
          {
            quantity: 1,
            description: site.demoJob.label,
            variant: {
              billing_type: 'one_time',
              currency: 'usd',
              initial_price: balance,
              title: 'Final balance',
              product_id: dep.product_id ?? undefined,
              visibility: 'hidden',
              force_create_new_plan: true,
            },
          },
        ],
      })

      let result: any
      if (data.mode === 'auto_charge') {
        // Charge the stored card the customer saved at deposit checkout.
        result = await whop<any>('POST', `/invoices/${invoice.id}/charge`, { payment_method_id: dep.payment_method_id })
      } else {
        // Email the invoice for manual payment.
        result = await whop<any>('POST', `/invoices/${invoice.id}/send`, {})
      }
      return {
        ok: true as const,
        invoiceId: invoice.id as string,
        status: (result?.status ?? invoice.status) as string,
        balance: money(balance),
        link: (result?.checkout_link ?? invoice.checkout_link ?? null) as string | null,
        mode: data.mode,
      }
    } catch (e: any) {
      console.error('createFinalInvoice failed', e?.status, e?.message, JSON.stringify(e?.body))
      return { ok: false as const, error: e?.message || 'Invoice failed.' }
    }
  })
