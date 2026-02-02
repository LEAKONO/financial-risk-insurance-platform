// frontend/src/config/routes.js
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  RISK_ASSESSMENT: '/risk-assessment',
  
  // User dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_OVERVIEW: '/dashboard',
  DASHBOARD_CLAIMS: '/dashboard/claims',
  DASHBOARD_POLICIES: '/dashboard/policies',
  DASHBOARD_PROFILE: '/dashboard/profile',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_POLICIES: '/admin/policies',
  ADMIN_CLAIMS: '/admin/claims',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_ACTIVITY: '/admin/activity',
}