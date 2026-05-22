function getBackendBaseUrl() {
  const envValue = process.env.CODEMENTOR_AI_BACKEND_URL
  if (envValue && envValue.trim()) {
    return envValue.trim().replace(/\/$/, '')
  }

  return 'http://127.0.0.1:8000'
}

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || getBackendBaseUrl()).trim().replace(/\/$/, '')
}

async function reviewCode({ code, language, baseUrl }) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  const response = await fetch(`${normalizedBaseUrl}/review-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code, language })
  })

  const payload = await safeReadJson(response)

  if (!response.ok) {
    const detail = payload && typeof payload === 'object' ? payload.detail : ''
    throw new Error(detail || `Request failed with status ${response.status}`)
  }

  return payload
}

async function safeReadJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function languageFromLanguageId(languageId) {
  const mapping = {
    javascript: 'javascript',
    javascriptreact: 'jsx',
    typescript: 'typescript',
    typescriptreact: 'jsx',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'cpp',
    csharp: 'cpp',
    html: 'jsx',
    css: 'javascript'
  }

  return mapping[languageId] || 'javascript'
}

module.exports = {
  getBackendBaseUrl,
  languageFromLanguageId,
  reviewCode
}
