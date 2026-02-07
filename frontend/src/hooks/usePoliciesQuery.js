// frontend/src/hooks/usePoliciesQuery.js
import { useEnhancedQuery, useEnhancedMutation } from './useReactQuery'
import { policyService } from '../services/api'

export const usePoliciesQuery = (options = {}) => {
  return useEnhancedQuery(
    ['policies'],
    () => policyService.getUserPolicies(),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      ...options,
    }
  )
}

export const usePolicyQuery = (id, options = {}) => {
  return useEnhancedQuery(
    ['policy', id],
    () => policyService.getPolicyById(id),
    {
      enabled: !!id,
      ...options,
    }
  )
}

export const useCreatePolicyMutation = (options = {}) => {
  return useEnhancedMutation(
    (policyData) => policyService.createPolicy(policyData),
    {
      successMessage: 'Policy created successfully',
      invalidateQueries: ['policies'],
      ...options,
    }
  )
}