const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'java', label: 'Java' }
]

export function Sidebar({ selectedLanguage, onLanguageChange, onUpload, fileName }) {
  return (
    <aside className="border-b border-white/10 bg-[#07111f] px-4 py-4 shadow-[0_20px_60px_rgba(2,6,23,0.45)] lg:sticky lg:top-0 lg:h-screen lg:w-[312px] lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="flex h-full flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-transparent p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">CodeMentor AI</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Upload code, choose a language, and send it to the AI for review or repair.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" htmlFor="language-select">
            Language
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            File Upload
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 px-4 py-4 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/10">
            <span>Upload file</span>
            <input className="hidden" type="file" onChange={onUpload} accept=".js,.jsx,.ts,.tsx,.py,.java,.txt,.md,.json,.css,.html" />
          </label>
          <p className="text-xs text-slate-500">{fileName}</p>
        </div>

        <div className="mt-auto rounded-3xl border border-white/10 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Backend</span>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">FastAPI</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Gemini responses are sent through the API layer so the frontend stays lightweight and safe.
          </p>
        </div>
      </div>
    </aside>
  )
}