# Whop setup

Everything this template needs from Whop, in order.

## 1. CLI and login

```bash
npm i -g @whop/cli
whop auth login --method oauth      # opens the browser
whop quickstart --business_name "Your Roofing Co"
```

Copy the business id (`biz_…`) into `src/config/site.ts` → `whop.accountId`.

## 2. Create the website app

```bash
whop apps init --app_type website --name "Your Roofing Co" --domain your-roofing-co
```

This claims `your-roofing-co.whop.site` and scaffolds the project. `--app_type` cannot be changed later.

## 3. Create the plans

A Whop "plan" is a **variant** in the current API. Create one product and one variant for each bookable offer.

```bash
A=biz_xxx
whop products create --account_id $A --title "Roof Inspection" --route your-roof-inspection --visibility visible
whop variants create --account_id $A --product_id prod_xxx --title "Roof Inspection" \
  --billing_type one_time --currency usd --initial_price 149 --description "One-time on-site inspection."
```

Repeat for the **project deposit** (e.g. `500`) and one **flat-rate service** (e.g. `225`). Paste each `plan_…` id into `offers[].planId`, and set `whop.leadProductId` to the inspection product id.

Product routes are global. If a route is taken, add a suffix.

## 4. API key and app secrets

The hosted runtime does not inject an API key for server code, so create a company API key in the Whop dashboard (Developer) with these scopes:

| Area | Scopes |
|---|---|
| Leads | `lead:basic:read`, `lead:manage` |
| Members | `member:basic:read`, `member:email:read`, `member:payment_methods:read`, `member:payment_methods:manage` |
| Payments | `payment:basic:read`, `payment:charge`, `payment:manage`, `payment:setup_intent:read` |
| Invoices | `invoice:basic:read`, `invoice:create`, `invoice:update` |
| Plans | `plan:basic:read`, `plan:create` |

Then store it as an app secret (it never touches the repo):

```bash
whop apps secrets set --secret WHOP_SERVER_KEY=<your key>
whop apps secrets set --secret PRO_PASSCODE=<passcode for the /pro console>
```

`whop apps dev` injects a short-lived `WHOP_API_KEY` locally; the code reads `WHOP_SERVER_KEY` first and falls back to it.

## 5. Deploy

```bash
whop apps deploy
```

## 6. A free test checkout

Whop's sandbox cannot be used with Websites yet, so a real checkout moves real money. To test without paying, create a 100% promo code on the inspection plan:

```bash
whop promo-codes create --account_id $A --code ROOFDEMO100 --promo_type percentage \
  --amount_off 100 --base_currency usd --stock 10 --one_per_customer \
  --new_users_only false --promo_duration_months 1 \
  --product_id prod_xxx --variant_ids '["plan_xxx"]'
```

Open `/checkout/inspection?ui=hosted`, add the code under "Promo code & details", and complete the order. The total is $0.

## Account verification

Until the Whop business completes verification, **issuing invoices is blocked** ("Complete account verification before issuing an invoice") and purchases over **$2,500** are disabled. The console still creates the invoice as a draft. `site.demoJob.contractTotal` is sized under the limit.
