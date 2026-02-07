// frontend/src/hooks/useCombinedApi.js
import { useApi } from './useApi'
import { useClaimsQuery, useCreateClaimMutation } from './useClaimsQuery'
import { usePoliciesQuery, useCreatePolicyMutation } from './usePoliciesQuery'

// Combined hook that provides both React Query and traditional API options
export const useCombinedClaims = (options = {}) => {
  // For list views, use React Query for caching
  const queryResult = useClaimsQuery(options)
  
  // For single operations, use traditional API hook
  const apiCreateClaim = useApi(claimService.createClaim, {
    successMessage: 'Claim created successfully',
    ...options,
  })

  return {
    // React Query properties
    data: queryResult.data?.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    
    // Traditional API properties
    createClaim: apiCreateClaim.execute,
    createLoading: apiCreateClaim.loading,
    createError: apiCreateClaim.error,
    
    // Combined helpers
    isSuccess: !!queryResult.data,
    isError: !!queryResult.error,
  }
}

export const useCombinedPolicies = (options = {}) => {
  const queryResult = usePoliciesQuery(options)
  const apiCreatePolicy = useApi(policyService.createPolicy, {
    successMessage: 'Policy created successfully',
    ...options,
  })

  return {
    data: queryResult.data?.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    
    createPolicy: apiCreatePolicy.execute,
    createLoading: apiCreatePolicy.loading,
    createError: apiCreatePolicy.error,
    
    isSuccess: !!queryResult.data,
    isError: !!queryResult.error,
  }
}