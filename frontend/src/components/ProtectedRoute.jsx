import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 px-6 py-5 text-sm text-[var(--color-text-secondary)] shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur">
          Checking your session...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}