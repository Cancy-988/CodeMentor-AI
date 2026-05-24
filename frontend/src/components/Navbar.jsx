import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function Navbar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { href: '/dashboard', label: 'Workspace' },
    { href: '/projects', label: 'Projects' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/fixes', label: 'Fixes' },
    { href: '/uploads', label: 'Uploads' },
  ]

  const displayName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'CodeMentor user'
  }, [user])

  const avatarUrl = user?.user_metadata?.avatar_url

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setMobileNavOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setMenuOpen(false)

    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/72 backdrop-blur-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex flex-col gap-0.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-orange-400">CodeMentor AI</p>
            <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">Workspace</p>
          </Link>

          <nav className="hidden gap-4 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-orange-400/10 text-orange-300 ring-1 ring-orange-400/20'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2 text-[var(--color-text-secondary)] transition hover:border-orange-400/30 hover:text-[var(--color-text-primary)] md:hidden"
            aria-expanded={mobileNavOpen}
            aria-label="Toggle navigation menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00-5.656 0l-2.12 2.12a1 1 0 001.414 1.414l2.12-2.12a2 2 0 012.828 0l2.12 2.12a1 1 0 001.414-1.414zM2.05 13.536A1 1 0 103.464 12.12l2.12 2.12a4 4 0 005.656 0l2.12-2.12a1 1 0 111.414 1.414l-2.12 2.12a2 2 0 01-2.828 0l-2.12-2.12z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 transition hover:border-orange-400/30"
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-semibold text-white">
                {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : getInitials(displayName)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-[var(--color-text-primary)]">{displayName}</span>
                <span className="block text-xs text-[var(--color-text-tertiary)]">{user?.email}</span>
              </span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 md:inline">Menu</span>
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-lg">
                <div className="border-b border-[var(--color-border)] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{displayName}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-tertiary)]">Signed in with Google through Supabase Auth.</p>
                </div>
                <div className="px-2 py-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-500 transition hover:bg-[var(--color-bg-primary)]"
                  >
                    Log out
                    <span className="text-xs uppercase tracking-[0.18em]">Logout</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        </div>

        {mobileNavOpen ? (
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.18)] md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? 'bg-orange-400/10 text-orange-300 ring-1 ring-orange-400/20'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}