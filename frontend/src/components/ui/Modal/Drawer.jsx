// frontend/src/components/ui/Modal/Drawer.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const Drawer = ({
  isOpen,
  onClose,
  position = 'right',
  children,
  title,
  size = 'md',
  className = '',
}) => {
  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
  }

  const sizeClasses = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-64',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-120' : 'h-120',
    xl: position === 'left' || position === 'right' ? 'w-160' : 'h-160',
    full: position === 'left' || position === 'right' ? 'w-full' : 'h-full',
  }

  const animationVariants = {
    left: {
      hidden: { x: '-100%' },
      visible: { x: 0 },
    },
    right: {
      hidden: { x: '100%' },
      visible: { x: 0 },
    },
    top: {
      hidden: { y: '-100%' },
      visible: { y: 0 },
    },
    bottom: {
      hidden: { y: '100%' },
      visible: { y: 0 },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={animationVariants[position]}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed ${positionClasses[position]} top-0 bottom-0
              ${sizeClasses[size]} z-50
              ${className}
            `}
          >
            <div className="h-full bg-white shadow-2xl overflow-hidden">
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              )}
              <div className="h-full overflow-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Drawer