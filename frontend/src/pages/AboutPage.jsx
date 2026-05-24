import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/Layout'

export function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">About CodeMentor AI</h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Empowering developers with intelligent, multi-agent AI code review
            </p>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="rounded-xl overflow-hidden border border-[var(--color-border-light)]">
                <div className="h-64 bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex items-center justify-center">
                  <div className="text-8xl">👩‍💻</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Meet the Creator</h2>
              <h3 className="text-2xl text-orange-500 font-semibold mb-4">Cancy Khandelwal</h3>
              <p className="text-lg text-[var(--color-text-secondary)] mb-6">
                Full-stack developer, AI enthusiast, and creator of CodeMentor AI. With a passion for improving developer productivity through intelligent automation, Cancy built CodeMentor AI to bring advanced multi-agent AI capabilities to code review.
              </p>
              <p className="text-[var(--color-text-secondary)] mb-8">
                CodeMentor AI combines expertise in backend development, AI/ML, and frontend design to create a seamless experience for developers worldwide. The platform leverages cutting-edge AI agents to provide comprehensive code analysis, bug detection, and intelligent suggestions.
              </p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-orange-500 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-orange-500 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.81 0-9.728h3.554v1.375c.428-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.363v5.585zM5.337 9.433c-1.144 0-1.915-.758-1.915-1.706 0-.953.77-1.706 1.954-1.706s1.915.758 1.915 1.706c0 .948-.771 1.706-1.954 1.706zm1.575 10.019H3.762V9.724h3.15v9.728zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                  </svg>
                  LinkedIn
                </a>
               
              
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
              <h3 className="text-xl font-semibold mb-4 text-orange-500">🎯 Our Vision</h3>
              <p className="text-[var(--color-text-secondary)]">
                To empower every developer with intelligent, accessible AI-powered code review tools that improve code quality, reduce bugs, and accelerate development.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]">
              <h3 className="text-xl font-semibold mb-4 text-orange-500">💡 Our Values</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>✓ Intelligence & Quality</li>
                <li>✓ Developer Experience</li>
                <li>✓ Security & Privacy</li>
                <li>✓ Continuous Innovation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Built In Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">What We Built</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-3">Multi-Agent AI System</h3>
              <p className="text-[var(--color-text-secondary)]">
                Sophisticated AI agents that specialize in different aspects of code review: bug detection, complexity analysis, security validation, and intelligent explanations.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-3">Beautiful Frontend</h3>
              <p className="text-[var(--color-text-secondary)]">
                Modern, responsive UI built with React and Tailwind CSS. Supports both dark and light themes with smooth animations and intuitive navigation.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Powerful Backend</h3>
              <p className="text-[var(--color-text-secondary)]">
                FastAPI-based backend with real-time processing, secure authentication, and persistent storage for all your code reviews and analyses.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]">
              <div className="text-3xl mb-4">🔌</div>
              <h3 className="text-xl font-semibold mb-3">VS Code Extension</h3>
              <p className="text-[var(--color-text-secondary)]">
                Seamlessly analyze code without leaving your editor. Direct integration with the VS Code interface for maximum productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Technology Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Frontend</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>React 18+</li>
                <li>Tailwind CSS</li>
                <li>React Router</li>
                <li>Vite</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-500">Backend</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>FastAPI (Python)</li>
                <li>SQLAlchemy ORM</li>
                <li>Supabase (Auth & DB)</li>
                <li>Gemini API</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-500">DevOps</h3>
              <ul className="space-y-2 text-[var(--color-text-secondary)]">
                <li>Docker</li>
                <li>Render (Hosting)</li>
                <li>Supabase Storage</li>
                <li>ChromaDB (RAG)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to improve your code?</h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">
            Join thousands of developers using CodeMentor AI for better code quality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600 px-8 py-4 text-lg font-semibold text-white transition transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-primary)] px-8 py-4 text-lg font-semibold transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
