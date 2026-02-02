// frontend/src/components/ui/Form/Checkbox.jsx
import React from 'react'

const Checkbox = ({ 
  label, 
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          {...props}
        />
      </div>
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-gray-900 cursor-pointer">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

export default Checkbox