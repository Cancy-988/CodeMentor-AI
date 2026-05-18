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

const responseSeed = {
  review: 'Submit code to get a structured review from the AI mentor.',
  fix: 'Use Fix Code to get a cleaner, improved version of your snippet.'
}

export default function App() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(starterCodeByLanguage.javascript)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(responseSeed.review)
  const [mode, setMode] = useState('review')
  const [fileName, setFileName] = useState('starter.js')

  const editorLanguage = useMemo(() => {
    if (language === 'jsx') {
      return 'javascript'
    }

    return language
  }, [language])

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage)
    setCode(starterCodeByLanguage[nextLanguage] || '')
    setFileName(defaultFileName(nextLanguage))
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const uploadedText = await file.text()
    setCode(uploadedText)
    setFileName(file.name)
  }

  const sendToBackend = async (actionLabel, promptPrefix) => {
    const trimmedCode = code.trim()
    if (!trimmedCode) {
      setResponse('Add code to the editor before sending a review request.')
      return
    }

    setMode(actionLabel)
    setLoading(true)
    setResponse('Analyzing your code...')

    try {
      const responsePayload = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${promptPrefix}\n\nLanguage: ${language}\nFile: ${fileName}\n\nCode:\n${trimmedCode}`
        })
      })

      const data = await responsePayload.json()
      setResponse(data.reply || 'No response returned from the server.')
    } catch (error) {
      setResponse('Could not reach the backend. Make sure FastAPI is running.')
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
                  A modern dark SaaS workspace for code review, refactoring, and beginner-friendly explanations.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => sendToBackend('review', 'Review this code and explain the issues clearly.')}
                  disabled={loading}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Review Code
                </button>
                <button
                  type="button"
                  onClick={() => sendToBackend('fix', 'Fix this code and return an improved version.')}
                  disabled={loading}
                  className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Fix Code
                </button>
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
              onReview={() => sendToBackend('review', 'Review this code and explain the issues clearly.')}
              onFix={() => sendToBackend('fix', 'Fix this code and return an improved version.')}
            />

            <ResponsePanel
              response={response}
              loading={loading}
              mode={mode}
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
    python: 'starter.py',
    typescript: 'starter.ts',
    jsx: 'starter.jsx',
    java: 'Main.java'
  }

  return mapping[selectedLanguage] || 'starter.txt'
}
