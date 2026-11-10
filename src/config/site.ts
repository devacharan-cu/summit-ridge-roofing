/**
 * ───────────────────────────────────────────────────────────────────────────
 *  SITE CONFIG: the ONLY file you edit to re-skin this template.
 *
 *  To pitch a different roofing company:
 *    1. Change `company`, `contact`, `serviceAreas`, `reviews`, `trust`, `theme`.
 *    2. Create your Whop plans (see README) and paste the plan_ ids into `offers`.
 *       Prices shown on the site are read live from the Whop plan at runtime,
 *       so `priceLabel` is only a fallback.
 *    3. Edit `services` copy and swap the Pexels ids in `photos`.
 *  Nothing else in the codebase is company-specific.
 * ───────────────────────────────────────────────────────────────────────────
 */

export type Offer = {
  /** key into `photos` */
  photo: string
  /** URL slug → /checkout/<slug> */
  slug: string
  /** Whop plan (variant) id, prefixed plan_ */
  planId: string
  title: string
  /** Fallback display price (the live price is fetched from Whop) */
  priceLabel: string
  blurb: string
  /**
   * one_time → a single charge (inspection, flat-rate service).
   * deposit  → saves the card on file via a Whop setup intent, then charges the
   *            deposit so the final balance can be invoiced later.
   */
  kind: 'one_time' | 'deposit'
  bullets: string[]
  /** custom whop.track event fired when the visitor lands on this checkout */
  trackEvent: 'deposit_started' | 'checkout_started'
}

export type Service = {
  id: string
  /** key into `photos` */
  photo: string
  name: string
  kicker: string
  body: string
  points: string[]
  cta: string
  /** matches an option in `estimateServices` so the contact form pre-selects it */
  estimate: string
  priceGuide: string
  /** slug of a bookable offer */
  offer?: string
  process: { title: string; body: string }[]
  faq: { q: string; a: string }[]
}

/** Pexels CDN (free license). Swap the ids in `photos` for the new company's own shots. */
export const photoUrl = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

