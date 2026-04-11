import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, USER_ROLES } from '../lib/supabase'

import { RESPONSIBILITIES, PAGE_RESPONSIBILITY_MAP } from '../utils/constants'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const hasPageAccess = (pageName, profileResponsibilities = [], pinRole = null) => {
  if (!pageName) return true
  const requiredResp = PAGE_RESPONSIBILITY_MAP[pageName]
  if (!requiredResp) return true // Super admin pages or unknown

  // Super admin has all access
  if (profileResponsibilities?.some(r => r === 'super-admin' || r === 'admin')) return true

  // PIN role access
  if (pinRole && pinRole === requiredResp) return true

  // Profile responsibilities
  return profileResponsibilities?.includes(requiredResp)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [pinRole, setPinRole] = useState(null)
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
        .from('profiles')
        .select('*, responsibilities')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Load PIN role from storage
  const loadPinRole = () => {
    const storedPinRole = localStorage.getItem('pinRole') || sessionStorage.getItem('pinRole')
    if (storedPinRole) {
      setPinRole(storedPinRole)
    }
  }

  // Clear PIN session
  const clearPinRole = () => {
    localStorage.removeItem('pinRole')
    sessionStorage.removeItem('pinRole')
    setPinRole(null)
  }


  const signUp = async (email, password, options = {}, role = USER_ROLES.CUSTOMER) => {
    try {
      // Handle both old format (name, phone, role) and new format (options, role)
      const name = options.name || options
      const phone = options.phone
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Profile will be created automatically by the trigger, but we set local state
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

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error signing in with Google:', error)
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
    pinRole,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAdmin,
    isDelivery,
    isCustomer: profile?.role === USER_ROLES.CUSTOMER,
    clearPinRole,
    responsibilities: profile?.responsibilities || [],
    hasPageAccess: (pageName) => hasPageAccess(pageName, profile?.responsibilities, pinRole)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
