import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { AuthShell } from '../components/AuthShell'
import { PublicLayout } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export function SignupPage() {
  const { session, loading, signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, session])

  const handleSignup = async () => {
    setError('')
    setSubmitting(true)

    try {
      await signInWithGoogle('/dashboard')
    } catch (signupError) {
      const message = signupError instanceof Error ? signupError.message : 'Signup failed.'
      setError(message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
          <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/80 px-6 py-5 text-sm text-[var(--color-text-secondary)] shadow-[0_24px_80px_rgba(15,23,42,0.2)] backdrop-blur">
            Preparing account setup...
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <PublicLayout>
      <AuthShell
        eyebrow="Professional onboarding"
        title="Create your CodeMentor AI account in one step."
        description="Start with Google, land in your dashboard, and keep every project review, fix suggestion, and upload tied to one secure workspace."
        cardEyebrow="Signup"
        cardTitle="Create account with Google"
        cardDescription="A Google account is all you need to unlock the full CodeMentor AI frontend experience."
        alternateLabel="Already have an account?"
        alternateHref="/login"
        alternateAction="Sign in instead"
        idleLabel="Sign up with Google"
        submittingLabel="Redirecting to Google..."
        loading={loading}
        submitting={submitting}
        error={error}
        warning={
          !isSupabaseConfigured
            ? 'Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before testing auth.'
            : ''
        }
        onSubmit={handleSignup}
      />
    </PublicLayout>
  )
}
