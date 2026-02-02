// frontend/src/components/ui/Card/InfoCard.jsx
import React from 'react'
import { motion } from 'framer-motion'

const InfoCard = ({ 
  icon: Icon, 
  title, 
  value, 
  change, 
  trend = 'up',
  loading = false,
  className = '' 
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden group hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 opacity-5 bg-gradient-to-br from-blue-500 to-purple-500 blur-2xl group-hover:opacity-10 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-blue-50">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          )}
        </div>
        
        {change && (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </span>
            <span className="text-sm text-gray-500">from last month</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default InfoCard