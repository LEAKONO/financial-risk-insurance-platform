// frontend/src/services/auth.service.js
import { authService } from './api'

export const login = async (email, password) => {
  return await authService.login({ email, password })
}

export const register = async (userData) => {
  return await authService.register(userData)
}

export const logout = async () => {
  return await authService.logout()
}

export const forgotPassword = async (email) => {
  return await authService.forgotPassword(email)
}

export const resetPassword = async (token, password) => {
  return await authService.resetPassword(token, password)
}

export const verifyEmail = async (token) => {
  return await authService.verifyEmail(token)
}