// frontend/src/components/ui/Card/StatsCard.jsx
import React from 'react'
import { motion } from 'framer-motion'

const StatsCard = ({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  color = 'blue', 
  trend,
  loading = false,
  className = '' 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    purple: 'from-purple-500 to-pink-600',
    red: 'from-red-500 to-rose-600',
    cyan: 'from-cyan-500 to-blue-500',
  }

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    cyan: 'text-cyan-600',
  }

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden group hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Gradient background */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-10 bg-gradient-to-br ${colorClasses[color]} blur-2xl group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            )}
            {subtext && (
              <p className="text-sm text-gray-500 mt-1">{subtext}</p>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl bg-opacity-10 ${color === 'blue' ? 'bg-blue-50' : color === 'green' ? 'bg-green-50' : color === 'orange' ? 'bg-orange-50' : color === 'purple' ? 'bg-purple-50' : color === 'red' ? 'bg-red-50' : 'bg-cyan-50'}`}>
              <Icon className={`h-6 w-6 ${iconColors[color]}`} />
            </div>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </span>
            <span className="text-sm text-gray-500">from last month</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard