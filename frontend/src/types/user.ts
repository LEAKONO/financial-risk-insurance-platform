// frontend/src/types/user.ts
export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'underwriter' | 'customer'
  isEmailVerified: boolean
  phone?: string
  dateOfBirth?: Date
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  riskProfile?: RiskProfile
  policies?: Policy[]
  activity?: ActivityLog[]
}

export interface AuthUser extends User {
  tokens?: AuthTokens
}

export interface UserRegistration {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phone: string
}

export interface UserUpdate {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}

export interface PasswordChange {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}