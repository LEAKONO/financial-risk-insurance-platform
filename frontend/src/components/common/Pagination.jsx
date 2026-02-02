// frontend/src/components/common/Pagination.jsx
import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || page === currentPage}
          className={`
            min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors
            ${page === currentPage
              ? 'bg-blue-600 text-white'
              : typeof page === 'number'
                ? 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                : 'text-gray-400 cursor-default'
            }
          `}
        >
          {page === '...' ? <MoreHorizontal className="h-4 w-4" /> : page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Pagination