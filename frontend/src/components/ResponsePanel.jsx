import { useEffect, useState } from 'react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'

SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('java', java)

const agentMeta = {
  language_detection: { label: 'Language Detection', icon: '<>', accent: 'text-orange-600', border: 'border-orange-200', chip: 'bg-orange-50 text-orange-700' },
  bug_detection: { label: 'Bug Detection', icon: '!', accent: 'text-amber-700', border: 'border-amber-200', chip: 'bg-amber-50 text-amber-800' },
  fix_suggestion: { label: 'Fix Suggestion', icon: '✓', accent: 'text-orange-600', border: 'border-orange-200', chip: 'bg-orange-50 text-orange-700' },
  complexity_analysis: { label: 'Complexity Analysis', icon: '≈', accent: 'text-amber-700', border: 'border-amber-200', chip: 'bg-amber-50 text-amber-800' },
  explanation: { label: 'Explanation', icon: 'i', accent: 'text-orange-600', border: 'border-orange-200', chip: 'bg-orange-50 text-orange-700' }
}

const syntaxLanguageMap = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  jsx: 'jsx',
  java: 'java'
}

export function ResponsePanel({ review, loading, error, fileName, language, onCopyCode, onDownloadReport }) {
  const validation = review?.validation
  const typedSummary = useTypewriterText(review?.final_summary)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setActiveTab('overview')
  }, [review])

  const dashboardTabs = review
    ? [
        { value: 'overview', label: 'Overview' },
        { value: 'language_detection', label: 'Language' },
        { value: 'bug_detection', label: 'Bug Fixes' },
        { value: 'fix_suggestion', label: 'Fix Suggestion' },
        { value: 'complexity_analysis', label: 'Complexity' },
        { value: 'explanation', label: 'Explanation' },
        { value: 'validation', label: 'Validation' }
      ]
    : []

  return (
    <aside className="panel-surface flex min-w-0 flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5">
      <div className="rounded-3xl border border-white/10 bg-[#0d1222] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">AI response panel</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Multi-agent review dashboard</h2>
            <p className="mt-2 text-sm text-slate-300">
              Use the tabs to inspect each agent without clutter. The overview keeps the final summary, validation, and report actions together.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-orange-200 shadow-sm">
              {language}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1222] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
        <div className="flex items-end gap-2 overflow-x-auto border-b border-white/10 bg-white/5 px-3 pt-3">
          {dashboardTabs.length > 0 ? (
            dashboardTabs.map((tab) => (
              <AgentTabButton
                key={tab.value}
                label={tab.label}
                active={activeTab === tab.value}
                onClick={() => setActiveTab(tab.value)}
              />
            ))
          ) : (
            <div className="h-10" />
          )}
        </div>

        <div className="agent-scroll flex max-h-[820px] flex-col gap-4 overflow-y-auto p-4 pr-1">
          {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm leading-6 text-rose-100">{error}</div> : null}

          {loading ? <LoadingState /> : null}

          {!loading && review ? (
            <ReviewDashboard
              review={review}
              activeTab={activeTab}
              language={language}
              onCopyCode={onCopyCode}
              typedSummary={typedSummary}
              validation={validation}
              onDownloadReport={onDownloadReport}
            />
          ) : null}

          {!loading && !review && !error ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-300">
              Run the analysis to open the multi-agent dashboard below the editor. The tab bar keeps each agent separate and easier to scan.
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

function ReviewDashboard({ review, activeTab, language, onCopyCode, typedSummary, validation, onDownloadReport }) {
  switch (activeTab) {
    case 'language_detection':
      return (
        <AgentCard meta={agentMeta.language_detection}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Pill>{review.language_detection.detected_language}</Pill>
              <Pill tone="muted">Confidence: {review.language_detection.confidence}</Pill>
            </div>
            <p className="text-sm leading-6 text-slate-300">{review.language_detection.explanation}</p>
          </div>
        </AgentCard>
      )

    case 'bug_detection':
      return (
        <AgentCard meta={agentMeta.bug_detection}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-700">{review.bug_detection.summary}</p>
            <div className="space-y-3">
              {review.bug_detection.issues.length > 0 ? (
                review.bug_detection.issues.map((issue) => (
                  <div key={issue.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{issue.title}</span>
                      <Pill tone="muted">{issue.severity}</Pill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{issue.explanation}</p>
                    <p className="mt-2 text-sm leading-6 text-orange-200">Fix: {issue.fix}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-400">No obvious bugs were detected by the agent.</p>
              )}
            </div>
          </div>
        </AgentCard>
      )

    case 'fix_suggestion':
      return (
        <AgentCard meta={agentMeta.fix_suggestion}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-300">{review.fix_suggestion.recommended_fix}</p>
            <div className="flex flex-wrap gap-2">
              {review.fix_suggestion.alternatives.length > 0 ? (
                review.fix_suggestion.alternatives.map((alternative) => (
                  <Pill key={alternative} tone="muted">
                    {alternative}
                  </Pill>
                ))
              ) : (
                <Pill tone="muted">No alternatives suggested</Pill>
              )}
            </div>
            {review.fix_suggestion.improved_code ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Improved code</p>
                  <button
                    type="button"
                    onClick={() => onCopyCode(review.fix_suggestion.improved_code)}
                    className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200 transition duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-400/15"
                  >
                    Copy code
                  </button>
                </div>
                <SyntaxHighlighter
                  language={syntaxLanguageMap[language] || 'javascript'}
                  style={oneLight}
                  customStyle={{ margin: 0, background: 'rgba(0,0,0,0.18)', color: '#e2e8f0', fontSize: '0.84rem', lineHeight: 1.65, padding: '1rem' }}
                  showLineNumbers={false}
                  wrapLongLines
                >
                  {review.fix_suggestion.improved_code}
                </SyntaxHighlighter>
              </div>
            ) : null}
          </div>
        </AgentCard>
      )

    case 'complexity_analysis':
      return (
        <AgentCard meta={agentMeta.complexity_analysis}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Pill>{review.complexity_analysis.time_complexity}</Pill>
              <Pill tone="muted">{review.complexity_analysis.space_complexity}</Pill>
            </div>
            <p className="text-sm leading-6 text-slate-300">{review.complexity_analysis.explanation}</p>
          </div>
        </AgentCard>
      )

    case 'explanation':
      return (
        <AgentCard meta={agentMeta.explanation}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-300">{review.explanation.simple_explanation}</p>
            <div className="flex flex-wrap gap-2">
              {review.explanation.key_takeaways.length > 0 ? (
                review.explanation.key_takeaways.map((takeaway) => (
                  <Pill key={takeaway} tone="muted">
                    {takeaway}
                  </Pill>
                ))
              ) : (
                <Pill tone="muted">No extra takeaways</Pill>
              )}
            </div>
          </div>
        </AgentCard>
      )

    case 'validation':
      return <ValidationCard validation={validation} />

    case 'overview':
    default:
      return (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Final summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {typedSummary}
                  {typedSummary && typedSummary !== review.final_summary ? <span className="typing-caret">|</span> : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {review.next_steps.map((step) => (
                  <Pill key={step} tone="accent">
                    {step}
                  </Pill>
                ))}
              </div>
            </div>
          </div>

          <ValidationCard validation={validation} />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDownloadReport}
              className="rounded-full border border-orange-400/30 bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.18)] transition duration-300 hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-300"
            >
              Download report
            </button>
          </div>
        </div>
      )
  }
}

function AgentTabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border px-4 py-2 text-sm font-semibold transition duration-300 ${
        active
          ? 'rounded-t-2xl border-white/10 border-b-[#0d1222] bg-[#0d1222] text-orange-200 shadow-[0_-8px_20px_rgba(0,0,0,0.2)]'
          : 'rounded-t-2xl rounded-b-none border-white/10 border-b-transparent bg-white/5 text-slate-300 hover:-translate-y-0.5 hover:border-orange-300/40 hover:bg-white/10 hover:text-orange-200'
      }`}
    >
      {label}
    </button>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Running multi-agent analysis</p>
            <p className="mt-1 text-sm text-slate-300">Generating language detection, bug analysis, fixes, complexity, and explanation.</p>
          </div>
        </div>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="loading-bar h-full w-1/2 rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500" />
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="skeleton-card rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="h-4 w-1/2 rounded-full bg-white/10" />
          <div className="mt-4 h-3 w-3/4 rounded-full bg-white/10" />
          <div className="mt-3 h-3 w-full rounded-full bg-white/10" />
          <div className="mt-3 h-3 w-5/6 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  )
}

function AgentCard({ meta, children }) {
  return (
    <section className={`panel-card rounded-3xl border ${meta.border} bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${meta.border} ${meta.chip} text-sm font-bold`}>
            {meta.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{meta.label}</h3>
            <p className={`mt-1 text-xs font-medium uppercase tracking-[0.2em] ${meta.accent}`}>Agent result</p>
          </div>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  )
}

function useTypewriterText(text) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!text) {
      setDisplayText('')
      return undefined
    }

    let currentIndex = 0
    setDisplayText('')

    const intervalId = window.setInterval(() => {
      currentIndex += Math.max(1, Math.ceil(text.length / 48))
      setDisplayText(text.slice(0, currentIndex))

      if (currentIndex >= text.length) {
        window.clearInterval(intervalId)
      }
    }, 24)

    return () => window.clearInterval(intervalId)
  }, [text])

  return displayText
}

function Pill({ children, tone = 'default' }) {
  const toneClasses =
    tone === 'accent'
      ? 'border-orange-200 bg-orange-50 text-orange-700'
      : tone === 'muted'
        ? 'border-orange-100 bg-orange-50/60 text-slate-600'
        : 'border-orange-200 bg-orange-50 text-orange-700'

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}>
      {children}
    </span>
  )
}

function ValidationCard({ validation }) {
  const statusTone = validation?.passed ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-amber-50 text-amber-800 border-amber-200'
  const statusLabel = validation?.passed ? 'Passed' : 'Needs review'

  return (
    <section className="panel-card rounded-3xl border border-orange-200 bg-white p-5 xl:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Validation Agent</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Confirms syntax safety, checks RAG grounding, and flags hallucination risk before you trust the output.
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
          {statusLabel}
        </span>
      </div>

      {validation ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ValidationStat label="Syntax" value={validation.syntax_ok ? 'OK' : 'Issue'} tone={validation.syntax_ok ? 'good' : 'warn'} />
          <ValidationStat label="RAG" value={validation.rag_aligned ? 'Aligned' : 'Weak match'} tone={validation.rag_aligned ? 'good' : 'warn'} />
          <ValidationStat label="Hallucination" value={validation.hallucination_risk} tone={validation.hallucination_risk === 'low' ? 'good' : 'warn'} />
          {validation.findings?.length > 0 ? (
            <div className="sm:col-span-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Findings</p>
              <div className="mt-3 space-y-2">
                {validation.findings.map((finding, index) => (
                  <div key={`${finding.category}-${index}`} className="rounded-2xl border border-orange-100 bg-white p-3 text-sm leading-6 text-slate-700">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{finding.category}</span>
                      <Pill tone="muted">{finding.severity}</Pill>
                    </div>
                    <p className="mt-2">{finding.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-4 text-sm leading-6 text-slate-600">
          The validation result will appear here after the backend returns the review payload.
        </div>
      )}
    </section>
  )
}

function ValidationStat({ label, value, tone }) {
  const toneClasses =
    tone === 'good'
      ? 'border-orange-200 bg-orange-50 text-orange-700'
      : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClasses}`}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-inherit/80">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
