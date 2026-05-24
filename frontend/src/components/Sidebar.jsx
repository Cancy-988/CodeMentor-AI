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
    <aside className="border-b border-white/10 bg-[#070b14] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] lg:sticky lg:top-0 lg:h-screen lg:w-[312px] lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="panel-surface flex h-full flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="rounded-3xl border border-white/10 bg-[#0d1222] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">CodeMentor AI</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Upload code, choose a language, and send it to the multi-agent review pipeline.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300" htmlFor="language-select">
            Language
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            File Upload
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-orange-300/40 bg-gradient-to-r from-orange-500/10 to-amber-400/10 px-4 py-4 text-sm font-medium text-orange-100 transition duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:from-orange-500/15 hover:to-amber-400/15">
            <span>Upload file</span>
            <input className="hidden" type="file" onChange={onUpload} accept=".js,.py,.cpp,.java" />
          </label>
          <p className="text-xs text-slate-400">{fileName}</p>
        </div>

        <div className="mt-auto rounded-3xl border border-white/10 bg-[#0d1222] p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Backend</span>
            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-orange-200">FastAPI</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Gemini responses are sent through the API layer so the frontend stays lightweight and easy to follow.
          </p>
        </div>
      </div>
    </aside>
  )
}
