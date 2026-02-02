// frontend/src/context/LoadingContext.jsx
import React, { createContext, useState, useContext } from 'react'

const LoadingContext = createContext({})

export const useLoading = () => useContext(LoadingContext)

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const showLoading = (message = '') => {
    setLoading(true)
    setLoadingMessage(message)
  }

  const hideLoading = () => {
    setLoading(false)
    setLoadingMessage('')
  }

  const withLoading = async (fn, message = '') => {
    showLoading(message)
    try {
      const result = await fn()
      return result
    } finally {
      hideLoading()
    }
  }

  const value = {
    loading,
    loadingMessage,
    showLoading,
    hideLoading,
    withLoading,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
            {loadingMessage && (
              <p className="text-gray-700">{loadingMessage}</p>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}