const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'java', label: 'Java' }
]

export function Sidebar({ selectedLanguage, onLanguageChange, onUpload, fileName }) {
  return (
    <aside className="border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] lg:sticky lg:top-0 lg:h-screen lg:w-[312px] lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="panel-surface flex h-full flex-col gap-6 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 backdrop-blur-xl">
        <div className="rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">CodeMentor AI</p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--color-text-primary)]">Workspace</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Upload code, choose a language, and send it to the multi-agent review pipeline.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]" htmlFor="language-select">
            Language
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition duration-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">
            File Upload
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 px-4 py-4 text-sm font-semibold text-[var(--color-text-primary)] transition duration-300 hover:-translate-y-0.5 hover:border-orange-400/40 hover:bg-[var(--color-bg-tertiary)]/90">
            <span>Upload file</span>
            <input className="hidden" type="file" onChange={onUpload} accept=".js,.py,.cpp,.java,image/*" />
          </label>
          <p className="text-xs text-[var(--color-text-tertiary)]">{fileName}</p>
        </div>

        <div className="mt-auto rounded-3xl border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)]/80 p-4">
          <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
            <span>Backend</span>
            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-orange-700 dark:text-orange-200">FastAPI</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Gemini responses are sent through the API layer so the frontend stays lightweight and easy to follow.
          </p>
        </div>
      </div>
    </aside>
  )
}
