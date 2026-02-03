// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { authService, userService } from '../services/api'  // Import from api.js

export const AuthContext = createContext({})

// Remove the useAuth export from here if you have it in hooks/useAuth.js
// export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await userService.getProfile()  // Use userService from api.js
      if (response.success) {
        setUser(response.data.user)
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to load user:', err)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authService.login({ email, password })  // Use authService from api.js
      
      if (response.success) {
        const { user, tokens } = response.data
        
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        
        setUser(user)
        return { success: true, user }
      } else {
        return { success: false, error: response.message }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await authService.register(userData)  // Use authService from api.js
      
      if (response.success) {
        const { user, tokens } = response.data
        
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        
        setUser(user)
        return { success: true, user }
      } else {
        return { success: false, error: response.message }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()  // Use authService from api.js
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await userService.updateProfile(data)  // Use userService from api.js
      if (response.success) {
        setUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        return { success: false, error: response.message }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed'
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUnderwriter: user?.role === 'underwriter',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}