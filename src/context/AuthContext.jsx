import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error) setProfile(data)
    setLoading(false)
  }

  async function register({ fullName, email, password, phone, role, memberCode }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) return { error }

    // Update profile with extra fields
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        phone,
        role: role === 'member' ? 'retail' : 'retail', // always starts as retail
        member_code: role === 'member' ? memberCode : null,
        member_status: role === 'member' ? 'pending' : 'none'
      })
      .eq('id', data.user.id)

    if (profileError) return { error: profileError }

    // If registering as member, create an application
    if (role === 'member' && memberCode) {
      await supabase.from('member_applications').insert({
        user_id: data.user.id,
        member_code: memberCode,
        status: 'pending'
      })
    }

    return { data }
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) return { error }
    return { data }
  }

  async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  })
  if (error) throw error
}

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) return { error }
    setUser(null)
    setProfile(null)
  }

  async function forgotPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { error }
  }

  const isAdmin = profile?.role === 'admin'
  const isMember = profile?.role === 'member' && profile?.member_status === 'approved'
  const isPendingMember = profile?.member_status === 'pending'

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isMember,
      isPendingMember,
      register,
      signInWithGoogle,
      login,
      logout,
      forgotPassword,
      fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}