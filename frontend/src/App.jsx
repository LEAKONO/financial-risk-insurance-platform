// frontend/src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { ModalProvider } from './context/ModalContext'
import { LoadingProvider } from './context/LoadingContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import MainLayout from './components/layout/MainLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import NotFound from './pages/404'
import DashboardOverview from './pages/dashboard/Overview'
import DashboardClaims from './pages/dashboard/Claims'
import DashboardPolicies from './pages/dashboard/Policies'
import DashboardProfile from './pages/dashboard/Profile'
import RiskAssessment from './pages/risk'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminPolicies from './pages/admin/Policies'
import AdminClaims from './pages/admin/Claims'
import AdminReports from './pages/admin/Reports'
import AdminActivity from './pages/admin/Activity'

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <LoadingProvider>
              <ToastProvider>
                <ModalProvider>
                  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <Routes>
                      {/* Public Routes - MainLayout */}
                      <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="risk-assessment" element={<RiskAssessment />} />
                      </Route>

                      {/* Auth Routes - Standalone (no layout) */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />

                      {/* User Dashboard Routes - DashboardLayout */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <DashboardLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<DashboardOverview />} />
                        <Route path="claims" element={<DashboardClaims />} />
                        <Route path="policies" element={<DashboardPolicies />} />
                        <Route path="profile" element={<DashboardProfile />} />
                      </Route>

                      {/* Admin Routes - AdminLayout */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute adminOnly={true}>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="policies" element={<AdminPolicies />} />
                        <Route path="claims" element={<AdminClaims />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="activity" element={<AdminActivity />} />
                      </Route>

                      {/* 404 Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </ModalProvider>
              </ToastProvider>
            </LoadingProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App