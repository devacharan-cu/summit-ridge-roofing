# Pixel events

Whop's pixel is injected automatically on `*.whop.site`, so `window.whop.track` exists before app code runs. Page views and checkout/purchase events are recorded by Whop with no code. This template adds the custom events below.

| Event | Fires when | Where |
|---|---|---|
| `estimate_requested` | The estimate form is submitted and the lead is created | `EstimateForm.tsx` |
| `lead` (Whop standard) | Same moment, with `event_id` = the lead id | `EstimateForm.tsx` |
| `service_viewed` | A service scrolls into view on `/services`, or a service detail page opens | `Sections.tsx`, `_site.services.$id.tsx` |
| `deposit_started` | A visitor lands on the deposit checkout | `_site.checkout.$slug.tsx` |
| `checkout_started` | A visitor lands on any other checkout | `_site.checkout.$slug.tsx` |

All calls go through `src/lib/track.ts`, which also de-duplicates repeats within a visit.

## Verify them

1. **On the page:** add `?debug=1` to any URL. A panel in the corner lists each event as it fires and shows whether the pixel is connected. The flag is remembered for the tab.
2. **In the console:** run `window.__whopEvents` to see the full list with properties.
3. **On the network:** the pixel sends requests to `t.whop.tw/conversions` (DevTools → Network).
4. **In Whop:** the Websites view and pixel dashboard in your Whop dashboard show visitors and events after a short delay.

## Note

`whop events list` (the API) may not return pixel events immediately. Use the dashboard views above to confirm.
