import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { site } from '#/config/site'
import { Logo } from './Logo'

const links = [
  { to: '/services', label: 'Services' },
  { to: '/book', label: 'Book online' },
  { to: '/area', label: 'Service area' },
  { to: '/financing', label: 'Financing' },
  { to: '/reviews', label: 'Reviews' },
] as const

function toggleTheme() {
  const root = document.documentElement
  const current = root.dataset.theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const next = current === 'dark' ? 'light' : 'dark'
  root.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* storage can be blocked; the toggle still works for this visit */
  }
}

export function Header() {
  const { company, contact } = site
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>{contact.hours}</span>
          <a href={`tel:${contact.phoneHref}`}>Call {contact.phoneDisplay}</a>
        </div>
      </div>
      <header className="nav">
        <div className="wrap">
          <Link to="/" className="brand" aria-label={`${company.name} home`} onClick={close}>
            <Logo />
            {company.name}
          </Link>
          <nav className="nav-links" aria-label="Main">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hide-m" activeProps={{ className: 'hide-m is-active' }}>
                {l.label}
              </Link>
            ))}
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle light and dark mode">
              <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            </button>
            <Link to="/contact" className="btn btn--accent" style={{ minHeight: 44, padding: '0 20px', fontSize: 16 }} onClick={close}>
              Free estimate
            </Link>
            <button
              type="button"
              className="icon-btn menu-btn"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </nav>
        </div>
        <div className="wrap">
          <div id="mobile-menu" className={`mobile-menu${open ? ' open' : ''}`}>
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={close}>{l.label}</Link>
            ))}
            <Link to="/contact" onClick={close}>Free estimate</Link>
          </div>
        </div>
      </header>
    </>
  )
}

export function Footer() {
  const { company, contact } = site
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <h4>{company.name}</h4>
            <div>{contact.address}</div>
            <div>{company.license}</div>
            <div style={{ marginTop: 10 }}>{contact.hours}</div>
          </div>
          <div>
            <h4>Services</h4>
            {site.services.map((s) => (
              <Link key={s.id} to="/services/$id" params={{ id: s.id }}>{s.name}</Link>
            ))}
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/book">Book online</Link>
            <Link to="/area">Service area</Link>
            <Link to="/financing">Financing</Link>
            <Link to="/reviews">Reviews</Link>
            <Link to="/contact">Free estimate</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href={`tel:${contact.phoneHref}`}>{contact.phoneDisplay}</a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <Link to="/pro">Contractor console</Link>
          </div>
        </div>
        <div className="fine">
          <span>© {new Date().getFullYear()} {company.name}. {company.license}</span>
          <span>
            Payments by Whop · Photography via{' '}
            <a href="https://www.pexels.com" target="_blank" rel="noreferrer" style={{ display: 'inline' }}>Pexels</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
