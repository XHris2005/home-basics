import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

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

  async function register({ fullName, email, password, phone, memberCode }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) return { error }

    // Wait for trigger to create profile row
    await new Promise(resolve => setTimeout(resolve, 1000))

    const updates = { phone }

    if (memberCode) {
      const codeRegex = /^NG\d{8}$/
      if (codeRegex.test(memberCode)) {
        const { data: codeData } = await supabase
          .from('membership_codes')
          .select('*')
          .eq('code', memberCode)
          .eq('is_active', true)
          .single()

        if (codeData) {
          const now = new Date()
          const expiresAt = new Date(codeData.expires_at)

          if (now <= expiresAt) {
            updates.role = 'member'
            updates.member_code = memberCode
            updates.member_status = 'approved'

            await supabase.from('admin_notifications').insert({
              type: 'new_member',
              message: `New member registered: ${fullName} (${email}) using code ${memberCode}.`,
              is_read: false,
            })
          } else {
            await supabase.from('admin_notifications').insert({
              type: 'code_expired',
              message: `User ${fullName} (${email}) tried expired code ${memberCode} during registration.`,
              is_read: false,
            })
          }
        } else {
          await supabase.from('admin_notifications').insert({
            type: 'code_not_found',
            message: `User ${fullName} (${email}) tried unrecognised code ${memberCode} during registration.`,
            is_read: false,
          })
        }
      }
    }

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', data.user.id)

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
      redirectTo: `${window.location.origin}/auth/callback`,
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
      googleLogin,
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