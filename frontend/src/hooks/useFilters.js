// frontend/src/hooks/useFilters.js
import { useState, useCallback, useMemo } from 'react'

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }, [])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setPage(1)
  }, [initialFilters])

  const queryParams = useMemo(() => {
    const params = { ...filters, page, limit }
    // Remove undefined/null values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key]
      }
    })
    return params
  }, [filters, page, limit])

  return {
    filters,
    page,
    limit,
    setPage,
    setLimit,
    updateFilter,
    updateFilters,
    resetFilters,
    queryParams,
  }
}