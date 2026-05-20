import Editor from '@monaco-editor/react'

const editorThemes = {
  javascript: 'vs-dark',
  cpp: 'vs-dark',
  typescript: 'vs-dark',
  python: 'vs-dark',
  jsx: 'vs-dark',
  java: 'vs-dark'
}

export function CodeEditorPanel({
  language,
  selectedLanguage,
  code,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
  loading
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Monaco Code Editor</h2>
          <p className="mt-1 text-sm text-slate-400">Edit code directly in the browser before running the multi-agent review.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading}
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current file</p>
          <p className="mt-1 text-sm text-slate-200">{selectedLanguage} snippet ready for analysis</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
          {language}
        </div>
      </div>

      <div className="min-h-[520px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1220]">
        <Editor
          height="100%"
          language={language}
          theme={editorThemes[language] || 'vs-dark'}
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            roundedSelection: false,
            automaticLayout: true,
            fontLigatures: true,
            overviewRulerLanes: 0
          }}
        />
      </div>
    </section>
  )
}