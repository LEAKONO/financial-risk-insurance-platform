// frontend/src/components/ui/Button/Button.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Loader from '../../common/Loader'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  href,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus:ring-red-500',
  }
  
  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3.5 text-lg',
    xl: 'px-10 py-4 text-xl',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`
  
  const content = (
    <>
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={`${size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${children ? 'mr-2' : ''}`} />
      )}
      {loading ? (
        <Loader size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'blue'} />
      ) : (
        children
      )}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`${size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${children ? 'ml-2' : ''}`} />
      )}
    </>
  )
  
  if (href) {
    return (
      <Link to={href} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  
  const ButtonElement = motion.button
  
  return (
    <ButtonElement
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {content}
    </ButtonElement>
  )
}

export default Button