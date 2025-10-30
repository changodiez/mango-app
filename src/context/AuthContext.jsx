import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const stableUser = useMemo(() => {
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
    }
  }, [user?.id, user?.email])

  useEffect(() => {
    let mounted = true
    let subscription

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (session?.user?.id !== user?.id) {
          setUser(session?.user ?? null)
        }
        setLoading(false)
      }
    )

    subscription = authSubscription

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (data) => {
    const { data: authData, error } = await supabase.auth.signUp(data)
    if (error) throw error
    return authData
  }

  const signIn = async (data) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword(data)
    if (error) throw error
    return authData
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = useMemo(() => ({
    user: stableUser,
    signUp,
    signIn,
    signOut,
  }), [stableUser])

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}