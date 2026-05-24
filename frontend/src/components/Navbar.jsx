import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-orange-300">CodeMentor AI</p>
            <p className="mt-1 text-sm text-slate-400">Google-authenticated workspace</p>
          </div>

          <nav className="hidden gap-4 sm:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-orange-400/10 text-orange-200 ring-1 ring-orange-400/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-orange-400/30"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-semibold text-white">
              {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : getInitials(displayName)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold text-white">{displayName}</span>
              <span className="block text-xs text-slate-400">{user?.email}</span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">Menu</span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[22px] border border-white/10 bg-[#0d1222] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="border-b border-white/10 px-4 py-4">
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Signed in with Google through Supabase Auth.</p>
              </div>
              <div className="px-2 py-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Log out
                  <span className="text-xs uppercase tracking-[0.18em] text-orange-300">Logout</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}