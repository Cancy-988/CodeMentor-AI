import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1020] text-slate-200">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-300 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
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