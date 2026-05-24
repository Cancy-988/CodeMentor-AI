import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export function SignupPage() {
  const { session, loading, signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  if (session) {
    navigate('/dashboard', { replace: true })
  }

  const handleSignup = async () => {
    setError('')
    setSubmitting(true)
    try {
      await signInWithGoogle('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-semibold">Create your CodeMentor AI account</h1>
          <p className="mt-2 text-sm text-slate-300">Sign up quickly using your Google account.</p>

          {error ? <div className="mt-4 rounded p-3 text-sm text-rose-100 bg-rose-400/10">{error}</div> : null}

          <button
            type="button"
            onClick={handleSignup}
            disabled={submitting || loading}
            className="mt-6 rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white"
          >
            {submitting ? 'Redirecting…' : 'Sign up with Google'}
          </button>
        </div>
      </div>
    </main>
  )
}
