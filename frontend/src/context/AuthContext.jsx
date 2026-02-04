// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { authService, userService } from '../services/api'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.log('⚠️ No token found, user not authenticated')
        setLoading(false)
        return
      }

      console.log('🔄 Loading user profile...')
      const response = await userService.getProfile()
      
      console.log('📥 Profile response:', response)
      
      // Handle different response structures
      let userData = null
      
      if (response.data) {
        // Check if response.data is the user object directly
        if (response.data._id || response.data.email) {
          userData = response.data
        }
        // Or if it's wrapped in a data property
        else if (response.data.data && (response.data.data._id || response.data.data.email)) {
          userData = response.data.data
        }
        // Or if it's in a user property
        else if (response.data.user) {
          userData = response.data.user
        }
      }
      
      if (userData) {
        console.log('✅ User profile loaded:', userData)
        console.log('🎭 User role:', userData?.role)
        setUser(userData)
      } else {
        console.log('❌ Failed to load user profile')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
      }
    } catch (err) {
      console.error('❌ Failed to load user:', err)
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
      console.log('🔐 Attempting login for:', email)
      
      const response = await authService.login({ email, password })
      
      console.log('📥 Full Login response:', response)
      console.log('📥 Response.data:', response.data)
      console.log('📥 Response keys:', Object.keys(response))
      if (response.data) {
        console.log('📥 Response.data keys:', Object.keys(response.data))
      }
      
      // Handle different response structures from backend
      let userData = null
      let tokens = null
      
      // Check the actual response structure from your backend
      if (response.data?.success && response.data?.data) {
        console.log('✅ Detected response structure: success/data pattern')
        
        const innerData = response.data.data
        console.log('📦 Inner data structure:', innerData)
        
        // Your backend returns: { user: {...}, tokens: {...} } inside data
        if (innerData.user && innerData.tokens) {
          userData = innerData.user
          tokens = innerData.tokens
          console.log('✅ User found in response.data.data.user')
          console.log('✅ Tokens found in response.data.data.tokens')
        }
      } 
      // Alternative structures for backward compatibility
      else if (response.data?.user && response.data?.tokens) {
        userData = response.data.user
        tokens = response.data.tokens
      }
      else if (response.data?.user && response.data?.token) {
        userData = response.data.user
        tokens = {
          accessToken: response.data.token,
          refreshToken: response.data.refreshToken
        }
      }
      else if (response?.user && response?.tokens) {
        userData = response.user
        tokens = response.tokens
      }
      else if (response?.user && response?.token) {
        userData = response.user
        tokens = {
          accessToken: response.token,
          refreshToken: response.refreshToken
        }
      }
      
      console.log('👤 Extracted User data:', userData)
      console.log('🎭 User role:', userData?.role)
      console.log('🔑 Extracted Tokens:', tokens)
      
      if (userData && tokens?.accessToken) {
        console.log('✅ Login successful!')
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken)
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken)
        }
        
        // Set user state
        setUser(userData)
        
        return { success: true, user: userData }
      } else {
        console.log('❌ Could not extract user or tokens from response')
        console.log('❌ Response structure:', response.data)
        console.log('❌ Please check your backend response structure')
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      console.error('❌ Error response:', err.response)
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      console.log('📝 Attempting registration...')
      
      const response = await authService.register(userData)
      
      console.log('📥 Registration response:', response)
      
      // Handle the same structure as login
      let newUser = null
      let tokens = null
      
      if (response.data?.success && response.data?.data) {
        const innerData = response.data.data
        if (innerData.user && innerData.tokens) {
          newUser = innerData.user
          tokens = innerData.tokens
        }
      }
      else if (response.data?.user && response.data?.tokens) {
        newUser = response.data.user
        tokens = response.data.tokens
      }
      else if (response.data?.user && response.data?.token) {
        newUser = response.data.user
        tokens = {
          accessToken: response.data.token,
          refreshToken: response.data.refreshToken
        }
      }
      
      if (newUser && tokens?.accessToken) {
        console.log('✅ Registration successful!')
        console.log('👤 New user:', newUser)
        
        localStorage.setItem('accessToken', tokens.accessToken)
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken)
        }
        
        setUser(newUser)
        return { success: true, user: newUser }
      } else {
        console.log('❌ Registration failed')
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (err) {
      console.error('❌ Registration error:', err)
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
      await authService.logout()
    } catch (err) {
      console.error('❌ Logout error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      console.log('✅ Logged out successfully')
    }
  }

  const updateProfile = async (data) => {
    try {
      console.log('🔄 Updating profile...')
      const response = await userService.updateProfile(data)
      
      // Handle different response structures
      let updatedUser = null
      
      if (response.data) {
        // Direct user object
        if (response.data._id || response.data.email) {
          updatedUser = response.data
        }
        // Wrapped in data property
        else if (response.data.data && (response.data.data._id || response.data.data.email)) {
          updatedUser = response.data.data
        }
        // In user property
        else if (response.data.user) {
          updatedUser = response.data.user
        }
        // Root level
        else if (response.user) {
          updatedUser = response.user
        }
      }
      
      if (updatedUser) {
        console.log('✅ Profile updated:', updatedUser)
        setUser(updatedUser)
        return { success: true, user: updatedUser }
      } else {
        console.log('❌ Profile update failed')
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (err) {
      console.error('❌ Profile update error:', err)
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

  useEffect(() => {
    if (user || loading === false) {
      console.log('🔄 Auth State Changed:')
      console.log('  - User:', user)
      console.log('  - Is Authenticated:', !!user)
      console.log('  - Is Admin:', user?.role === 'admin')
      console.log('  - Loading:', loading)
    }
  }, [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}