// frontend/src/components/ui/Progress/ProgressBar.jsx
import React from 'react'

const ProgressBar = ({ 
  value, 
  max = 100,
  showValue = true,
  variant = 'primary',
  size = 'md',
  label,
  className = '' 
}) => {
  const percentage = (value / max) * 100
  const normalizedValue = Math.min(Math.max(value, 0), max)

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  }

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6',
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {showValue && (
            <span className="text-gray-600">
              {normalizedValue} / {max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar }
export default ProgressBar