# Summit Ridge Roofing: Whop Websites roofing template

A reusable, config-driven website template for US roofing companies, built on **Whop Websites** (TanStack Start on Whop's hosted runtime). It demos the high-ticket flow end to end: **inspection fee → project deposit (card saved on file) → final-balance invoice**, all on Whop.

Live demo: https://summit-ridge-roofing-demo-dc.whop.site (add `?debug=1` to any URL to watch the `whop.track` events fire).

## What it demonstrates

| Requirement | Where |
|---|---|
| Sections: services (repair, replacement, inspection), service area, financing callout, reviews/trust, contact | `src/components/Sections.tsx`, `Hero.tsx`, `EstimateForm.tsx` |
| Real Whop plans: $149 inspection, $500 deposit, $225 flat-rate gutter service | `src/config/site.ts` → `offers` |
| Checkout on **Whop Payment Elements**, no custom card fields | `src/routes/_site.checkout.$slug.tsx` |
| `PaymentElement` + `EmailElement` + `AddressElement` + **`BrandingElement`** | default checkout |
| `ExpressCheckoutElement` (Apple Pay / Google Pay / PayPal) | top of every one-time checkout |
| Full `CheckoutElement` (summary, promo codes, tax, financing) | `/checkout/inspection?ui=hosted` |
| Financing (Klarna, Affirm, Afterpay…) | surfaces automatically inside Whop's elements for approved merchants |
| "Request an Estimate" → **Whop Leads API** | `submitEstimate` in `src/lib/api.ts` (`POST /leads`, `PATCH /leads/{id}`) |
| Card-on-file at deposit via a **setup intent** | `confirmCheckout` (`POST /setup_intents`, then `POST /payments` with the saved method) |
| Final balance with the **Invoices API** (auto-charge the stored card or send for manual payment) | `createFinalInvoice` + `/pro` console |
| Custom `whop.track` events: `estimate_requested`, `service_viewed`, `deposit_started` (+ `checkout_started`, standard `lead`) | `src/lib/track.ts`, `src/components/PixelDebug.tsx` |

Page views and checkout events are tracked automatically by the Whop pixel on `*.whop.site`.

## Re-skin it (no structural changes)

Everything company-specific lives in **`src/config/site.ts`**: company, contact, service area, reviews, theme colors, photo ids, services copy, and the `offers` list. Prices shown on the site are read live from the Whop plans, so changing a price in Whop updates the site. Adding a plan means adding one object to `offers`; the `/checkout/<slug>` route, price display and tracking follow automatically.

### Create the Whop plans (CLI)

```bash
npm i -g @whop/cli && whop auth login --method oauth
whop quickstart --business_name "Your Roofing Co"
whop products create --account_id biz_xxx --title "Roof Inspection" --route your-inspection --visibility visible
whop variants create --account_id biz_xxx --product_id prod_xxx --title "Roof Inspection" \
  --billing_type one_time --currency usd --initial_price 149
```

Repeat for the deposit and the flat-rate service, then paste each `plan_…` id into `offers`.

## Run and deploy

```bash
npm install
whop apps dev      # local, with Whop env injected
whop apps deploy   # build, typecheck, ship to https://<name>.whop.site
```

### App secrets (hosted runtime)

```bash
whop apps secrets set --secret WHOP_SERVER_KEY=<company API key>   # lead, member, invoice, payment, payment-method, setup-intent and plan scopes
whop apps secrets set --secret PRO_PASSCODE=<passcode for /pro>
```

`whop apps dev` injects `WHOP_API_KEY` automatically; hosted builds read `WHOP_SERVER_KEY`.

## Verify each requirement

- **Checkout:** `/checkout/inspection` (PaymentElement + Express + Branding) or `/checkout/inspection?ui=hosted` (CheckoutElement; promo codes work here).
- **Estimate → Lead:** submit the form on `/contact`; each request is stored on the Whop lead and listed in `/pro`.
- **Card on file and invoice:** pay the deposit at `/checkout/deposit` (saves the card with a setup intent, then charges the deposit). In `/pro`, choose **Invoice & auto-charge card** (`POST /invoices` → `POST /invoices/{id}/charge`) or **Send invoice to pay** (`POST /invoices/{id}/send`).
- **Pixel events:** open any page with `?debug=1` to see events as they fire, or run `window.__whopEvents` in the console.

## Notes and limits

- **Leads:** Whop keeps one lead per user and product, and an anonymous visitor has no Whop user. Each request is therefore appended to the owner's lead metadata (`req_001`, `req_002`, …) with the latest contact details mirrored at the top, and the `/pro` console lists every request.
- **Account verification:** until the Whop business is verified, invoices cannot be issued and purchases over $2,500 are blocked. The demo job in `site.demoJob` is sized under that; raise it after verification.
- **Photography:** Pexels (free license), referenced by id in `site.photos`, with responsive `srcset`, lazy loading and fixed aspect ratios.
- **Motion:** View Transitions API page transitions, CSS scroll-driven image motion, split-text headings, a CSS-only intro, and mouse-only Lenis smooth scroll, magnetic buttons and cursor ring. All of it is disabled under `prefers-reduced-motion`.
- **Payments:** Whop only. No Stripe, no PayPal, no custom card forms.
