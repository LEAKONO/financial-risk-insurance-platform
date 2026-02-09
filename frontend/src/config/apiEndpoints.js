// frontend/src/config/apiEndpoints.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: (token) => `/auth/verify-email/${token}`,
  },
  
  // Users
  USERS: {
    PROFILE: '/users/me',
    DASHBOARD: '/users/dashboard',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    ACTIVITY: '/users/activity',
    UPLOAD_AVATAR: '/users/upload-profile-picture',
    DELETE_ACCOUNT: '/users/account',
  },
  
  // Risk Management
  RISK: {
    PROFILE: '/risk/profile',
    CREATE_PROFILE: '/risk/profile',
    ANALYSIS: '/risk/analysis',
    COMPARE: '/risk/compare',
    CALCULATE_PREMIUM: '/risk/calculate-premium',
    FACTORS: '/risk/factors',
    SIMULATE_PREMIUM: '/risk/simulate-premium',
  },
  
  // Policies
  POLICIES: {
    LIST: '/policies',
    CREATE: '/policies',
    GET: (id) => `/policies/${id}`,
    UPDATE: (id) => `/policies/${id}`,
    CANCEL: (id) => `/policies/${id}/cancel`,
    RENEW: (id) => `/policies/${id}/renew`,
    DOCUMENTS: (id) => `/policies/${id}/documents`,
    PAYMENTS: (id) => `/policies/${id}/payments`,
    ADMIN_LIST: '/admin/policies',
    ADMIN_UPDATE_STATUS: (id) => `/admin/policies/${id}/status`,
  },
  
  // Claims
  CLAIMS: {
    LIST: '/claims',
    CREATE: '/claims',
    GET: (id) => `/claims/${id}`,
    UPLOAD_DOCUMENT: (id) => `/claims/${id}/documents`,
    DELETE_DOCUMENT: (id, docId) => `/claims/${id}/documents/${docId}`,
    UPDATE_STATUS: (id) => `/claims/${id}/status`,
    ASSIGN: (id) => `/claims/${id}/assign`,
    FRAUD_ANALYSIS: (id) => `/claims/${id}/fraud-analysis`,
    STATISTICS: '/admin/claims/statistics',
    ADMIN_LIST: '/admin/claims',
  },
  
  // Insurance
  INSURANCE: {
    QUOTE: '/insurance/quote',
    SAVE_QUOTE: '/insurance/quote/save',
    APPLY: '/insurance/apply',
    APPLICATIONS: '/insurance/applications',
    APPLICATION_STATUS: (id) => `/insurance/applications/${id}`,
    PROCESS_PAYMENT: '/insurance/payments/process',
    PAYMENT_HISTORY: '/insurance/payments/history',
    SETUP_PAYMENT_METHOD: '/insurance/payments/methods',
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAILS: (id) => `/admin/users/${id}`,
    UPDATE_USER_ROLE: (id) => `/admin/users/${id}/role`,
    TOGGLE_USER_STATUS: (id) => `/admin/users/${id}/status`,
    ACTIVITY: '/admin/activity',
    FINANCIAL_REPORT: '/admin/reports/financial',
    RISK_PROFILES: '/admin/reports/risk-profiles',
    GENERATE_REPORT: '/admin/reports/generate',
  },

  // Activities
  ACTIVITIES: {
    LIST: '/activities',
    GET: (id) => `/activities/${id}`,
    USER_ACTIVITIES: (userId) => `/users/${userId}/activities`,
    CREATE: '/activities',
    DELETE: (id) => `/activities/${id}`,
  },
};

