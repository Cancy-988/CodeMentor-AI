const vscode = acquireVsCodeApi()
const initialState = __STATE_JSON__

const app = document.getElementById('app')
let state = initialState || {}
let activeTab = state.activeTab || 'overview'

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function statusText(value, kind = '') {
  return `<span class="status ${kind}">${escapeHtml(value)}</span>`
}

function wrapMatches(code, regex, className) {
  return code.replace(regex, (match) => `<span class="${className}">${match}</span>`)
}

function highlightCode(code, language) {
  let html = escapeHtml(code)

  html = html.replace(/(^|\n)(\s*\/\/.*|\s*#.*)/g, (match, prefix, body) => {
    return `${prefix}<span class="tok-comment">${body}</span>`
  })

  html = wrapMatches(html, /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, 'tok-string')
  html = wrapMatches(html, /\b\d+(?:\.\d+)?\b/g, 'tok-number')

  const keywords = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'class', 'new', 'try', 'catch', 'throw', 'async', 'await', 'import', 'from', 'export'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'class', 'new', 'try', 'catch', 'throw', 'async', 'await', 'import', 'from', 'export', 'type', 'interface', 'extends', 'implements'],
    python: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'class', 'try', 'except', 'raise', 'with', 'as', 'lambda', 'True', 'False', 'None'],
    java: ['public', 'private', 'protected', 'class', 'static', 'void', 'int', 'double', 'String', 'new', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'import'],
    cpp: ['int', 'void', 'class', 'public', 'private', 'protected', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'include', 'namespace', 'std'],
    jsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'new', 'try', 'catch', 'throw', 'async', 'await', 'import', 'from', 'export', 'default', 'true', 'false', 'null', 'undefined']
  }

  const keywordList = keywords[language] || keywords.javascript
  const keywordPattern = new RegExp(`\\b(${keywordList.join('|')})\\b`, 'g')
  html = wrapMatches(html, keywordPattern, 'tok-keyword')
  html = html.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\s*(?=\()/g, '<span class="tok-fn">$1</span>')

  return html
}

function sourceCard() {
  const sourceTitle = state.sourceLabel || 'Source'
  const sourceLanguage = state.language || 'javascript'
  const sourceCode = state.sourceCode || ''

  return `
    <div class="card soft">
      <div class="card-head">
        <div>
          <p class="card-title">${escapeHtml(sourceTitle)}</p>
          <p class="card-note">${escapeHtml(state.fileName || 'untitled')} · ${escapeHtml(sourceLanguage)}</p>
        </div>
        ${statusText(sourceLanguage)}
      </div>
      <div class="code-shell" style="margin-top: 12px;">
        <div class="code-head">
          <p class="code-label">Source code</p>
        </div>
        <pre><code>${highlightCode(sourceCode, sourceLanguage)}</code></pre>
      </div>
    </div>
  `
}

