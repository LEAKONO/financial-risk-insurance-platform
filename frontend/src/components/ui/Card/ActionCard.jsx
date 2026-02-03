// frontend/src/components/ui/Card/ActionCard.jsx
import React from 'react'
import { motion } from 'framer-motion'

const ActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onClick,
  variant = 'primary',
  className = '' 
}) => {
  const variantClasses = {
    primary: 'from-blue-500 to-purple-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-orange-500 to-amber-500',
    danger: 'from-red-500 to-rose-500',
    info: 'from-cyan-500 to-blue-500',
  }

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden group hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-10 bg-gradient-to-br ${variantClasses[variant]} blur-2xl group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${variantClasses[variant]} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${variant === 'primary' ? 'text-blue-600' : variant === 'success' ? 'text-green-600' : variant === 'warning' ? 'text-orange-600' : variant === 'danger' ? 'text-red-600' : 'text-cyan-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <button
              onClick={onClick}
              className={`text-sm font-medium ${variant === 'primary' ? 'text-blue-600 hover:text-blue-800' : variant === 'success' ? 'text-green-600 hover:text-green-800' : variant === 'warning' ? 'text-orange-600 hover:text-orange-800' : variant === 'danger' ? 'text-red-600 hover:text-red-800' : 'text-cyan-600 hover:text-cyan-800'}`}
            >
              {actionText} →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { ActionCard }
export default ActionCard