export const site = {
  company: {
    name: 'Summit Ridge Roofing',
    shortName: 'Summit Ridge',
    tagline: 'Roofs that outlast the weather.',
    city: 'Denver',
    state: 'CO',
    license: 'CO Lic. #RC-204117 · Bonded & insured',
    founded: 2009,
    warrantyYears: 25,
  },

  contact: {
    phoneDisplay: '(720) 555-0142',
    phoneHref: '+17205550142',
    email: 'hello@summitridgeroofing.example',
    address: '4120 Larimer St, Denver, CO 80216',
    hours: 'Mon–Sat 7am–6pm · Storm line 24/7',
  },

  /** Real photographs (Pexels, free to use). id = Pexels photo id. */
  photos: {
    hero: { id: 33404248, alt: 'Roofer fastening asphalt shingles with a nail gun' },
    repair: { id: 9431615, alt: 'Roofer repairing shingles on a pitched roof' },
    replacement: { id: 33404080, alt: 'Crew laying underlayment and shingles during a roof replacement' },
    inspection: { id: 7788264, alt: 'Inspector in hi-vis and harness checking a roof surface' },
    offerInspection: { id: 7788264, alt: 'Roof inspector in safety harness' },
    offerDeposit: { id: 33404981, alt: 'Home with roof replacement underway and materials staged' },
    offerGutter: { id: 35153375, alt: 'Gutter being flushed with a pressure nozzle' },
    area: { id: 6319128, alt: 'Aerial view of a suburban neighborhood and its rooftops' },
    reviews: { id: 33501308, alt: 'Crew on a ladder replacing the roof of a two-story home' },
    crew: { id: 34019842, alt: 'Roofer in a harness unloading materials from a truck' },
  } as Record<string, { id: number; alt: string }>,

  /** Whop business that owns plans, leads and invoices */
  whop: {
    accountId: 'biz_zUSA1RojoI0fBx',
    /** Product the "Request an estimate" lead is attached to */
    leadProductId: 'prod_W7EWu4EYoMpWg',
  },

  theme: {
    // Overrides CSS variables at runtime. Any valid CSS color.
    accent: '#8c7a5b',
    ink: '#24221f',
  },

  /** Marketing services → /services and /services/<id>. `offer` links to a bookable plan slug. */
  services: [
    {
      id: 'repair',
      photo: 'repair',
      name: 'Roof repair',
      kicker: 'Most jobs finished in a day',
      body: 'Leaks, lifted shingles, flashing failures and storm damage. We find the actual source, fix it, and photograph the work before we leave.',
      points: ['Leak tracing with moisture mapping', 'Flashing, vents & valley rebuilds', 'Insurance-ready photo report'],
      cta: 'Get a repair quote',
      estimate: 'Roof repair',
      priceGuide: 'Most repairs run $350–$1,800',
      process: [
        { title: 'Trace the leak', body: 'We track water to its entry point from the attic and the roof, not just where the stain shows up.' },
        { title: 'Fixed-price quote', body: 'You get a written price before any work starts. No hourly surprises.' },
        { title: 'Repair and photograph', body: 'We fix it, seal it and take before-and-after photos for your records or your insurer.' },
      ],
      faq: [
        { q: 'Can you repair instead of replace?', a: 'Often, yes. If the roof has years left we say so plainly, and we only recommend replacement when repairs would be throwing money away.' },
        { q: 'Do you work with insurance claims?', a: 'We document damage with photos and a written report that adjusters accept. You stay in control of the claim.' },
        { q: 'How fast can you come out?', a: 'Active leaks get same-day or next-day tarping. Standard repairs are usually scheduled within the week.' },
      ],
    },
    {
      id: 'replacement',
      photo: 'replacement',
      name: 'Full replacement',
      kicker: 'Typical home: 2–3 days',
      body: 'Tear-off to deck, ice-and-water at every eave, synthetic underlayment, and a manufacturer-backed shingle system with a written workmanship warranty.',
      points: ['Class 4 impact-rated shingle options', 'Magnetic nail sweep, daily cleanup', 'Fixed written price, no change-order surprises'],
      cta: 'Price my replacement',
      estimate: 'Full replacement',
      priceGuide: 'Typical homes: $9,500–$26,000',
      process: [
        { title: 'Measure and quote', body: 'We measure the roof, inspect the deck and give you a fixed price in writing, usually within two days.' },
        { title: 'Reserve your crew', body: 'A deposit holds your install date and materials. The balance is billed when we finish.' },
        { title: 'Tear-off and install', body: 'Old roofing comes off to the deck, repairs are made, then the new system goes on in one visit.' },
        { title: 'Walkthrough and warranty', body: 'We inspect with you, sweep the yard with magnets, and register your workmanship warranty.' },
      ],
      faq: [
        { q: 'How long does a replacement take?', a: 'Most homes take two to three days, weather permitting.' },
        { q: 'What does the deposit cover?', a: 'It reserves your crew and materials and is applied to your final invoice. The remaining balance is billed once the job is complete.' },
        { q: 'Can I finance a new roof?', a: 'Eligible buyers see monthly-payment options at checkout from providers like Klarna and Affirm, offered automatically by Whop.' },
      ],
    },
    {
      id: 'inspection',
      photo: 'inspection',
      name: 'Roof inspection',
      kicker: 'Book and pay online',
      body: 'A certified inspector walks the roof, checks the attic, and sends a written report with photos. Credited toward any project over $5,000.',
      points: ['60-point inspection', 'Drone plus hands-on', 'Report in 24 hours'],
      cta: 'Book an inspection',
      offer: 'inspection',
      estimate: 'Not sure — inspect it',
      priceGuide: '$149 flat, credited toward projects over $5,000',
      process: [
        { title: 'Book online', body: 'Pick the inspection, pay securely, and we call to schedule within one business day.' },
        { title: 'On-site inspection', body: 'A certified inspector checks the surface, flashing, ventilation and attic, with drone photos where needed.' },
        { title: 'Written report', body: 'Within 24 hours you get photos, findings, and a plain-language recommendation. No pressure to buy.' },
      ],
      faq: [
        { q: 'Is the inspection fee refundable?', a: 'It is credited toward any project over $5,000 that you book with us.' },
        { q: 'Do I need to be home?', a: 'Not for the roof itself. We only need access to the attic if we are checking it.' },
        { q: 'Will you climb on a steep roof?', a: 'Yes, with harnesses. Where it is unsafe we use a drone and tell you what we could not reach.' },
      ],
    },
  ] as Service[],

  /** Bookable Whop plans. Replace planId values with your own. */
  offers: [
    {
      photo: 'offerInspection',
      slug: 'inspection',
      planId: 'plan_4XbxaD6U59u8I',
      title: 'Roof inspection',
      priceLabel: '$149',
      blurb: 'On-site inspection with a written report and photos.',
      kind: 'one_time',
      bullets: ['Certified inspector, 60-point checklist', 'Written report within 24 hours', 'Fee credited toward projects over $5,000'],
      trackEvent: 'checkout_started',
    },
    {
      photo: 'offerDeposit',
      slug: 'deposit',
      planId: 'plan_UbqRIhCcw8sws',
      title: 'Project deposit',
      priceLabel: '$500',
      blurb: 'Reserve your install date. The rest is billed when the job is done.',
      kind: 'deposit',
      bullets: ['Locks your crew and materials', 'Applied to your final invoice', 'Card saved securely, balance billed on completion'],
      trackEvent: 'deposit_started',
    },
    {
      photo: 'offerGutter',
      slug: 'gutter-clean',
      planId: 'plan_YFMsV1PT3WPsP',
      title: 'Gutter clean & flush',
      priceLabel: '$225',
      blurb: 'Flat-rate gutter cleaning and downspout flush, up to two stories.',
      kind: 'one_time',
      bullets: ['Every gutter run hand-cleared', 'Downspouts flushed and tested', 'Before/after photos'],
      trackEvent: 'checkout_started',
    },
  ] satisfies Offer[],

  /** Used by the contractor console to compute the final-balance invoice. */
  demoJob: {
    label: 'Roof repair: valley & flashing rebuild, 600 sq ft',
    // Keep under $2,500 until the Whop account finishes verification (see README).
    contractTotal: 2400,
  },

  serviceAreas: {
    headline: 'Serving the Front Range',
    blurb: 'Crews dispatch from Denver. Inspections are same-week across the metro.',
    cities: [
      'Denver', 'Aurora', 'Lakewood', 'Arvada', 'Westminster', 'Thornton',
      'Centennial', 'Littleton', 'Highlands Ranch', 'Parker', 'Castle Rock', 'Boulder',
      'Broomfield', 'Golden', 'Englewood', 'Wheat Ridge',
    ],
    radiusMiles: 35,
  },

  financing: {
    headline: 'Spread the cost of a new roof',
    body: 'At checkout, eligible buyers see monthly-payment options from providers like Klarna, Affirm and Afterpay. Options are offered automatically by Whop and depend on the amount, provider approval, and buyer eligibility. No extra forms on our side.',
    note: 'Financing availability varies by buyer and order. Subject to provider approval.',
  },

  reviews: {
    rating: 4.9,
    count: 412,
    source: 'Google & BBB, 2019–2026',
    items: [
      { name: 'Marcus T.', place: 'Lakewood', text: 'Hail took out half the neighborhood. Summit Ridge had a written price in two days and the roof was done before the next storm. Crew swept the yard with a magnet.', job: 'Full replacement' },
      { name: 'Dana R.', place: 'Arvada', text: 'The inspection report had photos of every problem area and said plainly what could wait. Nobody tried to upsell me.', job: 'Inspection' },
      { name: 'Priya & Neil S.', place: 'Highlands Ranch', text: 'Paid the deposit online, got the final invoice by email when they finished. Simple and exactly what was quoted.', job: 'Replacement' },
    ],
  },

  trust: [
    { label: 'Workmanship warranty', value: '25 yr' },
    { label: 'Roofs installed', value: '6,800+' },
    { label: 'Licensed & insured', value: 'Since 2009' },
  ],

  /** Estimate-form dropdown */
  estimateServices: ['Roof repair', 'Full replacement', 'Storm / hail damage', 'Not sure — inspect it'],
}

export type SiteConfig = typeof site
export const offerBySlug = (slug: string) => site.offers.find((o) => o.slug === slug)
export const serviceById = (id: string) => site.services.find((s) => s.id === id)
