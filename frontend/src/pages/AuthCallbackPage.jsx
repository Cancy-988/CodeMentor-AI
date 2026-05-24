import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export function AuthCallbackPage() {
  const { session, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const nextPath = new URLSearchParams(location.search).get('next') || '/dashboard'

  useEffect(() => {
    if (session) {
      navigate(nextPath, { replace: true })
    }
  }, [navigate, nextPath, session])

  if (!loading && !session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 px-6 py-5 text-sm text-[var(--color-text-secondary)] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur">
        Completing Google sign-in...
      </div>
    </div>
  )
}