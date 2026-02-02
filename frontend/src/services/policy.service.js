// frontend/src/services/policy.service.js
import { policyService } from './api'

export const getPolicies = async (params) => {
  return await policyService.getPolicies(params)
}

export const createPolicy = async (data) => {
  return await policyService.createPolicy(data)
}

export const getPolicy = async (id) => {
  return await policyService.getPolicy(id)
}

export const updatePolicy = async (id, data) => {
  return await policyService.updatePolicy(id, data)
}

export const cancelPolicy = async (id, reason) => {
  return await policyService.cancelPolicy(id, reason)
}

export const renewPolicy = async (id, termLength) => {
  return await policyService.renewPolicy(id, termLength)
}

export const getPolicyDocuments = async (id) => {
  return await policyService.getDocuments(id)
}

export const getPaymentHistory = async (id) => {
  return await policyService.getPaymentHistory(id)
}