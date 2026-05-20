import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
  language_detection: { label: 'Language Detection', icon: '<>', accent: 'text-cyan-200', border: 'border-cyan-400/20', chip: 'bg-cyan-400/10 text-cyan-200' },
  bug_detection: { label: 'Bug Detection', icon: '!', accent: 'text-rose-200', border: 'border-rose-400/20', chip: 'bg-rose-400/10 text-rose-200' },
  fix_suggestion: { label: 'Fix Suggestion', icon: '✓', accent: 'text-emerald-200', border: 'border-emerald-400/20', chip: 'bg-emerald-400/10 text-emerald-200' },
  complexity_analysis: { label: 'Complexity Analysis', icon: '≈', accent: 'text-amber-200', border: 'border-amber-400/20', chip: 'bg-amber-400/10 text-amber-200' },
  explanation: { label: 'Explanation', icon: 'i', accent: 'text-violet-200', border: 'border-violet-400/20', chip: 'bg-violet-400/10 text-violet-200' }
}

const syntaxLanguageMap = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  jsx: 'jsx',
  java: 'java'
}

export function ResponsePanel({ review, loading, error, fileName, language }) {
  const validation = review?.validation

  return (
    <aside className="flex min-w-0 flex-col gap-4 rounded-[28px] border border-white/10 bg-[#08101c] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:p-5">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI response panel</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Multi-agent review</h2>
            <p className="mt-2 text-sm text-slate-400">Each agent response appears in its own card so the output stays easy to scan.</p>
          </div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            {language}
          </span>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>Context</span>
            <span>{fileName}</span>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            The backend sends one structured payload with five agent results: language detection, bug detection, fix suggestions, complexity analysis, and explanations.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm leading-6 text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
              <div className="mt-4 h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : review ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <AgentCard meta={agentMeta.language_detection}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Pill>{review.language_detection.detected_language}</Pill>
                <Pill tone="muted">Confidence: {review.language_detection.confidence}</Pill>
              </div>
              <p className="text-sm leading-6 text-slate-300">{review.language_detection.explanation}</p>
            </div>
          </AgentCard>

          <AgentCard meta={agentMeta.bug_detection}>
            <div className="space-y-4">
              <p className="text-sm leading-6 text-slate-300">{review.bug_detection.summary}</p>
              <div className="space-y-3">
                {review.bug_detection.issues.length > 0 ? (
                  review.bug_detection.issues.map((issue) => (
                    <div key={issue.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{issue.title}</span>
                        <Pill tone="muted">{issue.severity}</Pill>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{issue.explanation}</p>
                      <p className="mt-2 text-sm leading-6 text-cyan-100">Fix: {issue.fix}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-400">No obvious bugs were detected by the agent.</p>
                )}
              </div>
            </div>
          </AgentCard>

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
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]">
                  <SyntaxHighlighter
                    language={syntaxLanguageMap[language] || 'javascript'}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, background: 'transparent', fontSize: '0.84rem', lineHeight: 1.65 }}
                    showLineNumbers={false}
                    wrapLongLines
                  >
                    {review.fix_suggestion.improved_code}
                  </SyntaxHighlighter>
                </div>
              ) : null}
            </div>
          </AgentCard>

          <AgentCard meta={agentMeta.complexity_analysis}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Pill>{review.complexity_analysis.time_complexity}</Pill>
                <Pill tone="muted">{review.complexity_analysis.space_complexity}</Pill>
              </div>
              <p className="text-sm leading-6 text-slate-300">{review.complexity_analysis.explanation}</p>
            </div>
          </AgentCard>

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

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-transparent p-5 xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Final summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{review.final_summary}</p>
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
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm leading-6 text-slate-400">
          Run the analysis to see the five agent cards here. The layout stays simple on mobile and expands into two columns on larger screens.
        </div>
      )}
    </aside>
  )
}

function AgentCard({ meta, children }) {
  return (
    <section className={`rounded-3xl border ${meta.border} bg-slate-950/70 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.35)]`}>
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

function Pill({ children, tone = 'default' }) {
  const toneClasses =
    tone === 'accent'
      ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
      : tone === 'muted'
        ? 'border-white/10 bg-white/5 text-slate-200'
        : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}>
      {children}
    </span>
  )
}

function ValidationCard({ validation }) {
  const statusTone = validation?.passed ? 'bg-emerald-400/10 text-emerald-200 border-emerald-400/20' : 'bg-amber-400/10 text-amber-200 border-amber-400/20'
  const statusLabel = validation?.passed ? 'Passed' : 'Needs review'

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 xl:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Validation Agent</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
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
            <div className="sm:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Findings</p>
              <div className="mt-3 space-y-2">
                {validation.findings.map((finding, index) => (
                  <div key={`${finding.category}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 text-slate-300">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{finding.category}</span>
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
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-400">
          The validation result will appear here after the backend returns the review payload.
        </div>
      )}
    </section>
  )
}

function ValidationStat({ label, value, tone }) {
  const toneClasses =
    tone === 'good'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
      : 'border-amber-400/20 bg-amber-400/10 text-amber-200'

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClasses}`}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-inherit/80">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}