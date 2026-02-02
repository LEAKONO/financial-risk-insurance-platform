// frontend/src/components/ui/Table/TableHeader.jsx
import React from 'react'
import { Search } from 'lucide-react'
import Input from '../Form/Input'
import Button from '../Button/Button'

const TableHeader = ({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {searchValue !== undefined && (
          <p className="text-sm text-gray-600 mt-1">
            Showing results for "{searchValue}"
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {onSearchChange && (
          <div className="md:w-64">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        )}

        <div className="flex gap-2">
          {actions}
        </div>
      </div>
    </div>
  )
}

export default TableHeader