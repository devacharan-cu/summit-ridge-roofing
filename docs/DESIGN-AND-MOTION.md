# Design and motion

## Visual identity

- **Dark mode:** absolute black (`#000`) with white type and neutral grey containers. No glows or gradients.
- **Light mode:** warm off-white and stone with rich charcoal text.
- **One restrained accent** (a muted stone/brass) used only for fine rules, numerals and small marks. Primary actions are solid charcoal (light) or white (dark).
- **Type:** Bricolage Grotesque for display, Instrument Sans for body, Fraunces italic for editorial accents.
- **Layout:** bento home, editorial services list, structural borders instead of identical cards.
- **Themes** follow the system preference and can be toggled; the choice is saved in `localStorage`.

Tokens live at the top of `src/styles.css`. Blocks that must stay dark (bands) or inverted (featured tiles) re-point `--text`, `--bg` and `--muted` locally, so buttons and text inside them always have contrast.

## Motion

| Effect | Implementation |
|---|---|
| Page transitions | View Transitions API through the router (`defaultViewTransition`); service photos are shared elements (`view-transition-name: svc-<id>`) |
| Image reveal, zoom and parallax | CSS `animation-timeline: view()` (progressive enhancement; content stays visible without it) |
| Split-text headings | `Split` component: words rise out of masks via one IntersectionObserver per heading |
| Intro curtain | Pure CSS, once per session, skipped on repeat visits |
| Inertia scroll | Lenis, mouse devices only |
| Magnetic buttons and cursor ring | `Motion.tsx` using the CSS `translate` property and a rAF-lerped ring |
| Grayscale → color images | CSS filter on hover-capable devices only |

Easing: `--ease: cubic-bezier(0.22, 1, 0.36, 1)` for entrances and hovers, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)` for the curtain.

## Performance and accessibility

- Animations touch only `transform`, `opacity`, `clip-path` and `filter`.
- Images use responsive `srcset` (480–1600w), `loading="lazy"` below the fold, `fetchpriority="high"` for the first image, and fixed aspect ratios to avoid layout shift.
- Everything is disabled under `prefers-reduced-motion`; smooth scroll, the cursor and magnetic buttons never run on touch devices.
- Visible focus rings, semantic headings, and `aria-label`s on split-text headings.

## Photography

Real photographs from [Pexels](https://www.pexels.com) (free commercial license), credited in the footer.
