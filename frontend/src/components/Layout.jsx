import { useRef, useEffect, useState } from 'react'
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

export function AppLayout({ children, showAuthNav = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {showAuthNav && <AuthNavbar />}
      <main className="flex-1">{children}</main>
    </div>
  )
}

function AuthNavbar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
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

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
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
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex flex-col gap-0.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-orange-400">CodeMentor AI</p>
            <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">Workspace</p>
          </Link>

          <nav className="hidden gap-4 sm:flex">
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

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00-5.656 0l-2.12 2.12a1 1 0 001.414 1.414l2.12-2.12a2 2 0 012.828 0l2.12 2.12a1 1 0 001.414-1.414zM2.05 13.536A1 1 0 103.464 12.12l2.12 2.12a4 4 0 005.656 0l2.12-2.12a1 1 0 11 1.414 1.414l-2.12 2.12a2 2 0 01-2.828 0l-2.12-2.12z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-[var(--color-bg-secondary)]"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-6 w-6 rounded-full" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
                  {getInitials(displayName)}
                </div>
              )}
              <span className="hidden sm:inline text-[var(--color-text-secondary)]">{displayName}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-lg">
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-[var(--color-bg-tertiary)] rounded-lg"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function PublicNavbar() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col gap-0">
            <span className="text-lg font-bold text-orange-500">CodeMentor</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">AI Code Review</span>
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) => {
              const active = location.pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-orange-500/12 text-orange-500 ring-1 ring-orange-500/20'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition"
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

            {isAuthenticated ? (
              <Link to="/dashboard" className="rounded-full bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition">
                  Sign In
                </Link>
                <Link to="/signup" className="rounded-full bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] py-12 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4 text-orange-500">CodeMentor AI</h3>
            <p className="text-sm text-[var(--color-text-tertiary)]">Multi-agent AI-powered code reviews and analysis.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
              <li><a href="#features" className="hover:text-[var(--color-text-secondary)]">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[var(--color-text-secondary)]">How it Works</a></li>
              <li><a href="#faq" className="hover:text-[var(--color-text-secondary)]">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
              <li><Link to="/about" className="hover:text-[var(--color-text-secondary)]">About Us</Link></li>
              <li><a href="mailto:contact@codemental.ai" className="hover:text-[var(--color-text-secondary)]">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Follow</h4>
            <div className="flex gap-4">
              <a href="#" className="text-[var(--color-text-tertiary)] hover:text-orange-500">Twitter</a>
              <a href="#" className="text-[var(--color-text-tertiary)] hover:text-orange-500">GitHub</a>
              <a href="#" className="text-[var(--color-text-tertiary)] hover:text-orange-500">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--color-border-light)] pt-8">
          <p className="text-sm text-[var(--color-text-tertiary)] text-center">© {currentYear} CodeMentor AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
