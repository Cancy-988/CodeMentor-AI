const toneStyles = {
  review: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  fix: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
}

export function ResponsePanel({ response, loading, mode, fileName, language }) {
  return (
    <aside className="flex min-w-0 flex-col gap-4 rounded-[28px] border border-white/10 bg-[#08101c] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:p-5">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI response panel</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Mentor feedback</h2>
            <p className="mt-2 text-sm text-slate-400">The backend response appears here after you review or fix code.</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${toneStyles[mode] || toneStyles.review}`}>
            {mode}
          </span>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>Context</span>
            <span>{language}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
            <span>File</span>
            <span className="truncate text-slate-400">{fileName}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-3/5 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{response}</p>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-transparent p-5">
        <p className="text-sm font-semibold text-white">Workflow</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Upload a file, choose the language, and ask the AI to review or repair the snippet.
        </p>
      </div>
    </aside>
  )
}