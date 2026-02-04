// frontend/src/config/apiEndpoints.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: (token) => `${API_BASE_URL}/auth/reset-password/${token}`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    VERIFY_EMAIL: (token) => `${API_BASE_URL}/auth/verify-email/${token}`,
  },
  
  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/me`,
    DASHBOARD: `${API_BASE_URL}/users/dashboard`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
    ACTIVITY: `${API_BASE_URL}/users/activity`,
    UPLOAD_AVATAR: `${API_BASE_URL}/users/upload-profile-picture`,
    DELETE_ACCOUNT: `${API_BASE_URL}/users/account`,
  },
  
  // Risk
  RISK: {
    PROFILE: `${API_BASE_URL}/risk/profiles/me`,
    CREATE_PROFILE: `${API_BASE_URL}/risk/profiles`,
    ANALYSIS: `${API_BASE_URL}/risk/profiles/analysis`,
    COMPARE: `${API_BASE_URL}/risk/profiles/compare`,
    CALCULATE_PREMIUM: `${API_BASE_URL}/risk/calculate-premium`,
    FACTORS: `${API_BASE_URL}/risk/factors`,
    SIMULATE_PREMIUM: `${API_BASE_URL}/risk/simulate-premium`,
  },
  
  // Policies
  POLICIES: {
    LIST: `${API_BASE_URL}/policies`,
    CREATE: `${API_BASE_URL}/policies`,
    GET: (id) => `${API_BASE_URL}/policies/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/policies/${id}`,
    CANCEL: (id) => `${API_BASE_URL}/policies/${id}/cancel`,
    RENEW: (id) => `${API_BASE_URL}/policies/${id}/renew`,
    DOCUMENTS: (id) => `${API_BASE_URL}/policies/${id}/documents`,
    PAYMENTS: (id) => `${API_BASE_URL}/policies/${id}/payments`,
    ADMIN_LIST: `${API_BASE_URL}/policies/admin/all`,
    ADMIN_UPDATE_STATUS: (id) => `${API_BASE_URL}/policies/admin/${id}/status`,
  },
  
  // Claims
  CLAIMS: {
    LIST: `${API_BASE_URL}/claims`,
    CREATE: `${API_BASE_URL}/claims`,
    GET: (id) => `${API_BASE_URL}/claims/${id}`,
    UPLOAD_DOCUMENT: (id) => `${API_BASE_URL}/claims/${id}/documents`,
    DELETE_DOCUMENT: (id, docId) => `${API_BASE_URL}/claims/${id}/documents/${docId}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/claims/${id}/status`,
    ASSIGN: (id) => `${API_BASE_URL}/claims/${id}/assign`,
    FRAUD_ANALYSIS: (id) => `${API_BASE_URL}/claims/${id}/fraud-analysis`,
    STATISTICS: `${API_BASE_URL}/claims/admin/statistics`,
    ADMIN_LIST: `${API_BASE_URL}/claims/admin/all`,
  },
  
  // Insurance
  INSURANCE: {
    QUOTE: `${API_BASE_URL}/insurance/quote`,
    SAVE_QUOTE: `${API_BASE_URL}/insurance/quote/save`,
    APPLY: `${API_BASE_URL}/insurance/apply`,
    APPLICATIONS: `${API_BASE_URL}/insurance/applications`,
    APPLICATION_STATUS: (id) => `${API_BASE_URL}/insurance/applications/${id}`,
    PROCESS_PAYMENT: `${API_BASE_URL}/insurance/payments/process`,
    PAYMENT_HISTORY: `${API_BASE_URL}/insurance/payments/history`,
    SETUP_PAYMENT_METHOD: `${API_BASE_URL}/insurance/payments/methods`,
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    USERS: `${API_BASE_URL}/admin/users`,
    USER_DETAILS: (id) => `${API_BASE_URL}/admin/users/${id}`,
    UPDATE_USER_ROLE: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
    TOGGLE_USER_STATUS: (id) => `${API_BASE_URL}/admin/users/${id}/status`,
    POLICIES: `${API_BASE_URL}/admin/policies`,
    ACTIVITY: `${API_BASE_URL}/admin/activity`,
    FINANCIAL_REPORT: `${API_BASE_URL}/admin/reports/financial`,
    RISK_PROFILES: `${API_BASE_URL}/admin/reports/risk-profiles`,
    GENERATE_REPORT: `${API_BASE_URL}/admin/reports/generate`,
  },

  // Activities
  ACTIVITIES: {
    LIST: `${API_BASE_URL}/activities`,
    GET: (id) => `${API_BASE_URL}/activities/${id}`,
    USER_ACTIVITIES: (userId) => `${API_BASE_URL}/users/${userId}/activities`,
    RECENT: (limit) => `${API_BASE_URL}/activities/recent?limit=${limit}`,
    CREATE: `${API_BASE_URL}/activities`,
    DELETE: (id) => `${API_BASE_URL}/activities/${id}`,
  },
}