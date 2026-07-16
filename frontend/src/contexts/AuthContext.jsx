import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { restoreSession } from '../api/profile.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()

  // Global 401 handler — fires when any API call gets unauthorized
  // Covers blocked users mid-session without needing a page reload
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setProfile(null)
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [navigate])

  // On every page load/refresh: check if the cookie is still valid
  // If yes → restore user state. If no → stays null → redirects to /login
  useEffect(() => {
    async function restore() {
      try {
        const data = await restoreSession()
        if (data) {
          setUser({ id: data.id, name: data.name, email: data.email, role: data.role })
          setProfile(data.profile)
        }
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  async function login(credentials) {
    await api.post('/auth/login', credentials)
    // Login only sets the cookie — fetch profile to get user data
    const data = await api.get('/profile')
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role })
    setProfile(data.profile)
    return data.profile
  }

  async function register(userData) {
    await api.post('/auth/register', userData)
    // Auto-login after register so the user lands on onboarding already authenticated
    return login({ email: userData.email, password: userData.password })
  }

  async function logout() {
    await api.post('/auth/logout')
    setUser(null)
    setProfile(null)
  }

  // Called after onboarding or profile update to keep state in sync
  function updateProfile(updates) {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  function updateUser(updates) {
    setUser(prev => ({ ...prev, ...updates }))
  }

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used outside <AuthProvider>')
  }
  return context
}