// frontend/src/services/insurance.service.js
import { insuranceService } from './api'

export const getQuote = async (data) => {
  return await insuranceService.getQuote(data)
}

export const saveQuote = async (quoteData) => {
  return await insuranceService.saveQuote(quoteData)
}

export const applyForPolicy = async (data) => {
  return await insuranceService.applyForPolicy(data)
}

export const getApplications = async () => {
  return await insuranceService.getApplications()
}

export const getApplicationStatus = async (id) => {
  return await insuranceService.getApplicationStatus(id)
}

export const processPayment = async (data) => {
  return await insuranceService.processPayment(data)
}

export const getPaymentHistory = async (params) => {
  return await insuranceService.getPaymentHistory(params)
}

export const setupPaymentMethod = async (data) => {
  return await insuranceService.setupPaymentMethod(data)
}