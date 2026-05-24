import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

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
      <div className="flex min-h-screen items-center justify-center bg-[#0b1020] text-slate-200">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-300 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
          Loading secure session...
        </div>
      </div>
    )
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b14] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-8rem] h-96 w-96 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1440px] items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <section className="animate-[fadeInUp_0.6s_ease-out] space-y-8">
          <div className="inline-flex items-center rounded-full border border-orange-400/25 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300 backdrop-blur">
            Supabase Google OAuth
          </div>

          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              CodeMentor AI becomes a real authenticated product.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Sign in with Google, keep your sessions persistent, and return to your saved reviews, chats, and fixes from any device.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard title="Protected workspace" description="Dashboard access is guarded by Supabase auth and React Router." />
            <FeatureCard title="Persistent session" description="Supabase keeps the user signed in and the app restores the session automatically." />
            <FeatureCard title="Logout flow" description="Users can sign out cleanly from the navbar menu." />
            <FeatureCard title="Modern UX" description="Dark onboarding screen with orange accents that matches the product direction." />
          </div>
        </section>

        <section className="animate-[fadeInUp_0.75s_ease-out]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
            <div className="rounded-[28px] border border-white/10 bg-[#0d1222] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Login</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Continue with Google</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Your Google account becomes your CodeMentor AI identity, profile, and saved history.
              </p>

              {!isSupabaseConfigured ? (
                <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                  Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before testing auth.
                </div>
              ) : null}

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                {submitting ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                After sign-in, you will be redirected to the dashboard and can revisit old chats, reviews, and fixes.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  )
}