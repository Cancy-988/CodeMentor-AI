import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8f2] to-white/80 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">CodeMentor AI</p>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
              Productive code reviews powered by multi-agent AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-700">
              Sign in with Google, save your chats and reviews, and let the AI suggest fixes, explanations, and validation for your code.
            </p>

            <div className="mt-8 flex gap-4">
              <Link to="/signup" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-95">
                Get started — Sign up with Google
              </Link>
              <Link to="/login" className="rounded-2xl border border-orange-300 px-6 py-3 text-sm font-semibold text-orange-700">
                Sign in
              </Link>
            </div>
          </section>

          <aside className="rounded-[28px] border border-orange-200 bg-white/95 p-6 shadow">
            <p className="text-sm font-semibold text-slate-800">Why CodeMentor AI?</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Persistent chat history and saved reviews</li>
              <li>Multi-agent code analysis, fixes and validation</li>
              <li>Google OAuth sign-in and secure sessions</li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
  )
}
