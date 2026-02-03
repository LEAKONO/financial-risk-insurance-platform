// frontend/src/components/ui/Table/DataTable.jsx
import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Filter } from 'lucide-react'
import EmptyState from '../../common/EmptyState'
import Loader from '../../common/Loader'
import Pagination from '../../common/Pagination'

const DataTable = ({
  columns,
  data,
  loading = false,
  emptyState,
  pagination,
  onRowClick,
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortedData = () => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const sortedData = getSortedData()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader size="lg" />
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <EmptyState {...emptyState} />
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`
                    px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                    ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}
                  `}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`h-3 w-3 ${sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                      </div>
                    )}
                    {column.filterable && (
                      <Filter className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  transition-colors
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-4 whitespace-nowrap
                      ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}
                    `}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{pagination.startIndex}</span> to{' '}
              <span className="font-semibold">{pagination.endIndex}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> results
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }
export default DataTable