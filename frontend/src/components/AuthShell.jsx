import { Link } from 'react-router-dom'

const defaultHighlights = [
  {
    eyebrow: 'Smart review workflows',
    title: 'One workspace for review, fixes, and learning',
    description: 'Move from code upload to bug analysis and improved fixes without bouncing between tools.'
  },
  {
    eyebrow: 'Secure sign-in',
    title: 'Google OAuth with persistent sessions',
    description: 'Come back to the same dashboard, saved context, and analysis history on any device.'
  },
  {
    eyebrow: 'Built for developers',
    title: 'Clear reports instead of noisy AI output',
    description: 'Read bug findings, complexity insights, and explanations in a format that is easy to act on.'
  }
]

export function AuthShell({
  eyebrow,
  title,
  description,
  cardEyebrow,
  cardTitle,
  cardDescription,
  alternateLabel,
  alternateHref,
  alternateAction,
  submittingLabel,
  idleLabel,
  loading = false,
  submitting = false,
  error = '',
  warning = '',
  onSubmit,
  highlights = defaultHighlights,
}) {
  return (
    <main className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-orange-500/18 blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-80 w-80 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">
            {eyebrow}
          </div>

          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
              {description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/75 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-orange-400">{item.eyebrow}</p>
                <h2 className="mt-3 text-base font-semibold text-[var(--color-text-primary)]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lg:pl-8">
          <div className="rounded-[32px] border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/88 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:p-6">
            <div className="rounded-[28px] border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]/92 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">{cardEyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">{cardTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{cardDescription}</p>

              {warning ? (
                <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-700 dark:text-amber-100">
                  {warning}
                </div>
              ) : null}

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-700 dark:text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={onSubmit}
                disabled={loading || submitting}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-4 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:from-orange-400 hover:to-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                {submitting ? submittingLabel : idleLabel}
              </button>

              <div className="mt-5 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-bg-primary)]/70 px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                Your account is created through Google and connected to your CodeMentor AI workspace automatically.
              </div>

              <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
                {alternateLabel}{' '}
                <Link to={alternateHref} className="font-semibold text-orange-500 transition hover:text-orange-400">
                  {alternateAction}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
