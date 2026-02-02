// frontend/src/services/upload.service.js
import { uploadService } from './api'

export const uploadFile = async (file, endpoint, fieldName = 'file') => {
  return await uploadService.uploadFile(file, endpoint, fieldName)
}

export const uploadMultipleFiles = async (files, endpoint, fieldName = 'files') => {
  return await uploadService.uploadMultipleFiles(files, endpoint, fieldName)
}