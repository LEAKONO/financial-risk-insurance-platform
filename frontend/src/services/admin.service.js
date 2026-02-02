// frontend/src/services/admin.service.js
import { adminService } from './api'

export const getAdminDashboard = async () => {
  return await adminService.getDashboard()
}

export const getAdminUsers = async (params) => {
  return await adminService.getUsers(params)
}

export const getAdminUserDetails = async (id) => {
  return await adminService.getUserDetails(id)
}

export const updateUserRole = async (id, role) => {
  return await adminService.updateUserRole(id, role)
}

export const toggleUserStatus = async (id) => {
  return await adminService.toggleUserStatus(id)
}

export const getSystemActivity = async (params) => {
  return await adminService.getSystemActivity(params)
}

export const getFinancialReport = async (params) => {
  return await adminService.getFinancialReport(params)
}

export const getRiskProfilesOverview = async () => {
  return await adminService.getRiskProfilesOverview()
}

export const generateReport = async (data) => {
  return await adminService.generateReport(data)
}