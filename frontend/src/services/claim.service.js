// frontend/src/services/claim.service.js
import { claimService } from './api'

export const getClaims = async (params) => {
  return await claimService.getClaims(params)
}

export const createClaim = async (data) => {
  return await claimService.createClaim(data)
}

export const getClaim = async (id) => {
  return await claimService.getClaim(id)
}

export const uploadClaimDocument = async (id, file) => {
  return await claimService.uploadDocument(id, file)
}

export const deleteClaimDocument = async (id, docId) => {
  return await claimService.deleteDocument(id, docId)
}

export const updateClaimStatus = async (id, data) => {
  return await claimService.updateClaimStatus(id, data)
}

export const assignClaim = async (id, assigneeId) => {
  return await claimService.assignClaim(id, assigneeId)
}

export const analyzeFraud = async (id) => {
  return await claimService.analyzeFraud(id)
}

export const getClaimStatistics = async () => {
  return await claimService.getClaimStatistics()
}