// frontend/src/components/ui/Button/IconButton.jsx
import React from 'react'
import { motion } from 'framer-motion'

const IconButton = ({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus:ring-red-500',
  }
  
  const sizes = {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-5',
  }
  
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-b-2 border-white ${iconSizes[size]}`} />
      ) : (
        <Icon className={iconSizes[size]} />
      )}
    </motion.button>
  )
}

export { IconButton }
export default IconButton