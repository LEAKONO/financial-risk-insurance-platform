// frontend/src/components/ui/Modal/ConfirmModal.jsx
import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Modal from './Modal'
import Button from '../Button/Button'

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      buttonVariant: 'danger',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      buttonVariant: 'warning',
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      buttonVariant: 'primary',
    },
  }

  const config = variantConfig[variant] || variantConfig.danger
  const Icon = config.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${config.bgColor}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export { ConfirmModal }
export default ConfirmModal