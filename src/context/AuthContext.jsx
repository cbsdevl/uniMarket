import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, USER_ROLES } from '../lib/supabase'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email, password, name, phone, role = USER_ROLES.CUSTOMER) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      })

      if (error) throw error

      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          name,
          phone,
          role
        })
        setUser(data.user)
        setProfile({ id: data.user.id, email, name, phone, role })
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)
        await fetchProfile(data.user.id)
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error signing in:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { success: false, error: error.message }
    }
  }

  const isAdmin = profile?.role === USER_ROLES.ADMIN
  const isDelivery = profile?.role === USER_ROLES.DELIVERY

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isDelivery,
    isCustomer: profile?.role === USER_ROLES.CUSTOMER
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
