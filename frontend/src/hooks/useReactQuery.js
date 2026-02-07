// frontend/src/hooks/useReactQuery.js
import { useQuery, useMutation, useQueryClient, useQueries } from 'react-query'
import { useToast } from './useToast'
import { useLoading } from './useLoading'

// Configuration for React Query
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error('Query Error:', error)
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation Error:', error)
      },
    },
  },
}

// Enhanced useQuery with loading and toast integration
export const useEnhancedQuery = (queryKey, queryFn, options = {}) => {
  const { showLoading, hideLoading } = useLoading()
  const { error: showError } = useToast()

  return useQuery(queryKey, queryFn, {
    ...options,
    onSettled: () => {
      if (options.showLoading !== false) {
        hideLoading()
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
      if (options.showError !== false) {
        showError(errorMessage)
      }
      if (options.onError) {
        options.onError(error)
      }
    },
  })
}

// Enhanced useMutation with loading and toast integration
export const useEnhancedMutation = (mutationFn, options = {}) => {
  const { showLoading, hideLoading } = useLoading()
  const { success: showSuccess, error: showError } = useToast()
  const queryClient = useQueryClient()

  return useMutation(mutationFn, {
    ...options,
    onMutate: () => {
      if (options.showLoading !== false) {
        showLoading(options.loadingMessage || 'Processing...')
      }
      if (options.onMutate) {
        options.onMutate()
      }
    },
    onSuccess: (data, variables, context) => {
      hideLoading()
      if (options.successMessage !== false) {
        showSuccess(options.successMessage || 'Operation completed successfully')
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context)
      }
      if (options.invalidateQueries) {
        queryClient.invalidateQueries(options.invalidateQueries)
      }
    },
    onError: (error, variables, context) => {
      hideLoading()
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
      if (options.showError !== false) {
        showError(errorMessage)
      }
      if (options.onError) {
        options.onError(error, variables, context)
      }
    },
    onSettled: () => {
      hideLoading()
      if (options.onSettled) {
        options.onSettled()
      }
    },
  })
}