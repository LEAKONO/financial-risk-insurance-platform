// frontend/src/components/common/Loader.jsx
import React from 'react'

const Loader = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  }

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    white: 'border-gray-200 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600',
    purple: 'border-purple-200 border-t-purple-600',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
      />
    </div>
  )
}

export default Loader