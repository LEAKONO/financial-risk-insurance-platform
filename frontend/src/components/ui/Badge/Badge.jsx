// frontend/src/components/ui/Badge/Badge.jsx
import React from 'react'

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  rounded = 'full',
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-purple-100 text-purple-800',
    outline: 'bg-transparent border border-gray-300 text-gray-700',
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-sm',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  return (
    <span className={`
      inline-flex items-center font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}
    `}>
      {children}
    </span>
  )
}

export { Badge }
export default Badge