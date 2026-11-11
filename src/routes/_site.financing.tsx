import { createFileRoute, Link } from '@tanstack/react-router'
import { Financing, CtaBand } from '#/components/Sections'
import { pageTitle } from '#/config/site'

export const Route = createFileRoute('/_site/financing')({
  head: () => ({ meta: [{ title: pageTitle('Roof Financing') }] }),
  component: () => (
    <>
      <Financing h1 />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="h2">How it works at checkout</h2>
          <ol className="steps">
            <li className="reveal"><div><h3>Choose a service</h3><p>Pick the inspection, deposit or flat-rate service you want to book.</p></div></li>
            <li className="reveal"><div><h3>See your options</h3><p>The Whop checkout shows installment methods automatically when you are eligible for the amount.</p></div></li>
            <li className="reveal"><div><h3>Pay your way</h3><p>Choose monthly payments, a card, or Apple Pay and Google Pay. Approval is handled by the provider.</p></div></li>
          </ol>
          <div className="row mt">
            <Link className="btn btn--accent" to="/book">Book online</Link>
          </div>
        </div>
      </section>
      <CtaBand title="Want a number for your roof first?" />
    </>
  ),
})
