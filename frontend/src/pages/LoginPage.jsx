import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { AuthShell } from '../components/AuthShell'
import { PublicLayout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export function LoginPage() {
  const { session, loading, signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (session) {
      navigate(from, { replace: true })
    }
  }, [from, navigate, session])

  const handleGoogleLogin = async () => {
    setError('')
    setSubmitting(true)

    try {
      await signInWithGoogle(from)
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Google sign-in failed.'
      setError(message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/80 px-6 py-5 text-sm text-[var(--color-text-secondary)] shadow-[0_24px_80px_rgba(15,23,42,0.2)] backdrop-blur">
            Loading secure session...
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  return (
    <PublicLayout>
      <AuthShell
        eyebrow="Secure product access"
        title="Sign in to your CodeMentor AI workspace."
        description="Open your review dashboard, continue saved sessions, and get back to fixes and reports without starting from scratch."
        cardEyebrow="Login"
        cardTitle="Continue with Google"
        cardDescription="Use the Google account connected to your CodeMentor AI profile and jump straight into your workspace."
        alternateLabel="Need a new account?"
        alternateHref="/signup"
        alternateAction="Create one here"
        idleLabel="Continue with Google"
        submittingLabel="Redirecting to Google..."
        submitting={submitting}
        error={error}
        warning={
          !isSupabaseConfigured
            ? 'Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before testing auth.'
            : ''
        }
        onSubmit={handleGoogleLogin}
      />
    </PublicLayout>
  )
}
