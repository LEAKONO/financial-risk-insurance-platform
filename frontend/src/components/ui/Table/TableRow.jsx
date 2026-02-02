// frontend/src/components/ui/Table/TableRow.jsx
import React from 'react'

const TableRow = ({ 
  children, 
  onClick,
  selected = false,
  className = '' 
}) => {
  return (
    <tr
      onClick={onClick}
      className={`
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        ${selected ? 'bg-blue-50' : ''}
        transition-colors
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

export default TableRow