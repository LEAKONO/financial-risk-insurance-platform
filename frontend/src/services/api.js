// frontend/src/services/api.js
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

// Helper function for consistent error handling
const handleApiError = (error) => {
  if (error.response) {
    return {
      success: false,
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      errors: error.response.data?.errors,
      data: error.response.data,
    };
  }

  if (error.request) {
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }

  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };
};

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  register: async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  forgotPassword: async (email) => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  resetPassword: async (token, password) => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD(token), { password });
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  verifyEmail: async (token) => {
    try {
      await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL(token));
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================
// USER SERVICE
// ============================================
export const userService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDashboard: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.DASHBOARD);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  changePassword: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getActivity: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.ACTIVITY, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteAccount: async (password) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT, { data: { password } });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================
// RISK SERVICE
// ============================================
export const riskService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RISK.PROFILE);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createOrUpdateProfile: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RISK.CREATE_PROFILE, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAnalysis: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RISK.ANALYSIS);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  compareWithAverage: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RISK.COMPARE);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  calculatePremium: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RISK.CALCULATE_PREMIUM, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRiskFactors: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RISK.FACTORS);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  simulatePremium: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RISK.SIMULATE_PREMIUM, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================
// CLAIM SERVICE
// ============================================
export const claimService = {
  getClaims: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CLAIMS.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createClaim: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CLAIMS.CREATE, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getClaim: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CLAIMS.GET(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateClaim: async (id, data) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.CLAIMS.UPDATE_STATUS(id), data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  uploadDocument: async (id, file) => {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await apiClient.post(API_ENDPOINTS.CLAIMS.UPLOAD_DOCUMENT(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteDocument: async (id, docId) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CLAIMS.DELETE_DOCUMENT(id, docId));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  assignClaim: async (id, assigneeId) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CLAIMS.ASSIGN(id), { assigneeId });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  analyzeFraud: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CLAIMS.FRAUD_ANALYSIS(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getClaimStatistics: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CLAIMS.STATISTICS);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAdminClaims: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CLAIMS.ADMIN_LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================
// POLICY SERVICE
// ============================================
export const policyService = {
  getPolicies: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POLICIES.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUserPolicies: async (params = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POLICIES.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  createPolicy: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POLICIES.CREATE, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPolicy: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POLICIES.GET(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updatePolicy: async (id, data) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.POLICIES.UPDATE(id), data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  cancelPolicy: async (id, reason) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POLICIES.CANCEL(id), { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  renewPolicy: async (id, termLength) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POLICIES.RENEW(id), { termLength });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDocuments: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POLICIES.DOCUMENTS(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPaymentHistory: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POLICIES.PAYMENTS(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAdminPolicies: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POLICIES.ADMIN_LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updatePolicyStatus: async (id, status) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.POLICIES.ADMIN_UPDATE_STATUS(id), { status });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================
// ACTIVITY SERVICE
// ============================================
export const activityService = {
  getActivities: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ACTIVITIES.LIST, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getActivityById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ACTIVITIES.GET(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUserActivities: async (userId, params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ACTIVITIES.USER_ACTIVITIES(userId), { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // UPDATED METHOD - supports filter & fallback mock data
  getRecentActivities: async (limit = 10, filter = null) => {
    try {
      let url = `/admin/activities/recent?limit=${limit}`;
      if (filter && filter !== 'all') url += `&type=${filter}`;
      const response = await apiClient.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: true, data: generateMockActivities(limit, filter) };
    }
  },

  logActivity: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ACTIVITIES.CREATE, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteActivity: async (id) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ACTIVITIES.DELETE(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Helper function for mock activities
const generateMockActivities = (limit = 10, filter = null) => {
  const mockActivities = [
    {
      id: '1',
      action: 'login',
      entity: 'user',
      description: 'Admin user logged into the system',
      severity: 'info',
      user: { name: 'Admin User', email: 'admin@example.com' },
      timestamp: new Date(Date.now() - 300000).toISOString(),
      entityId: 'user_001',
    },
    {
      id: '2',
      action: 'create',
      entity: 'policy',
      description: 'New life insurance policy created',
      severity: 'info',
      user: { name: 'John Doe', email: 'john@example.com' },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      entityId: 'policy_123',
    },
    {
      id: '3',
      action: 'update',
      entity: 'user',
      description: 'User profile information updated',
      severity: 'info',
      user: { name: 'Sarah Wilson', email: 'sarah@example.com' },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      entityId: 'user_456',
    },
    {
      id: '4',
      action: 'submit',
      entity: 'claim',
      description: 'New claim submitted for review',
      severity: 'warning',
      user: { name: 'Michael Brown', email: 'michael@example.com' },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      entityId: 'claim_789',
    },
    {
      id: '5',
      action: 'approve',
      entity: 'claim',
      description: 'Claim approved and payment processed',
      severity: 'success',
      user: { name: 'System', email: 'system' },
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      entityId: 'claim_456',
    },
  ];

  let filtered = mockActivities;
  if (filter && filter !== 'all') {
    filtered = mockActivities.filter(
      (activity) =>
        activity.entity === filter || (filter === 'system' && activity.user.name === 'System')
    );
  }

  return filtered.slice(0, limit);
};

// ============================================
// INSURANCE SERVICE
// ============================================
export const insuranceService = {
  getQuote: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INSURANCE.QUOTE, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  saveQuote: async (quoteData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INSURANCE.SAVE_QUOTE, { quoteData });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  applyForPolicy: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INSURANCE.APPLY, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getApplications: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INSURANCE.APPLICATIONS);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getApplicationStatus: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INSURANCE.APPLICATION_STATUS(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  processPayment: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INSURANCE.PROCESS_PAYMENT, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPaymentHistory: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INSURANCE.PAYMENT_HISTORY, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  setupPaymentMethod: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INSURANCE.SETUP_PAYMENT_METHOD, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// ============================================
// ADMIN SERVICE
// ============================================
export const adminService = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUsers: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getUserDetails: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.USER_DETAILS(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(id), { role });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ADMIN.TOGGLE_USER_STATUS(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSystemActivity: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.ACTIVITY, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getFinancialReport: async (params) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.FINANCIAL_REPORT, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRiskProfilesOverview: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.RISK_PROFILES);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  generateReport: async (data) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.GENERATE_REPORT, data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Export everything
export default {
  api: apiClient,
  auth: authService,
  user: userService,
  risk: riskService,
  policy: policyService,
  claim: claimService,
  insurance: insuranceService,
  admin: adminService,
  activity: activityService,
  handleApiError,
};