function validationCard(validation) {
  if (!validation) {
    return `
      <div class="card">
        <p class="card-title">Validation</p>
        <p class="card-note">The validation result will appear here after the backend returns the review payload.</p>
      </div>
    `
  }

  const findings = Array.isArray(validation.findings) ? validation.findings : []

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <p class="card-title">Validation Agent</p>
          <p class="card-note">Confirms syntax safety, checks RAG grounding, and flags hallucination risk before you trust the output.</p>
        </div>
        ${statusText(validation.passed ? 'Passed' : 'Needs review', validation.passed ? 'good' : 'warn')}
      </div>
      <div class="grid three" style="margin-top: 12px;">
        <div class="card soft"><p class="card-title" style="font-size: 11px;">Syntax</p><p class="card-note" style="margin-top: 8px; font-weight: 700; color: var(--text);">${validation.syntax_ok ? 'OK' : 'Issue'}</p></div>
        <div class="card soft"><p class="card-title" style="font-size: 11px;">RAG</p><p class="card-note" style="margin-top: 8px; font-weight: 700; color: var(--text);">${validation.rag_aligned ? 'Aligned' : 'Weak match'}</p></div>
        <div class="card soft"><p class="card-title" style="font-size: 11px;">Hallucination</p><p class="card-note" style="margin-top: 8px; font-weight: 700; color: var(--text);">${escapeHtml(validation.hallucination_risk)}</p></div>
      </div>
      ${findings.length ? `
        <div class="grid" style="margin-top: 12px;">
          ${findings.map((finding) => `
            <div class="card soft">
              <div class="card-head">
                <p class="card-title">${escapeHtml(finding.category)}</p>
                ${statusText(finding.severity, 'warn')}
              </div>
              <p class="card-note">${escapeHtml(finding.message)}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `
}

function bugDetectionCard(result) {
  const issues = (result.bug_detection && result.bug_detection.issues) || []
  const summary = result.bug_detection && result.bug_detection.summary ? result.bug_detection.summary : 'No summary returned.'

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <p class="card-title">Bug Detection</p>
          <p class="card-note">${escapeHtml(summary)}</p>
        </div>
        ${statusText(`${issues.length} issue${issues.length === 1 ? '' : 's'}`, 'warn')}
      </div>
      <div class="grid" style="margin-top: 12px;">
        ${issues.length ? issues.map((issue) => `
          <div class="card soft">
            <div class="card-head">
              <p class="card-title">${escapeHtml(issue.title)}</p>
              ${statusText(issue.severity)}
            </div>
            <p class="card-note">${escapeHtml(issue.explanation)}</p>
            <p class="card-note" style="color: var(--accent-deep);"><strong>Fix:</strong> ${escapeHtml(issue.fix)}</p>
          </div>
        `).join('') : '<div class="empty">No obvious bugs were detected by the agent.</div>'}
      </div>
    </div>
  `
}

function fixSuggestionCard(result) {
  const fix = result.fix_suggestion || {}
  const alternatives = Array.isArray(fix.alternatives) ? fix.alternatives : []
  const improvedCode = fix.improved_code || ''

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <p class="card-title">Fix Suggestions</p>
          <p class="card-note">${escapeHtml(fix.recommended_fix || 'No recommendation returned.')}</p>
        </div>
        ${statusText(`${alternatives.length} option${alternatives.length === 1 ? '' : 's'}`)}
      </div>
      <div class="pill-row" style="margin-top: 12px;">
        ${alternatives.length ? alternatives.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join('') : '<span class="pill">No alternatives suggested</span>'}
      </div>
      ${improvedCode ? `
        <div class="code-shell" style="margin-top: 12px;">
          <div class="code-head">
            <p class="code-label">Improved code</p>
            <button class="button" data-copy-code="${encodeURIComponent(improvedCode)}">Copy code</button>
          </div>
          <pre><code>${highlightCode(improvedCode, state.language || 'javascript')}</code></pre>
        </div>
      ` : ''}
    </div>
  `
}

function complexityCard(result) {
  const complexity = result.complexity_analysis || {}

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <p class="card-title">Complexity Analysis</p>
          <p class="card-note">${escapeHtml(complexity.explanation || 'No complexity explanation returned.')}</p>
        </div>
      </div>
      <div class="grid two" style="margin-top: 12px;">
        <div class="card soft"><p class="card-title" style="font-size: 11px;">Time</p><p class="card-note" style="margin-top: 8px; font-weight: 700; color: var(--text);">${escapeHtml(complexity.time_complexity || '—')}</p></div>
        <div class="card soft"><p class="card-title" style="font-size: 11px;">Space</p><p class="card-note" style="margin-top: 8px; font-weight: 700; color: var(--text);">${escapeHtml(complexity.space_complexity || '—')}</p></div>
      </div>
    </div>
  `
}

function explanationCard(result) {
  const explanation = result.explanation || {}
  const takeaways = Array.isArray(explanation.key_takeaways) ? explanation.key_takeaways : []

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <p class="card-title">AI Explanation</p>
          <p class="card-note">${escapeHtml(explanation.simple_explanation || 'No explanation returned.')}</p>
        </div>
      </div>
      <div class="pill-row" style="margin-top: 12px;">
        ${takeaways.length ? takeaways.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join('') : '<span class="pill">No extra takeaways</span>'}
      </div>
    </div>
  `
}

function overviewContent(result) {
  const nextSteps = Array.isArray(result.next_steps) ? result.next_steps : []
  return `
    <div class="grid">
      <div class="card soft">
        <div class="card-head">
          <div>
            <p class="card-title">Final summary</p>
            <p class="card-note">${escapeHtml(result.final_summary || 'No summary returned.')}</p>
          </div>
          <div class="pill-row">
            ${nextSteps.map((step) => `<span class="pill tag">${escapeHtml(step)}</span>`).join('')}
          </div>
        </div>
      </div>
      ${validationCard(result.validation)}
      <div class="card">
        <div class="card-head">
          <div>
            <p class="card-title">CodeMentor AI</p>
            <p class="card-note">A lightweight extension version of your React UI, tuned for analysis and quick scanning.</p>
          </div>
          ${statusText('Ready', 'good')}
        </div>
      </div>
      ${sourceCard()}
    </div>
  `
}

function tabButton(label, value) {
  return `<button class="tab ${activeTab === value ? 'active' : ''}" data-tab="${value}">${escapeHtml(label)}</button>`
}

function renderTabs() {
  const tabs = state.result
    ? [
        ['overview', 'Overview'],
        ['bug_detection', 'Bug Detection'],
        ['fix_suggestion', 'Fix Suggestions'],
        ['complexity_analysis', 'Complexity'],
        ['validation', 'Validation'],
        ['explanation', 'Explanation']
      ]
    : []

  return `<div class="tab-bar">${tabs.length ? tabs.map((tab) => tabButton(tab[1], tab[0])).join('') : '<span class="tab active">Overview</span>'}</div>`
}

function renderBody() {
  if (state.loading) {
    return `
      <div class="loading">
        <div class="loader-row">
          <div class="spinner"></div>
          <div>
            <p class="card-title" style="margin: 0;">Running multi-agent analysis</p>
            <p class="card-note" style="margin-top: 4px;">Generating bug analysis, fixes, complexity, validation, and explanation.</p>
          </div>
        </div>
        <div class="bar"><span></span></div>
        <div class="grid">
          <div class="card skeleton" style="height: 74px;"></div>
          <div class="card skeleton" style="height: 74px;"></div>
          <div class="card skeleton" style="height: 74px;"></div>
        </div>
      </div>
    `
  }

  if (state.error) {
    return `<div class="error">${escapeHtml(state.error)}</div>`
  }

  if (!state.result) {
    return '<div class="empty">Use the buttons above to analyze selected code or the currently open file. The results will appear here in a clean, responsive dashboard.</div>'
  }

  switch (activeTab) {
    case 'bug_detection':
      return bugDetectionCard(state.result)
    case 'fix_suggestion':
      return fixSuggestionCard(state.result)
    case 'complexity_analysis':
      return complexityCard(state.result)
    case 'validation':
      return validationCard(state.result.validation)
    case 'explanation':
      return explanationCard(state.result)
    case 'overview':
    default:
      return overviewContent(state.result)
  }
}

function render() {
  app.innerHTML = `
    <div class="hero">
      <div class="topbar">
        <div>
          <p class="eyebrow">CodeMentor AI</p>
          <h1 class="title">Sidebar review workspace</h1>
          <p class="subtle">A lightweight extension version of the React UI, tuned for code review inside VS Code.</p>
        </div>
        <div class="actions">
          <span class="tag">${escapeHtml(state.language || 'javascript')}</span>
          <span class="tag">${escapeHtml(state.fileName || 'No file')}</span>
        </div>
      </div>
      <div class="section-actions" style="margin-top: 12px;">
        <button class="button primary" data-action="analyze-selected">Analyze Selected Code</button>
        <button class="button" data-action="analyze-current-file">Analyze Current File</button>
      </div>
      <div class="sidebar-note">${escapeHtml(state.sourceLabel || 'Idle')}</div>
    </div>

    <div class="panel">
      ${renderTabs()}
      <div class="panel-body">
        ${renderBody()}
      </div>
    </div>
  `
}

function setState(nextState) {
  state = nextState || {}
  if (!state.activeTab) {
    state.activeTab = activeTab
  }
  render()
}

app.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]')
  const tabButtonEl = event.target.closest('[data-tab]')
  const copyButton = event.target.closest('[data-copy-code]')

  if (actionButton) {
    vscode.postMessage({ type: actionButton.getAttribute('data-action') })
    return
  }

  if (tabButtonEl) {
    activeTab = tabButtonEl.getAttribute('data-tab')
    vscode.setState({ ...(vscode.getState() || {}), activeTab })
    state.activeTab = activeTab
    render()
    return
  }

  if (copyButton) {
    navigator.clipboard.writeText(decodeURIComponent(copyButton.getAttribute('data-copy-code') || ''))
  }
})

window.addEventListener('message', (event) => {
  const message = event.data || {}
  if (message.type === 'state') {
    activeTab = message.state && message.state.activeTab ? message.state.activeTab : activeTab
    vscode.setState(message.state)
    setState(message.state)
  }
})

setState(initialState)
