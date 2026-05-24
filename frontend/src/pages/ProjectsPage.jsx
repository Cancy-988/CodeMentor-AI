import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { authFetch } from '../lib/apiClient'
import { readJsonResponse } from '../lib/apiClient'

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
]

const reviewTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'language_detection', label: 'Language' },
  { value: 'bug_detection', label: 'Bug Fixes' },
  { value: 'fix_suggestion', label: 'Fix Suggestion' },
  { value: 'complexity_analysis', label: 'Complexity' },
  { value: 'explanation', label: 'Explanation' },
  { value: 'validation', label: 'Validation' },
]

const supportedExtensions = new Set(['.js', '.py', '.cpp', '.java'])

export function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [framework, setFramework] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectionLabel, setSelectionLabel] = useState('No folder selected')
  const [review, setReview] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [activeReviewTab, setActiveReviewTab] = useState('overview')

  useEffect(() => {
    setActiveReviewTab('overview')
  }, [review])

  useEffect(() => {
    loadProjects()
  }, [])

  const projectNameFromFile = (fileName) => fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()

  const isSupportedProjectFile = (file) => {
    const fileName = file.name.toLowerCase()
    return Array.from(supportedExtensions).some((extension) => fileName.endsWith(extension))
  }

  const getFolderName = (file) => {
    const relativePath = file.webkitRelativePath || ''

    if (relativePath.includes('/')) {
      return relativePath.split('/')[0]
    }

    return file.name
  }

  const getProjectNameFromSelection = (files) => {
    if (!files.length) {
      return ''
    }

    if (files.length > 1) {
      return projectNameFromFile(getFolderName(files[0]))
    }

    return projectNameFromFile(files[0].name)
  }

  const pickPrimaryFile = (uploadedFiles) => {
    const preferredNames = ['index.js', 'main.js', 'app.js', 'index.py', 'main.py', 'app.py', 'main.cpp', 'main.java']

    for (const preferredName of preferredNames) {
      const match = uploadedFiles.find((file) => file.filename.toLowerCase().endsWith(preferredName))

      if (match) {
        return match
      }
    }

    return uploadedFiles[0] || null
  }

  const loadProjects = async () => {
    setLoading(true)

    try {
      const res = await authFetch('/api/projects')

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || 'Unable to load projects right now.')
      }

      const data = await readJsonResponse(res)
      setProjects(Array.isArray(data) ? data : [])
      setPageError('')
    } catch (loadError) {
      setProjects([])
      setPageError(loadError instanceof Error ? loadError.message : 'Unable to load projects right now.')
    } finally {
      setLoading(false)
    }
  }

  const uploadProjectFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file, file.webkitRelativePath || file.name)

    const response = await authFetch('/api/upload-code', {
      method: 'POST',
      body: formData,
    })

    const data = await readJsonResponse(response)

    if (!response.ok) {
      throw new Error(data?.detail || 'The project upload failed.')
    }

    return data
  }

  const uploadProjectFiles = async (files) => {
    const uploadedFiles = []

    for (const file of files) {
      uploadedFiles.push(await uploadProjectFile(file))
    }

    return uploadedFiles
  }

  const runMultiAgentReview = async (code, reviewLanguage) => {
    const response = await authFetch('/review-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: reviewLanguage,
        code,
      }),
    })

    const data = await readJsonResponse(response)

    if (!response.ok) {
      throw new Error(data?.detail || 'The multi-agent review failed.')
    }

    return data
  }

  const createProject = async () => {
    const trimmedName = projectName.trim()

    if (!trimmedName) {
      throw new Error('Add a project name before creating it.')
    }

    const response = await authFetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: trimmedName,
        description: description.trim() || null,
        language: language || null,
        framework: framework.trim() || null,
      }),
    })

    const data = await readJsonResponse(response)

    if (!response.ok) {
      throw new Error(data?.detail || 'The project could not be created.')
    }

    return data
  }

  const handleUploadChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    const supportedFiles = files.filter(isSupportedProjectFile)
    const file = files[0] ?? null

    setSelectedFile(file)
    setSelectedFiles(supportedFiles)

    if (files.length > 1) {
      const folderName = getFolderName(files[0])
      setSelectionLabel(`${folderName} (${supportedFiles.length}/${files.length} supported files)`)

      if (!projectName.trim()) {
        setProjectName(projectNameFromFile(folderName))
      }

      if (!description.trim()) {
        setDescription(`Imported from folder ${folderName}`)
      }
    } else if (file) {
      setSelectionLabel(file.name)

      if (!projectName.trim()) {
        setProjectName(projectNameFromFile(file.name))
      }

      if (!description.trim()) {
        setDescription(`Imported from ${file.name}`)
      }
    } else {
      setSelectionLabel('No folder selected')
    }

    if (files.length > 0 && supportedFiles.length === 0) {
      setFormError('Select a folder that contains at least one .js, .py, .cpp, or .java file.')
    } else {
      setFormError('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setReview(null)
    setActiveReviewTab('overview')
    setSubmitting(true)

    try {
      let uploadedFile = null
      const filesToUpload = selectedFiles.length > 0 ? selectedFiles : selectedFile && isSupportedProjectFile(selectedFile) ? [selectedFile] : []

      if (filesToUpload.length > 0) {
        const uploadedFiles = await uploadProjectFiles(filesToUpload)
        uploadedFile = pickPrimaryFile(uploadedFiles)

        if (!projectName.trim()) {
          setProjectName(getProjectNameFromSelection(filesToUpload))
        }

        if (!description.trim()) {
          const selectionTitle = filesToUpload.length > 1 ? getFolderName(filesToUpload[0]) : filesToUpload[0].name
          setDescription(`Imported from ${selectionTitle}`)
        }

        if (uploadedFile && (!language || language === 'javascript')) {
          setLanguage(uploadedFile.language)
        }
      } else if (selectedFile) {
        throw new Error('Select a folder that contains at least one supported source file.')
      }

      await createProject()
      await loadProjects()

      if (uploadedFile) {
        setReviewLoading(true)
        try {
          const reviewResult = await runMultiAgentReview(uploadedFile.content, uploadedFile.language)
          setReview(reviewResult)
        } finally {
          setReviewLoading(false)
        }
      }

      setSelectedFile(null)
      setSelectedFiles([])
      setSelectionLabel('No folder selected')
      setProjectName('')
      setDescription('')
      setLanguage('javascript')
      setFramework('')
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Unable to create the project.')
    } finally {
      setSubmitting(false)
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

      <div className="relative mx-auto max-w-[1440px] space-y-10 px-4 py-8 sm:px-6 lg:px-10">
        <section className="animate-[fadeInUp_0.6s_ease-out] space-y-8">
          <div className="inline-flex items-center rounded-full border border-orange-400/25 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300 backdrop-blur">
            Project Workspace
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
              Upload a project folder, keep it organized, and review it from one place.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
              Add your source files, create a project record, and keep the project list ready for future reviews, fixes, and uploads.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard title="Folder upload" description="Pick a full project folder instead of a single file." />
            <FeatureCard title="Live project list" description="New projects appear immediately after creation with the latest update time." />
            <FeatureCard title="Fast feedback" description="Errors are shown inline instead of leaving the page blank." />
            <FeatureCard title="Google-style shell" description="The page follows the same dark glass and orange accent direction as login." />
          </div>
          <br></br>
        </section>

        <section className="animate-[fadeInUp_0.75s_ease-out] rounded-[32px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-6">
          <div className="rounded-[28px] border border-[var(--color-border-light)] bg-[var(--color-bg-tertiary)]/80 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">New Project</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">Create and upload</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Upload a project folder, fill in the details, and save it as a project.
            </p>

            {pageError ? (
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                {pageError}
              </div>
            ) : null}

            {formError ? (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                {formError}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]" htmlFor="project-name">
                  Project name
                </label>
                <input
                  id="project-name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="My first review project"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]" htmlFor="project-description">
                  Description
                </label>
                <textarea
                  id="project-description"
                  rows="3"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Short note about what the project contains"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]" htmlFor="project-language">
                    Language
                  </label>
                  <select
                    id="project-language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-[#0d1222] text-slate-100">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]" htmlFor="project-framework">
                    Framework
                  </label>
                  <input
                    id="project-framework"
                    value={framework}
                    onChange={(event) => setFramework(event.target.value)}
                    placeholder="React, FastAPI, Django"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">Upload project folder</label>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-orange-300/40 bg-gradient-to-r from-orange-500/10 to-amber-400/10 px-4 py-4 text-sm font-medium text-orange-100 transition duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:from-orange-500/15 hover:to-amber-400/15">
                  <span>{selectionLabel}</span>
                  <span className="rounded-full border border-orange-300/30 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">
                    Browse folder
                  </span>
                  <input className="hidden" type="file" accept=".js,.py,.cpp,.java" multiple webkitdirectory="true" onChange={handleUploadChange} />
                </label>
                <p className="text-xs leading-6 text-[var(--color-text-tertiary)]">
                  Choose a folder to upload its code files together. Supported uploads are .js, .py, .cpp, and .java files. The first matching source file is used for the review.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                {submitting ? 'Saving project...' : 'Upload folder and create project'}
              </button>

              <div className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/50 p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                After saving, the project card appears below with a live timestamp so you can track recent work.
              </div>
            </form>

            {reviewLoading ? (
              <div className="mt-6 rounded-[24px] border border-orange-400/20 bg-orange-400/10 p-5 text-sm leading-6 text-orange-100">
                Running the multi-agent review on the uploaded folder. Bug detection, fix suggestions, and validation are being prepared.
              </div>
            ) : null}

            {!reviewLoading && review ? (
              <div className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Multi-agent review</p>
                    <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Suggested fix and analysis</h3>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${review.validation?.passed ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-400/20 bg-amber-400/10 text-amber-100'}`}>
                    {review.validation?.passed ? 'Validation passed' : 'Validation needs attention'}
                  </span>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1222]">
                  <div className="flex items-end gap-2 overflow-x-auto border-b border-white/10 bg-white/5 px-3 pt-3">
                    {reviewTabs.map((tab) => (
                      <ReviewTabButton
                        key={tab.value}
                        label={tab.label}
                        active={activeReviewTab === tab.value}
                        onClick={() => setActiveReviewTab(tab.value)}
                      />
                    ))}
                  </div>

                  <div className="p-4 sm:p-5">
                    <ReviewAgentPanel review={review} activeTab={activeReviewTab} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="animate-[fadeInUp_0.8s_ease-out] rounded-[32px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/88 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">Projects</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">Your project list</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                If the list is empty, use the upload form above to add your first project.
              </p>
            </div>
            <div className="rounded-full border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/50 px-4 py-2 text-sm text-[var(--color-text-secondary)]">
              {loading ? 'Syncing projects...' : `${projects.length} saved`}
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[24px] border border-[var(--color-border-light)] bg-[#0d1222] px-5 py-6 text-sm text-slate-300">
              Loading projects...
            </div>
          ) : null}

          {!loading && projects.length === 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <EmptyStateCard title="Nothing here yet" description="Create a project from the panel above to populate this section." />
              <EmptyStateCard title="Upload first" description="Supported code uploads are imported before the project record is saved." />
            </div>
          ) : null}

          <ul className="mt-6 space-y-4">
            {projects.map((project) => (
              <li key={project.id} className="rounded-[24px] border border-[var(--color-border-light)] bg-[#0d1222] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-semibold text-white">{project.name}</h4>
                      {project.status ? <Badge label={project.status} /> : null}
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{project.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      {project.language ? <Badge label={project.language} tone="subtle" /> : null}
                      {project.framework ? <Badge label={project.framework} tone="subtle" /> : null}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400">Updated {new Date(project.updated_at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-[24px] border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur">
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
    </div>
  )
}

function EmptyStateCard({ title, description }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#0d1222] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  )
}

function Badge({ label, tone = 'default' }) {
  const toneClasses =
    tone === 'subtle'
      ? 'border-white/10 bg-white/5 text-slate-200'
      : 'border-orange-400/20 bg-orange-400/10 text-orange-200'

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses}`}>{label}</span>
}

function ReviewTabButton({ label, active, onClick }) {
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

function ReviewAgentPanel({ review, activeTab }) {
  switch (activeTab) {
    case 'language_detection':
      return (
        <AgentSection title="Language Detection" accent="text-orange-300">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge label={review.language_detection.detected_language} tone="subtle" />
              <Badge label={`Confidence: ${review.language_detection.confidence}`} tone="subtle" />
            </div>
            <p className="text-sm leading-6 text-slate-300">{review.language_detection.explanation}</p>
          </div>
        </AgentSection>
      )

    case 'bug_detection':
      return (
        <AgentSection title="Bug Detection" accent="text-amber-300">
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-300">{review.bug_detection.summary}</p>
            <div className="space-y-3">
              {review.bug_detection.issues?.length > 0 ? (
                review.bug_detection.issues.map((issue) => (
                  <div key={issue.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{issue.title}</span>
                      <Badge label={issue.severity} tone="subtle" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{issue.explanation}</p>
                    <p className="mt-2 text-sm leading-6 text-orange-200">Fix: {issue.fix}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-400">No obvious bugs were detected.</p>
              )}
            </div>
          </div>
        </AgentSection>
      )

    case 'fix_suggestion':
      return (
        <AgentSection title="Fix Suggestion" accent="text-orange-300">
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-300">{review.fix_suggestion.recommended_fix}</p>
            <div className="flex flex-wrap gap-2">
              {review.fix_suggestion.alternatives?.length > 0 ? (
                review.fix_suggestion.alternatives.map((alternative) => (
                  <Badge key={alternative} label={alternative} tone="subtle" />
                ))
              ) : (
                <Badge label="No alternatives suggested" tone="subtle" />
              )}
            </div>
            {review.fix_suggestion.improved_code ? (
              <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-slate-200">
                {review.fix_suggestion.improved_code}
              </pre>
            ) : null}
          </div>
        </AgentSection>
      )

    case 'complexity_analysis':
      return (
        <AgentSection title="Complexity Analysis" accent="text-amber-300">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge label={review.complexity_analysis.time_complexity} tone="subtle" />
              <Badge label={review.complexity_analysis.space_complexity} tone="subtle" />
            </div>
            <p className="text-sm leading-6 text-slate-300">{review.complexity_analysis.explanation}</p>
          </div>
        </AgentSection>
      )

    case 'explanation':
      return (
        <AgentSection title="Explanation" accent="text-orange-300">
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-300">{review.explanation.simple_explanation}</p>
            <div className="flex flex-wrap gap-2">
              {review.explanation.key_takeaways?.length > 0 ? (
                review.explanation.key_takeaways.map((takeaway) => (
                  <Badge key={takeaway} label={takeaway} tone="subtle" />
                ))
              ) : (
                <Badge label="No extra takeaways" tone="subtle" />
              )}
            </div>
          </div>
        </AgentSection>
      )
   

    case 'validation':
      return (
        <AgentSection title="Validation" accent="text-orange-300">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge label={review.validation?.passed ? 'Passed' : 'Needs attention'} tone="subtle" />
              <Badge label={`Syntax: ${review.validation?.syntax_ok ? 'OK' : 'Issue'}`} tone="subtle" />
              <Badge label={`RAG: ${review.validation?.rag_aligned ? 'Aligned' : 'Weak match'}`} tone="subtle" />
              <Badge label={`Risk: ${review.validation?.hallucination_risk || 'unknown'}`} tone="subtle" />
            </div>
            {review.validation?.findings?.length > 0 ? (
              <div className="space-y-3">
                {review.validation.findings.map((finding, index) => (
                  <div key={`${finding.category}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{finding.category}</span>
                      <Badge label={finding.severity} tone="subtle" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{finding.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-400">No validation findings were reported.</p>
            )}
          </div>
        </AgentSection>
      )
    case 'overview':
    default:
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Summary</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{review.final_summary}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Bug detection</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{review.bug_detection.summary}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Fix suggestion</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{review.fix_suggestion.recommended_fix}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Next steps</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {review.next_steps?.map((step) => (
                <Badge key={step} label={step} tone="subtle" />
              ))}
            </div>
          </div>
        </div>
      )
  }
}

function AgentSection({ title, accent, children }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-[0.18em] ${accent}`}>{title}</h4>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Agent result</p>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  )
}
