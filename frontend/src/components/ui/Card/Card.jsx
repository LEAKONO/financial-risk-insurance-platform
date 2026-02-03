// frontend/src/components/ui/Card/Card.jsx
import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  hoverable = false,
  padding = true,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-2xl shadow-lg
        ${hoverable ? 'hover:shadow-xl transition-shadow duration-300' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}

export { Card }
export default Card