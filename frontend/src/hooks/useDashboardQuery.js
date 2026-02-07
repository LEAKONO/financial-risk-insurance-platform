// frontend/src/hooks/useDashboardQuery.js
import { useQueries } from 'react-query'
import { policyService, claimService, userService } from '../services/api'

export const useDashboardQuery = () => {
  const results = useQueries([
    {
      queryKey: ['policies', 'dashboard'],
      queryFn: () => policyService.getUserPolicies({ limit: 3 }),
      staleTime: 1000 * 60 * 2, // 2 minutes for dashboard
    },
    {
      queryKey: ['claims', 'dashboard'],
      queryFn: () => claimService.getClaims({ limit: 3 }),
      staleTime: 1000 * 60 * 2,
    },
    {
      queryKey: ['user', 'dashboard'],
      queryFn: () => userService.getDashboard(),
      staleTime: 1000 * 60 * 2,
    },
  ])

  const isLoading = results.some(result => result.isLoading)
  const isError = results.some(result => result.isError)
  const error = results.find(result => result.error)?.error

  const data = results.every(result => !result.isLoading && !result.isError) 
    ? {
        policies: results[0].data?.data?.policies || [],
        claims: results[1].data?.data?.claims || [],
        stats: results[2].data?.data?.stats || {},
      }
    : null

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => results.forEach(result => result.refetch()),
  }
}