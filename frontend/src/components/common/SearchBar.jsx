// frontend/src/components/common/SearchBar.jsx
import React from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  delay = 300,
  className = '',
  ...props
}) => {
  const [query, setQuery] = React.useState('')
  const debouncedQuery = useDebounce(query, delay)

  React.useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  const clearSearch = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        {...props}
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}

export { SearchBar }
export default SearchBar