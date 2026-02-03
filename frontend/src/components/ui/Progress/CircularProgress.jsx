// frontend/src/components/ui/Progress/CircularProgress.jsx
import React from 'react'

const CircularProgress = ({ 
  value, 
  max = 100,
  size = 'md',
  showValue = true,
  variant = 'primary',
  className = '' 
}) => {
  const percentage = (value / max) * 100
  const normalizedValue = Math.min(Math.max(value, 0), max)

  const sizeClasses = {
    xs: 'h-8 w-8',
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24',
  }

  const strokeWidths = {
    xs: 3,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10,
  }

  const variantClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-purple-600',
  }

  const radius = size === 'xs' ? 12 : size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 36 : 44
  const strokeWidth = strokeWidths[size]
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg
        className={`transform -rotate-90 ${sizeClasses[size]}`}
        viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${radius * 2 + strokeWidth * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none transition-all duration-500 ${variantClasses[variant]}`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

export { CircularProgress }
export default CircularProgress