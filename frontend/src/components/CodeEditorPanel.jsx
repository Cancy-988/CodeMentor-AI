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
  loading,
  onCopyCode
}) {
  return (
    <section className="panel-surface flex min-w-0 flex-1 flex-col gap-4 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)]/80 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Monaco Code Editor</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Edit code directly in the browser before running the multi-agent review.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCopyCode}
            className="rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
          >
            Copy code
          </button>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading}
            className="rounded-full border border-orange-300 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              {loading ? (
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : null}
              {loading ? 'Analyzing...' : 'Analyze Code'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-tertiary)]">Current file</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{selectedLanguage} snippet ready for analysis</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
          {language}
        </div>
      </div>

      <div className="min-h-[520px] overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[#0b1220] transition duration-300 focus-within:border-orange-400">
        <Editor
          height="100%"
          language={language}
          theme={editorThemes[language] || 'vs'}
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
