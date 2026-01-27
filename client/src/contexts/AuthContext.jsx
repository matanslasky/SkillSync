import { createContext, useState, useContext, useEffect } from 'react'
import * as authService from '../services/authService'
import socketService from '../services/socketService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
          
          // Connect socket when user logs in
          socketService.connect(firebaseUser.uid)
          
          // Set online status
          socketService.setOnlineStatus('online')
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
        // Set offline status before disconnect
        socketService.setOnlineStatus('offline')
        // Disconnect socket when user logs out
        socketService.disconnect()
      }
      setLoading(false)
    })

    // Handle browser close/refresh - set offline status
    const handleBeforeUnload = () => {
      socketService.setOnlineStatus('offline')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const data = await authService.register(userData)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export { AuthContext }
