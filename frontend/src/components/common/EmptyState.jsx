// frontend/src/components/common/EmptyState.jsx
import React from 'react'
import { motion } from 'framer-motion'

const EmptyState = ({ 
  icon: Icon, 
  title = 'No data found', 
  description = 'There is no data to display at the moment.',
  action,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      {Icon && (
        <div className="p-4 bg-gray-100 rounded-2xl mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action}
    </motion.div>
  )
}

export { EmptyState }
export default EmptyState