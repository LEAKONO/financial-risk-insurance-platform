// frontend/src/utils/constants.js
export const POLICY_TYPES = {
  LIFE: {
    label: 'Life Insurance',
    description: 'Coverage for life protection and financial security',
    icon: 'heart',
    color: 'from-red-500 to-pink-500',
  },
  HEALTH: {
    label: 'Health Insurance',
    description: 'Medical coverage and healthcare protection',
    icon: 'activity',
    color: 'from-green-500 to-emerald-500',
  },
  PROPERTY: {
    label: 'Property Insurance',
    description: 'Protection for homes and properties',
    icon: 'home',
    color: 'from-blue-500 to-cyan-500',
  },
  AUTO: {
    label: 'Auto Insurance',
    description: 'Vehicle coverage and accident protection',
    icon: 'car',
    color: 'from-purple-500 to-pink-500',
  },
  DISABILITY: {
    label: 'Disability Insurance',
    description: 'Income protection during disability',
    icon: 'wheelchair',
    color: 'from-orange-500 to-amber-500',
  },
  LIABILITY: {
    label: 'Liability Insurance',
    description: 'Protection against legal liabilities',
    icon: 'shield',
    color: 'from-indigo-500 to-blue-500',
  },
}

export const CLAIM_STATUS = {
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-800',
    icon: 'clock',
  },
  'UNDER-REVIEW': {
    label: 'Under Review',
    color: 'bg-purple-100 text-purple-800',
    icon: 'search',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: 'check-circle',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: 'x-circle',
  },
  PAID: {
    label: 'Paid',
    color: 'bg-emerald-100 text-emerald-800',
    icon: 'dollar-sign',
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-800',
    icon: 'archive',
  },
}

export const USER_ROLES = {
  ADMIN: {
    label: 'Administrator',
    color: 'bg-purple-100 text-purple-800',
    level: 3,
  },
  UNDERWRITER: {
    label: 'Underwriter',
    color: 'bg-blue-100 text-blue-800',
    level: 2,
  },
  CUSTOMER: {
    label: 'Customer',
    color: 'bg-green-100 text-green-800',
    level: 1,
  },
}

export const RISK_CATEGORIES = {
  LOW: {
    label: 'Low Risk',
    color: 'from-green-400 to-emerald-500',
    score: '0-25',
  },
  MODERATE: {
    label: 'Moderate Risk',
    color: 'from-yellow-400 to-amber-500',
    score: '26-50',
  },
  HIGH: {
    label: 'High Risk',
    color: 'from-orange-400 to-red-500',
    score: '51-75',
  },
  'VERY-HIGH': {
    label: 'Very High Risk',
    color: 'from-red-500 to-rose-600',
    score: '76-100',
  },
}

export const OCCUPATIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'manual', label: 'Manual Labor' },
  { value: 'hazardous', label: 'Hazardous Occupation' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'unemployed', label: 'Unemployed' },
]

export const EMPLOYMENT_STATUS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
]

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const WEEKDAYS = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
]

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 