import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { syncBackendProfile } from '../lib/apiClient'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!active) {
        return
      }

      if (error) {
        console.error('Failed to load Supabase session', error)
      }

      setSession(data.session ?? null)
      setLoading(false)

      if (data.session) {
        syncBackendProfile().catch((syncError) => {
          console.warn('Unable to sync backend profile', syncError)
        })
      }
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setLoading(false)

      if (nextSession) {
        syncBackendProfile().catch((syncError) => {
          console.warn('Unable to sync backend profile', syncError)
        })
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const user = session?.user ?? null

  const signInWithGoogle = async (nextPath = '/dashboard') => {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
    const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(session),
      signInWithGoogle,
      signOut
    }),
    [loading, session, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}