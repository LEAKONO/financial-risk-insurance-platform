// frontend/src/hooks/useApi.js
import { useState, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { useLoading } from '../context/LoadingContext'

export const useApi = (apiFunction, options = {}) => {
  const { showLoading: showGlobalLoading, withLoading: withGlobalLoading } = useLoading()
  const { error: showError } = useToast()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const execute = useCallback(async (params = {}, localOptions = {}) => {
    const {
      showLoading = true,
      showError: showToastError = true,
      loadingMessage = '',
      onSuccess,
      onError,
    } = { ...options, ...localOptions }

    try {
      setLoading(true)
      if (showLoading) {
        if (loadingMessage) {
          showGlobalLoading(loadingMessage)
        }
      }

      const response = await apiFunction(params)
      setData(response.data)
      setError(null)
      
      if (onSuccess) {
        onSuccess(response.data)
      }
      
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      
      if (showToastError) {
        showError(errorMessage)
      }
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
      if (showLoading && loadingMessage) {
        // Loading is hidden by LoadingContext
      }
    }
  }, [apiFunction, options, showGlobalLoading, showError])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    error,
    loading,
    execute,
    reset,
    isSuccess: !!data && !error,
    isError: !!error,
  }
}