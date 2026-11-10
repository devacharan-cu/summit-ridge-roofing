import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { site } from '#/config/site'
import { proOverview, createFinalInvoice, type ProRow } from '#/lib/api'

export const Route = createFileRoute('/_site/pro')({
  head: () => ({ meta: [{ title: `Contractor console · ${site.company.name}` }, { name: 'robots', content: 'noindex' }] }),
  component: Pro,
})

type Overview = Extract<Awaited<ReturnType<typeof proOverview>>, { ok: true }>

function Pro() {
  const [pass, setPass] = useState('')
  const [data, setData] = useState<Overview | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<Record<string, any>>({})

  async function load(e?: React.FormEvent) {
    e?.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const r = await proOverview({ data: { passcode: pass } })
      if (r.ok) setData(r)
      else setErr(r.error)
    } catch {
      setErr('Could not load the console.')
    }
    setBusy(false)
  }

  async function invoice(row: ProRow, mode: 'auto_charge' | 'send') {
    setResults((r) => ({ ...r, [row.paymentId]: { pending: mode } }))
    const res = await createFinalInvoice({ data: { passcode: pass, paymentId: row.paymentId, mode } })
    setResults((r) => ({ ...r, [row.paymentId]: res }))
  }

  return (
    <div className="wrap section">
      <span className="eyebrow">For the contractor</span>
      <h1 className="h2">Job console</h1>
      <p className="lede" style={{ margin: '14px 0 28px' }}>
        Quote requests arrive as Whop Leads. Deposit customers have a card on file, so when the job is done you bill the balance with the Whop Invoices API.
      </p>

      {!data ? (
        <form className="panel stack" style={{ maxWidth: 460 }} onSubmit={load}>
          <div className="field">
            <label htmlFor="pc">Console passcode</label>
            <input id="pc" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
          </div>
          {err && <div className="form-msg err" role="alert">{err}</div>}
          <button className="btn btn--ink" disabled={busy || !pass}>{busy ? 'Checking…' : 'Open console'}</button>
        </form>
      ) : (
        <div className="stack">
          <section className="panel">
            <h2 style={{ fontSize: 28 }}>Customers &amp; final balance</h2>
            <p className="co-note" style={{ margin: '8px 0 16px' }}>
              Demo job: {data.job.label} · contract total ${data.job.contractTotal.toLocaleString()}. Final balance = contract total − amount already paid.
            </p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Customer</th><th>Paid</th><th>Card on file</th><th>Final balance</th></tr>
                </thead>
                <tbody>
                  {data.deposits.length === 0 && (
                    <tr><td colSpan={4}>No paid customers yet. Pay a deposit at <a href="/checkout/deposit">/checkout/deposit</a>.</td></tr>
                  )}
                  {data.deposits.map((d: ProRow) => {
                    const r = results[d.paymentId]
                    return (
                      <tr key={d.paymentId}>
                        <td>{d.email ?? '—'}<div><span className="code">{d.paymentId}</span></div></td>
                        <td>${d.amount} <span className={`pill ${d.status === 'paid' ? 'ok' : ''}`}>{d.status}</span></td>
                        <td>{d.card ?? (d.hasSavedCard ? 'Saved' : 'None')}</td>
                        <td>
                          <div className="row">
                            <button className="btn btn--ink" style={{ minHeight: 42, padding: '0 16px', fontSize: 15 }} disabled={!d.hasSavedCard || r?.pending} onClick={() => invoice(d, 'auto_charge')}>
                              Invoice &amp; auto-charge card
                            </button>
                            <button className="btn btn--ghost" style={{ minHeight: 42, padding: '0 16px', fontSize: 15 }} disabled={r?.pending} onClick={() => invoice(d, 'send')}>
                              Send invoice to pay
                            </button>
                          </div>
                          {r?.pending && <p className="co-note mt">Creating invoice…</p>}
                          {r && !r.pending && r.ok && (
                            <p className="form-msg ok mt">
                              Invoice <span className="code">{r.invoiceId}</span> for ${r.balance}: {r.status}
                              {r.mode === 'send' && r.link ? <> · <a href={r.link} target="_blank" rel="noreferrer">payment link</a></> : null}
                            </p>
                          )}
                          {r && !r.pending && !r.ok && <p className="form-msg err mt">{r.error}</p>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2 style={{ fontSize: 28 }}>Estimate requests (Whop Leads)</h2>
            <div className="tbl-wrap" style={{ marginTop: 14 }}>
              <table className="tbl">
                <thead>
                  <tr><th>Lead</th><th>Contact</th><th>Request</th></tr>
                </thead>
                <tbody>
                  {data.requests.length === 0 && <tr><td colSpan={3}>No estimate requests yet.</td></tr>}
                  {data.requests.map((l: any, i: number) => (
                    <tr key={`${l.leadId}-${l.at}-${i}`}>
                      <td><span className="code">{l.leadId}</span><div className="co-note">{new Date(l.at).toLocaleString()}</div></td>
                      <td>{l.name}<div>{l.email}</div><div>{l.phone}</div></td>
                      <td>{l.service} · {l.urgency}<div>{l.address} {l.zip}</div><div className="co-note">{l.message}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
