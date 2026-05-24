import { supabase } from './supabaseClient'

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '')

function buildApiUrl(input) {
  if (typeof input !== 'string') {
    return input
  }

  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input
  }

  if (!backendBaseUrl) {
    return input
  }

  return `${backendBaseUrl}${input.startsWith('/') ? '' : '/'}${input}`
}

export async function readJsonResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session?.access_token ?? null
}

export async function authFetch(input, init = {}) {
  const accessToken = await getAccessToken()
  const headers = new Headers(init.headers || {})
  const apiUrl = buildApiUrl(input)

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return fetch(apiUrl, {
    ...init,
    headers,
  })
}

export async function syncBackendProfile() {
  const response = await authFetch('/api/auth/me')

  if (!response.ok) {
    const data = await readJsonResponse(response)
    throw new Error(data?.detail || 'Failed to synchronize the backend profile.')
  }

  return readJsonResponse(response)
}