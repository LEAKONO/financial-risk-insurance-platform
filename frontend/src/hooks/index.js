// frontend/src/hooks/index.js
export { useApi } from './useApi'
export { useAuth } from './useAuth'
export { useDebounce } from './useDebounce'
export { useFilters } from './useFilters'
export { useLocalStorage } from './useLocalStorage'
export { useModal } from './useModal'
export { usePagination } from './usePagination'
export { useTheme } from './useTheme'
export { useToast } from './useToast'
export { useWindowSize } from './useWindowSize'

// React Query hooks
export { useEnhancedQuery, useEnhancedMutation } from './useReactQuery'
export { useClaimsQuery, useClaimQuery, useCreateClaimMutation, useUpdateClaimMutation } from './useClaimsQuery'
export { usePoliciesQuery, usePolicyQuery, useCreatePolicyMutation } from './usePoliciesQuery'
export { useDashboardQuery } from './useDashboardQuery'
export { useCombinedClaims, useCombinedPolicies } from './useCombinedApi'