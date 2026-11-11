# Architecture

TanStack Start (React 19, Vite) on Whop's hosted Cloudflare Workers runtime. Whop is the backend for plans, payments, leads and invoices; there is no separate database.

## Layout

```
src/
├── config/site.ts            ← the only file you edit to re-skin
├── lib/
│   ├── api.ts                ← server functions (leads, checkout confirm, console, invoices)
│   ├── whop.server.ts        ← server-only fetch wrapper for the Whop API
│   └── track.ts              ← whop.track helper (+ event mirror for the debug panel)
├── components/
│   ├── Header.tsx            ← nav, theme toggle, mobile menu, footer
│   ├── Hero.tsx              ← headline + interactive roof-pitch explorer
│   ├── Sections.tsx          ← bento, services, offers, area, financing, reviews, CTA
│   ├── EstimateForm.tsx      ← "Request an Estimate" → Leads API
│   ├── Photo.tsx             ← responsive photo with scroll-driven motion
│   ├── Motion.tsx            ← split-text reveal, smooth scroll, magnetic buttons, cursor
│   └── PixelDebug.tsx        ← ?debug=1 panel listing whop.track events
├── routes/
│   ├── __root.tsx            ← document shell, fonts, theme script, intro curtain
│   ├── _site.tsx             ← shared layout (header persists across pages)
│   ├── _site.index.tsx       ← /
│   ├── _site.services.*.tsx  ← /services and /services/$id
│   ├── _site.book / area / financing / reviews / contact.tsx
│   ├── _site.checkout.$slug.tsx  ← /checkout/<offer>
│   ├── _site.thanks.tsx      ← /thanks
│   └── _site.pro.tsx         ← /pro contractor console
├── styles.css, motion.css    ← design tokens and motion
└── router.tsx                ← router + view transitions
docs/                         ← this documentation
```

## Data flows

### Checkout (one-time offers)
`PaymentElement` form (`EmailElement`, `AddressElement`, `PaymentElement`, `BrandingElement`) plus an `ExpressCheckoutElement` row. On pay, the browser creates a **confirmation token** with the Payments handle; the `confirmCheckout` server function calls `POST /payments` with that token. A 3-D Secure or other next step is handled with `whop.payments.handleNextAction`. `?ui=hosted` swaps in Whop's full `CheckoutElement`.

### Deposit with card on file
The deposit page mounts Payments in **setup** mode (`currency: 'usd'`). `confirmCheckout` then:
1. `POST /setup_intents` with the confirmation token, which saves the card on file and returns `payment_method_id` and `member_id`.
2. `POST /payments` for the deposit plan using that saved method.

### Estimate form → lead
`submitEstimate` validates input (plus a honeypot), then:
1. `POST /leads` (no metadata) to ensure the lead exists for the owner user and lead product.
2. `GET /leads/{id}`, then `PATCH /leads/{id}` appending the request as `req_###` metadata and mirroring the latest contact details.

Whop keeps one lead per user and product, and anonymous visitors have no Whop user, which is why requests are appended rather than created as separate leads.

### Final balance
The `/pro` console (passcode in `PRO_PASSCODE`) lists paid customers and estimate requests. `createFinalInvoice`:
1. Reads the paid payment, computes `contract total − paid`.
2. `POST /invoices` with a one-off variant for the balance.
3. Either `POST /invoices/{id}/charge` (stored card) or `POST /invoices/{id}/send` (manual payment).

## Security notes

- Secrets (`WHOP_SERVER_KEY`, `PRO_PASSCODE`) live only in Whop app secrets; nothing sensitive is in the repo.
- All Whop API calls run in server functions; the browser only ever holds confirmation tokens.
- The estimate form has input validation, length limits and a honeypot field.
- `/pro` is `noindex` and gated by the passcode on every server call.
