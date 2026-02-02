// frontend/src/components/common/Tooltip.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  delay = 200,
  className = '' 
}) => {
  const [visible, setVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(null)

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    const id = setTimeout(() => setVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap ${positionClasses[position]}`}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Tooltip