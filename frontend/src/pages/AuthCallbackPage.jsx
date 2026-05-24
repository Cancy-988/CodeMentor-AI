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
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] text-slate-200">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-300 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        Completing Google sign-in...
      </div>
    </div>
  )
}