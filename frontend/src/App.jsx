import { useMemo, useState } from 'react'

import { Sidebar } from './components/Sidebar'
import { CodeEditorPanel } from './components/CodeEditorPanel'
import { ResponsePanel } from './components/ResponsePanel'

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

export default function App() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(starterCodeByLanguage.javascript)
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('starter.js')

  const editorLanguage = useMemo(() => {
    if (language === 'jsx') {
      return 'javascript'
    }

    return language
  }, [language])

  const uploadCodeFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-code', {
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
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'The file upload failed.')
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
      const responsePayload = await fetch('/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code: trimmedCode })
      })

      const data = await responsePayload.json()

      if (!responsePayload.ok) {
        throw new Error(data?.detail || 'The review request failed.')
      }

      setReview(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not reach the backend. Make sure FastAPI is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <Sidebar
          selectedLanguage={language}
          onLanguageChange={handleLanguageChange}
          onUpload={handleFileUpload}
          fileName={fileName}
        />

        <section className="flex min-h-screen flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <header className="rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300/90">
                  CodeMentor AI Studio
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  Review, fix, and understand code with an AI mentor.
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                  A clean dark workspace for multi-agent code review, bug detection, and beginner-friendly explanations.
                </p>
              </div>
            </div>
          </header>

          <div className="grid flex-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <CodeEditorPanel
              language={editorLanguage}
              selectedLanguage={language}
              code={code}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
              onAnalyze={sendToBackend}
              loading={loading}
            />

            <ResponsePanel
              loading={loading}
              error={error}
              review={review}
              fileName={fileName}
              language={language}
            />
          </div>
        </section>
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
