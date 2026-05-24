import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'

import { Navbar } from '../components/Navbar'
import { authFetch, readJsonResponse } from '../lib/apiClient'
import { buildFileTree, guessLanguageFromFileName, pickPrimaryWorkspaceFile } from '../lib/workspaceBundle'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [projectBundle, setProjectBundle] = useState(null)
  const [selectedPath, setSelectedPath] = useState('')
  const [editorCode, setEditorCode] = useState('')
  const [fixResult, setFixResult] = useState(null)
  const [fixLoading, setFixLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      const response = await authFetch(`/api/projects/${projectId}/workspace`) 
      const data = await readJsonResponse(response)

      if (!mounted) {
        return
      }

      if (!response.ok) {
        setProjectBundle(null)
        setError(data?.detail || 'Unable to load the project workspace.')
      } else {
        setProjectBundle(data)
        setError('')
      }

      setLoading(false)
    }

    load()

    return () => {
      mounted = false
    }
  }, [projectId])

  const project = projectBundle?.project || null
  const workspace = projectBundle?.workspace_json || null
  const files = workspace?.files || []
  const fileTree = useMemo(() => buildFileTree(files), [files])
  const selectedFile = useMemo(() => files.find((file) => file.path === selectedPath) || pickPrimaryWorkspaceFile(files) || null, [files, selectedPath])
  const review = workspace?.review || null

  useEffect(() => {
    if (!selectedFile) {
      setSelectedPath('')
      setEditorCode('')
      return
    }

    setSelectedPath(selectedFile.path || selectedFile.filename || '')
    setEditorCode(selectedFile.content || '')
  }, [selectedFile?.path])

  const handleGenerateFix = async () => {
    if (!editorCode.trim()) {
      return
    }

    setFixLoading(true)
    setFixResult(null)

    try {
      const response = await authFetch('/api/fixes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          original_code: editorCode,
          language: selectedFile?.language || project?.language || guessLanguageFromFileName(selectedFile?.filename || selectedFile?.path || '')
        })
      })

      const data = await readJsonResponse(response)

      if (!response.ok) {
        throw new Error(data?.detail || 'Unable to generate a fix.')
      }

      setFixResult(data)
    } catch (fixError) {
      setFixResult({ error: fixError instanceof Error ? fixError.message : 'Unable to generate a fix.' })
    } finally {
      setFixLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Navbar />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-8rem] h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Project detail</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">{project?.name || 'Loading project'}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Project #{projectId} workspace, file tree, editor, and AI feedback in one place.</p>
          </div>
          <Link to="/projects" className="rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/80 px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:-translate-y-0.5 hover:border-orange-300/40 hover:text-orange-200">
            Back to projects
          </Link>
        </div>

        {error ? <div className="mb-6 rounded-[24px] border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm leading-6 text-rose-100">{error}</div> : null}

        {loading ? <div className="rounded-[24px] border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)]/85 px-5 py-6 text-sm text-[var(--color-text-secondary)]">Loading project workspace...</div> : null}

        {!loading && project ? (
          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_380px]">
            <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Files</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">File tree</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Click a file to open it in the editor.</p>
              <div className="mt-4 max-h-[70vh] overflow-auto rounded-[20px] border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-3">
                {fileTree.length > 0 ? (
                  <WorkspaceTree nodes={fileTree} selectedPath={selectedPath || selectedFile?.path || ''} onSelect={setSelectedPath} />
                ) : (
                  <p className="p-3 text-sm leading-6 text-[var(--color-text-secondary)]">No bundled files were saved for this project yet.</p>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Workspace</p>
                    <h2 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">Editor</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{selectedFile?.filename || selectedFile?.path || 'Select a file'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateFix}
                    disabled={fixLoading || !editorCode.trim()}
                    className="rounded-full border border-orange-300 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {fixLoading ? 'Generating fix...' : 'Fix this code'}
                  </button>
                </div>

                <div className="mt-5 min-h-[620px] overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[#0b1220]">
                  <Editor
                    height="620px"
                    language={selectedFile?.language || project.language || 'javascript'}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={(value) => setEditorCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 22,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      padding: { top: 16, bottom: 16 },
                      automaticLayout: true
                    }}
                  />
                </div>
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Project info</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Saved snapshot</h2>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Name:</span> {project.name}</p>
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Language:</span> {project.language || 'n/a'}</p>
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Framework:</span> {project.framework || 'n/a'}</p>
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Status:</span> {project.status || 'saved'}</p>
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Created:</span> {new Date(project.created_at).toLocaleString()}</p>
                    <p><span className="font-semibold text-[var(--color-text-primary)]">Updated:</span> {new Date(project.updated_at).toLocaleString()}</p>
                  </div>
                  {project.description ? <p className="mt-4 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4 text-sm leading-6 text-[var(--color-text-secondary)]">{project.description}</p> : null}
                </section>

                <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Quick fix</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Fix output</h2>
                  {fixResult?.error ? (
                    <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100">{fixResult.error}</div>
                  ) : fixResult ? (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Explanation</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{fixResult.explanation}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Fixed code</p>
                        <pre className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-2xl border border-[var(--color-border-light)] bg-[#0b1220] p-4 text-xs leading-6 text-slate-200">{fixResult.fixed_code}</pre>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">Click the button above to generate and save a fix for the selected code.</p>
                  )}
                </section>
              </div>

              {review ? <ProjectReviewSummary review={review} /> : null}
            </section>

            <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">AI result</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Saved workspace review</h2>
              {review ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Summary</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{review.final_summary}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Validation</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{review.validation?.passed ? 'Passed' : 'Needs attention'} - Syntax {review.validation?.syntax_ok ? 'OK' : 'Issue'}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">Next steps</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.next_steps?.map((step) => (
                        <span key={step} className="rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/60 px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">No saved review bundle exists yet for this project.</p>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function WorkspaceTree({ nodes, selectedPath, onSelect }) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.path}>
          {node.type === 'folder' ? (
            <div>
              <div className="rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)]">{node.name}</div>
              {node.children?.length > 0 ? <div className="pl-4"><WorkspaceTree nodes={node.children} selectedPath={selectedPath} onSelect={onSelect} /></div> : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(node.path)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                selectedPath === node.path
                  ? 'border-orange-400/30 bg-orange-400/10 text-orange-100'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)] hover:bg-[var(--color-bg-primary)]/55 hover:text-[var(--color-text-primary)]'
              }`}
            >
              {node.name}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

function ProjectReviewSummary({ review }) {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">AI review</p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Analysis summary</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SummaryCard title="Bug detection" text={review.bug_detection?.summary} />
        <SummaryCard title="Fix suggestion" text={review.fix_suggestion?.recommended_fix} />
        <SummaryCard title="Explanation" text={review.explanation?.simple_explanation} />
        <SummaryCard title="Complexity" text={`${review.complexity_analysis?.time_complexity || ''} / ${review.complexity_analysis?.space_complexity || ''}`} />
      </div>
    </section>
  )
}

function SummaryCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/55 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-tertiary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{text || 'No data available.'}</p>
    </div>
  )
}
