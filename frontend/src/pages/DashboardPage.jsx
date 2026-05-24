import { useEffect, useMemo, useRef, useState } from 'react'

import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { CodeEditorPanel } from '../components/CodeEditorPanel'
import { ResponsePanel } from '../components/ResponsePanel'
import { authFetch } from '../lib/apiClient'

const starterCodeByLanguage = {
  javascript:
    'function greet(name) {\n' +
    '  return `Hello, ${name}!`\n' +
    '}\n\n' +
    "console.log(greet('CodeMentor'))",
  cpp:
    '#include <iostream>\n\n' +
    'int main() {\n' +
    '    std::cout << "Hello from CodeMentor AI" << std::endl;\n' +
    '    return 0;\n' +
    '}',
  python:
    'def greet(name):\n' +
    '    return f"Hello, {name}!"\n\n' +
    'print(greet("CodeMentor"))',
  typescript:
    'type User = {\n' +
    '  name: string\n' +
    '}\n\n' +
    'const greet = (user: User): string => {\n' +
    '  return `Hello, ${user.name}!`\n' +
    '}\n\n' +
    "console.log(greet({ name: 'CodeMentor' }))",
  jsx:
    'export default function App() {\n' +
    '  return <h1>Hello from CodeMentor AI</h1>\n' +
    '}',
  java:
    'public class Main {\n' +
    '    public static void main(String[] args) {\n' +
    '        System.out.println("Hello from CodeMentor AI");\n' +
    '    }\n' +
    '}'
}

export function DashboardPage() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(starterCodeByLanguage.javascript)
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('starter.js')
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)
  const toastTimersRef = useRef(new Map())

  const editorLanguage = useMemo(() => {
    if (language === 'jsx') {
      return 'javascript'
    }

    return language
  }, [language])

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      toastTimersRef.current.clear()
    }
  }, [])

  const showToast = (title, description, tone = 'info') => {
    const id = toastIdRef.current + 1
    toastIdRef.current = id

    setToasts((currentToasts) => [...currentToasts, { id, title, description, tone }])

    const timerId = window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
      toastTimersRef.current.delete(id)
    }, 3600)

    toastTimersRef.current.set(id, timerId)
  }

  const dismissToast = (toastId) => {
    const timerId = toastTimersRef.current.get(toastId)
    if (timerId) {
      window.clearTimeout(timerId)
      toastTimersRef.current.delete(toastId)
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId))
  }

  const uploadCodeFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const isImage = file.type && file.type.startsWith('image/')
    const endpoint = isImage ? '/api/upload-file' : '/api/upload-code'

    const response = await authFetch(endpoint, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.detail || 'The file upload failed.')
    }

    return data
  }

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage)
    setCode(starterCodeByLanguage[nextLanguage] || '')
    setFileName(defaultFileName(nextLanguage))
    setReview(null)
    setError('')
    showToast('Language changed', `${languageLabel(nextLanguage)} starter code loaded.`, 'info')
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setError('')
      setLoading(true)
      const uploadedFile = await uploadCodeFile(file)
      setCode(uploadedFile.content)
      setLanguage(uploadedFile.language)
      setFileName(uploadedFile.filename)
      setReview(null)
      showToast('File imported', `${uploadedFile.filename} is ready for review.`, 'success')
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'The file upload failed.'
      setError(message)
      showToast('Upload failed', message, 'error')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  const sendToBackend = async () => {
    const trimmedCode = code.trim()
    if (!trimmedCode) {
      setError('Add code to the editor before sending a review request.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const responsePayload = await authFetch('/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code: trimmedCode })
      })

      const data = await responsePayload.json()

      if (!responsePayload.ok) {
        throw new Error(data?.detail || 'The review request failed.')
      }

      setReview(data)
      showToast('Review ready', 'The multi-agent report finished successfully.', 'success')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not reach the backend. Make sure FastAPI is running.'
      setError(message)
      showToast('Review failed', message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async (text, label = 'Code') => {
    const normalizedText = text.trim()
    if (!normalizedText) {
      showToast('Nothing to copy', `${label} is empty.`, 'error')
      return
    }

    try {
      await copyTextToClipboard(normalizedText)
      showToast('Copied', `${label} copied to clipboard.`, 'success')
    } catch {
      showToast('Copy failed', 'Clipboard access was blocked by the browser.', 'error')
    }
  }

  const handleDownloadReport = () => {
    if (!review) {
      showToast('No report yet', 'Run a review before downloading a report.', 'error')
      return
    }

    const report = buildReportMarkdown({ review, fileName, language })
    const downloadName = `${fileName.replace(/\.[^.]+$/, '') || 'codementor-report'}-report.md`
    downloadTextFile(downloadName, report)
    showToast('Download started', `${downloadName} is being saved.`, 'success')
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100">
      <Navbar />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar
          selectedLanguage={language}
          onLanguageChange={handleLanguageChange}
          onUpload={handleFileUpload}
          fileName={fileName}
        />

        <section className="flex min-h-screen flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <header className="animate-[fadeInUp_0.55s_ease-out] rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-orange-300">
                  CodeMentor AI Studio
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  Review, fix, and understand code with an AI mentor.
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  A bright workspace for multi-agent code review, bug detection, and beginner-friendly explanations.
                </p>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
            <CodeEditorPanel
              language={editorLanguage}
              selectedLanguage={language}
              code={code}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
              onAnalyze={sendToBackend}
              loading={loading}
              onCopyCode={() => handleCopyCode(code, 'Editor code')}
            />

            <ResponsePanel
              loading={loading}
              error={error}
              review={review}
              fileName={fileName}
              language={language}
              onCopyCode={(text) => handleCopyCode(text, 'Improved code')}
              onDownloadReport={handleDownloadReport}
            />
          </div>
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:justify-end sm:px-6">
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      </div>
    </main>
  )
}