// Helper function to get full URL
export const getFullUrl = (endpoint) => {
  if (typeof endpoint === 'function') {
    return (...args) => `${API_BASE_URL}${endpoint(...args)}`;
  }
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to generate endpoint with query parameters
export const generateUrlWithParams = (baseUrl, params = {}) => {
  const url = getFullUrl(baseUrl);
  const queryParams = new URLSearchParams(params).toString();
  return queryParams ? `${url}?${queryParams}` : url;
};

// Pre-built endpoint functions for common use cases
export const ENDPOINT_FUNCTIONS = {
  // Risk endpoints
  risk: {
    getProfile: () => getFullUrl(API_ENDPOINTS.RISK.PROFILE),
    createOrUpdateProfile: () => getFullUrl(API_ENDPOINTS.RISK.CREATE_PROFILE),
    getAnalysis: () => getFullUrl(API_ENDPOINTS.RISK.ANALYSIS),
    getCompare: () => getFullUrl(API_ENDPOINTS.RISK.COMPARE),
    calculatePremium: () => getFullUrl(API_ENDPOINTS.RISK.CALCULATE_PREMIUM),
    getFactors: () => getFullUrl(API_ENDPOINTS.RISK.FACTORS),
    simulatePremium: () => getFullUrl(API_ENDPOINTS.RISK.SIMULATE_PREMIUM),
  },
  
  // Auth endpoints
  auth: {
    register: () => getFullUrl(API_ENDPOINTS.AUTH.REGISTER),
    login: () => getFullUrl(API_ENDPOINTS.AUTH.LOGIN),
    logout: () => getFullUrl(API_ENDPOINTS.AUTH.LOGOUT),
    forgotPassword: () => getFullUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD),
    resetPassword: (token) => getFullUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD(token)),
    refreshToken: () => getFullUrl(API_ENDPOINTS.AUTH.REFRESH_TOKEN),
    verifyEmail: (token) => getFullUrl(API_ENDPOINTS.AUTH.VERIFY_EMAIL(token)),
  },
  
  // User endpoints
  user: {
    getProfile: () => getFullUrl(API_ENDPOINTS.USERS.PROFILE),
    getDashboard: () => getFullUrl(API_ENDPOINTS.USERS.DASHBOARD),
    updateProfile: () => getFullUrl(API_ENDPOINTS.USERS.UPDATE_PROFILE),
    changePassword: () => getFullUrl(API_ENDPOINTS.USERS.CHANGE_PASSWORD),
    getActivity: (params) => generateUrlWithParams(API_ENDPOINTS.USERS.ACTIVITY, params),
    uploadAvatar: () => getFullUrl(API_ENDPOINTS.USERS.UPLOAD_AVATAR),
    deleteAccount: () => getFullUrl(API_ENDPOINTS.USERS.DELETE_ACCOUNT),
  },
  
  // Policy endpoints
  policy: {
    list: (params) => generateUrlWithParams(API_ENDPOINTS.POLICIES.LIST, params),
    create: () => getFullUrl(API_ENDPOINTS.POLICIES.CREATE),
    get: (id) => getFullUrl(API_ENDPOINTS.POLICIES.GET(id)),
    update: (id) => getFullUrl(API_ENDPOINTS.POLICIES.UPDATE(id)),
    cancel: (id) => getFullUrl(API_ENDPOINTS.POLICIES.CANCEL(id)),
    renew: (id) => getFullUrl(API_ENDPOINTS.POLICIES.RENEW(id)),
    getDocuments: (id) => getFullUrl(API_ENDPOINTS.POLICIES.DOCUMENTS(id)),
    getPayments: (id) => getFullUrl(API_ENDPOINTS.POLICIES.PAYMENTS(id)),
  },
  
  // Claim endpoints
  claim: {
    list: (params) => generateUrlWithParams(API_ENDPOINTS.CLAIMS.LIST, params),
    create: () => getFullUrl(API_ENDPOINTS.CLAIMS.CREATE),
    get: (id) => getFullUrl(API_ENDPOINTS.CLAIMS.GET(id)),
    uploadDocument: (id) => getFullUrl(API_ENDPOINTS.CLAIMS.UPLOAD_DOCUMENT(id)),
    updateStatus: (id) => getFullUrl(API_ENDPOINTS.CLAIMS.UPDATE_STATUS(id)),
    assign: (id) => getFullUrl(API_ENDPOINTS.CLAIMS.ASSIGN(id)),
    fraudAnalysis: (id) => getFullUrl(API_ENDPOINTS.CLAIMS.FRAUD_ANALYSIS(id)),
  },
  
  // Admin endpoints
  admin: {
    getDashboard: () => getFullUrl(API_ENDPOINTS.ADMIN.DASHBOARD),
    getUsers: (params) => generateUrlWithParams(API_ENDPOINTS.ADMIN.USERS, params),
    getUserDetails: (id) => getFullUrl(API_ENDPOINTS.ADMIN.USER_DETAILS(id)),
    updateUserRole: (id) => getFullUrl(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(id)),
    toggleUserStatus: (id) => getFullUrl(API_ENDPOINTS.ADMIN.TOGGLE_USER_STATUS(id)),
    getActivity: (params) => generateUrlWithParams(API_ENDPOINTS.ADMIN.ACTIVITY, params),
    getFinancialReport: (params) => generateUrlWithParams(API_ENDPOINTS.ADMIN.FINANCIAL_REPORT, params),
    getRiskProfiles: () => getFullUrl(API_ENDPOINTS.ADMIN.RISK_PROFILES),
    generateReport: () => getFullUrl(API_ENDPOINTS.ADMIN.GENERATE_REPORT),
  },
};

export default API_ENDPOINTS;