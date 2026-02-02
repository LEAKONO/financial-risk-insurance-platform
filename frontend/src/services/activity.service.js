// frontend/src/services/activity.service.js
import { userService } from './api'
import { adminService } from './api'

export const getUserActivity = async (params) => {
  return await userService.getActivity(params)
}

export const getSystemActivity = async (params) => {
  return await adminService.getSystemActivity(params)
}