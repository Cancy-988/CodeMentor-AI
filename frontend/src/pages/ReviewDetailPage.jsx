import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'

import { Navbar } from '../components/Navbar'
import { authFetch, readJsonResponse } from '../lib/apiClient'

export function ReviewDetailPage() {
  const { reviewId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [review, setReview] = useState(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      const response = await authFetch(`/api/reviews/${reviewId}`)
      const data = await readJsonResponse(response)

      if (!mounted) {
        return
      }

      if (!response.ok) {
        setReview(null)
        setError(data?.detail || 'Unable to load the saved review.')
      } else {
        setReview(data)
        setError('')
      }

      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [reviewId])

  const result = review?.result_json || null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Navbar />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-8rem] h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Review detail</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Review #{reviewId}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Open the saved review payload, code sample, and analysis result in one view.</p>
          </div>
          <Link to="/reviews" className="rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/80 px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:-translate-y-0.5 hover:border-orange-300/40 hover:text-orange-200">
            Back to reviews
          </Link>
        </div>

        {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm leading-6 text-rose-100">{error}</div> : null}

        {loading ? <div className="rounded-[24px] border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)]/85 px-5 py-6 text-sm text-[var(--color-text-secondary)]">Loading review details...</div> : null}

        {!loading && review ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Reviewed code</p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">{review.language}</h2>
                </div>
                <div className="rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 px-4 py-2 text-sm text-[var(--color-text-secondary)]">
                  {new Date(review.created_at).toLocaleString()}
                </div>
              </div>

              <div className="mt-5 min-h-[620px] overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[#0b1220]">
                <Editor
                  height="620px"
                  language={review.language || 'javascript'}
                  theme="vs-dark"
                  value={review.code || ''}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 22,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    padding: { top: 16, bottom: 16 },
                    automaticLayout: true,
                    readOnly: true
                  }}
                />
              </div>
            </section>

            <section className="space-y-6">
              <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Review result</p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">AI analysis</h2>
                {result ? (
                  <div className="mt-4 space-y-4">
                    <ResultCard title="Final summary" text={result.final_summary} />
                    <ResultCard title="Bug detection" text={result.bug_detection?.summary} />
                    <ResultCard title="Fix suggestion" text={result.fix_suggestion?.recommended_fix} />
                    <ResultCard title="Explanation" text={result.explanation?.simple_explanation} />
                    <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Validation</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{result.validation?.passed ? 'Passed' : 'Needs attention'} - Syntax {result.validation?.syntax_ok ? 'OK' : 'Issue'} - RAG {result.validation?.rag_aligned ? 'Aligned' : 'Weak match'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">This review record does not contain a saved analysis payload.</p>
                )}
              </section>

              <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Details</p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Metadata</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <p><span className="font-semibold text-[var(--color-text-primary)]">Review ID:</span> {review.id}</p>
                  <p><span className="font-semibold text-[var(--color-text-primary)]">Chat ID:</span> {review.chat_id || 'n/a'}</p>
                  <p><span className="font-semibold text-[var(--color-text-primary)]">Language:</span> {review.language}</p>
                  <p><span className="font-semibold text-[var(--color-text-primary)]">Created:</span> {new Date(review.created_at).toLocaleString()}</p>
                </div>
              </section>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function ResultCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{text || 'No data available.'}</p>
    </div>
  )
}
