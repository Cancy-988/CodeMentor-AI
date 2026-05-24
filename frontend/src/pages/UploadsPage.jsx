import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { authFetch } from '../lib/apiClient'

export function UploadsPage() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const res = await authFetch('/api/uploads')
      if (!mounted) return
      if (!res.ok) {
        setUploads([])
      } else {
        const data = await res.json()
        setUploads(data)
      }
      setLoading(false)
    }
    load()
    return () => (mounted = false)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Navbar />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-8rem] h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
        <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Uploads</p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Uploaded files</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Uploaded files appear here with the same navigation as the rest of the workspace.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {loading ? 'Loading...' : `${uploads.length} saved`}
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-[#0d1222] px-5 py-6 text-sm text-slate-300">
              Loading uploads...
            </div>
          ) : null}

          {!loading && uploads.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-300">
              No uploads yet. Upload a file from the Projects or Workspace screen.
            </div>
          ) : null}

          <ul className="mt-6 space-y-4">
            {uploads.map((upload) => (
              <li key={upload.id} className="rounded-[24px] border border-white/10 bg-[#0d1222] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{upload.file_name}</h3>
                      <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
                        {upload.mime_type || upload.file_type || 'file'}
                      </span>
                    </div>

                    {upload.file_type === 'image' ? (
                      <div className="mt-3">
                        {upload.extracted_text ? (
                          <div className="rounded-lg border border-white/6 bg-white/3 p-3 text-sm text-slate-200">
                            <strong className="text-xs text-slate-300">OCR:</strong>
                            <div className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-sm">{upload.extracted_text}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">No extracted text available.</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-slate-300">Uploaded files are kept in the same project-style card layout as reviews and fixes.</p>
                    )}
                  </div>

                  <div className="text-sm text-slate-400">{new Date(upload.created_at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
