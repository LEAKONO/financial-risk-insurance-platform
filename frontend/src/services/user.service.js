// frontend/src/services/user.service.js
import { userService } from './api'

export const getProfile = async () => {
  return await userService.getProfile()
}

export const getDashboard = async () => {
  return await userService.getDashboard()
}

export const updateProfile = async (data) => {
  return await userService.updateProfile(data)
}

export const changePassword = async (data) => {
  return await userService.changePassword(data)
}

export const getActivity = async (params) => {
  return await userService.getActivity(params)
}

export const uploadAvatar = async (file) => {
  return await userService.uploadAvatar(file)
}