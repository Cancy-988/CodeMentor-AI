import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/Layout'

const features = [
  {
    icon: '🔍',
    title: 'Multi-Agent Analysis',
    description: 'Our AI agents analyze bugs, complexity, security issues, and suggest fixes all at once.'
  },
  {
    icon: '💡',
    title: 'Smart Code Explanations',
    description: 'Get detailed explanations of what your code does and how to improve it.'
  },
  {
    icon: '🚀',
    title: 'Automatic Fixes',
    description: 'Receive AI-generated code fixes with explanations for better understanding.'
  },
  {
    icon: '✅',
    title: 'Code Validation',
    description: 'Validate your code against best practices and security standards.'
  },
  {
    icon: '📊',
    title: 'Complexity Analysis',
    description: 'Understand code complexity and get recommendations for optimization.'
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Google OAuth authentication with encrypted data and persistent chat history.'
  }
]

const howItWorks = [
  {
    step: 1,
    title: 'Upload Your Code',
    description: 'Paste your code or upload files to the CodeMentor AI platform. Supports Python, JavaScript, Java, and more.'
  },
  {
    step: 2,
    title: 'Multi-Agent Analysis',
    description: 'Our AI agents analyze your code for bugs, complexity issues, security vulnerabilities, and generate fixes.'
  },
  {
    step: 3,
    title: 'Review Results',
    description: 'Get comprehensive reports with bug detection, complexity analysis, and suggested improvements.'
  },
  {
    step: 4,
    title: 'Save & Learn',
    description: 'Save your analysis, track improvements, and learn from AI-generated explanations.'
  }
]

const faqs = [
  {
    question: 'What programming languages does CodeMentor AI support?',
    answer: 'CodeMentor AI supports multiple programming languages including Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, and more. We continuously add support for new languages based on user feedback.'
  },
  {
    question: 'Is my code private and secure?',
    answer: 'Yes! Your code is private and secure. We use Google OAuth for authentication, and all data is encrypted. Your code analysis history is saved in your personal workspace and is never shared with other users.'
  },
  {
    question: 'How does the multi-agent AI work?',
    answer: 'Our system uses multiple specialized AI agents: Bug Detection Agent finds logical errors, Complexity Analysis Agent identifies performance issues, Security Validation Agent checks for vulnerabilities, and Explanation Agent provides human-readable insights.'
  },
  {
    question: 'Can I integrate CodeMentor AI with my IDE?',
    answer: 'Yes! We provide a VS Code extension that lets you analyze code directly from your editor without leaving your development environment.'
  },
  {
    question: 'Do you offer team collaboration features?',
    answer: 'Team features are coming soon! Currently, each user gets their own workspace. Upcoming updates will include team projects, shared reviews, and collaborative analysis.'
  },
  {
    question: 'What happens to my analysis history?',
    answer: 'All your analyses are saved in your dashboard. You can view, export, and reference past reviews anytime. Your complete history is stored securely and can be accessed from any device.'
  }
]

function FAQ() {
  const [openId, setOpenId] = useState(null)

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-[var(--color-text-secondary)] text-lg">Everything you need to know about CodeMentor AI</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-[var(--color-border-light)] rounded-lg overflow-hidden transition"
            >
              <button
                onClick={() => setOpenId(openId === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition"
              >
                <h3 className="font-semibold text-left text-[var(--color-text-primary)]">{faq.question}</h3>
                <span className="ml-4 flex-shrink-0 text-orange-500 font-bold">
                  {openId === idx ? '−' : '+'}
                </span>
              </button>
              {openId === idx && (
                <div className="px-6 py-4 bg-[var(--color-bg-primary)] border-t border-[var(--color-border-light)]">
                  <p className="text-[var(--color-text-secondary)]">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <span className="text-sm font-semibold text-orange-400">AI-Powered Code Reviews</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Intelligent Code Review with <span className="text-orange-500">Multi-Agent AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-8">
              Get instant feedback on your code. Our AI agents detect bugs, analyze complexity, suggest fixes, and explain everything. All powered by advanced multi-agent AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600 px-8 py-4 text-lg font-semibold text-white transition transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] px-8 py-4 text-lg font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] p-8 backdrop-blur">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-light)]">
                <div className="text-orange-500 font-semibold mb-2">🐛 Bug Detection</div>
                <p className="text-sm text-[var(--color-text-secondary)]">Find logical errors and potential runtime issues</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-light)]">
                <div className="text-orange-500 font-semibold mb-2">⚡ Performance Analysis</div>
                <p className="text-sm text-[var(--color-text-secondary)]">Identify complexity and optimization opportunities</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-light)]">
                <div className="text-orange-500 font-semibold mb-2">✅ Smart Fixes</div>
                <p className="text-sm text-[var(--color-text-secondary)]">Get AI-suggested fixes with explanations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-[var(--color-text-secondary)] text-lg">Everything you need for professional code review</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)] hover:border-orange-500/50 hover:bg-[var(--color-bg-secondary)] transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[var(--color-text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-[var(--color-text-secondary)] text-lg">Simple, fast, and effective code analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-xl font-bold text-orange-500">{item.step}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-[var(--color-text-secondary)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg-secondary)]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to improve your code?</h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">Start using CodeMentor AI today. It's free to get started!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600 px-8 py-4 text-lg font-semibold text-white transition transform hover:scale-105"
            >
              Sign Up Now
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-primary)] px-8 py-4 text-lg font-semibold transition"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
