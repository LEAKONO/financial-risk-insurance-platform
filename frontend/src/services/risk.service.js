// frontend/src/services/risk.service.js
import { riskService } from './api'

export const getRiskProfile = async () => {
  return await riskService.getProfile()
}

export const createOrUpdateRiskProfile = async (data) => {
  return await riskService.createOrUpdateProfile(data)
}

export const getRiskAnalysis = async () => {
  return await riskService.getAnalysis()
}

export const compareWithAverage = async () => {
  return await riskService.compareWithAverage()
}

export const calculatePremium = async (data) => {
  return await riskService.calculatePremium(data)
}

export const getRiskFactors = async () => {
  return await riskService.getRiskFactors()
}

export const simulatePremium = async (data) => {
  return await riskService.simulatePremium(data)
}