function defaultFileName(selectedLanguage) {
  const mapping = {
    javascript: 'starter.js',
    cpp: 'starter.cpp',
    python: 'starter.py',
    typescript: 'starter.ts',
    jsx: 'starter.jsx',
    java: 'Main.java'
  }

  return mapping[selectedLanguage] || 'starter.txt'
}

function languageLabel(languageKey) {
  const labels = {
    javascript: 'JavaScript',
    cpp: 'C++',
    python: 'Python',
    typescript: 'TypeScript',
    jsx: 'React JSX',
    java: 'Java'
  }

  return labels[languageKey] || 'Code'
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', 'true')
  textArea.style.position = 'absolute'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

function buildReportMarkdown({ review, fileName, language }) {
  const lines = [
    '# CodeMentor AI Report',
    '',
    `- File: ${fileName}`,
    `- Input language: ${languageLabel(language)}`,
    `- Detected language: ${review.language_detection.detected_language}`,
    `- Confidence: ${review.language_detection.confidence}`,
    '',
    '## Final Summary',
    review.final_summary,
    '',
    '## Language Detection',
    review.language_detection.explanation,
    '',
    '## Bug Detection',
    review.bug_detection.summary,
    '',
    ...review.bug_detection.issues.flatMap((issue) => [
      `- ${issue.title} (${issue.severity})`,
      `  - ${issue.explanation}`,
      `  - Fix: ${issue.fix}`
    ]),
    '',
    '## Fix Suggestion',
    review.fix_suggestion.recommended_fix,
    '',
    '```',
    review.fix_suggestion.improved_code,
    '```',
    '',
    '## Complexity Analysis',
    review.complexity_analysis.explanation,
    `- Time complexity: ${review.complexity_analysis.time_complexity}`,
    `- Space complexity: ${review.complexity_analysis.space_complexity}`,
    '',
    '## Explanation',
    review.explanation.simple_explanation,
    '',
    '## Next Steps',
    ...review.next_steps.map((step) => `- ${step}`)
  ]

  if (review.validation) {
    lines.push('', '## Validation')
    lines.push(`- Syntax: ${review.validation.syntax_ok ? 'OK' : 'Issue'}`)
    lines.push(`- RAG alignment: ${review.validation.rag_aligned ? 'Aligned' : 'Weak match'}`)
    lines.push(`- Hallucination risk: ${review.validation.hallucination_risk}`)

    if (review.validation.findings?.length > 0) {
      lines.push('', '### Findings')
      review.validation.findings.forEach((finding) => {
        lines.push(`- ${finding.category} (${finding.severity}): ${finding.message}`)
      })
    }
  }

  return `${lines.join('\n')}\n`
}

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = downloadUrl
  link.download = fileName
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)
}

function ToastCard({ toast, onDismiss }) {
  const toneClasses = {
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    error: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
    info: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
  }

  const toneLabel = {
    success: 'Success',
    error: 'Error',
    info: 'Info'
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-[toastIn_0.28s_ease-out] rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur ${toneClasses[toast.tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] opacity-80">{toneLabel[toast.tone]}</p>
          <p className="mt-1 text-sm font-semibold text-white">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm leading-6 text-slate-200/90">{toast.description}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}