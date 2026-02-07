// frontend/src/hooks/useClaimsQuery.js
import { useEnhancedQuery, useEnhancedMutation } from './useReactQuery'
import { claimService } from '../services/api'

export const useClaimsQuery = (options = {}) => {
  return useEnhancedQuery(
    ['claims'],
    () => claimService.getClaims(),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      ...options,
    }
  )
}

export const useClaimQuery = (id, options = {}) => {
  return useEnhancedQuery(
    ['claim', id],
    () => claimService.getClaimById(id),
    {
      enabled: !!id,
      ...options,
    }
  )
}

export const useCreateClaimMutation = (options = {}) => {
  return useEnhancedMutation(
    (claimData) => claimService.createClaim(claimData),
    {
      successMessage: 'Claim submitted successfully',
      invalidateQueries: ['claims'],
      ...options,
    }
  )
}

export const useUpdateClaimMutation = (options = {}) => {
  return useEnhancedMutation(
    ({ id, ...data }) => claimService.updateClaim(id, data),
    {
      successMessage: 'Claim updated successfully',
      invalidateQueries: ['claims'],
      ...options,
    }
  )
}