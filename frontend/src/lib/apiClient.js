import { supabase } from './supabaseClient'

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

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

export async function syncBackendProfile() {
  const response = await authFetch('/api/auth/me')

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.detail || 'Failed to synchronize the backend profile.')
  }

  return response.json()
}