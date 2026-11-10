import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { site } from '#/config/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${site.company.name} | Roof repair, replacement & inspection in ${site.company.city}` },
      {
        name: 'description',
        content: `${site.company.name}: licensed ${site.company.city} roofers. Book an inspection online, pay a deposit securely, and get a fixed-price estimate. ${site.company.warrantyYears}-year workmanship warranty.`,
      },
      { name: 'theme-color', content: site.theme.ink },
    ],
    scripts: [
      {
        // Before first paint: enable JS-only styles, apply the saved theme, mark repeat visits (skips the intro).
        children:
          "try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('theme');if(t==='dark'||t==='light')d.dataset.theme=t;if(sessionStorage.getItem('seen'))d.classList.add('seen');else sessionStorage.setItem('seen','1')}catch(e){}",
      },
    ],
    links: [
      {
        rel: 'icon',
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='9' fill='%2324221f'/%3E%3Cpath d='M7 24 20 11l13 13' fill='none' stroke='%23f3f0ea' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
      },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://images.pexels.com' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,500&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: () => <Outlet />,
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <main className="wrap section">
      <h1 className="h2">Page not found</h1>
      <p className="lede" style={{ margin: '16px 0 24px' }}>That page doesn’t exist.</p>
      <a className="btn btn--ink" href="/">Back to home</a>
    </main>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ ['--ink-brand' as any]: site.theme.ink, ['--accent-brand' as any]: site.theme.accent }}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="intro" aria-hidden="true">
          <div className="intro-inner">
            <svg viewBox="0 0 40 40" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path className="draw" d="M3 22 20 7l17 15" />
              <path className="draw d2" d="M9 24v10h22V24" />
            </svg>
            <span>{site.company.name}</span>
          </div>
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
