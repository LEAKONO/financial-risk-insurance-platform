// frontend/src/components/common/FilterPanel.jsx
import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import Input from '../ui/Form/Input'
import Select from '../ui/Form/Select'

const FilterPanel = ({ 
  filters = [], 
  onFilterChange, 
  onSearch, 
  searchPlaceholder = 'Search...',
  className = '' 
}) => {
  const [search, setSearch] = React.useState('')
  const [activeFilters, setActiveFilters] = React.useState({})

  const handleSearch = (value) => {
    setSearch(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const clearFilter = (key) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearch('')
    if (onFilterChange) {
      onFilterChange({})
    }
    if (onSearch) {
      onSearch('')
    }
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || search

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || ''}
              onChange={(value) => handleFilterChange(filter.key, value)}
              options={filter.options}
              placeholder={filter.placeholder}
              className="min-w-[150px]"
            />
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          
          {search && (
            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg">
              <span className="text-sm">Search: "{search}"</span>
              <button
                onClick={() => setSearch('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key)
            const option = filter?.options?.find(opt => opt.value === value)
            return (
              <div key={key} className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg">
                <span className="text-sm">{filter?.label}: {option?.label || value}</span>
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}

          <button
            onClick={clearAllFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

export default FilterPanel