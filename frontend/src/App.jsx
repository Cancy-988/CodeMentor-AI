import { useState } from 'react'

const starterPrompts = [
  'Explain React hooks in simple terms.',
  'Help me debug this JavaScript error.',
  'Suggest a study plan for learning FastAPI.'
]

export default function App() {
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('Ask CodeMentor AI a question to get started.')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      return
    }

    setLoading(true)
    setReply('Thinking...')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage })
      })

      const data = await response.json()
      setReply(data.reply || 'No response returned from the server.')
    } catch (error) {
      setReply('Could not reach the backend. Make sure FastAPI is running.')
    } finally {
      setLoading(false)
    }
  }

  const usePrompt = (prompt) => {
    setMessage(prompt)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300">
              CodeMentor AI
            </p>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
              Learn faster with an AI coding mentor built for beginners.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              This starter connects a React frontend to a FastAPI backend and gives you a clean base for Gemini-powered coaching, debugging help, and code explanations.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block text-sm font-medium text-slate-300" htmlFor="message">
                Ask your coding question
              </label>
              <textarea
                id="message"
                rows="5"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none ring-0 transition focus:border-cyan-400/50"
                placeholder="Example: Explain closures in JavaScript with a real-world example."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Sending...' : 'Get Answer'}
                </button>
                <button
                  type="button"
                  onClick={() => setMessage('')}
                  className="rounded-full border border-white/15 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  Clear
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-soft">
            <div>
              <h2 className="text-xl font-semibold">Starter Prompts</h2>
              <div className="mt-4 space-y-3">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => usePrompt(prompt)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold">Latest Reply</h2>
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
                {reply}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
